<?php

use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DoctorController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\PatientController;
use App\Http\Controllers\Api\ScheduleController;
use App\Http\Controllers\Api\PublicController;
use App\Http\Controllers\Api\StaffController;
use App\Http\Controllers\ChatController;
use Illuminate\Support\Facades\Route;

/* ─────────────── Public Routes ─────────────── */
Route::post('/chat', [ChatController::class, 'chat']);
Route::post('/register',        [AuthController::class, 'register']);
Route::post('/send-otp',        [AuthController::class, 'sendOTP']);
Route::post('/login',           [AuthController::class, 'login']);
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/reset-password',  [AuthController::class, 'resetPassword']);

Route::get('/public/clinic-status', [\App\Http\Controllers\Api\PublicController::class, 'getClinicStatus']);
Route::get('/public/doctors',       [\App\Http\Controllers\Api\PublicController::class, 'getDoctors']);
Route::get('/public/services',      [\App\Http\Controllers\Api\PublicController::class, 'getServices']);
Route::get('/public/queue',         [\App\Http\Controllers\Api\PublicController::class, 'getQueue']);
Route::get('/public/announcements', [\App\Http\Controllers\Api\PublicController::class, 'getAnnouncements']);
Route::get('/public/settings',      [\App\Http\Controllers\Api\PublicController::class, 'getSettings']);
Route::get('/public/landing-page',  [\App\Http\Controllers\Api\LandingPageSettingController::class, 'index']);

