<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\Doctor;
use App\Models\DoctorSchedule;
use App\Models\DoctorAttachment;
use App\Models\Patient;
use App\Models\Service;
use App\Models\Specialization;
use App\Models\Staff;
use App\Models\SystemNotification;
use App\Models\SystemSetting;
use App\Mail\AccountCreatedMail;
use App\Mail\CustomDoctorMail;
use App\Mail\CustomStaffMail;
use Illuminate\Support\Facades\Mail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;
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

    public function getSettings()
    {
        return response()->json(SystemSetting::getAdminPortalSettings());
    }

    public function updateSettings(Request $request)
    {
        $validated = $request->validate([
            'branding' => 'sometimes|array',
            'branding.clinicName' => 'required_with:branding|string|max:80',
            'branding.tagline' => 'nullable|string|max:120',
            'branding.logoPath' => 'nullable|string|max:2048',
            'features' => 'sometimes|array',
            'features.menuItems' => 'sometimes|array',
            'features.menuItems.*' => 'boolean',
            'features.dashboardWidgets' => 'sometimes|array',
            'features.dashboardWidgets.*' => 'boolean',
            'features.patientMenuItems' => 'sometimes|array',
            'features.patientMenuItems.*' => 'boolean',
            'features.doctorMenuItems' => 'sometimes|array',
            'features.doctorMenuItems.*' => 'boolean',
            'features.guestMenuItems' => 'sometimes|array',
            'features.guestMenuItems.*' => 'boolean',
            'theme' => 'sometimes|array',
            'theme.accentColor' => ['required_with:theme', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'theme.sidebarColor' => ['required_with:theme', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'theme.fontSize' => 'required_with:theme|in:compact,comfortable,large',
            'homepage' => 'sometimes|array',
            'homepage.hero' => 'sometimes|array',
            'homepage.hero.subtitle' => 'nullable|string|max:255',
            'homepage.hero.quote' => 'nullable|string|max:255',
            'homepage.hero.ctaLabel' => 'nullable|string|max:80',
            'homepage.schedule' => 'sometimes|array',
            'homepage.schedule.*' => 'nullable|string|max:120',
            'homepage.emergency' => 'sometimes|array',
            'homepage.emergency.*' => 'nullable|string|max:255',
            'homepage.contact' => 'sometimes|array',
            'homepage.contact.*' => 'nullable|string|max:2048',
            'homepage.social' => 'sometimes|array',
            'homepage.social.*' => 'nullable|string|max:2048',
            'homepage.footer' => 'sometimes|array',
            'homepage.footer.*' => 'nullable|string|max:2048',
            'rooms' => 'sometimes|array',
            'rooms.*.id' => 'required_with:rooms|string',
            'rooms.*.name' => 'required_with:rooms|string|max:80',
            'rooms.*.purpose' => 'nullable|string|max:255',
            'rooms.*.status' => 'required_with:rooms|in:Active,Maintenance',
        ]);

        $settings = array_replace_recursive(SystemSetting::getAdminPortalSettings(), $validated);

        return response()->json([
            'message' => 'Settings updated.',
            'settings' => SystemSetting::saveAdminPortalSettings($settings),
        ]);
    }

    public function uploadBrandLogo(Request $request)
    {
        $request->validate(['logo' => 'required|image|max:2048']);

        $settings = SystemSetting::getAdminPortalSettings();
        $oldLogo = $settings['branding']['logoPath'] ?? '';

        if ($oldLogo && ! str_starts_with($oldLogo, 'http')) {
            Storage::disk('public')->delete($oldLogo);
        }

        $settings['branding']['logoPath'] = $request->file('logo')->store('branding-logos', 'public');

        return response()->json([
            'message' => 'Logo uploaded.',
            'settings' => SystemSetting::saveAdminPortalSettings($settings),
        ]);
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

    public function createPatient(Request $request)
    {
        $request->validate([
            'first_name'     => 'required|string|max:255',
            'last_name'      => 'required|string|max:255',
            'birth_date'     => 'required|date',
            'sex'            => 'required|in:Male,Female,Other',
            'contact_number' => 'required|string|max:20',
            'email'          => 'required|email|unique:patients,email',
            'address'        => 'required|string',
        ]);

        $tempPassword = Str::random(8);

        $patient = Patient::create([
            'patient_number'      => 'PAT-' . date('Ymd') . '-' . str_pad(rand(1, 9999), 4, '0', STR_PAD_LEFT),
            'first_name'          => $request->first_name,
            'last_name'           => $request->last_name,
            'middle_name'         => $request->middle_name,
            'birth_date'          => $request->birth_date,
            'sex'                 => $request->sex,
            'civil_status'        => $request->civil_status ?? 'Single',
            'contact_number'      => $request->contact_number,
            'email'               => $request->email,
            'password'            => Hash::make($tempPassword),
            'address'             => $request->address,
            'registration_type'   => 'Walk-in',
            'account_status'      => 'Active',
            'verification_status' => 'Approved', // Admin created accounts are pre-verified
        ]);

        SystemNotification::createWelcome('patient', $patient->patient_id, trim($patient->first_name . ' ' . $patient->last_name));

        try {
            Mail::to($patient->email)->send(new AccountCreatedMail($patient, $tempPassword, 'Patient'));
        } catch (\Exception $e) {
            Log::error("New patient email failed: " . $e->getMessage());
        }

        return response()->json([
            'message'       => 'Patient account created successfully.',
            'patient'       => $patient,
            'temp_password' => $tempPassword,
        ]);
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
        return response()->json(Doctor::with(['specialization', 'specializations', 'schedules'])->get());
    }

    public function createDoctor(Request $request)
    {
        $inputIds = $request->specialization_ids ?? [];
        $existingIds = array_filter($inputIds, fn($id) => is_numeric($id));
        $manualNames = array_map(fn($id) => str_replace('NEW:', '', $id), array_filter($inputIds, fn($id) => is_string($id) && Str::startsWith($id, 'NEW:')));

        $request->validate([
            'first_name'       => 'required|string|max:255',
            'last_name'        => 'required|string|max:255',
            'specialization_ids'=> 'nullable|array',
            'email'            => 'required|email|unique:doctors,email',
        ]);

        if (!empty($existingIds)) {
            $validator = \Validator::make(['ids' => $existingIds], [
                'ids.*' => 'exists:specializations,specialization_id'
            ]);
            if ($validator->fails()) {
                return response()->json(['errors' => $validator->errors()], 422);
            }
        }

        $finalIds = $existingIds;
        foreach ($manualNames as $name) {
            $spec = Specialization::firstOrCreate(['specialization_name' => $name], ['description' => 'Custom Entry']);
            $finalIds[] = $spec->specialization_id;
        }

        $tempPassword = Str::random(8);

        $doctor = Doctor::create([
            'first_name'        => $request->first_name,
            'last_name'         => $request->last_name,
            'specialization_id' => $finalIds[0] ?? null,
            'license_number'    => $request->license_number ?? 'PENDING-'.time(),
            'contact_number'    => $request->contact_number ?? 'N/A',
            'email'             => $request->email,
            'password'          => Hash::make($tempPassword),
            'status'            => 'Active',
            'daily_booking_limit' => $request->daily_booking_limit ?? 20,
        ]);

        if ($request->hasFile('photo')) {
            $path = $request->file('photo')->store('profile-pictures', 'public');
            $doctor->profile_picture = $path;
            $doctor->save();
        }

        if ($request->hasFile('attachments')) {
            foreach ($request->file('attachments') as $file) {
                $path = $file->store('doctor-attachments', 'public');
                $doctor->attachments()->create([
                    'file_path' => $path,
                    'file_name' => $file->getClientOriginalName(),
                    'file_type' => $file->getClientMimeType(),
                ]);
            }
        }

        $doctor->specializations()->sync($finalIds);

        // Welcome notification for doctor
        SystemNotification::createWelcome('doctor', $doctor->doctor_id, trim($doctor->first_name . ' ' . $doctor->last_name));

        try {
            Mail::to($doctor->email)->send(new AccountCreatedMail($doctor, $tempPassword, 'Doctor'));
        } catch (\Exception $e) {
            Log::error("Doctor account creation email failed: " . $e->getMessage());
        }

        return response()->json([
            'message'       => 'Doctor account created successfully.',
            'doctor'        => $doctor->load(['specialization', 'attachments']),
            'temp_password' => $tempPassword, // display in UI to admin
        ]);
    }

    public function updateDoctor(Request $request, $id)
    {
        $doctor = Doctor::findOrFail($id);
        $inputIds = $request->specialization_ids ?? [];
        $existingIds = array_filter($inputIds, fn($id) => is_numeric($id));
        $manualNames = array_map(fn($id) => str_replace('NEW:', '', $id), array_filter($inputIds, fn($id) => is_string($id) && Str::startsWith($id, 'NEW:')));

        $request->validate([
            'status' => 'sometimes|in:Active,Inactive,On Leave',
            'daily_booking_limit' => 'sometimes|integer|min:1',
            'specialization_ids' => 'sometimes|array',
        ]);

        if (!empty($existingIds)) {
            $validator = \Validator::make(['ids' => $existingIds], [
                'ids.*' => 'exists:specializations,specialization_id'
            ]);
            if ($validator->fails()) {
                return response()->json(['errors' => $validator->errors()], 422);
            }
        }

        $finalIds = $existingIds;
        foreach ($manualNames as $name) {
            $spec = Specialization::firstOrCreate(['specialization_name' => $name], ['description' => 'Custom Entry']);
            $finalIds[] = $spec->specialization_id;
        }
        
        $doctor->fill($request->only(['first_name', 'last_name', 'contact_number', 'status', 'daily_booking_limit']));
        
        if ($request->hasFile('photo')) {
            if ($doctor->profile_picture) {
                Storage::disk('public')->delete($doctor->profile_picture);
            }
            $path = $request->file('photo')->store('profile-pictures', 'public');
            $doctor->profile_picture = $path;
        }

        if ($request->hasFile('attachments')) {
            foreach ($request->file('attachments') as $file) {
                $path = $file->store('doctor-attachments', 'public');
                $doctor->attachments()->create([
                    'file_path' => $path,
                    'file_name' => $file->getClientOriginalName(),
                    'file_type' => $file->getClientMimeType(),
                ]);
            }
        }

        if ($request->has('specialization_ids')) {
            $doctor->specialization_id = $finalIds[0] ?? null;
            $doctor->specializations()->sync($finalIds);
        }
        
        $doctor->save();
        return response()->json(['message' => 'Doctor updated.', 'doctor' => $doctor->load(['specializations', 'attachments'])]);
    }

    public function updateDoctorStatus(Request $request, $id)
    {
        $request->validate(['status' => 'required|in:Active,Inactive,On Leave']);
        $doctor = Doctor::findOrFail($id);
        $doctor->status = $request->status;
        $doctor->save();
        return response()->json(['message' => 'Doctor status updated.', 'doctor' => $doctor]);
    }

    public function sendDoctorEmail(Request $request, $id)
    {
        $request->validate([
            'subject' => 'required|string|max:255',
            'message' => 'required|string',
        ]);

        $doctor = Doctor::findOrFail($id);

        try {
            Mail::to($doctor->email)->send(new CustomDoctorMail($doctor, $request->subject, $request->message));
            return response()->json(['message' => 'Email sent to doctor successfully.']);
        } catch (\Exception $e) {
            Log::error("Custom doctor email failed: " . $e->getMessage());
            return response()->json(['message' => 'Failed to send email. ' . $e->getMessage()], 500);
        }
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
            'email'          => 'required|email|unique:staff,email',
        ]);

        $tempPassword = Str::random(8);

        $staff = Staff::create([
            'first_name'     => $request->first_name,
            'last_name'      => $request->last_name,
            'role'           => $request->role,
            'contact_number' => $request->contact_number ?? 'N/A',
            'email'          => $request->email,
            'password'       => Hash::make($tempPassword),
            'account_status' => 'Active',
        ]);

        if ($request->hasFile('photo')) {
            $path = $request->file('photo')->store('profile-pictures', 'public');
            $staff->profile_picture = $path;
            $staff->save();
        }

        SystemNotification::createWelcome('staff', $staff->staff_id, trim($staff->first_name . ' ' . $staff->last_name));

        try {
            Mail::to($staff->email)->send(new AccountCreatedMail($staff, $tempPassword, $staff->role));
        } catch (\Exception $e) {
            Log::error("Staff account creation email failed: " . $e->getMessage());
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
        
        if ($request->hasFile('photo')) {
            if ($staff->profile_picture) {
                Storage::disk('public')->delete($staff->profile_picture);
            }
            $path = $request->file('photo')->store('profile-pictures', 'public');
            $staff->profile_picture = $path;
        }

        $staff->save();
        return response()->json(['message' => 'Staff updated.', 'staff' => $staff->makeHidden(['password'])]);
    }

    public function sendStaffEmail(Request $request, $id)
    {
        $request->validate([
            'subject' => 'required|string|max:255',
            'message' => 'required|string',
        ]);

        $staff = Staff::findOrFail($id);

        try {
            Mail::to($staff->email)->send(new CustomStaffMail($staff, $request->subject, $request->message));
            return response()->json(['message' => 'Email sent to staff successfully.']);
        } catch (\Exception $e) {
            Log::error("Custom staff email failed: " . $e->getMessage());
            return response()->json(['message' => 'Failed to send email. ' . $e->getMessage()], 500);
        }
    }

    /* ─────────────────────────── Services ─────────────────────────── */

    public function getServices()
    {
        return response()->json(Service::with(['specialization', 'specializations'])->orderBy('service_name')->get());
    }

    public function createService(Request $request)
    {
        $inputIds = $request->specialization_ids ?? [];

        $request->validate([
            'service_name'  => 'required|string|max:255|unique:services,service_name',
            'description'   => 'nullable|string',
            'duration_mins' => 'required|integer|min:5',
            'base_fee'      => 'required|numeric|min:0',
            'specialization_ids' => 'required|array|min:1',
        ]);

        // Resolve all IDs — numeric real IDs pass through, 'NEW:name' strings get firstOrCreate'd
        $finalIds = [];
        foreach ($inputIds as $entry) {
            if (is_numeric($entry)) {
                // Real DB ID — verify it exists
                $spec = Specialization::find($entry);
                if ($spec) {
                    $finalIds[] = $spec->specialization_id;
                }
            } elseif (is_string($entry) && Str::startsWith($entry, 'NEW:')) {
                $name = trim(str_replace('NEW:', '', $entry));
                if ($name) {
                    $spec = Specialization::firstOrCreate(
                        ['specialization_name' => $name],
                        ['description' => 'Custom Entry']
                    );
                    $finalIds[] = $spec->specialization_id;
                }
            } elseif (is_string($entry)) {
                // Plain name string — firstOrCreate
                $spec = Specialization::firstOrCreate(
                    ['specialization_name' => $entry],
                    ['description' => 'Custom Entry']
                );
                $finalIds[] = $spec->specialization_id;
            }
        }

        if (empty($finalIds)) {
            return response()->json(['errors' => ['specialization_ids' => ['At least one valid specialization is required.']]], 422);
        }

        $service = Service::create([
            'service_name'       => $request->service_name,
            'description'        => $request->description ?? '',
            'estimated_duration' => $request->duration_mins,
            'base_fee'           => $request->base_fee,
            'specialization_id'  => $finalIds[0] ?? null,
            'service_status'     => 'Available',
        ]);

        $service->specializations()->sync($finalIds);

        return response()->json(['message' => 'Service created.', 'service' => $service->load('specializations')]);
    }

    public function updateService(Request $request, $id)
    {
        $service = Service::findOrFail($id);
        $inputIds = $request->specialization_ids ?? [];

        $request->validate([
            'service_name'  => 'required|string|max:255|unique:services,service_name,'.$id.',service_id',
            'description'   => 'nullable|string',
            'duration_mins' => 'required|integer|min:5',
            'base_fee'      => 'required|numeric|min:0',
            'specialization_ids' => 'required|array|min:1',
        ]);

        // Resolve all IDs — numeric real IDs pass through, 'NEW:name' strings get firstOrCreate'd
        $finalIds = [];
        foreach ($inputIds as $entry) {
            if (is_numeric($entry)) {
                $spec = Specialization::find($entry);
                if ($spec) {
                    $finalIds[] = $spec->specialization_id;
                }
            } elseif (is_string($entry) && Str::startsWith($entry, 'NEW:')) {
                $name = trim(str_replace('NEW:', '', $entry));
                if ($name) {
                    $spec = Specialization::firstOrCreate(
                        ['specialization_name' => $name],
                        ['description' => 'Custom Entry']
                    );
                    $finalIds[] = $spec->specialization_id;
                }
            } elseif (is_string($entry)) {
                $spec = Specialization::firstOrCreate(
                    ['specialization_name' => $entry],
                    ['description' => 'Custom Entry']
                );
                $finalIds[] = $spec->specialization_id;
            }
        }

        if (empty($finalIds)) {
            return response()->json(['errors' => ['specialization_ids' => ['At least one valid specialization is required.']]], 422);
        }

        $service->update([
            'service_name'       => $request->service_name,
            'description'        => $request->description ?? '',
            'estimated_duration' => $request->duration_mins,
            'base_fee'           => $request->base_fee,
            'specialization_id'  => $finalIds[0] ?? null,
        ]);

        $service->specializations()->sync($finalIds);

        return response()->json(['message' => 'Service updated.', 'service' => $service->load('specializations')]);
    }

    public function deleteService($id)
    {
        Service::findOrFail($id)->delete();
        return response()->json(['message' => 'Service deleted.']);
    }

    /* ─────────────────────────── Specializations ─────────────────────── */

    public function getSpecializations()
    {
        return response()->json(Specialization::orderBy('specialization_name')->get());
    }

    public function createSpecialization(Request $request)
    {
        $request->validate(['name' => 'required|string|max:255']);
        // Use firstOrCreate so re-submitting an existing name never throws a 422
        $spec = Specialization::firstOrCreate(
            ['specialization_name' => $request->name],
            ['description' => '']
        );
        return response()->json(['message' => 'Specialization saved.', 'specialization' => $spec]);
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

    public function resetDoctorPassword(Request $request, $id)
    {
        $doctor = Doctor::findOrFail($id);
        $tempPassword = Str::random(8);
        
        $doctor->password = Hash::make($tempPassword);
        $doctor->save();

        try {
            Mail::to($doctor->email)->send(new AccountCreatedMail($doctor, $tempPassword, 'Doctor'));
        } catch (\Exception $e) {
            Log::error("Doctor password reset email failed: " . $e->getMessage());
        }

        return response()->json([
            'message' => 'Doctor password reset successfully.',
            'temp_password' => $tempPassword,
        ]);
    }

    public function resetStaffPassword(Request $request, $id)
    {
        $staff = Staff::findOrFail($id);
        $tempPassword = Str::random(8);
        
        $staff->password = Hash::make($tempPassword);
        $staff->save();

        try {
            Mail::to($staff->email)->send(new AccountCreatedMail($staff, $tempPassword, $staff->role));
        } catch (\Exception $e) {
            Log::error("Staff password reset email failed: " . $e->getMessage());
        }

        return response()->json([
            'message' => 'Staff password reset successfully.',
            'temp_password' => $tempPassword,
        ]);
    }
}
