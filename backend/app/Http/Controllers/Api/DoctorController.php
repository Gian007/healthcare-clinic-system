<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Appointment;
use App\Models\Queue;

class DoctorController extends Controller
{
    public function dashboard(Request $request)
    {
        $doctorId = $request->user()->doctor_id;
        $today = date('Y-m-d');

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
            'queues_today' => $queuesToday,
            'stats' => [
                'total_appointments' => $appointmentsToday->count(),
                'completed' => $appointmentsToday->where('booking_status', 'Completed')->count(),
                'waiting' => $queuesToday->where('queue_status', 'Waiting')->count(),
            ]
        ]);
    }

    public function getAppointments(Request $request)
    {
        $doctorId = $request->user()->doctor_id;
        $appointments = Appointment::with(['patient', 'service'])
            ->where('doctor_id', $doctorId)
            ->orderBy('appointment_date', 'desc')
            ->orderBy('start_time', 'asc')
            ->get();
            
        return response()->json($appointments);
    }

    public function updateAppointmentStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:Pending,Confirmed,Cancelled,Completed,No Show,Rescheduled',
            'reason' => 'nullable|string'
        ]);

        $appointment = Appointment::where('appointment_id', $id)->firstOrFail();
        
        // Authorization check
        if ($appointment->doctor_id !== $request->user()->doctor_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $appointment->booking_status = $request->status;
        if ($request->has('reason')) {
            // Ideally stored in a 'notes' or 'completion_reason' column. Using reason_for_visit for now if not exists, but better to just ignore or create new column.
            $appointment->completion_note = $request->reason;
        }
        $appointment->save();

        return response()->json(['message' => 'Status updated successfully', 'appointment' => $appointment]);
    }
}
