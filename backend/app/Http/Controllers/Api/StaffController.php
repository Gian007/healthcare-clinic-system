<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Appointment;
use App\Models\Queue;
use App\Models\Patient;

class StaffController extends Controller
{
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
            
        $totalPatients = Patient::count();
        $pendingVerifications = Patient::whereIn('verification_status', ['Pending', 'Under Review'])->count();

        return response()->json([
            'appointments_today' => $appointmentsToday,
            'queues_today' => $queuesToday,
            'stats' => [
                'total_appointments' => $appointmentsToday->count(),
                'active_queues' => $queuesToday->whereIn('queue_status', ['Waiting', 'Active', 'Serving'])->count(),
                'total_patients' => $totalPatients,
                'pending_verifications' => $pendingVerifications,
                'walkins_today' => $queuesToday->where('queue_source', 'Walk-in')->count()
            ]
        ]);
    }
}
