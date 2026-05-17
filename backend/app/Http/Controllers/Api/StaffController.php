<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\Doctor;
use App\Models\DoctorSchedule;
use App\Models\Patient;
use App\Models\PatientVerification;
use App\Models\Queue;
use App\Models\Staff;
use App\Models\SystemNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class StaffController extends Controller
{
    /* ─────────────────────────── Dashboard ─────────────────────────── */

    public function dashboard(Request $request)
    {
        $today = date('Y-m-d');

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
        $appointment->booking_status = $request->booking_status;
        $appointment->save();

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

    public function getSchedules()
    {
        return response()->json(
            DoctorSchedule::with(['doctor'])->orderBy('day_of_week')->get()
        );
    }

    /* ─────────────────────────── Queue ─────────────────────────── */

    public function getQueue()
    {
        $today = date('Y-m-d');
        return response()->json(
            Queue::with(['patient', 'doctor'])
                ->where('queue_date', $today)
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

        $queue->queue_status = $request->queue_status;
        $queue->save();

        if ($request->queue_status === 'Done') {
            if ($queue->patient_id) {
                SystemNotification::create([
                    'notifiable_type' => 'patient',
                    'notifiable_id'   => $queue->patient_id,
                    'title'           => 'Appointment Completed',
                    'body'            => 'Thank you. Your appointment is now complete. We hope to see you again soon!',
                    'type'            => 'success',
                ]);
            }

            // Automate the next patient in the queue
            $nextQueue = Queue::where('doctor_id', $queue->doctor_id)
                ->where('queue_date', $queue->queue_date)
                ->where('queue_status', 'Waiting')
                ->orderBy('queue_number', 'asc')
                ->first();

            if ($nextQueue) {
                $nextQueue->queue_status = 'Serving';
                $nextQueue->save();

                // Send notification to the next patient that their consultation is starting
                if ($nextQueue->patient_id) {
                    SystemNotification::create([
                        'notifiable_type' => 'patient',
                        'notifiable_id'   => $nextQueue->patient_id,
                        'title'           => 'Consultation Started',
                        'body' => 'It is your turn! Please proceed to the doctor\'s clinic room.',
                        'type'            => 'info',
                    ]);
                }
            }
        }

        return response()->json(['message' => 'Queue status updated.', 'queue' => $queue]);
    }
}
