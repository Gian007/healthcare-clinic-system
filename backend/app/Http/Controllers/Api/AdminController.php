<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\Doctor;
use App\Models\DoctorSchedule;
use App\Models\Patient;
use App\Models\Service;
use App\Models\Specialization;
use App\Models\Staff;
use App\Models\SystemNotification;
use App\Mail\AccountCreatedMail;
use Illuminate\Support\Facades\Mail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class AdminController extends Controller
{
    /* ─────────────────────────── Dashboard ─────────────────────────── */

    public function dashboard()
    {
        $today = date('Y-m-d');

        return response()->json([
            'stats' => [
                'total_patients'        => Patient::count(),
                'total_doctors'         => Doctor::count(),
                'total_staff'           => Staff::count(),
                'appointments_today'    => Appointment::where('appointment_date', $today)->count(),
                'pending_verifications' => Patient::whereIn('verification_status', ['Pending', 'Under Review'])->count(),
                'active_appointments'   => Appointment::whereIn('booking_status', ['Pending', 'Confirmed'])->count(),
            ],
            'recent_patients' => Patient::orderBy('created_at', 'desc')->take(5)->get(),
            'recent_appointments' => Appointment::with(['patient', 'doctor', 'service'])
                ->orderBy('created_at', 'desc')
                ->take(5)
                ->get(),
        ]);
    }

    /* ─────────────────────────── Profile ─────────────────────────── */

    public function updateProfile(Request $request)
    {
        $admin = $request->user();
        $request->validate([
            'first_name'     => 'sometimes|string|max:255',
            'last_name'      => 'sometimes|string|max:255',
            'contact_number' => 'sometimes|string|regex:/^[0-9]+$/|max:20',
            'email'          => 'sometimes|email|unique:staff,email,' . $admin->staff_id . ',staff_id',
        ]);
        $admin->fill($request->only(['first_name', 'last_name', 'contact_number', 'email']));
        $admin->save();
        return response()->json(['message' => 'Profile updated.', 'user' => $admin->fresh()]);
    }

    public function updatePassword(Request $request)
    {
        $admin = $request->user();
        $request->validate(['current_password' => 'required', 'password' => 'required|min:8|confirmed']);
        if (! Hash::check($request->current_password, $admin->password)) {
            throw ValidationException::withMessages(['current_password' => ['Current password is incorrect.']]);
        }
        $admin->password = Hash::make($request->password);
        $admin->save();
        return response()->json(['message' => 'Password updated.']);
    }

    public function uploadProfilePicture(Request $request)
    {
        $request->validate(['photo' => 'required|image|max:2048']);
        $admin = $request->user();
        if ($admin->profile_picture) {
            Storage::disk('public')->delete($admin->profile_picture);
        }
        $path = $request->file('photo')->store('profile-pictures', 'public');
        $admin->profile_picture = $path;
        $admin->save();
        return response()->json(['message' => 'Photo updated.', 'profile_picture' => asset('storage/' . $path)]);
    }

    /* ─────────────────────────── Patients ─────────────────────────── */

    public function getPatients()
    {
        return response()->json(Patient::with('patientVerification')->orderBy('created_at', 'desc')->get());
    }

    public function updatePatientStatus(Request $request, $id)
    {
        $request->validate(['status' => 'required|in:Active,Inactive,Suspended']);
        $patient = Patient::findOrFail($id);
        $patient->account_status = $request->status;
        $patient->save();
        return response()->json(['message' => 'Patient status updated.', 'patient' => $patient]);
    }

    public function updatePatient(Request $request, $id)
    {
        $patient = Patient::findOrFail($id);
        $patient->update($request->all());
        return response()->json(['message' => 'Patient updated.', 'patient' => $patient]);
    }

    public function approveVerification(Request $request, $patientId)
    {
        $patient = Patient::findOrFail($patientId);
        $action = $request->action; // 'approve' or 'reject'
        
        if ($action === 'approve') {
            $patient->update(['verification_status' => 'Approved']);
            if ($patient->patientVerification) {
                $patient->patientVerification->update([
                    'status' => 'Approved',
                    'reviewed_by' => auth()->id(),
                    'reviewed_at' => now()
                ]);
            }
            SystemNotification::create([
                'notifiable_type' => 'patient',
                'notifiable_id'   => $patient->patient_id,
                'title'           => 'ID Verification Approved',
                'body'            => 'Congratulations! Your identity has been verified. You now have full access to all booking features.',
                'type'            => 'success',
            ]);
        } else {
            $patient->update(['verification_status' => 'Rejected']);
            if ($patient->patientVerification) {
                $patient->patientVerification->update([
                    'status' => 'Rejected',
                    'reviewed_by' => auth()->id(),
                    'reviewed_at' => now(),
                    'rejection_reason' => $request->reason
                ]);
            }
            SystemNotification::create([
                'notifiable_type' => 'patient',
                'notifiable_id'   => $patient->patient_id,
                'title'           => 'ID Verification Rejected',
                'body'            => "Your ID verification was rejected. Reason: {$request->reason}. Please re-upload clear and valid documents in your profile.",
                'type'            => 'danger',
            ]);
        }

        return response()->json(['message' => 'Verification processed.']);
    }

    /* ─────────────────────────── Doctors ─────────────────────────── */

    public function getDoctors()
    {
        return response()->json(Doctor::with(['specialization', 'schedules'])->get());
    }

    public function createDoctor(Request $request)
    {
        $request->validate([
            'first_name'       => 'required|string|max:255',
            'last_name'        => 'required|string|max:255',
            'specialization_id'=> 'required|exists:specializations,specialization_id',
            'license_number'   => 'required|string|unique:doctors,license_number',
            'contact_number'   => 'required|string|regex:/^[0-9]+$/|max:20',
            'email'            => 'required|email|unique:doctors,email',
        ]);

        $tempPassword = Str::random(8);

        $doctor = Doctor::create([
            'first_name'        => $request->first_name,
            'last_name'         => $request->last_name,
            'specialization_id' => $request->specialization_id,
            'license_number'    => $request->license_number,
            'contact_number'    => $request->contact_number,
            'email'             => $request->email,
            'password'          => Hash::make($tempPassword),
            'status'            => 'Active',
            'daily_booking_limit' => $request->daily_booking_limit ?? 20,
        ]);

        // Welcome notification for doctor
        SystemNotification::createWelcome('doctor', $doctor->doctor_id, trim($doctor->first_name . ' ' . $doctor->last_name));

        try {
            Mail::to($doctor->email)->send(new AccountCreatedMail($doctor, $tempPassword, 'Doctor'));
        } catch (\Exception $e) {
            // Log or ignore if email fails
        }

        return response()->json([
            'message'       => 'Doctor account created successfully.',
            'doctor'        => $doctor->load('specialization'),
            'temp_password' => $tempPassword, // display in UI to admin
        ]);
    }

    public function updateDoctor(Request $request, $id)
    {
        $doctor = Doctor::findOrFail($id);
        $request->validate([
            'status' => 'sometimes|in:Active,Inactive,On Leave',
            'daily_booking_limit' => 'sometimes|integer|min:1',
        ]);
        $doctor->fill($request->only(['first_name', 'last_name', 'contact_number', 'status', 'daily_booking_limit', 'specialization_id']));
        $doctor->save();
        return response()->json(['message' => 'Doctor updated.', 'doctor' => $doctor->load('specialization')]);
    }

    public function updateDoctorStatus(Request $request, $id)
    {
        $request->validate(['status' => 'required|in:Active,Inactive,On Leave']);
        $doctor = Doctor::findOrFail($id);
        $doctor->status = $request->status;
        $doctor->save();
        return response()->json(['message' => 'Doctor status updated.', 'doctor' => $doctor]);
    }

    /* ─────────────────────────── Staff ─────────────────────────── */

    public function getStaff()
    {
        return response()->json(Staff::orderBy('created_at', 'desc')->get()->makeHidden(['password']));
    }

    public function createStaff(Request $request)
    {
        $request->validate([
            'first_name'     => 'required|string|max:255',
            'last_name'      => 'required|string|max:255',
            'role'           => 'required|in:Admin,Receptionist,Nurse,Verifier,Queue Manager,Cashier',
            'contact_number' => 'required|string|regex:/^[0-9]+$/|max:20',
            'email'          => 'required|email|unique:staff,email',
        ]);

        $tempPassword = Str::random(8);

        $staff = Staff::create([
            'first_name'     => $request->first_name,
            'last_name'      => $request->last_name,
            'role'           => $request->role,
            'contact_number' => $request->contact_number,
            'email'          => $request->email,
            'password'       => Hash::make($tempPassword),
            'account_status' => 'Active',
        ]);

        SystemNotification::createWelcome('staff', $staff->staff_id, trim($staff->first_name . ' ' . $staff->last_name));

        try {
            Mail::to($staff->email)->send(new AccountCreatedMail($staff, $tempPassword, $staff->role));
        } catch (\Exception $e) {
            // Log or ignore if email fails
        }

        return response()->json([
            'message'       => 'Staff account created.',
            'staff'         => $staff->makeHidden(['password']),
            'temp_password' => $tempPassword,
        ]);
    }

    public function updateStaff(Request $request, $id)
    {
        $staff = Staff::findOrFail($id);
        $request->validate([
            'account_status' => 'sometimes|in:Active,Inactive,Suspended',
        ]);
        $staff->fill($request->only(['first_name', 'last_name', 'contact_number', 'role', 'account_status']));
        $staff->save();
        return response()->json(['message' => 'Staff updated.', 'staff' => $staff->makeHidden(['password'])]);
    }

    /* ─────────────────────────── Services ─────────────────────────── */

    public function getServices()
    {
        return response()->json(Service::orderBy('service_name')->get());
    }

    public function createService(Request $request)
    {
        $request->validate([
            'service_name'  => 'required|string|max:255|unique:services,service_name',
            'description'   => 'nullable|string',
            'duration_mins' => 'required|integer|min:5',
        ]);
        $service = Service::create($request->only(['service_name', 'description', 'duration_mins']));
        return response()->json(['message' => 'Service created.', 'service' => $service]);
    }

    public function updateService(Request $request, $id)
    {
        $service = Service::findOrFail($id);
        $service->fill($request->only(['service_name', 'description', 'duration_mins']));
        $service->save();
        return response()->json(['message' => 'Service updated.', 'service' => $service]);
    }

    public function deleteService($id)
    {
        Service::findOrFail($id)->delete();
        return response()->json(['message' => 'Service deleted.']);
    }

    /* ─────────────────────────── Specializations ─────────────────────── */

    public function getSpecializations()
    {
        return response()->json(Specialization::orderBy('name')->get());
    }

    /* ─────────────────────────── Schedules ─────────────────────────── */

    public function getSchedules()
    {
        return response()->json(DoctorSchedule::with(['doctor.specialization'])->get());
    }

    public function createSchedule(Request $request)
    {
        $request->validate([
            'doctor_id'    => 'required|exists:doctors,doctor_id',
            'day_of_week'  => 'required|in:Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday',
            'start_time'   => 'required',
            'end_time'     => 'required',
        ]);
        $schedule = DoctorSchedule::create($request->only(['doctor_id', 'day_of_week', 'start_time', 'end_time', 'slot_duration_mins', 'max_patients']));
        return response()->json(['message' => 'Schedule created.', 'schedule' => $schedule->load('doctor')]);
    }

    public function deleteSchedule($id)
    {
        DoctorSchedule::findOrFail($id)->delete();
        return response()->json(['message' => 'Schedule deleted.']);
    }

    /* ─────────────────────────── Reports ─────────────────────────── */

    public function getReports(Request $request)
    {
        $from = $request->from ?? now()->startOfMonth()->toDateString();
        $to   = $request->to   ?? now()->toDateString();

        $appointments = Appointment::whereBetween('appointment_date', [$from, $to]);

        return response()->json([
            'period' => ['from' => $from, 'to' => $to],
            'total_appointments'  => (clone $appointments)->count(),
            'completed'           => (clone $appointments)->where('booking_status', 'Completed')->count(),
            'cancelled'           => (clone $appointments)->where('booking_status', 'Cancelled')->count(),
            'no_show'             => (clone $appointments)->where('booking_status', 'No Show')->count(),
            'pending'             => (clone $appointments)->where('booking_status', 'Pending')->count(),
            'total_patients'      => Patient::count(),
            'new_patients'        => Patient::whereBetween('created_at', [$from . ' 00:00:00', $to . ' 23:59:59'])->count(),
            'total_doctors'       => Doctor::count(),
            'verified_patients'   => Patient::where('verification_status', 'Approved')->count(),
            'pending_verifications' => Patient::whereIn('verification_status', ['Pending', 'Under Review'])->count(),
        ]);
    }

    /* ─────────────────────────── Day-off Approvals ─────────────────── */

    public function getDayOffRequests()
    {
        return response()->json(
            \App\Models\DoctorDayOff::with('doctor')
                ->orderBy('created_at', 'desc')
                ->get()
        );
    }

    public function updateDayOffRequest(Request $request, $id)
    {
        $request->validate(['status' => 'required|in:Approved,Rejected']);
        $dayOff = \App\Models\DoctorDayOff::findOrFail($id);
        $dayOff->status = $request->status;
        $dayOff->save();

        $msg = $request->status === 'Approved'
            ? 'Your day-off request has been approved.'
            : 'Your day-off request was rejected.';

        SystemNotification::create([
            'notifiable_type' => 'doctor',
            'notifiable_id'   => $dayOff->doctor_id,
            'title'           => "Day-off Request {$request->status}",
            'body'            => $msg . " (Date: {$dayOff->date})",
            'type'            => $request->status === 'Approved' ? 'success' : 'warning',
        ]);

        return response()->json(['message' => "Day-off {$request->status}.", 'dayOff' => $dayOff]);
    }
}
