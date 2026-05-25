<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\Patient;
use App\Models\SystemNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Carbon\Carbon;

class PatientController extends Controller
{
    public function dashboard(Request $request)
    {
        $patient = $request->user();
        $patientId = $patient->patient_id;

        $appointments = Appointment::with(['doctor', 'service', 'cancellation'])
            ->where('patient_id', $patientId)
            ->orderBy('appointment_date', 'asc')
            ->orderBy('start_time', 'asc')
            ->get();

        $today = date('Y-m-d');
        $now = now();
        $oneHourLater = now()->addHour();

        $pendingConfirm = Appointment::with(['doctor', 'service'])
            ->where('patient_id', $patientId)
            ->where('appointment_date', $today)
            ->whereIn('booking_status', ['Pending', 'Confirmed', 'Rescheduled'])
            ->where('attendance_status', 'No Response')
            ->get()
            ->filter(function($appt) use ($now, $oneHourLater) {
                $apptTime = \Carbon\Carbon::parse($appt->appointment_date . ' ' . $appt->start_time);
                return $apptTime->gt($now->subMinutes(15)) && $apptTime->lte($oneHourLater);
            })
            ->first();

        return response()->json([
            'appointments' => $appointments,
            'patient'      => $patient,
            'pending_attendance_confirm_appointment' => $pendingConfirm,
        ]);
    }

    public function updateProfile(Request $request)
    {
        $patient   = $request->user();
        $patientId = $patient->patient_id;

        $request->validate([
            'contact_number' => 'sometimes|string|regex:/^\+?[0-9]+$/|max:20',
            'email'          => 'sometimes|email|unique:patients,email,' . $patientId . ',patient_id',
            'birth_date'     => 'sometimes|date',
            'address'        => 'sometimes|string',
            // Name change requires a reason
            'first_name'     => 'sometimes|string|max:255',
            'last_name'      => 'sometimes|string|max:255',
            'name_change_reason' => 'required_with:first_name,last_name|nullable|string',
        ], [
            'contact_number.regex' => 'Contact number must contain numbers only (optionally starting with +).',
            'name_change_reason.required_with' => 'Please provide a reason for the name change.',
        ]);

        $updates = $request->only(['contact_number', 'email', 'birth_date', 'address', 'first_name', 'last_name']);

        if (!empty($updates)) {
            $patient->fill($updates);
            $patient->save();
        }

        // If name change requested, create a notification for staff review
        if ($request->has('first_name') || $request->has('last_name')) {
            if ($request->name_change_reason) {
                SystemNotification::create([
                    'notifiable_type' => 'staff',
                    'notifiable_id'   => 0, // broadcast to all staff (id=0 = broadcast)
                    'title'           => 'Patient Name Change Request',
                    'body'            => "Patient #{$patient->patient_number} requested a name change. Reason: {$request->name_change_reason}",
                    'type'            => 'warning',
                ]);
            }
        }

        return response()->json(['message' => 'Profile updated successfully.', 'user' => $patient->fresh()]);
    }

    public function updatePassword(Request $request)
    {
        $patient = $request->user();

        $request->validate([
            'current_password'      => 'required',
            'password'              => 'required|min:8|confirmed',
        ]);

        if (! Hash::check($request->current_password, $patient->password)) {
            throw ValidationException::withMessages(['current_password' => ['Current password is incorrect.']]);
        }

        $patient->password = Hash::make($request->password);
        $patient->save();

        return response()->json(['message' => 'Password updated successfully.']);
    }

    public function uploadProfilePicture(Request $request)
    {
        $request->validate(['photo' => 'required|image|max:2048']);

        $patient = $request->user();
        $path    = $request->file('photo')->store('profile-pictures', 'public');

        // Delete old photo
        if ($patient->profile_picture) {
            Storage::disk('public')->delete($patient->profile_picture);
        }

        $patient->profile_picture = $path;
        $patient->save();

        return response()->json([
            'message'       => 'Profile picture updated.',
            'profile_picture' => asset('storage/' . $path),
        ]);
    }

