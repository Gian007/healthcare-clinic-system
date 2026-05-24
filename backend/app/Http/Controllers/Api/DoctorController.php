<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\DoctorAttendance;
use App\Models\DoctorDayOff;
use App\Models\DoctorSchedule;
use App\Models\Queue;
use App\Models\SystemNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class DoctorController extends Controller
{
    private function doctor(Request $request)
    {
        return $request->user(); // Doctor model
    }

    /* ─────────────────────────── Dashboard ─────────────────────────── */

    public function dashboard(Request $request)
    {
        $doctor   = $this->doctor($request);
        $doctorId = $doctor->doctor_id;
        $today    = date('Y-m-d');
        $this->syncTodayAppointmentQueues($doctorId, $today);
        $this->syncCompletedAppointmentStatuses($doctorId, $today);

        $appointmentsToday = Appointment::with(['patient', 'service'])
            ->where('doctor_id', $doctorId)
            ->where('appointment_date', $today)
            ->get();

        $queuesToday = Queue::with('patient')
            ->where('doctor_id', $doctorId)
            ->where('queue_date', $today)
            ->orderBy('queue_number', 'asc')
            ->get();

        return response()->json([
            'appointments_today' => $appointmentsToday,
            'queues_today'       => $queuesToday,
            'doctor'             => $doctor->load('specialization'),
            'stats'              => [
                'total_appointments' => $appointmentsToday->count(),
                'completed'          => $queuesToday->where('queue_status', 'Done')->count(),
                'waiting'            => $queuesToday->where('queue_status', 'Waiting')->count(),
            ],
        ]);
    }

    /* ─────────────────────────── Appointments ─────────────────────────── */

    public function getAppointments(Request $request)
    {
        $doctorId = $this->doctor($request)->doctor_id;
        $today = date('Y-m-d');
        $this->syncTodayAppointmentQueues($doctorId, $today);
        $this->syncCompletedAppointmentStatuses($doctorId, $today);

        return response()->json(
            Appointment::with(['patient', 'service'])
                ->where('doctor_id', $doctorId)
                ->orderBy('appointment_date', 'desc')
                ->orderBy('start_time', 'asc')
                ->get()
        );
    }

    public function updateAppointmentStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:Pending,Confirmed,Cancelled,Completed,No Show,Rescheduled',
            'reason' => 'nullable|string',
        ]);

        $appointment = Appointment::where('appointment_id', $id)->firstOrFail();

        if ($appointment->doctor_id !== $this->doctor($request)->doctor_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if ($request->status === 'Completed') {
            $queueItem = Queue::where('appointment_id', $id)->first();
            if ($queueItem) {
                if ($queueItem->queue_status !== 'Serving') {
                    return response()->json(['message' => 'Cannot mark complete. The patient session must be In Progress first.'], 422);
                }
                
                // Mark the queue item as Done as well
                $queueItem->queue_status = 'Done';
                $queueItem->save();
                $this->completeLinkedAppointment($queueItem);

                $this->startNextWaitingQueue($appointment->doctor_id, $queueItem->queue_date);
            }
        }

        $appointment->booking_status = $request->status;
        if ($request->reason) {
            $appointment->completion_note = $request->reason;
        }
        $appointment->save();

        // Notify patient
        $msgMap = [
            'Completed' => ['Appointment Completed', 'Thank you. Your appointment is now complete. We hope to see you again soon!', 'success'],
            'No Show'   => ['Missed Appointment', 'You were marked as a no-show for your appointment. Please contact us to reschedule.', 'warning'],
        ];

        if (isset($msgMap[$request->status]) && $appointment->patient_id) {
            [$title, $body, $type] = $msgMap[$request->status];
            SystemNotification::create([
                'notifiable_type' => 'patient',
                'notifiable_id'   => $appointment->patient_id,
                'title'           => $title,
                'body'            => $body,
                'type'            => $type,
            ]);
        }

        return response()->json(['message' => 'Status updated.', 'appointment' => $appointment]);
    }

    /* ─────────────────────────── Queue ─────────────────────────── */

    public function getQueue(Request $request)
    {
        $doctorId = $this->doctor($request)->doctor_id;
        $today    = date('Y-m-d');
        $this->syncTodayAppointmentQueues($doctorId, $today);

        return response()->json(
            Queue::with('patient')
                ->where('doctor_id', $doctorId)
                ->where('queue_date', $today)
                ->orderBy('priority_number')
                ->orderBy('queue_number')
                ->get()
        );
    }

    public function updateQueueStatus(Request $request, $id)
    {
        $request->validate(['status' => 'required|in:Waiting,Active,Serving,Done,Cancelled']);
        
        $doctorId = $this->doctor($request)->doctor_id;
        $queue = Queue::where('queue_id', $id)->where('doctor_id', $doctorId)->firstOrFail();
        $oldStatus = $queue->queue_status;
        
        if ($request->status === 'Done' && $queue->queue_status !== 'Serving') {
            return response()->json(['message' => 'Cannot mark complete. The patient session must be In Progress first.'], 422);
        }

        if ($request->status === 'Serving' && ! $this->isTappedIn($doctorId, $queue->queue_date)) {
            return response()->json(['message' => 'You must clock in before starting the queue.'], 422);
        }

        $queue->queue_status = $request->status;
        $queue->save();

        if ($request->status === 'Serving' && $oldStatus !== 'Serving' && $queue->patient_id) {
            SystemNotification::create([
                'notifiable_type' => 'patient',
                'notifiable_id'   => $queue->patient_id,
                'title'           => 'Consultation Started',
                'body'            => 'It is your turn. Please proceed to the doctor\'s clinic room.',
                'type'            => 'info',
            ]);
        }

        if ($request->status === 'Done') {
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

            $this->startNextWaitingQueue($doctorId, $queue->queue_date);
        }

        return response()->json(['message' => 'Queue status updated.', 'queue' => $queue]);
    }

    /* ─────────────────────────── Schedules ─────────────────────────── */

    public function getSchedules(Request $request)
    {
        $doctorId = $this->doctor($request)->doctor_id;
        return response()->json(
            DoctorSchedule::where('doctor_id', $doctorId)->get()
        );
    }

    /* ─────────────────────────── Day-offs ─────────────────────────── */

    public function getDayOffs(Request $request)
    {
        $doctorId = $this->doctor($request)->doctor_id;
        return response()->json(
            DoctorDayOff::where('doctor_id', $doctorId)->orderBy('dayoff_date', 'desc')->get()
        );
    }

    public function requestDayOff(Request $request)
    {
        $request->validate([
            'date'        => 'required|date|after_or_equal:today',
            'is_half_day' => 'sometimes|boolean',
            'start_time'  => 'required_if:is_half_day,true|nullable',
            'end_time'    => 'required_if:is_half_day,true|nullable',
            'reason'      => 'required|string|max:500',
        ]);

        $doctor = $this->doctor($request);

        $dayOff = DoctorDayOff::create([
            'doctor_id'   => $doctor->doctor_id,
            'dayoff_date' => $request->date,
            'is_half_day' => $request->is_half_day ?? false,
            'start_time'  => $request->start_time,
            'end_time'    => $request->end_time,
            'reason'      => $request->reason,
            'status'      => 'Pending',
        ]);

        $typeStr = ($request->is_half_day) ? "a half-day off ({$request->start_time} to {$request->end_time})" : "a full day-off";

        // Notify admin
        SystemNotification::create([
            'notifiable_type' => 'staff',
            'notifiable_id'   => 0, // broadcast to admin
            'title'           => 'Day-off Request',
            'body'            => "Dr. {$doctor->first_name} {$doctor->last_name} requested {$typeStr} on {$request->date}. Reason: {$request->reason}",
            'type'            => 'info',
        ]);

        return response()->json(['message' => 'Day-off request submitted.', 'dayOff' => $dayOff]);
    }

    public function deleteDayOff(Request $request, $id)
    {
        $doctorId = $this->doctor($request)->doctor_id;
        $dayOff = DoctorDayOff::where('dayoff_id', $id)
            ->where('doctor_id', $doctorId)
            ->firstOrFail();

        if ($dayOff->status !== 'Pending') {
            return response()->json(['message' => 'Only pending day-off requests can be removed.'], 400);
        }

        $dayOff->delete();

        return response()->json(['message' => 'Day-off request removed.']);
    }

    /* ─────────────────────────── Attendance ─────────────────────────── */

    public function recordAttendance(Request $request)
    {
        $request->validate(['action' => 'required|in:time_in,time_out']);

        $doctor = $this->doctor($request);
        $today  = date('Y-m-d');

        $attendance = DoctorAttendance::firstOrNew([
            'doctor_id' => $doctor->doctor_id,
            'attendance_date' => $today,
        ]);

        $now = now()->toTimeString();
        if ($request->action === 'time_in') {
            if ($attendance->time_in && ! $attendance->time_out) {
                return response()->json(['message' => 'You are already clocked in.', 'attendance' => $attendance]);
            }
            $attendance->time_in = $now;
            $attendance->time_out = null;
            $attendance->attendance_status = 'Present';
        } elseif ($request->action === 'time_out') {
            $hasActivePatient = Queue::where('doctor_id', $doctor->doctor_id)
                ->where('queue_date', $today)
                ->where('queue_status', 'Serving')
                ->exists();

            if ($hasActivePatient) {
                return response()->json(['message' => 'Complete the current patient before clocking out.'], 422);
            }

            if (! $attendance->time_in) {
                return response()->json(['message' => 'You must clock in before clocking out.'], 422);
            }

            $attendance->time_out = $now;
            $attendance->attendance_status = 'Completed';
        }

        $attendance->save();
        $nextQueue = $request->action === 'time_in'
            ? $this->startNextWaitingQueue($doctor->doctor_id, $today)
            : null;

        return response()->json([
            'message' => $nextQueue
                ? 'Time in recorded and the next waiting patient is now in progress.'
                : ucfirst(str_replace('_', ' ', $request->action)) . ' recorded.',
            'attendance' => $attendance,
            'next_queue' => $nextQueue,
        ]);
    }

    public function getAttendance(Request $request)
    {
        $doctorId = $this->doctor($request)->doctor_id;
        return response()->json(
            DoctorAttendance::where('doctor_id', $doctorId)
                ->orderBy('attendance_date', 'desc')
                ->take(30)
                ->get()
        );
    }

    /* ─────────────────────────── Profile ─────────────────────────── */

    private function isTappedIn(int $doctorId, string $date): bool
    {
        return DoctorAttendance::where('doctor_id', $doctorId)
            ->where('attendance_date', $date)
            ->whereNotNull('time_in')
            ->whereNull('time_out')
            ->exists();
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

    private function syncCompletedAppointmentStatuses(int $doctorId, string $today): void
    {
        $completedQueues = Queue::where('doctor_id', $doctorId)
            ->where('queue_date', $today)
            ->where('queue_status', 'Done')
            ->whereNotNull('appointment_id')
            ->get();

        foreach ($completedQueues as $queue) {
            $this->completeLinkedAppointment($queue);
        }
    }

    private function startNextWaitingQueue(int $doctorId, string $date): ?Queue
    {
        if (! $this->isTappedIn($doctorId, $date)) {
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

        return $nextQueue->fresh(['patient']);
    }

    private function syncTodayAppointmentQueues(int $doctorId, string $today): void
    {
        $appointments = Appointment::where('doctor_id', $doctorId)
            ->where('appointment_date', $today)
            ->where('booking_status', 'Confirmed')
            ->whereDoesntHave('queue')
            ->orderBy('start_time')
            ->get();

        foreach ($appointments as $appointment) {
            $maxQueueNumber = Queue::where('doctor_id', $doctorId)
                ->where('queue_date', $today)
                ->max('queue_number') ?? 0;

            Queue::create([
                'queue_date'          => $today,
                'doctor_id'           => $doctorId,
                'patient_id'          => $appointment->patient_id,
                'appointment_id'      => $appointment->appointment_id,
                'queue_source'        => 'Appointment',
                'queue_number'        => $maxQueueNumber + 1,
                'priority_number'     => $maxQueueNumber + 1,
                'checked_in_at'       => now(),
                'is_activated'        => false,
                'queue_status'        => 'Active',
                'estimated_wait_time' => $maxQueueNumber * 15,
            ]);
        }
    }

    public function updateProfile(Request $request)
    {
        $doctor = $this->doctor($request);
        $inputIds = $request->specialization_ids ?? [];
        $existingIds = array_filter($inputIds, fn($id) => is_numeric($id));
        $manualNames = array_map(fn($id) => str_replace('NEW:', '', $id), array_filter($inputIds, fn($id) => is_string($id) && Str::startsWith($id, 'NEW:')));

        $request->validate([
            'contact_number'      => 'sometimes|string|regex:/^[0-9]+$/|max:20',
            'email'               => 'sometimes|email|unique:doctors,email,' . $doctor->doctor_id . ',doctor_id',
            'years_of_experience' => 'sometimes|nullable|integer|min:0',
            'consultation_fee'    => 'sometimes|nullable|numeric|min:0',
            'specialization_ids'  => 'sometimes|array',
        ]);

        if (!empty($existingIds)) {
            $validator = \Validator::make(['ids' => $existingIds], [
                'ids.*' => 'exists:specializations,specialization_id'
            ]);
            if ($validator->fails()) {
                return response()->json(['errors' => $validator->errors()], 422);
            }
        }

        $finalIds = $existingIds;
        foreach ($manualNames as $name) {
            $spec = Specialization::firstOrCreate(['specialization_name' => $name], ['description' => 'Custom Entry']);
            $finalIds[] = $spec->specialization_id;
        }

        $doctor->fill($request->only(['first_name', 'last_name', 'contact_number', 'email', 'years_of_experience', 'consultation_fee']));

        if ($request->has('specialization_ids')) {
            $doctor->specialization_id = $finalIds[0] ?? null;
            $doctor->specializations()->sync($finalIds);
        }

        $doctor->save();
        return response()->json(['message' => 'Profile updated.', 'user' => $doctor->fresh()->load(['specialization', 'specializations'])]);
    }

    public function updatePassword(Request $request)
    {
        $doctor = $this->doctor($request);
        $request->validate(['current_password' => 'required', 'password' => 'required|min:8|confirmed']);
        if (! Hash::check($request->current_password, $doctor->password)) {
            throw ValidationException::withMessages(['current_password' => ['Current password is incorrect.']]);
        }
        $doctor->password = Hash::make($request->password);
        $doctor->save();
        return response()->json(['message' => 'Password updated.']);
    }

    public function uploadProfilePicture(Request $request)
    {
        $request->validate(['photo' => 'required|image|max:2048']);
        $doctor = $this->doctor($request);
        if ($doctor->profile_picture) {
            Storage::disk('public')->delete($doctor->profile_picture);
        }
        $path = $request->file('photo')->store('profile-pictures', 'public');
        $doctor->profile_picture = $path;
        $doctor->save();
        return response()->json(['message' => 'Photo updated.', 'profile_picture' => asset('storage/' . $path)]);
    }
}
