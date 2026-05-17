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
                'completed'          => $appointmentsToday->where('booking_status', 'Completed')->count(),
                'waiting'            => $queuesToday->where('queue_status', 'Waiting')->count(),
            ],
        ]);
    }

    /* ─────────────────────────── Appointments ─────────────────────────── */

    public function getAppointments(Request $request)
    {
        $doctorId = $this->doctor($request)->doctor_id;

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

                // Automate next patient in the queue
                $nextQueue = Queue::where('doctor_id', $queueItem->doctor_id)
                    ->where('queue_date', $queueItem->queue_date)
                    ->where('queue_status', 'Waiting')
                    ->orderBy('queue_number', 'asc')
                    ->first();

                if ($nextQueue) {
                    $nextQueue->queue_status = 'Serving';
                    $nextQueue->save();

                    if ($nextQueue->patient_id) {
                        SystemNotification::create([
                            'notifiable_type' => 'patient',
                            'notifiable_id'   => $nextQueue->patient_id,
                            'title'           => 'Consultation Started',
                            'body'            => 'It is your turn! Please proceed to the doctor\'s clinic room.',
                            'type'            => 'info',
                        ]);
                    }
                }
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

        return response()->json(
            Queue::with('patient')
                ->where('doctor_id', $doctorId)
                ->where('queue_date', $today)
                ->orderBy('queue_number')
                ->get()
        );
    }

    public function updateQueueStatus(Request $request, $id)
    {
        $request->validate(['status' => 'required|in:Waiting,Active,Serving,Done,Cancelled']);
        
        $doctorId = $this->doctor($request)->doctor_id;
        $queue = Queue::where('queue_id', $id)->where('doctor_id', $doctorId)->firstOrFail();
        
        if ($request->status === 'Done' && $queue->queue_status !== 'Serving') {
            return response()->json(['message' => 'Cannot mark complete. The patient session must be In Progress first.'], 422);
        }

        $queue->queue_status = $request->status;
        $queue->save();

        if ($request->status === 'Done') {
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
            $nextQueue = Queue::where('doctor_id', $doctorId)
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
        $request->validate(['action' => 'required|in:time_in,break_start,break_end,time_out']);

        $doctor = $this->doctor($request);
        $today  = date('Y-m-d');

        $attendance = DoctorAttendance::firstOrCreate(
            ['doctor_id' => $doctor->doctor_id, 'date' => $today],
            ['date' => $today, 'doctor_id' => $doctor->doctor_id]
        );

        $now = now()->toTimeString();
        match ($request->action) {
            'time_in'     => $attendance->time_in     = $now,
            'break_start' => $attendance->break_start = $now,
            'break_end'   => $attendance->break_end   = $now,
            'time_out'    => $attendance->time_out    = $now,
        };

        $attendance->save();

        return response()->json(['message' => ucfirst(str_replace('_', ' ', $request->action)) . ' recorded.', 'attendance' => $attendance]);
    }

    public function getAttendance(Request $request)
    {
        $doctorId = $this->doctor($request)->doctor_id;
        return response()->json(
            DoctorAttendance::where('doctor_id', $doctorId)
                ->orderBy('date', 'desc')
                ->take(30)
                ->get()
        );
    }

    /* ─────────────────────────── Profile ─────────────────────────── */

    public function updateProfile(Request $request)
    {
        $doctor = $this->doctor($request);
        $request->validate([
            'contact_number' => 'sometimes|string|regex:/^[0-9]+$/|max:20',
            'email'          => 'sometimes|email|unique:doctors,email,' . $doctor->doctor_id . ',doctor_id',
        ]);
        $doctor->fill($request->only(['first_name', 'last_name', 'contact_number', 'email']));
        $doctor->save();
        return response()->json(['message' => 'Profile updated.', 'user' => $doctor->fresh()]);
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