    public function uploadVerificationId(Request $request)
    {
        $isBase64 = is_string($request->input('id_front')) && str_starts_with($request->input('id_front'), 'data:image/');

        if ($isBase64) {
            $request->validate([
                'id_front'  => 'required|string',
                'id_back'   => 'required|string',
                'id_selfie' => 'required|string',
            ]);
        } else {
            $request->validate([
                'id_front'  => 'required|image|max:10240',
                'id_back'   => 'required|image|max:10240',
                'id_selfie' => 'required|image|max:10240',
            ]);
        }

        try {
            $patient = $request->user();
            
            if ($isBase64) {
                $frontPath  = $this->saveBase64Image($request->input('id_front'), 'verification-ids');
                $backPath   = $this->saveBase64Image($request->input('id_back'), 'verification-ids');
                $selfiePath = $this->saveBase64Image($request->input('id_selfie'), 'verification-ids');
            } else {
                $frontPath  = $request->file('id_front')->store('verification-ids', 'public');
                $backPath   = $request->file('id_back')->store('verification-ids', 'public');
                $selfiePath = $request->file('id_selfie')->store('verification-ids', 'public');
            }

            // Create or update patient_verifications record
            $patient->patientVerification()->updateOrCreate(
                ['patient_id' => $patient->patient_id],
                [
                    'id_type'       => $request->id_type ?? 'Valid ID',
                    'id_image'      => $frontPath,
                    'id_back_image' => $backPath,
                    'selfie_image'  => $selfiePath,
                    'status'        => 'Under Review',
                    'submitted_at'  => now(),
                    'rejection_reason' => null, // Reset reason on resubmit
                ]
            );

            $patient->verification_status = 'Under Review';
            $patient->save();

            // Notify staff
            SystemNotification::create([
                'notifiable_type' => 'staff',
                'notifiable_id'   => 0,
                'title'           => 'New ID Verification Request',
                'body'            => "Patient {$patient->first_name} {$patient->last_name} (#{$patient->patient_number}) submitted documents for verification.",
                'type'            => 'info',
                'link'            => "/staff/patients?review={$patient->patient_id}",
            ]);

            return response()->json(['message' => 'Documents submitted for review. Your account will be updated shortly.']);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('ID Upload Verification failed: ' . $e->getMessage(), [
                'exception' => $e
            ]);
            return response()->json([
                'message' => 'Failed to upload and save verification documents. ' . $e->getMessage()
            ], 500);
        }
    }

    private function saveBase64Image($base64String, $folder)
    {
        if (preg_match('/^data:image\/(\w+);base64,/', $base64String, $type)) {
            $data = substr($base64String, strpos($base64String, ',') + 1);
            $type = strtolower($type[1]); // jpg, png, etc.

            if (!in_array($type, ['jpg', 'jpeg', 'png', 'gif', 'webp'])) {
                throw new \Exception('Invalid image type. Only JPG, JPEG, PNG, GIF, and WEBP are allowed.');
            }

            $data = base64_decode($data);

            if ($data === false) {
                throw new \Exception('Base64 decode failed.');
            }

            if (strlen($data) > 10485760) {
                throw new \Exception('Decoded image size exceeds 10MB.');
            }

            $fileName = $folder . '/' . bin2hex(random_bytes(20)) . '.' . $type;
            Storage::disk('public')->put($fileName, $data);

            return $fileName;
        } else {
            throw new \Exception('Invalid image format. Must be a base64 encoded image string.');
        }
    }

