<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ClinicOperatingHour;
use App\Models\Doctor;
use App\Models\DoctorSchedule;
use App\Models\DoctorDayOff;
use App\Models\SpecialSchedule;
use App\Models\SystemNotification;
use App\Models\Appointment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ScheduleController extends Controller
{
    /* ─────────────────────────── Clinic Operating Hours ─────────────────────────── */

    public function getClinicHours()
    {
        $hours = ClinicOperatingHour::all();
        if ($hours->isEmpty()) {
            $days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
            foreach ($days as $day) {
                ClinicOperatingHour::create([
                    'day_of_week' => $day,
                    'is_open' => !in_array($day, ['Sunday']),
                    'open_time' => '08:00',
                    'close_time' => '17:00'
                ]);
            }
            $hours = ClinicOperatingHour::all();
        }
        return response()->json($hours);
    }

    public function updateClinicHours(Request $request)
    {
        $request->validate([
            'hours' => 'required|array',
            'hours.*.id' => 'required|exists:clinic_operating_hours,id',
            'hours.*.is_open' => 'required|boolean',
            'hours.*.open_time' => 'required',
            'hours.*.close_time' => 'required',
        ]);

        foreach ($request->hours as $hourData) {
            ClinicOperatingHour::where('id', $hourData['id'])->update([
                'is_open' => $hourData['is_open'],
                'open_time' => $hourData['open_time'],
                'close_time' => $hourData['close_time'],
            ]);
        }

        return response()->json(['message' => 'Clinic operating hours updated.']);
    }

    /* ─────────────────────────── Doctor Regular Schedules ─────────────────────────── */

    public function getDoctorSchedules()
    {
        return response()->json(DoctorSchedule::with('doctor')->get());
    }

    public function createDoctorSchedule(Request $request)
    {
        $request->validate([
            'doctor_id'    => 'required|exists:doctors,doctor_id',
            'day_of_week'  => 'required|string',
            'start_time'   => 'required',
            'end_time'     => 'required|after:start_time',
            'slot_minutes' => 'required|integer|min:5',
            'max_patients' => 'required|integer|min:1',
            'room'         => 'nullable|string',
        ]);

        // Validate against clinic hours
        $clinicHour = ClinicOperatingHour::where('day_of_week', $request->day_of_week)->first();
        if (!$clinicHour || !$clinicHour->is_open) {
            return response()->json(['message' => 'Clinic is closed on this day.'], 422);
        }

        if (Carbon::parse($request->start_time)->lt(Carbon::parse($clinicHour->open_time)) || 
            Carbon::parse($request->end_time)->gt(Carbon::parse($clinicHour->close_time))) {
            return response()->json(['message' => 'Doctor schedule must be within clinic operating hours (' . $clinicHour->open_time . ' - ' . $clinicHour->close_time . ').'], 422);
        }

        // Check overlaps
        $overlap = DoctorSchedule::where('doctor_id', $request->doctor_id)
            ->where('day_of_week', $request->day_of_week)
            ->where(function($q) use ($request) {
                $q->whereBetween('start_time', [$request->start_time, $request->end_time])
                  ->orWhereBetween('end_time', [$request->start_time, $request->end_time]);
            })->exists();

        if ($overlap) {
            return response()->json(['message' => 'Schedule overlaps with another regular schedule for this doctor.'], 422);
        }

        $schedule = DoctorSchedule::create([
            'doctor_id'       => $request->doctor_id,
            'day_of_week'     => $request->day_of_week,
            'start_time'      => $request->start_time,
            'end_time'        => $request->end_time,
            'slot_minutes'    => $request->slot_minutes,
            'max_patients'    => $request->max_patients,
            'room'            => $request->room,
            'schedule_status' => 'Active',
        ]);

        return response()->json(['message' => 'Schedule created successfully.', 'schedule' => $schedule->load('doctor')]);
    }

    public function updateDoctorSchedule(Request $request, $id)
    {
        $schedule = DoctorSchedule::findOrFail($id);
        $request->validate([
            'start_time'   => 'required',
            'end_time'     => 'required|after:start_time',
            'slot_minutes' => 'required|integer|min:5',
            'max_patients' => 'required|integer|min:1',
            'room'         => 'nullable|string',
            'schedule_status' => 'required|in:Active,Inactive',
        ]);

        $schedule->update($request->all());
        return response()->json(['message' => 'Schedule updated successfully.', 'schedule' => $schedule->load('doctor')]);
    }

    public function deleteDoctorSchedule($id)
    {
        DoctorSchedule::findOrFail($id)->delete();
        return response()->json(['message' => 'Schedule deleted.']);
    }

    /* ─────────────────────────── Day Off Requests ─────────────────────────── */

    public function getDayOffRequests()
    {
        return response()->json(DoctorDayOff::with('doctor')->orderBy('dayoff_date', 'desc')->get());
    }

    public function approveDayOffRequest(Request $request, $id)
    {
        $dayoff = DoctorDayOff::findOrFail($id);
        $dayoff->update([
            'status' => 'Approved',
            'admin_remarks' => $request->remarks,
            'approved_by' => $request->user()->staff_id ?? $request->user()->id,
            'approved_at' => now(),
        ]);

        // Notify Doctor
        SystemNotification::create([
            'notifiable_type' => 'doctor',
            'notifiable_id'   => $dayoff->doctor_id,
            'title'           => 'Day-off Request Approved',
            'body'            => "Your day-off for {$dayoff->dayoff_date} has been approved. Reason: {$dayoff->reason}",
            'type'            => 'success'
        ]);

        // Notify Affected Patients
        $appointments = Appointment::where('doctor_id', $dayoff->doctor_id)
            ->where('appointment_date', $dayoff->dayoff_date)
            ->whereIn('booking_status', ['Pending', 'Confirmed', 'Approved'])
            ->get();

        foreach ($appointments as $app) {
            $app->update(['booking_status' => 'Affected By Schedule']);
            SystemNotification::create([
                'notifiable_type' => 'patient',
                'notifiable_id'   => $app->patient_id,
                'title'           => 'Doctor Unavailable (Reschedule Required)',
                'body'            => "Your doctor is unavailable on {$app->appointment_date}. Please wait for reschedule instructions or choose another date.",
                'type'            => 'warning'
            ]);
        }

        return response()->json(['message' => 'Day-off approved and patients notified.']);
    }

    public function rejectDayOffRequest(Request $request, $id)
    {
        $dayoff = DoctorDayOff::findOrFail($id);
        $dayoff->update([
            'status' => 'Rejected',
            'admin_remarks' => $request->remarks,
        ]);

        SystemNotification::create([
            'notifiable_type' => 'doctor',
            'notifiable_id'   => $dayoff->doctor_id,
            'title'           => 'Day-off Request Rejected',
            'body'            => "Your day-off for {$dayoff->dayoff_date} was rejected. Remarks: {$request->remarks}",
            'type'            => 'error'
        ]);

        return response()->json(['message' => 'Day-off request rejected.']);
    }

    /* ─────────────────────────── Special Schedules / Holidays ─────────────────────────── */

    public function getSpecialSchedules()
    {
        return response()->json(SpecialSchedule::with('appliesTo')->orderBy('date', 'asc')->get());
    }

    public function createSpecialSchedule(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'date' => 'required|date',
            'type' => 'required|in:Holiday,Clinic Closed,Shortened Hours,Special Doctor Schedule,Emergency',
            'applies_to_type' => 'required|in:Whole Clinic,Specific Doctor,Specific Service',
            'applies_to_id' => 'nullable|integer',
            'notify_patients' => 'boolean',
        ]);

        $special = SpecialSchedule::create($request->all());

        if ($request->notify_patients) {
            $this->notifyPatientsForSpecial($special);
        }

        return response()->json(['message' => 'Special schedule created.', 'special' => $special]);
    }

    public function updateSpecialSchedule(Request $request, $id)
    {
        $special = SpecialSchedule::findOrFail($id);
        $special->update($request->all());
        return response()->json(['message' => 'Special schedule updated.', 'special' => $special]);
    }

    public function deleteSpecialSchedule($id)
    {
        SpecialSchedule::findOrFail($id)->delete();
        return response()->json(['message' => 'Special schedule deleted.']);
    }

    private function notifyPatientsForSpecial($special)
    {
        $query = Appointment::where('appointment_date', $special->date)
            ->whereIn('booking_status', ['Pending', 'Confirmed', 'Approved']);

        if ($special->applies_to_type === 'Specific Doctor') {
            $query->where('doctor_id', $special->applies_to_id);
        } elseif ($special->applies_to_type === 'Specific Service') {
            $query->where('service_id', $special->applies_to_id);
        }

        $appointments = $query->get();

        foreach ($appointments as $app) {
            if ($special->type === 'Clinic Closed' || $special->type === 'Holiday' || $special->type === 'Emergency') {
                $app->update(['booking_status' => 'Affected By Schedule']);
            }
            
            SystemNotification::create([
                'notifiable_type' => 'patient',
                'notifiable_id'   => $app->patient_id,
                'title'           => 'Schedule Change: ' . $special->title,
                'body'            => "There is a schedule change on {$special->date}. " . ($special->reason ?: "Please check your appointment status."),
                'type'            => 'warning'
            ]);
        }
    }

    /* ─────────────────────────── Booking Availability Logic ─────────────────────────── */

    public function getAvailableSlots(Request $request)
    {
        $request->validate([
            'doctor_id' => 'required|exists:doctors,doctor_id',
            'date'      => 'required|date',
        ]);

        $date = Carbon::parse($request->date);
        $dayName = $date->format('l');

        // 1. Check Clinic Hours
        $clinicHour = ClinicOperatingHour::where('day_of_week', $dayName)->first();
        if (!$clinicHour || !$clinicHour->is_open) return response()->json(['slots' => [], 'message' => 'Clinic is closed on this day.']);

        // 2. Check Holidays / Clinic Closure
        $closure = SpecialSchedule::where('date', $request->date)
            ->whereIn('type', ['Holiday', 'Clinic Closed', 'Emergency'])
            ->where('applies_to_type', 'Whole Clinic')
            ->where('is_active', true)
            ->first();
        if ($closure) return response()->json(['slots' => [], 'message' => 'Clinic is closed for: ' . $closure->title]);

        // 3. Check Doctor Day Off
        $dayOff = DoctorDayOff::where('doctor_id', $request->doctor_id)
            ->where('dayoff_date', $request->date)
            ->where('status', 'Approved')
            ->first();
        if ($dayOff) return response()->json(['slots' => [], 'message' => 'Doctor is on leave.']);

        // 4. Check Special Schedule for specific doctor
        $specialDoc = SpecialSchedule::where('date', $request->date)
            ->where('applies_to_type', 'Specific Doctor')
            ->where('applies_to_id', $request->doctor_id)
            ->where('is_active', true)
            ->first();

        // 5. Get Doctor Regular Schedule
        $schedules = DoctorSchedule::where('doctor_id', $request->doctor_id)
            ->where('day_of_week', $dayName)
            ->where('schedule_status', 'Active')
            ->get();

        if ($schedules->isEmpty() && !$specialDoc) return response()->json(['slots' => [], 'message' => 'Doctor has no schedule for this day.']);

        $availableSlots = [];

        foreach ($schedules as $sched) {
            $startTime = Carbon::parse($sched->start_time);
            $endTime = Carbon::parse($sched->end_time);

            // If special schedule shortened hours for clinic
            $shortened = SpecialSchedule::where('date', $request->date)
                ->where('type', 'Shortened Hours')
                ->where('applies_to_type', 'Whole Clinic')
                ->where('is_active', true)
                ->first();
            
            if ($shortened) {
                $startTime = Carbon::parse($shortened->start_time)->max($startTime);
                $endTime = Carbon::parse($shortened->end_time)->min($endTime);
            }

            $current = clone $startTime;
            while ($current->lt($endTime)) {
                $slotEnd = (clone $current)->addMinutes($sched->slot_minutes);
                if ($slotEnd->gt($endTime)) break;

                $timeStr = $current->format('H:i');
                
                // Check existing appointments
                $count = Appointment::where('doctor_id', $request->doctor_id)
                    ->where('appointment_date', $request->date)
                    ->where('start_time', $timeStr)
                    ->count();
                
                if ($count < 1) { // Assuming 1 patient per slot for simplicity, or use max_patients
                     $availableSlots[] = [
                         'time' => $timeStr,
                         'end_time' => $slotEnd->format('H:i'),
                         'room' => $sched->room,
                         'schedule_id' => $sched->schedule_id
                     ];
                }

                $current->addMinutes($sched->slot_minutes);
            }
        }

        return response()->json(['slots' => $availableSlots]);
    }
}
