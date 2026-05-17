<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Doctor;
use App\Models\Service;
// use App\Models\Announcement; // if announcement model exists
use Illuminate\Http\Request;

use App\Models\ClinicOperatingHour;
use App\Models\SpecialSchedule;
use App\Models\DoctorDayOff;
use App\Models\Appointment;

class PublicController extends Controller
{
    public function getClinicStatus()
    {
        $today = now()->format('l');
        $date = now()->format('Y-m-d');

        $hours = ClinicOperatingHour::where('day_of_week', $today)->first();
        $special = SpecialSchedule::where('date', $date)
            ->where('applies_to_type', 'Whole Clinic')
            ->where('is_active', true)
            ->first();

        return response()->json([
            'today' => $today,
            'date' => $date,
            'hours' => $hours,
            'special' => $special,
        ]);
    }

    public function getDoctors()
    {
        $date = now()->format('Y-m-d');
        $day = now()->format('l');

        $doctors = Doctor::with(['specialization', 'schedules', 'dayOffs', 'appointments'])
            ->where('status', 'Active')
            ->get()
            ->map(function($doc) use ($date, $day) {
                // Check if doctor has approved day off today
                $hasDayOff = DoctorDayOff::where('doctor_id', $doc->doctor_id)
                    ->where('dayoff_date', $date)
                    ->where('status', 'Approved')
                    ->exists();

                // Check if doctor has special schedule today
                $special = SpecialSchedule::where('date', $date)
                    ->where('applies_to_type', 'Specific Doctor')
                    ->where('applies_to_id', $doc->doctor_id)
                    ->where('is_active', true)
                    ->first();

                $doc->is_available_today = !$hasDayOff;
                if ($special && ($special->type === 'Clinic Closed' || $special->type === 'Emergency')) {
                    $doc->is_available_today = false;
                }
                
                return $doc;
            });

        return response()->json($doctors);
    }

    public function getServices()
    {
        return response()->json(Service::all());
    }

    public function getQueue()
    {
        $today = date('Y-m-d');
        $queue = \App\Models\Queue::with(['patient', 'doctor.specialization'])
            ->where('queue_date', $today)
            ->orderBy('queue_number')
            ->get();

        return response()->json($queue);
    }

    public function getAnnouncements()
    {
        $announcements = SpecialSchedule::where('is_active', true)
            ->orderBy('date', 'asc')
            ->get();
        return response()->json($announcements);
    }
}