    public function store(Request $request)
    {
        $service = \App\Models\Service::findOrFail($request->service_id);

        $rules = [
            'service_id'       => 'required|exists:services,id',
            'appointment_date' => 'required|date',
            'start_time'       => 'required',
            'end_time'         => 'required',
            'reason_for_visit' => 'required|string',
        ];

        if ($service->requires_doctor) {
            $rules['doctor_id']   = 'required|exists:doctors,doctor_id';
            $rules['schedule_id'] = 'required|exists:doctor_schedules,schedule_id';
        } else {
            $rules['doctor_id']   = 'nullable|exists:doctors,doctor_id';
            $rules['schedule_id'] = 'nullable|exists:doctor_schedules,schedule_id';
        }

        $request->validate($rules);

        $nowInManila = Carbon::now('Asia/Manila');
        $appointmentDate = Carbon::parse($request->appointment_date);
        
        // Ensure date is not in the past (date-wise) in Asia/Manila
        if ($appointmentDate->format('Y-m-d') < $nowInManila->format('Y-m-d')) {
            return response()->json(['message' => 'The appointment date cannot be in the past.'], 422);
        }

        // If today, ensure the time slot is not in the past
        if ($appointmentDate->format('Y-m-d') === $nowInManila->format('Y-m-d')) {
            $slotDateTime = Carbon::parse($appointmentDate->format('Y-m-d') . ' ' . $request->start_time, 'Asia/Manila');
            if ($slotDateTime->lt($nowInManila)) {
                return response()->json(['message' => 'This time slot has already passed.'], 422);
            }
        }

        // Double-booking/capacity check (ensure slot is not already booked, excluding Cancelled or Rejected ones)
        if ($service->requires_doctor) {
            $count = Appointment::where('doctor_id', $request->doctor_id)
                ->where('appointment_date', $request->appointment_date)
                ->where('start_time', $request->start_time)
                ->whereNotIn('booking_status', ['Cancelled', 'Rejected'])
                ->count();
            
            if ($count >= 1) {
                return response()->json(['message' => 'This time slot is already fully booked.'], 422);
            }
        } else {
            // Direct service check (capacity: max 5 bookings per slot)
            $count = Appointment::where('service_id', $request->service_id)
                ->where('appointment_date', $request->appointment_date)
                ->where('start_time', $request->start_time)
                ->whereNotIn('booking_status', ['Cancelled', 'Rejected'])
                ->count();
            
            if ($count >= 5) {
                return response()->json(['message' => 'This time slot is already fully booked.'], 422);
            }
        }

        $patient = $request->user();

        $appointment = Appointment::create([
            'patient_id'       => $patient->patient_id,
            'doctor_id'        => $service->requires_doctor ? $request->doctor_id : null,
            'service_id'       => $request->service_id,
            'schedule_id'      => $service->requires_doctor ? $request->schedule_id : null,
            'appointment_date' => $request->appointment_date,
            'start_time'       => $request->start_time,
            'end_time'         => $request->end_time,
            'appointment_type' => 'Online',
            'reason_for_visit' => $request->reason_for_visit,
            'booking_status'   => 'Pending',
            'checkin_deadline' => now()->addDays(1),
        ]);

        // Notify patient
        SystemNotification::create([
            'notifiable_type' => 'patient',
            'notifiable_id'   => $patient->patient_id,
            'title'           => 'Appointment Booked Successfully',
            'body'            => "Your appointment has been submitted and is pending confirmation. Date: {$request->appointment_date} at {$request->start_time}.",
            'type'            => 'success',
        ]);

        return response()->json(['message' => 'Appointment booked successfully.', 'appointment' => $appointment->load(['doctor', 'service'])]);
    }

    public function cancelAppointment(Request $request, $id)
    {
        $request->validate([
            'cancellation_reason' => 'required|string|max:1000',
        ]);

        $patient = $request->user();
        $appointment = Appointment::with(['doctor'])->where('appointment_id', $id)
            ->where('patient_id', $patient->patient_id)
            ->firstOrFail();

        if (in_array($appointment->booking_status, ['Cancelled', 'Completed'])) {
            return response()->json(['message' => 'Appointment is already ' . strtolower($appointment->booking_status) . '.'], 422);
        }

        $appointment->booking_status = 'Cancelled';
        $appointment->save();

        \App\Models\AppointmentCancellation::create([
            'appointment_id' => $appointment->appointment_id,
            'cancelled_by' => 'Patient',
            'cancellation_reason' => $request->cancellation_reason,
            'cancelled_at' => now(),
        ]);

        // Notify patient
        SystemNotification::create([
            'notifiable_type' => 'patient',
            'notifiable_id'   => $patient->patient_id,
            'title'           => 'Appointment Cancelled',
            'body'            => "You have cancelled your appointment with Dr. {$appointment->doctor->first_name} {$appointment->doctor->last_name} on {$appointment->appointment_date}.",
            'type'            => 'danger',
        ]);

        // Notify doctor/staff
        SystemNotification::create([
            'notifiable_type' => 'staff',
            'notifiable_id'   => 0,
            'title'           => 'Patient Cancelled Appointment',
            'body'            => "Patient {$patient->first_name} {$patient->last_name} cancelled their appointment on {$appointment->appointment_date}. Reason: {$request->cancellation_reason}",
            'type'            => 'warning',
        ]);

        return response()->json(['message' => 'Appointment cancelled successfully.', 'appointment' => $appointment]);
    }

    public function confirmAttendance(Request $request, $id)
    {
        $patient = $request->user();
        $appointment = Appointment::with(['doctor'])->where('appointment_id', $id)
            ->where('patient_id', $patient->patient_id)
            ->firstOrFail();

        $appointment->attendance_status = 'Yes';
        $appointment->save();

        SystemNotification::create([
            'notifiable_type' => 'patient',
            'notifiable_id'   => $patient->patient_id,
            'title'           => 'Attendance Confirmed',
            'body'            => "You have confirmed you are coming to your appointment with Dr. {$appointment->doctor->first_name} on {$appointment->appointment_date}.",
            'type'            => 'success',
        ]);

        return response()->json(['message' => 'Attendance confirmed successfully.', 'appointment' => $appointment]);
    }

