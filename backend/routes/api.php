<?php

use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DoctorController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\PatientController;
use App\Http\Controllers\Api\StaffController;
use Illuminate\Support\Facades\Route;

/* ─────────────── Public Routes ─────────────── */
Route::post('/register',        [AuthController::class, 'register']);
Route::post('/login',           [AuthController::class, 'login']);
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/reset-password',  [AuthController::class, 'resetPassword']);

Route::get('/public/doctors',       [\App\Http\Controllers\Api\PublicController::class, 'getDoctors']);
Route::get('/public/services',      [\App\Http\Controllers\Api\PublicController::class, 'getServices']);
Route::get('/public/queue',         [\App\Http\Controllers\Api\PublicController::class, 'getQueue']);
Route::get('/public/announcements', [\App\Http\Controllers\Api\PublicController::class, 'getAnnouncements']);

/* ─────────────── Authenticated Routes ─────────────── */
Route::middleware('auth:sanctum')->group(function () {

    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me',      [AuthController::class, 'me']);

    /* ── Notifications (all roles) ── */
    Route::get('/notifications',                [NotificationController::class, 'index']);
    Route::get('/notifications/unread-count',   [NotificationController::class, 'unreadCount']);
    Route::put('/notifications/read-all',       [NotificationController::class, 'markAllRead']);
    Route::put('/notifications/{id}/read',      [NotificationController::class, 'markRead']);

    /* ── Patient Routes ── */
    Route::prefix('patient')->group(function () {
        Route::get('/dashboard',          [PatientController::class, 'dashboard']);
        Route::put('/profile',            [PatientController::class, 'updateProfile']);
        Route::post('/profile/password',  [PatientController::class, 'updatePassword']);
        Route::post('/profile/photo',     [PatientController::class, 'uploadProfilePicture']);
        Route::post('/verify-id',         [PatientController::class, 'uploadVerificationId']);
        Route::post('/appointments',      [PatientController::class, 'store']);
    });

    /* ── Doctor Routes ── */
    Route::prefix('doctor')->group(function () {
        Route::get('/dashboard',                    [DoctorController::class, 'dashboard']);
        Route::get('/appointments',                 [DoctorController::class, 'getAppointments']);
        Route::put('/appointments/{id}/status',     [DoctorController::class, 'updateAppointmentStatus']);
        Route::get('/queue',                        [DoctorController::class, 'getQueue']);
        Route::get('/schedules',                    [DoctorController::class, 'getSchedules']);
        Route::get('/dayoffs',                      [DoctorController::class, 'getDayOffs']);
        Route::post('/dayoffs',                     [DoctorController::class, 'requestDayOff']);
        Route::post('/attendance',                  [DoctorController::class, 'recordAttendance']);
        Route::get('/attendance',                   [DoctorController::class, 'getAttendance']);
        Route::put('/profile',                      [DoctorController::class, 'updateProfile']);
        Route::post('/profile/password',            [DoctorController::class, 'updatePassword']);
        Route::post('/profile/photo',               [DoctorController::class, 'uploadProfilePicture']);
    });

    /* ── Staff Routes ── */
    Route::prefix('staff')->group(function () {
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
        Route::get('/schedules',                        [StaffController::class, 'getSchedules']);
        Route::get('/queue',                            [StaffController::class, 'getQueue']);
        Route::put('/queue/{id}/status',                [StaffController::class, 'updateQueueStatus']);
    });

    /* ── Admin Routes ── */
    Route::prefix('admin')->group(function () {
        Route::get('/dashboard',                    [AdminController::class, 'dashboard']);
        Route::put('/profile',                      [AdminController::class, 'updateProfile']);
        Route::post('/profile/password',            [AdminController::class, 'updatePassword']);
        Route::post('/profile/photo',               [AdminController::class, 'uploadProfilePicture']);

        Route::get('/patients',                     [AdminController::class, 'getPatients']);
        Route::put('/patients/{id}',                [AdminController::class, 'updatePatient']);
        Route::put('/patients/{id}/status',         [AdminController::class, 'updatePatientStatus']);
        Route::post('/patients/{id}/verify',        [AdminController::class, 'approveVerification']);

        Route::get('/doctors',                      [AdminController::class, 'getDoctors']);
        Route::post('/doctors',                     [AdminController::class, 'createDoctor']);
        Route::put('/doctors/{id}',                 [AdminController::class, 'updateDoctor']);
        Route::put('/doctors/{id}/status',          [AdminController::class, 'updateDoctorStatus']);

        Route::get('/staff',                        [AdminController::class, 'getStaff']);
        Route::post('/staff',                       [AdminController::class, 'createStaff']);
        Route::put('/staff/{id}',                   [AdminController::class, 'updateStaff']);

        Route::get('/services',                     [AdminController::class, 'getServices']);
        Route::post('/services',                    [AdminController::class, 'createService']);
        Route::put('/services/{id}',                [AdminController::class, 'updateService']);
        Route::delete('/services/{id}',             [AdminController::class, 'deleteService']);

        Route::get('/specializations',              [AdminController::class, 'getSpecializations']);

        Route::get('/schedules',                    [AdminController::class, 'getSchedules']);
        Route::post('/schedules',                   [AdminController::class, 'createSchedule']);
        Route::delete('/schedules/{id}',            [AdminController::class, 'deleteSchedule']);

        Route::get('/reports',                      [AdminController::class, 'getReports']);

        Route::get('/dayoffs',                      [AdminController::class, 'getDayOffRequests']);
        Route::put('/dayoffs/{id}',                 [AdminController::class, 'updateDayOffRequest']);
    });
});

Route::get('/test', fn() => response()->json(['status' => 'ok', 'message' => 'Laravel API is running.']));