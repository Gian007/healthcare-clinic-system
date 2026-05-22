<?php

use Illuminate\Support\Facades\Route;
use App\Models\Appointment;
use App\Models\AppointmentCancellation;
use App\Models\SystemNotification;
use App\Models\SystemSetting;
use Illuminate\Http\Request;
use Carbon\Carbon;

Route::get('/', function () {
    return response()->json([
        'name' => 'Health Care Clinic API',
        'status' => 'Online',
        'message' => 'The backend service is running successfully.'
    ]);
});

Route::get('/appointments/{id}/confirm-attendance-signed', function (Request $request, $id) {
    if (! $request->hasValidSignature()) {
        abort(401, 'This link has expired or is invalid.');
    }

    $appointment = Appointment::with(['doctor', 'patient', 'service'])->findOrFail($id);

    if ($appointment->attendance_status === 'No Response') {
        $appointment->attendance_status = 'Yes';
        $appointment->save();

        SystemNotification::create([
            'notifiable_type' => 'patient',
            'notifiable_id'   => $appointment->patient_id,
            'title'           => 'Attendance Confirmed via Email',
            'body'            => "You have confirmed your attendance to your appointment with Dr. {$appointment->doctor->first_name} on {$appointment->appointment_date}.",
            'type'            => 'success',
        ]);
    }

    $settings = SystemSetting::getAdminPortalSettings();
    $branding = $settings['branding'] ?? [];
    $clinicName = $branding['clinicName'] ?? 'SHQMS';
    $logoPath = $branding['logoPath'] ?? '';
    
    return view('emails.attendance_response', [
        'success' => true,
        'message' => 'Thank you! Your attendance has been successfully confirmed.',
        'appointment' => $appointment,
        'clinicName' => $clinicName,
        'logoPath' => $logoPath,
        'frontendUrl' => config('app.frontend_url')
    ]);
})->name('appointment.confirm-signed');

Route::get('/appointments/{id}/decline-attendance-signed', function (Request $request, $id) {
    if (! $request->hasValidSignature()) {
        abort(401, 'This link has expired or is invalid.');
    }

    $appointment = Appointment::with(['doctor', 'patient', 'service'])->findOrFail($id);

    if (in_array($appointment->booking_status, ['Cancelled', 'Completed'])) {
        $message = 'Your appointment is already ' . strtolower($appointment->booking_status) . '.';
    } else {
        $appointment->attendance_status = 'No';
        $appointment->booking_status = 'Cancelled';
        $appointment->save();

        AppointmentCancellation::create([
            'appointment_id' => $appointment->appointment_id,
            'cancelled_by' => 'Patient',
            'cancellation_reason' => 'Declined attendance in 1-hour pre-confirmation email.',
            'cancelled_at' => now(),
        ]);

        SystemNotification::create([
            'notifiable_type' => 'patient',
            'notifiable_id'   => $appointment->patient_id,
            'title'           => 'Appointment Cancelled via Email',
            'body'            => "Your appointment with Dr. {$appointment->doctor->first_name} on {$appointment->appointment_date} has been cancelled.",
            'type'            => 'danger',
        ]);
        
        $message = 'Your appointment has been successfully cancelled and your spot has been released.';
    }

    $settings = SystemSetting::getAdminPortalSettings();
    $branding = $settings['branding'] ?? [];
    $clinicName = $branding['clinicName'] ?? 'SHQMS';
    $logoPath = $branding['logoPath'] ?? '';

    return view('emails.attendance_response', [
        'success' => false,
        'message' => $message,
        'appointment' => $appointment,
        'clinicName' => $clinicName,
        'logoPath' => $logoPath,
        'frontendUrl' => config('app.frontend_url')
    ]);
})->name('appointment.decline-signed');