    public function declineAttendance(Request $request, $id)
    {
        $patient = $request->user();
        $appointment = Appointment::with(['doctor'])->where('appointment_id', $id)
            ->where('patient_id', $patient->patient_id)
            ->firstOrFail();

        $appointment->attendance_status = 'No';
        $appointment->booking_status = 'Cancelled';
        $appointment->save();

        \App\Models\AppointmentCancellation::create([
            'appointment_id' => $appointment->appointment_id,
            'cancelled_by' => 'Patient',
            'cancellation_reason' => 'Declined attendance in 1-hour pre-confirmation check.',
            'cancelled_at' => now(),
        ]);

        SystemNotification::create([
            'notifiable_type' => 'patient',
            'notifiable_id'   => $patient->patient_id,
            'title'           => 'Appointment Cancelled',
            'body'            => "Your appointment with Dr. {$appointment->doctor->first_name} has been cancelled since you selected you are not going.",
            'type'            => 'danger',
        ]);

        return response()->json(['message' => 'Appointment cancelled successfully.', 'appointment' => $appointment]);
    }

    public function getServiceRequests(Request $request)
    {
        $patient = $request->user();
        $requests = \App\Models\DoctorServiceRequest::with(['doctor', 'items.service'])
            ->where('patient_id', $patient->patient_id)
            ->where('status', 'pending')
            ->orderBy('created_at', 'desc')
            ->get();
        return response()->json($requests);
    }

    public function acceptServiceRequest(Request $request, $id)
    {
        $patient = $request->user();
        $serviceRequest = \App\Models\DoctorServiceRequest::with(['items.service', 'doctor'])
            ->where('patient_id', $patient->patient_id)
            ->where('status', 'pending')
            ->findOrFail($id);

        $request->validate([
            'appointment_date' => 'required|date',
            'start_time'       => 'required',
            'end_time'         => 'required',
        ]);

        $serviceRequest->update(['status' => 'accepted']);

        // Create appointments for each requested service item
        foreach ($serviceRequest->items as $item) {
            $appointment = Appointment::create([
                'patient_id'       => $patient->patient_id,
                'doctor_id'        => $serviceRequest->doctor_id,
                'service_id'       => $item->service_id,
                'schedule_id'      => null, // Recommended items don't strictly require regular schedule linking
                'appointment_date' => $request->appointment_date,
                'start_time'       => $request->start_time,
                'end_time'         => $request->end_time,
                'appointment_type' => 'Online',
                'reason_for_visit' => "Recommended service request #" . $serviceRequest->id . ". Doctor remarks: " . ($serviceRequest->remarks ?? 'None'),
                'booking_status'   => 'Confirmed', // Automatically confirmed when accepted
                'checkin_deadline' => now()->addDays(1),
            ]);

            // Notify patient
            SystemNotification::create([
                'notifiable_type' => 'patient',
                'notifiable_id'   => $patient->patient_id,
                'title'           => 'Recommended Appointment Scheduled',
                'body'            => "Recommended service {$item->service->name} has been scheduled for {$request->appointment_date} at {$request->start_time}.",
                'type'            => 'success',
            ]);
        }

        // Notify Staff
        SystemNotification::create([
            'notifiable_type' => 'staff',
            'notifiable_id'   => 0,
            'title'           => 'Recommended Service Request Accepted',
            'body'            => "Patient {$patient->first_name} {$patient->last_name} accepted the recommended service request from Dr. {$serviceRequest->doctor->last_name}.",
            'type'            => 'info',
        ]);

        return response()->json(['message' => 'Service request accepted and scheduled successfully.']);
    }

    public function declineServiceRequest(Request $request, $id)
    {
        $patient = $request->user();
        $serviceRequest = \App\Models\DoctorServiceRequest::where('patient_id', $patient->patient_id)
            ->where('status', 'pending')
            ->findOrFail($id);

        $serviceRequest->update(['status' => 'declined']);

        // Notify Doctor
        SystemNotification::create([
            'notifiable_type' => 'doctor',
            'notifiable_id'   => $serviceRequest->doctor_id,
            'title'           => 'Recommended Service Declined',
            'body'            => "Patient {$patient->first_name} {$patient->last_name} declined your recommended service request.",
            'type'            => 'warning',
        ]);

        return response()->json(['message' => 'Service request declined.']);
    }
}
