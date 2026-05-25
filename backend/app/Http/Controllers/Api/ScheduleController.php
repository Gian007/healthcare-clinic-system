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

    public function getMySchedules(Request $request)
    {
        $doctor = $request->user();
        if (!$doctor || get_class($doctor) !== \App\Models\Doctor::class) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }
        
        $schedules = DoctorSchedule::where('doctor_id', $doctor->doctor_id)
            ->orderByRaw("FIELD(day_of_week, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')")
            ->get();
            
        return response()->json($schedules);
    }

    public function createDoctorSchedule(Request $request)
    {
        $request->validate([
            'doctor_id'    => 'required|exists:doctors,doctor_id',
            'day_of_week'  => 'required|string',
            'start_time'   => 'required',
            'end_time'     => 'required|after:start_time',
            'room'         => 'required|string',
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

        // Check doctor overlaps (Strict interval intersection: start1 < end2 AND end1 > start2)
        $doctorOverlap = DoctorSchedule::where('doctor_id', $request->doctor_id)
            ->where('day_of_week', $request->day_of_week)
            ->where('schedule_status', 'Active')
            ->where('start_time', '<', $request->end_time)
            ->where('end_time', '>', $request->start_time)
            ->exists();

        if ($doctorOverlap) {
            return response()->json(['message' => 'Schedule overlaps with another regular schedule for this doctor.'], 422);
        }

        // Check room overlaps
        if ($request->room) {
            $roomOverlap = DoctorSchedule::where('room', $request->room)
                ->where('day_of_week', $request->day_of_week)
                ->where('schedule_status', 'Active')
                ->where('start_time', '<', $request->end_time)
                ->where('end_time', '>', $request->start_time)
                ->exists();

            if ($roomOverlap) {
                return response()->json(['message' => "The room '{$request->room}' is already assigned to another doctor during this time slot."], 422);
            }
        }

        $schedule = DoctorSchedule::create([
            'doctor_id'       => $request->doctor_id,
            'day_of_week'     => $request->day_of_week,
            'start_time'      => $request->start_time,
            'end_time'        => $request->end_time,
            'lunch_start'     => $request->lunch_start,
            'lunch_end'       => $request->lunch_end,
            'break1_start'    => $request->break1_start,
            'break1_end'      => $request->break1_end,
            'break2_start'    => $request->break2_start,
            'break2_end'      => $request->break2_end,
            'slot_minutes'    => $request->slot_minutes ?? 30, 
            'max_patients'    => $request->slot_limit ?? 999, 
            'slot_limit'      => $request->slot_limit ?? 8, 
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
            'room'         => 'required|string',
            'schedule_status' => 'required|in:Active,Inactive',
        ]);

        // Check doctor overlaps excluding current schedule item
        $doctorOverlap = DoctorSchedule::where('doctor_id', $schedule->doctor_id)
            ->where('day_of_week', $schedule->day_of_week)
            ->where('schedule_id', '!=', $id)
            ->where('schedule_status', 'Active')
            ->where('start_time', '<', $request->end_time)
            ->where('end_time', '>', $request->start_time)
            ->exists();

        if ($doctorOverlap) {
            return response()->json(['message' => 'Schedule overlaps with another regular schedule for this doctor.'], 422);
        }

        // Check room overlaps excluding current schedule item
        if ($request->room) {
            $roomOverlap = DoctorSchedule::where('room', $request->room)
                ->where('day_of_week', $schedule->day_of_week)
                ->where('schedule_id', '!=', $id)
                ->where('schedule_status', 'Active')
                ->where('start_time', '<', $request->end_time)
                ->where('end_time', '>', $request->start_time)
                ->exists();

            if ($roomOverlap) {
                return response()->json(['message' => "The room '{$request->room}' is already assigned to another doctor during this time slot."], 422);
            }
        }

        $schedule->update($request->all());
        return response()->json(['message' => 'Schedule updated successfully.', 'schedule' => $schedule->load('doctor')]);
    }

    public function deleteDoctorSchedule($id)
    {
        $schedule = DoctorSchedule::findOrFail($id);
        
        // Check if there are any appointments referencing this schedule to prevent integrity violations
        $hasAppointments = \App\Models\Appointment::where('schedule_id', $id)->exists();
        
        if ($hasAppointments) {
            // Deactivate instead of hard deleting to preserve historical and active booking records safely
            $schedule->update(['schedule_status' => 'Inactive']);
            return response()->json([
                'message' => 'Schedule contains active or historical appointments. It has been deactivated instead of deleted.',
                'deactivated' => true
            ]);
        }
        
        $schedule->delete();
        return response()->json(['message' => 'Schedule deleted successfully.']);
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

        // Broadcast to all accounts generally (Holiday or Special)
        $appliesText = $special->applies_to_type;
        if ($special->applies_to_type === 'Specific Doctor' && $special->appliesTo) {
            $appliesText = 'Dr. ' . $special->appliesTo->first_name . ' ' . $special->appliesTo->last_name;
        }

        $formattedDate = \Carbon\Carbon::parse($special->date)->format('F d, Y');
        $title = "📅 Schedule Alert: " . $special->title;
        $body = "A special schedule has been set for {$formattedDate}. Type: {$special->type}. Applies to: {$appliesText}." . ($special->reason ? " Reason: \"{$special->reason}\"" : "");

        // 1. Broadcast to all patients
        $patients = \App\Models\Patient::all();
        foreach ($patients as $p) {
            SystemNotification::create([
                'notifiable_type' => 'patient',
                'notifiable_id'   => $p->patient_id,
                'title'           => $title,
                'body'            => $body,
                'type'            => 'warning',
                'is_read'         => false,
            ]);
        }

        // 2. Broadcast to all doctors
        $doctors = \App\Models\Doctor::all();
        foreach ($doctors as $d) {
            SystemNotification::create([
                'notifiable_type' => 'doctor',
                'notifiable_id'   => $d->doctor_id,
                'title'           => $title,
                'body'            => $body,
                'type'            => 'warning',
                'is_read'         => false,
            ]);
        }

        // 3. Broadcast to all staff
        $staff = \App\Models\Staff::all();
        foreach ($staff as $s) {
            SystemNotification::create([
                'notifiable_type' => 'staff',
                'notifiable_id'   => $s->staff_id,
                'title'           => $title,
                'body'            => $body,
                'type'            => 'warning',
                'is_read'         => false,
            ]);
        }

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
            'doctor_id'  => 'nullable|exists:doctors,doctor_id',
            'date'       => 'required|date',
            'service_id' => 'required|exists:services,id',
        ]);

        $date = Carbon::parse($request->date);
        $dayName = $date->format('l');
        $service = \App\Models\Service::findOrFail($request->service_id);
        $duration = (int) $service->estimated_duration ?: 30;

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

        // Direct Service Slot Generation (no doctor chosen)
        if (!$request->doctor_id) {
            $startTime = Carbon::parse($clinicHour->open_time);
            $endTime = Carbon::parse($clinicHour->close_time);

            // Shortened hours?
            $shortened = SpecialSchedule::where('date', $request->date)
                ->where('type', 'Shortened Hours')
                ->where('applies_to_type', 'Whole Clinic')
                ->where('is_active', true)
                ->first();
            
            if ($shortened) {
                $startTime = Carbon::parse($shortened->start_time)->max($startTime);
                $endTime = Carbon::parse($shortened->end_time)->min($endTime);
            }

            $allSlots = [];
            $current = clone $startTime;
            while ($current->lt($endTime)) {
                $slotEnd = (clone $current)->addMinutes($duration);
                if ($slotEnd->gt($endTime)) break;

                $timeStr = $current->format('H:i');
                
                // Skip typical lunch break 12:00 - 13:00
                $isLunch = ($timeStr >= '12:00' && $timeStr < '13:00');
                if ($isLunch) {
                    $current->addMinutes($duration);
                    continue;
                }

                // Check capacity: let's see how many appointments are booked for this service at this date/time
                $count = Appointment::where('service_id', $service->id)
                    ->where('appointment_date', $request->date)
                    ->where('start_time', $timeStr)
                    ->whereNotIn('booking_status', ['Cancelled', 'Rejected'])
                    ->count();

                // Capacity limit for direct services: say, maximum 5 patients per slot
                $isFull = $count >= 5;

                $slotDateTime = Carbon::parse($request->date . ' ' . $timeStr, 'Asia/Manila');
                $nowInManila = Carbon::now('Asia/Manila');
                $isPast = $slotDateTime->lt($nowInManila);

                $isAvailable = !$isFull && !$isPast;

                $allSlots[] = [
                    'time' => $timeStr,
                    'start_time' => $timeStr,
                    'end_time' => $slotEnd->format('H:i'),
                    'room' => 'Laboratory/Exam Room',
                    'schedule_id' => null,
                    'is_available' => $isAvailable,
                    'is_full' => $isFull,
                    'is_past' => $isPast
                ];

                $current->addMinutes($duration);
            }

            return response()->json(['slots' => $allSlots]);
        }

        // 3. Check Doctor Day Off
        $dayOff = DoctorDayOff::where('doctor_id', $request->doctor_id)
            ->where('dayoff_date', $request->date)
            ->where('status', 'Approved')
            ->first();
        if ($dayOff) return response()->json(['slots' => [], 'message' => 'Doctor is on leave.']);

        // 4. Get Doctor Regular Schedule
        $schedules = DoctorSchedule::where('doctor_id', $request->doctor_id)
            ->where('day_of_week', $dayName)
            ->where('schedule_status', 'Active')
            ->get();

        if ($schedules->isEmpty()) return response()->json(['slots' => [], 'message' => 'Doctor has no schedule for this day.']);

        $allSlots = [];

        foreach ($schedules as $sched) {
            $startTime = Carbon::parse($sched->start_time);
            $endTime = Carbon::parse($sched->end_time);

            // Special schedule shortened hours?
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
                $slotEnd = (clone $current)->addMinutes($duration);
                if ($slotEnd->gt($endTime)) break;

                $timeStr = $current->format('H:i');
                
                // Define Breaks from Database
                $isLunch = ($sched->lunch_start && $sched->lunch_end) && ($timeStr >= $sched->lunch_start && $timeStr < $sched->lunch_end);
                $isBreak1 = ($sched->break1_start && $sched->break1_end) && ($timeStr >= $sched->break1_start && $timeStr < $sched->break1_end);
                $isBreak2 = ($sched->break2_start && $sched->break2_end) && ($timeStr >= $sched->break2_start && $timeStr < $sched->break2_end);

                if ($isLunch || $isBreak1 || $isBreak2) {
                    $current->addMinutes($duration);
                    continue; // Skip breaks entirely from the available list
                }

                // Count existing appointments for this specific slot or time window
                $count = Appointment::where('doctor_id', $request->doctor_id)
                    ->where('appointment_date', $request->date)
                    ->where('start_time', $timeStr)
                    ->whereNotIn('booking_status', ['Cancelled', 'Rejected'])
                    ->count();
                
                $isFull = $count >= 1;

                $requestDateStr = Carbon::parse($request->date)->format('Y-m-d');
                $slotDateTime = Carbon::parse($requestDateStr . ' ' . $timeStr, 'Asia/Manila');
                $nowInManila = Carbon::now('Asia/Manila');
                $isPast = $slotDateTime->lt($nowInManila);

                $isAvailable = !$isFull && !$isPast;

                $allSlots[] = [
                    'time' => $timeStr,
                    'start_time' => $timeStr,
                    'end_time' => $slotEnd->format('H:i'),
                    'room' => $sched->room,
                    'schedule_id' => $sched->schedule_id,
                    'is_available' => $isAvailable,
                    'is_full' => $isFull,
                    'is_past' => $isPast
                ];

                $current->addMinutes($duration);
            }
        }

        return response()->json(['slots' => $allSlots]);
    }
}
