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

use App\Models\SystemSetting;

class PublicController extends Controller
{
    public function getClinicStatus()
    {
        $today = now()->format('l');
        $date = now()->format('Y-m-d');
        $time = now()->format('H:i:s');

        $hours = ClinicOperatingHour::where('day_of_week', $today)->first();
        $special = SpecialSchedule::where('date', $date)
            ->where('applies_to_type', 'Whole Clinic')
            ->where('is_active', true)
            ->first();

        $isOpenNow = false;

        if ($special) {
            if ($special->type === 'Clinic Closed' || $special->type === 'Holiday') {
                $isOpenNow = false;
            } else if ($special->type === 'Shortened Hours') {
                if ($time >= $special->start_time && $time <= $special->end_time) {
                    $isOpenNow = true;
                }
            } else {
                // For other specials (Emergency, etc), default to checking regular hours
                if ($hours && $hours->is_open && $time >= $hours->open_time && $time <= $hours->close_time) {
                    $isOpenNow = true;
                }
            }
        } else if ($hours && $hours->is_open) {
            if ($time >= $hours->open_time && $time <= $hours->close_time) {
                $isOpenNow = true;
            }
        }

        return response()->json([
            'today' => $today,
            'date' => $date,
            'hours' => $hours,
            'special' => $special,
            'is_open_now' => $isOpenNow,
        ]);
    }

    public function getDoctors()
    {
        $date = now()->format('Y-m-d');
        $day = now()->format('l');

        $doctors = Doctor::with(['specialization', 'schedules', 'dayOffs', 'appointments', 'services'])
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

                $todaySchedule = $doc->schedules->where('day_of_week', $day)->first();
                $doc->today_schedule = $todaySchedule ? ($todaySchedule->start_time . ' - ' . $todaySchedule->end_time) : 'No Schedule Today';
                
                $doc->is_tapped_in = \App\Models\DoctorAttendance::where('doctor_id', $doc->doctor_id)
                    ->where('attendance_date', $date)
                    ->whereNotNull('time_in')
                    ->whereNull('time_out')
                    ->exists();
                
                $queueCount = \App\Models\Queue::where('doctor_id', $doc->doctor_id)
                    ->where('queue_date', $date)
                    ->whereIn('queue_status', ['Waiting', 'Active'])
                    ->count();
                    
                $doc->current_queue_count = $queueCount;
                $doc->estimated_wait_time = $queueCount * 15; // 15 mins per patient
                
                return $doc;
            });

        return response()->json($doctors);
    }

    public function getServices()
    {
        return response()->json(Service::where('is_active', true)->get());
    }

    public function getQueue()
    {
        $today = date('Y-m-d');
        $queue = \App\Models\Queue::with(['patient', 'doctor.specialization'])
            ->where('queue_date', $today)
            ->orderBy('queue_number')
            ->get();

        $pendingAppointments = \App\Models\Appointment::with(['patient'])
            ->where('appointment_date', $today)
            ->where('booking_status', 'Confirmed')
            ->whereNotIn('appointment_id', $queue->pluck('appointment_id')->filter())
            ->get()
            ->map(function ($apt) {
                return [
                    'queue_id'        => 'apt-' . $apt->appointment_id,
                    'doctor_id'       => $apt->doctor_id,
                    'patient_id'      => $apt->patient_id,
                    'patient'         => $apt->patient,
                    'queue_status'    => 'Scheduled',
                    'queue_number'    => '---',
                    'priority_number' => 9999, // Sort at the end
                    'start_time'      => $apt->start_time,
                ];
            });

        $merged = array_merge($queue->toArray(), $pendingAppointments->toArray());

        return response()->json($merged);
    }

    public function getAnnouncements()
    {
        $announcements = SpecialSchedule::where('is_active', true)
            ->orderBy('date', 'asc')
            ->get();
        return response()->json($announcements);
    }

    public function getSettings()
    {
        return response()->json(SystemSetting::getAdminPortalSettings());
    }
}
