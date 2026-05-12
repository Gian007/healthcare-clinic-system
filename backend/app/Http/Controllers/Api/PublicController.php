<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Doctor;
use App\Models\Service;
// use App\Models\Announcement; // if announcement model exists
use Illuminate\Http\Request;

class PublicController extends Controller
{
    public function getDoctors()
    {
        // Only return Active doctors, and include specializations and schedules
        // Doctors with approved day-off today? 
        $today = date('l'); // Day of week
        $doctors = Doctor::with([
            'specialization', 
            'schedules' => function ($q) {
                $q->orderBy('day_of_week')->orderBy('start_time');
            },
            'dayOffs' => function ($q) {
                $q->where('status', 'Approved')->where('date', '>=', date('Y-m-d'));
            }
        ])
        ->where('status', 'Active')
        ->get();

        return response()->json($doctors);
    }

    public function getServices()
    {
        return response()->json(Service::all());
    }

    public function getQueue()
    {
        // Assuming queue public data can be derived from appointments today
        // We will just return empty array for now or fetch appointments that are Checked In
        $today = date('Y-m-d');
        $queue = \App\Models\Appointment::with(['patient:patient_id,first_name,last_name', 'doctor:doctor_id,first_name,last_name'])
            ->where('appointment_date', $today)
            ->whereIn('booking_status', ['Confirmed', 'In Progress', 'Completed'])
            ->orderBy('created_at')
            ->get()
            ->map(function ($app) {
                return [
                    'queue_number' => 'Q-' . str_pad($app->appointment_id, 3, '0', STR_PAD_LEFT),
                    'patient_name' => $app->patient ? $app->patient->first_name . ' ' . $app->patient->last_name : 'Unknown',
                    'doctor_name'  => $app->doctor ? 'Dr. ' . $app->doctor->first_name . ' ' . $app->doctor->last_name : 'Unknown',
                    'status'       => $app->booking_status,
                ];
            });

        return response()->json($queue);
    }

    public function getAnnouncements()
    {
        // For now return empty or simple placeholder since Announcements model isn't built yet,
        // but user said "Queue, announcements, services, and doctor data must all come from real database"
        return response()->json([]);
    }
}
