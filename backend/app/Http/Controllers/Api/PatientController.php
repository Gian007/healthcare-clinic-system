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

class PatientController extends Controller
{
    public function dashboard(Request $request)
    {
        $patient = $request->user();
        $patientId = $patient->patient_id;

        $appointments = Appointment::with(['doctor', 'service'])
            ->where('patient_id', $patientId)
            ->orderBy('appointment_date', 'asc')
            ->orderBy('start_time', 'asc')
            ->get();

        return response()->json([
            'appointments' => $appointments,
            'patient'      => $patient,
        ]);
    }

    public function updateProfile(Request $request)
    {
        $patient   = $request->user();
        $patientId = $patient->patient_id;

        $request->validate([
            'contact_number' => 'sometimes|string|regex:/^[0-9]+$/|max:20',
            'email'          => 'sometimes|email|unique:patients,email,' . $patientId . ',patient_id',
            'birth_date'     => 'sometimes|date',
            'address'        => 'sometimes|string',
            // Name change requires a reason
            'first_name'     => 'sometimes|string|max:255',
            'last_name'      => 'sometimes|string|max:255',
            'name_change_reason' => 'required_with:first_name,last_name|nullable|string',
        ], [
            'contact_number.regex' => 'Contact number must contain numbers only.',
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
        $request->validate(['id_image' => 'required|image|max:5120']);

        $patient = $request->user();
        $path    = $request->file('id_image')->store('verification-ids', 'public');

        // Create or update patient_verifications record
        $patient->patientVerification()->updateOrCreate(
            ['patient_id' => $patient->patient_id],
            [
                'id_type'   => $request->id_type ?? 'Government ID',
                'id_image'  => $path,
                'status'    => 'Under Review',
                'submitted_at' => now(),
            ]
        );

        $patient->verification_status = 'Under Review';
        $patient->save();

        // Notify staff
        SystemNotification::create([
            'notifiable_type' => 'staff',
            'notifiable_id'   => 0,
            'title'           => 'New ID Verification Request',
            'body'            => "Patient {$patient->first_name} {$patient->last_name} (#{$patient->patient_number}) submitted an ID for verification.",
            'type'            => 'info',
        ]);

        return response()->json(['message' => 'ID submitted for review. Your account will be updated shortly.']);
    }

    public function store(Request $request)
    {
        $request->validate([
            'doctor_id'        => 'required|exists:doctors,doctor_id',
            'service_id'       => 'required|exists:services,service_id',
            'schedule_id'      => 'required|exists:doctor_schedules,schedule_id',
            'appointment_date' => 'required|date|after_or_equal:today',
            'start_time'       => 'required',
            'end_time'         => 'required',
            'reason_for_visit' => 'required|string',
        ]);

        $patient = $request->user();

        $appointment = Appointment::create([
            'patient_id'       => $patient->patient_id,
            'doctor_id'        => $request->doctor_id,
            'service_id'       => $request->service_id,
            'schedule_id'      => $request->schedule_id,
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
}
