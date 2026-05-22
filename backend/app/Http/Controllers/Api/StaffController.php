<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\Doctor;
use App\Models\DoctorAttendance;
use App\Models\DoctorSchedule;
use App\Models\Patient;
use App\Models\PatientVerification;
use App\Models\Queue;
use App\Models\Staff;
use App\Models\SystemNotification;
use App\Models\WalkinVisit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class StaffController extends Controller
{
    /* ─────────────────────────── Dashboard ─────────────────────────── */

    public function dashboard(Request $request)
    {
        $today = date('Y-m-d');
        $this->syncTodayAppointmentQueues($today);
        $this->syncCompletedAppointmentStatuses($today);

        $appointmentsToday = Appointment::with(['patient', 'doctor', 'service'])
            ->where('appointment_date', $today)
            ->get();

        $queuesToday = Queue::with(['patient', 'doctor'])
            ->where('queue_date', $today)
            ->orderBy('queue_number', 'asc')
            ->get();

        $pendingVerifications = Patient::whereIn('verification_status', ['Pending', 'Under Review'])->count();

        return response()->json([
            'appointments_today' => $appointmentsToday,
            'queues_today'       => $queuesToday,
            'stats'              => [
                'total_appointments'    => $appointmentsToday->count(),
                'active_queues'         => $queuesToday->whereIn('queue_status', ['Waiting', 'Active', 'Serving'])->count(),
                'total_patients'        => Patient::count(),
                'pending_verifications' => $pendingVerifications,
                'walkins_today'         => $queuesToday->where('queue_source', 'Walk-in')->count(),
            ],
        ]);
    }

    /* ─────────────────────────── Profile ─────────────────────────── */

    public function updateProfile(Request $request)
    {
        $staff = $request->user();

        $request->validate([
            'first_name'     => 'sometimes|string|max:255',
            'last_name'      => 'sometimes|string|max:255',
            'middle_name'    => 'nullable|string|max:255',
            'contact_number' => 'sometimes|string|regex:/^[0-9]+$/|max:20',
            'email'          => 'sometimes|email|unique:staff,email,' . $staff->staff_id . ',staff_id',
        ]);

        $staff->fill($request->only(['first_name', 'last_name', 'middle_name', 'contact_number', 'email']));
        $staff->save();

        return response()->json(['message' => 'Profile updated.', 'user' => $staff->fresh()]);
    }

    public function updatePassword(Request $request)
    {
        $staff = $request->user();

        $request->validate([
            'current_password' => 'required',
            'password'         => 'required|min:8|confirmed',
        ]);

        if (! Hash::check($request->current_password, $staff->password)) {
            throw ValidationException::withMessages(['current_password' => ['Current password is incorrect.']]);
        }

        $staff->password = Hash::make($request->password);
        $staff->save();

        return response()->json(['message' => 'Password updated.']);
    }

    public function uploadProfilePicture(Request $request)
    {
        $request->validate(['photo' => 'required|image|max:2048']);
        $staff = $request->user();

        if ($staff->profile_picture) {
            Storage::disk('public')->delete($staff->profile_picture);
        }

        $path = $request->file('photo')->store('profile-pictures', 'public');
        $staff->profile_picture = $path;
        $staff->save();

        return response()->json(['message' => 'Photo updated.', 'profile_picture' => asset('storage/' . $path)]);
    }

    /* ─────────────────────────── Patients ─────────────────────────── */

    public function getPatients()
    {
        return response()->json(Patient::orderBy('created_at', 'desc')->get());
    }

    public function getPatient($id)
    {
        return response()->json(Patient::with('patientVerification')->findOrFail($id));
    }

    public function updatePatient(Request $request, $id)
    {
        if ($request->user()->role === 'Nurse') {
            return response()->json(['message' => 'Access denied. Nurses cannot modify patient records.'], 403);
        }

        $patient = Patient::findOrFail($id);
        $request->validate([
            'account_status' => 'sometimes|in:Active,Inactive,Suspended',
        ]);
        $patient->fill($request->only(['first_name', 'last_name', 'contact_number', 'account_status']));
        $patient->save();
        return response()->json(['message' => 'Patient updated.', 'patient' => $patient]);
    }

    /* ─────────────────────────── ID Verification ─────────────────────── */

    public function getPendingVerifications()
    {
        return response()->json(
            Patient::with('patientVerification')
                ->whereIn('verification_status', ['Pending', 'Under Review'])
                ->get()
        );
    }

    public function approveVerification(Request $request, $patientId)
    {
        if ($request->user()->role === 'Nurse') {
            return response()->json(['message' => 'Access denied. Nurses cannot verify patient identity documents.'], 403);
        }

        $request->validate(['action' => 'required|in:approve,reject', 'reason' => 'nullable|string']);

        $patient = Patient::findOrFail($patientId);

        if ($request->action === 'approve') {
            $patient->verification_status = 'Approved';
            $title  = 'ID Verification Approved';
            $body   = 'Your ID has been verified. You now have full access to book appointments.';
            $type   = 'success';
        } else {
            $patient->verification_status = 'Rejected';
            $title  = 'ID Verification Rejected';
            $reason = $request->reason ?? 'The submitted ID did not meet our requirements.';
            $body   = "Your ID verification was rejected. Reason: {$reason}. Please re-upload a valid ID.";
            $type   = 'danger';
        }

        $patient->save();

        // Notify patient
        SystemNotification::create([
            'notifiable_type' => 'patient',
            'notifiable_id'   => $patient->patient_id,
            'title'           => $title,
            'body'            => $body,
            'type'            => $type,
        ]);

        return response()->json(['message' => 'Verification updated.', 'patient' => $patient]);
    }

    /* ─────────────────────────── Appointments ─────────────────────── */

    public function getAppointments()
    {
        $this->syncCompletedAppointmentStatuses(date('Y-m-d'));

        return response()->json(
            Appointment::with(['patient', 'doctor', 'service'])
                ->orderBy('appointment_date', 'desc')
                ->get()
        );
    }

    public function updateAppointmentStatus(Request $request, $id)
    {
        $request->validate(['booking_status' => 'required|in:Pending,Confirmed,Cancelled,Completed,No Show,Rescheduled']);

        $appointment = Appointment::with(['patient'])->findOrFail($id);
        $oldStatus = $appointment->booking_status;
        $appointment->booking_status = $request->booking_status;
        $appointment->save();

        // Dynamically add to active queues on Check-in (when booking_status goes to Confirmed)
        if ($request->booking_status === 'Confirmed' && $oldStatus !== 'Confirmed') {
            $queueDate = $appointment->appointment_date;
            
            // Check if queue entry already exists for this appointment
            $existingQueue = Queue::where('appointment_id', $appointment->appointment_id)
                ->where('queue_date', $queueDate)
                ->first();

            if (!$existingQueue) {
                // Find max queue number for this doctor to assign next sequence
                $maxQueueNumber = Queue::where('doctor_id', $appointment->doctor_id)
                    ->where('queue_date', $queueDate)
                    ->max('queue_number') ?? 0;

                $newQueueNumber = $maxQueueNumber + 1;
                $priority = $newQueueNumber;

                // "if he come then he will be next if some one get that slow disregard the other que"
                if ($appointment->attendance_status === 'No Response') {
                    // Make them NEXT in line by pushing other waiting queue items down
                    Queue::where('doctor_id', $appointment->doctor_id)
                        ->where('queue_date', $queueDate)
                        ->where('queue_status', 'Waiting')
                        ->increment('priority_number');

                    // Assign priority_number = 1 to place them right at the front of waiting queue!
                    $priority = 1;
                }

                Queue::create([
                    'queue_date'         => $queueDate,
                    'doctor_id'          => $appointment->doctor_id,
                    'patient_id'         => $appointment->patient_id,
                    'appointment_id'     => $appointment->appointment_id,
                    'queue_source'       => 'Appointment',
                    'queue_number'       => $newQueueNumber,
                    'priority_number'    => $priority,
                    'checked_in_at'      => now(),
                    'is_activated'       => false,
                    'queue_status'       => 'Active',
                    'estimated_wait_time'=> ($priority - 1) * 15,
                ]);

                // Create a notification that they have a queue number, but are not tapped in yet.
                if ($appointment->patient_id) {
                    SystemNotification::create([
                        'notifiable_type' => 'patient',
                        'notifiable_id'   => $appointment->patient_id,
                        'title'           => 'Queue Number Assigned',
                        'body'            => "Your queue number is Q-{$newQueueNumber}. Please tap in at the clinic when you arrive so staff know you are in the hospital." .
                                             ($priority === 1 ? " You will be prioritized once tapped in." : ""),
                        'type'            => 'success',
                    ]);
                }
            }
        }

        // Notify patient about status change
        $msgMap = [
            'Confirmed'   => ['Appointment Confirmed', 'Your appointment has been confirmed.', 'success'],
            'Cancelled'   => ['Appointment Cancelled', 'Your appointment has been cancelled.', 'danger'],
            'Rescheduled' => ['Appointment Rescheduled', 'Your appointment has been rescheduled.', 'warning'],
        ];

        if (isset($msgMap[$request->booking_status]) && $appointment->patient) {
            [$title, $body, $type] = $msgMap[$request->booking_status];
            SystemNotification::create([
                'notifiable_type' => 'patient',
                'notifiable_id'   => $appointment->patient->patient_id,
                'title'           => $title,
                'body'            => $body . " Date: {$appointment->appointment_date} at {$appointment->start_time}.",
                'type'            => $type,
            ]);
        }

        return response()->json(['message' => 'Status updated.', 'appointment' => $appointment]);
    }

    /* ─────────────────────────── Schedule ─────────────────────────── */

    public function storeWalkIn(Request $request)
    {
        if ($request->user()->role === 'Nurse') {
            return response()->json(['message' => 'Access denied. Nurses cannot register walk-in patients.'], 403);
        }

        $request->validate([
            'patient_id'       => 'nullable|exists:patients,patient_id',
            'first_name'       => 'required_without:patient_id|string|max:255',
            'last_name'        => 'required_without:patient_id|string|max:255',
            'birth_date'       => 'required_without:patient_id|date',
            'sex'              => 'required_without:patient_id|in:Male,Female',
            'contact_number'   => ['required_without:patient_id', 'nullable', 'regex:/^09[0-9]{9}$/'],
            'address'          => 'required_without:patient_id|string|max:1000',
            'doctor_id'        => 'required|exists:doctors,doctor_id',
            'service_id'       => 'required|exists:services,service_id',
            'reason_for_visit' => 'required|string|max:1000',
        ], [
            'contact_number.regex' => 'Phone number must start with 09 and be exactly 11 digits.',
        ]);

        $patient = $request->patient_id
            ? Patient::findOrFail($request->patient_id)
            : Patient::create([
                'patient_number'      => 'PAT-' . date('Ymd') . '-' . str_pad(rand(1, 9999), 4, '0', STR_PAD_LEFT),
                'first_name'          => $request->first_name,
                'last_name'           => $request->last_name,
                'middle_name'         => $request->middle_name,
                'birth_date'          => $request->birth_date,
                'sex'                 => $request->sex,
                'civil_status'        => $request->civil_status ?? 'Single',
                'contact_number'      => $request->contact_number,
                'email'               => 'walkin-' . Str::uuid() . '@clinic.local',
                'password'            => Hash::make(Str::random(16)),
                'address'             => $request->address,
                'registration_type'   => 'Walk-in',
                'account_status'      => 'Active',
                'verification_status' => 'Walk-in Temporary',
            ]);

        $today = date('Y-m-d');
        $walkIn = WalkinVisit::create([
            'patient_id'       => $patient->patient_id,
            'doctor_id'        => $request->doctor_id,
            'service_id'       => $request->service_id,
            'visit_date'       => $today,
            'arrival_time'     => now()->toTimeString(),
            'reason_for_visit' => $request->reason_for_visit,
            'created_by'       => $request->user()->staff_id,
            'walkin_status'    => 'Queued',
        ]);

        $maxQueueNumber = Queue::where('doctor_id', $request->doctor_id)
            ->where('queue_date', $today)
            ->max('queue_number') ?? 0;
        $newQueueNumber = $maxQueueNumber + 1;
        $doctorPresent = $this->isDoctorTappedIn((int) $request->doctor_id, $today);
        $hasCurrent = Queue::where('doctor_id', $request->doctor_id)
            ->where('queue_date', $today)
            ->where('queue_status', 'Serving')
            ->exists();

        $queue = Queue::create([
            'queue_date'          => $today,
            'doctor_id'           => $request->doctor_id,
            'patient_id'          => $patient->patient_id,
            'walkin_id'           => $walkIn->walkin_id,
            'queue_source'        => 'Walk-in',
            'queue_number'        => $newQueueNumber,
            'priority_number'     => $newQueueNumber,
            'checked_in_at'       => now(),
            'is_activated'        => true,
            'queue_status'        => ($doctorPresent && ! $hasCurrent) ? 'Serving' : 'Waiting',
            'estimated_wait_time' => ($newQueueNumber - 1) * 15,
        ]);

        return response()->json([
            'message' => 'Walk-in registered and added to queue.',
            'patient' => $patient,
            'walkin' => $walkIn,
            'queue' => $queue->fresh(['patient', 'doctor']),
        ], 201);
    }

    public function getSchedules()
    {
        return response()->json(
            DoctorSchedule::with(['doctor'])->orderBy('day_of_week')->get()
        );
    }

    public function getDoctorAttendances()
    {
        $today = date('Y-m-d');

        return response()->json(
            DoctorAttendance::with('doctor')
                ->where('attendance_date', $today)
                ->get()
        );
    }

    public function tapInDoctor($id)
    {
        $doctor = Doctor::findOrFail($id);
        $today = date('Y-m-d');

        $attendance = DoctorAttendance::firstOrNew([
            'doctor_id' => $doctor->doctor_id,
            'attendance_date' => $today,
        ]);

        if ($attendance->time_in && ! $attendance->time_out) {
            return response()->json(['message' => 'Doctor is already tapped in.', 'attendance' => $attendance]);
        }

        if (! $attendance->time_in) {
            $attendance->time_in = now()->toTimeString();
        }

        $attendance->time_out = null;
        $attendance->attendance_status = 'Present';
        $attendance->save();
        $nextQueue = $this->startNextWaitingQueue($doctor->doctor_id, $today);

        return response()->json([
            'message' => $nextQueue
                ? 'Doctor tapped in and the next waiting patient is now in progress.'
                : 'Doctor tapped in.',
            'attendance' => $attendance->fresh('doctor'),
            'next_queue' => $nextQueue?->fresh(['patient', 'doctor']),
        ]);
    }

    public function tapOutDoctor($id)
    {
        $doctor = Doctor::findOrFail($id);
        $today = date('Y-m-d');

        $hasActivePatient = Queue::where('doctor_id', $doctor->doctor_id)
            ->where('queue_date', $today)
            ->where('queue_status', 'Serving')
            ->exists();

        if ($hasActivePatient) {
            return response()->json(['message' => 'Complete the current patient before tapping the doctor out.'], 422);
        }

        $attendance = DoctorAttendance::where('doctor_id', $doctor->doctor_id)
            ->where('attendance_date', $today)
            ->first();

        if (! $attendance || ! $attendance->time_in) {
            return response()->json(['message' => 'Doctor has not tapped in today.'], 422);
        }

        if ($attendance->time_out) {
            return response()->json(['message' => 'Doctor is already tapped out.', 'attendance' => $attendance]);
        }

        $attendance->time_out = now()->toTimeString();
        $attendance->attendance_status = 'Completed';
        $attendance->save();

        return response()->json(['message' => 'Doctor tapped out.', 'attendance' => $attendance->fresh('doctor')]);
    }

    /* ─────────────────────────── Queue ─────────────────────────── */

    public function getQueue()
    {
        $today = date('Y-m-d');
        $this->syncTodayAppointmentQueues($today);
        $this->syncCompletedAppointmentStatuses($today);

        return response()->json(
            Queue::with(['patient', 'doctor'])
                ->where('queue_date', $today)
                ->orderBy('priority_number')
                ->orderBy('queue_number')
                ->get()
        );
    }

    public function updateQueueStatus(Request $request, $id)
    {
        $request->validate(['queue_status' => 'required|in:Waiting,Active,Serving,Done,Cancelled']);
        $queue = Queue::findOrFail($id);

        if ($request->queue_status === 'Done' && $queue->queue_status !== 'Serving') {
            return response()->json(['message' => 'Cannot mark complete. The patient session must be In Progress first.'], 422);
        }

        if ($request->queue_status === 'Serving' && ! $this->isDoctorTappedIn($queue->doctor_id, $queue->queue_date)) {
            return response()->json(['message' => 'Doctor must tap in before this queue can start.'], 422);
        }

        $queue->queue_status = $request->queue_status;
        $queue->save();

        if ($request->queue_status === 'Done') {
            $this->notifyCompletedAndAdvanceNext($queue);
        }

        return response()->json(['message' => 'Queue status updated.', 'queue' => $queue]);
    }

    public function tapInQueue($id)
    {
        $queue = Queue::with(['patient', 'doctor'])->findOrFail($id);

        if (in_array($queue->queue_status, ['Done', 'Cancelled'])) {
            return response()->json(['message' => 'This queue item is already closed.'], 422);
        }

        $current = Queue::where('doctor_id', $queue->doctor_id)
            ->where('queue_date', $queue->queue_date)
            ->where('queue_status', 'Serving')
            ->where('queue_id', '!=', $queue->queue_id)
            ->exists();

        $firstQueue = Queue::where('doctor_id', $queue->doctor_id)
            ->where('queue_date', $queue->queue_date)
            ->where(function ($query) use ($queue) {
                $query->where('queue_status', 'Waiting')
                    ->orWhere('queue_id', $queue->queue_id);
            })
            ->orderBy('priority_number', 'asc')
            ->orderBy('queue_number', 'asc')
            ->first();

        $doctorPresent = $this->isDoctorTappedIn($queue->doctor_id, $queue->queue_date);

        $queue->checked_in_at = now();
        $queue->is_activated = true;
        $queue->queue_status = ($doctorPresent && ! $current && $firstQueue && $firstQueue->queue_id === $queue->queue_id)
            ? 'Serving'
            : 'Waiting';
        $queue->save();

        if ($queue->queue_status === 'Serving' && $queue->patient_id) {
            SystemNotification::create([
                'notifiable_type' => 'patient',
                'notifiable_id'   => $queue->patient_id,
                'title'           => 'Consultation Started',
                'body'            => 'It is your turn. Please proceed to the doctor\'s clinic room.',
                'type'            => 'info',
            ]);
        }

        return response()->json([
            'message' => $queue->queue_status === 'Serving'
                ? 'Patient tapped in and is now in progress.'
                : ($doctorPresent
                    ? 'Patient tapped in and is now waiting in the hospital.'
                    : 'Patient tapped in and is waiting. The queue cannot start until the doctor taps in.'),
            'queue' => $queue->fresh(['patient', 'doctor']),
        ]);
    }

    public function tapOutQueue($id)
    {
        $queue = Queue::with(['patient', 'doctor'])->findOrFail($id);

        if ($queue->queue_status !== 'Serving') {
            return response()->json(['message' => 'Only an in-progress queue item can be tapped out.'], 422);
        }

        $queue->queue_status = 'Done';
        $queue->save();

        $nextQueue = $this->notifyCompletedAndAdvanceNext($queue);

        return response()->json([
            'message' => 'Patient tapped out and queue completed.',
            'queue' => $queue->fresh(['patient', 'doctor']),
            'next_queue' => $nextQueue?->fresh(['patient', 'doctor']),
        ]);
    }

    private function notifyCompletedAndAdvanceNext(Queue $queue): ?Queue
    {
        $this->completeLinkedAppointment($queue);

        if ($queue->patient_id) {
            SystemNotification::create([
                'notifiable_type' => 'patient',
                'notifiable_id'   => $queue->patient_id,
                'title'           => 'Appointment Completed',
                'body'            => 'Thank you. Your appointment is now complete. We hope to see you again soon!',
                'type'            => 'success',
            ]);
        }

        return $this->startNextWaitingQueue($queue->doctor_id, $queue->queue_date);
    }

    private function completeLinkedAppointment(Queue $queue): void
    {
        if (! $queue->appointment_id) {
            return;
        }

        $appointment = Appointment::where('appointment_id', $queue->appointment_id)->first();
        if (! $appointment || $appointment->booking_status === 'Completed') {
            return;
        }

        $appointment->booking_status = 'Completed';
        $appointment->save();
    }

    private function syncCompletedAppointmentStatuses(string $today): void
    {
        $completedQueues = Queue::where('queue_date', $today)
            ->where('queue_status', 'Done')
            ->whereNotNull('appointment_id')
            ->get();

        foreach ($completedQueues as $queue) {
            $this->completeLinkedAppointment($queue);
        }
    }

    private function startNextWaitingQueue(int $doctorId, string $date): ?Queue
    {
        if (! $this->isDoctorTappedIn($doctorId, $date)) {
            return null;
        }

        $hasCurrent = Queue::where('doctor_id', $doctorId)
            ->where('queue_date', $date)
            ->where('queue_status', 'Serving')
            ->exists();

        if ($hasCurrent) {
            return null;
        }

        $nextQueue = Queue::where('doctor_id', $doctorId)
            ->where('queue_date', $date)
            ->where('queue_status', 'Waiting')
            ->orderBy('priority_number', 'asc')
            ->orderBy('queue_number', 'asc')
            ->first();

        if (! $nextQueue) {
            return null;
        }

        $nextQueue->queue_status = 'Serving';
        $nextQueue->save();

        if ($nextQueue->patient_id) {
            SystemNotification::create([
                'notifiable_type' => 'patient',
                'notifiable_id'   => $nextQueue->patient_id,
                'title'           => 'Consultation Started',
                'body'            => 'It is your turn. Please proceed to the doctor\'s clinic room.',
                'type'            => 'info',
            ]);
        }

        return $nextQueue;
    }

    private function isDoctorTappedIn(int $doctorId, string $date): bool
    {
        return DoctorAttendance::where('doctor_id', $doctorId)
            ->where('attendance_date', $date)
            ->whereNotNull('time_in')
            ->whereNull('time_out')
            ->exists();
    }

    private function syncTodayAppointmentQueues(string $today): void
    {
        $appointments = Appointment::where('appointment_date', $today)
            ->where('booking_status', 'Confirmed')
            ->whereDoesntHave('queue')
            ->orderBy('doctor_id')
            ->orderBy('start_time')
            ->get();

        foreach ($appointments as $appointment) {
            $this->createAppointmentQueue($appointment, $today);
        }
    }

    private function createAppointmentQueue(Appointment $appointment, string $today): Queue
    {
        $maxQueueNumber = Queue::where('doctor_id', $appointment->doctor_id)
            ->where('queue_date', $today)
            ->max('queue_number') ?? 0;

        $newQueueNumber = $maxQueueNumber + 1;

        return Queue::create([
            'queue_date'          => $today,
            'doctor_id'           => $appointment->doctor_id,
            'patient_id'          => $appointment->patient_id,
            'appointment_id'      => $appointment->appointment_id,
            'queue_source'        => 'Appointment',
            'queue_number'        => $newQueueNumber,
            'priority_number'     => $newQueueNumber,
            'checked_in_at'       => now(),
            'is_activated'        => false,
            'queue_status'        => 'Active',
            'estimated_wait_time' => ($newQueueNumber - 1) * 15,
        ]);
    }
}