/* ─────────────── Authenticated Routes ─────────────── */
Route::middleware('auth:sanctum')->group(function () {

    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me',      [AuthController::class, 'me']);
    Route::get('/services', [PublicController::class, 'getServices']);
    Route::get('/booking/available-slots', [ScheduleController::class, 'getAvailableSlots']);

    /* ── Notifications (all roles) ── */
    Route::get('/notifications',                [NotificationController::class, 'index']);
    Route::get('/notifications/unread-count',   [NotificationController::class, 'unreadCount']);
    Route::put('/notifications/read-all',       [NotificationController::class, 'markAllRead']);
    Route::put('/notifications/{id}/read',      [NotificationController::class, 'markRead']);

    /* ── Patient Routes ── */
    Route::prefix('patient')->middleware('role:patient')->group(function () {
        Route::get('/dashboard',          [PatientController::class, 'dashboard']);
        Route::put('/profile',            [PatientController::class, 'updateProfile']);
        Route::post('/profile/password',  [PatientController::class, 'updatePassword']);
        Route::post('/profile/photo',     [PatientController::class, 'uploadProfilePicture']);
        Route::post('/verify-id',         [PatientController::class, 'uploadVerificationId']);
        Route::post('/appointments',      [PatientController::class, 'store']);
        Route::put('/appointments/{id}/cancel', [PatientController::class, 'cancelAppointment']);
        Route::put('/appointments/{id}/confirm-attendance', [PatientController::class, 'confirmAttendance']);
        Route::put('/appointments/{id}/decline-attendance', [PatientController::class, 'declineAttendance']);
    });

    /* ── Doctor Routes ── */
    Route::prefix('doctor')->middleware('role:doctor')->group(function () {
        Route::get('/specializations',              [\App\Http\Controllers\Api\AdminController::class, 'getSpecializations']);
        Route::get('/dashboard',                    [DoctorController::class, 'dashboard']);
        Route::get('/appointments',                 [DoctorController::class, 'getAppointments']);
        Route::put('/appointments/{id}/status',     [DoctorController::class, 'updateAppointmentStatus']);
        Route::get('/queue',                        [DoctorController::class, 'getQueue']);
        Route::put('/queue/{id}/status',            [DoctorController::class, 'updateQueueStatus']);
        Route::get('/schedules',                    [ScheduleController::class, 'getMySchedules']);
        Route::get('/dayoffs',                      [DoctorController::class, 'getDayOffs']);
        Route::post('/dayoffs',                     [DoctorController::class, 'requestDayOff']);
        Route::delete('/dayoffs/{id}',              [DoctorController::class, 'deleteDayOff']);
        Route::post('/attendance',                  [DoctorController::class, 'recordAttendance']);
        Route::get('/attendance',                   [DoctorController::class, 'getAttendance']);
        Route::put('/profile',                      [DoctorController::class, 'updateProfile']);
        Route::post('/profile/password',            [DoctorController::class, 'updatePassword']);
        Route::post('/profile/photo',               [DoctorController::class, 'uploadProfilePicture']);
    });

    /* ── Staff Routes ── */
    Route::prefix('staff')->middleware('role:staff')->group(function () {
        Route::get('/dashboard',                        [StaffController::class, 'dashboard']);
        Route::put('/profile',                          [StaffController::class, 'updateProfile']);
        Route::post('/profile/password',                [StaffController::class, 'updatePassword']);
        Route::post('/profile/photo',                   [StaffController::class, 'uploadProfilePicture']);
        Route::get('/patients',                         [StaffController::class, 'getPatients']);
        Route::get('/patients/{id}',                    [StaffController::class, 'getPatient']);
        Route::put('/patients/{id}',                    [StaffController::class, 'updatePatient']);
        Route::get('/verifications',                    [StaffController::class, 'getPendingVerifications']);
        Route::post('/verifications/{id}',              [StaffController::class, 'approveVerification']);
        Route::get('/appointments',                     [StaffController::class, 'getAppointments']);
        Route::put('/appointments/{id}/status',         [StaffController::class, 'updateAppointmentStatus']);
        Route::post('/walk-ins',                        [StaffController::class, 'storeWalkIn']);
        Route::get('/schedules',                        [StaffController::class, 'getSchedules']);
        Route::get('/doctor-attendances',               [StaffController::class, 'getDoctorAttendances']);
        Route::post('/doctors/{id}/tap-in',             [StaffController::class, 'tapInDoctor']);
        Route::post('/doctors/{id}/tap-out',            [StaffController::class, 'tapOutDoctor']);
        Route::get('/queue',                            [StaffController::class, 'getQueue']);
        Route::put('/queue/{id}/status',                [StaffController::class, 'updateQueueStatus']);
        Route::post('/queue/{id}/tap-in',               [StaffController::class, 'tapInQueue']);
        Route::post('/queue/{id}/tap-out',              [StaffController::class, 'tapOutQueue']);
    });

    /* ── Admin Routes ── */
    Route::prefix('admin')->middleware('role:admin')->group(function () {
        Route::get('/dashboard',                    [AdminController::class, 'dashboard']);
        Route::post('/notifications/broadcast',     [NotificationController::class, 'broadcast']);
        Route::put('/profile',                      [AdminController::class, 'updateProfile']);
        Route::post('/profile/password',            [AdminController::class, 'updatePassword']);
        Route::post('/profile/photo',               [AdminController::class, 'uploadProfilePicture']);

        Route::get('/settings',                     [AdminController::class, 'getSettings']);
        Route::put('/settings',                     [AdminController::class, 'updateSettings']);
        Route::post('/settings/logo',               [AdminController::class, 'uploadBrandLogo']);

        Route::put('/landing-page/{section_key}',   [\App\Http\Controllers\Api\LandingPageSettingController::class, 'update']);
        Route::post('/landing-page/upload-image',   [\App\Http\Controllers\Api\LandingPageSettingController::class, 'uploadImage']);

        Route::get('/patients',                     [AdminController::class, 'getPatients']);
        Route::post('/patients',                    [AdminController::class, 'createPatient']);
        Route::put('/patients/{id}',                [AdminController::class, 'updatePatient']);
        Route::put('/patients/{id}/status',         [AdminController::class, 'updatePatientStatus']);
        Route::post('/patients/{id}/verify',        [AdminController::class, 'approveVerification']);

        Route::get('/doctors',                      [AdminController::class, 'getDoctors']);
        Route::post('/doctors',                     [AdminController::class, 'createDoctor']);
        Route::put('/doctors/{id}',                 [AdminController::class, 'updateDoctor']);
        Route::put('/doctors/{id}/status',          [AdminController::class, 'updateDoctorStatus']);
        Route::post('/doctors/{id}/email',           [AdminController::class, 'sendDoctorEmail']);
        Route::post('/doctors/{id}/reset-password', [AdminController::class, 'resetDoctorPassword']);

        Route::get('/staff',                        [AdminController::class, 'getStaff']);
        Route::post('/staff',                       [AdminController::class, 'createStaff']);
        Route::put('/staff/{id}',                   [AdminController::class, 'updateStaff']);
        Route::post('/staff/{id}/email',             [AdminController::class, 'sendStaffEmail']);
        Route::post('/staff/{id}/reset-password',   [AdminController::class, 'resetStaffPassword']);

        // Scheduling Overhaul
        Route::get('/clinic-hours',                 [ScheduleController::class, 'getClinicHours']);
        Route::put('/clinic-hours',                 [ScheduleController::class, 'updateClinicHours']);

        Route::get('/doctor-schedules',             [ScheduleController::class, 'getDoctorSchedules']);
        Route::post('/doctor-schedules',            [ScheduleController::class, 'createDoctorSchedule']);
        Route::put('/doctor-schedules/{id}',        [ScheduleController::class, 'updateDoctorSchedule']);
        Route::delete('/doctor-schedules/{id}',     [ScheduleController::class, 'deleteDoctorSchedule']);

        Route::get('/day-off-requests',             [ScheduleController::class, 'getDayOffRequests']);
        Route::put('/day-off-requests/{id}/approve', [ScheduleController::class, 'approveDayOffRequest']);
        Route::put('/day-off-requests/{id}/reject',  [ScheduleController::class, 'rejectDayOffRequest']);

        Route::get('/special-schedules',            [ScheduleController::class, 'getSpecialSchedules']);
        Route::post('/special-schedules',           [ScheduleController::class, 'createSpecialSchedule']);
        Route::put('/special-schedules/{id}',       [ScheduleController::class, 'updateSpecialSchedule']);
        Route::delete('/special-schedules/{id}',    [ScheduleController::class, 'deleteSpecialSchedule']);

        Route::get('/services',                     [AdminController::class, 'getServices']);
        Route::post('/services',                    [AdminController::class, 'createService']);
        Route::put('/services/{id}',                [AdminController::class, 'updateService']);
        Route::delete('/services/{id}',             [AdminController::class, 'deleteService']);

        Route::get('/specializations',              [AdminController::class, 'getSpecializations']);
        Route::post('/specializations',             [AdminController::class, 'createSpecialization']);

        Route::get('/schedules',                    [AdminController::class, 'getSchedules']);
        Route::post('/schedules',                   [AdminController::class, 'createSchedule']);
        Route::delete('/schedules/{id}',            [AdminController::class, 'deleteSchedule']);

        Route::get('/reports',                      [AdminController::class, 'getReports']);

        Route::get('/dayoffs',                      [AdminController::class, 'getDayOffRequests']);
        Route::put('/dayoffs/{id}',                 [AdminController::class, 'updateDayOffRequest']);
    });
});

Route::get('/test', fn() => response()->json(['status' => 'ok', 'message' => 'Laravel API is running.']));

Route::get('/test-email', function () {
    \Illuminate\Support\Facades\Mail::raw('Clinic system SMTP mailer is working!', function ($message) {
        $message->to('smartqueuesys@gmail.com')
                ->subject('Test Email');
    });
    return 'Email Sent!';
});
