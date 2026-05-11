<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\DoctorController;
use Illuminate\Http\Request;

// Auth Routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    
    // Patient Routes
    Route::prefix('patient')->group(function() {
        Route::get('/dashboard', [\App\Http\Controllers\Api\PatientController::class, 'dashboard']);
        Route::post('/appointments', [\App\Http\Controllers\Api\PatientController::class, 'store']);
    });

    // Doctor Routes
    Route::prefix('doctor')->group(function() {
        Route::get('/dashboard', [\App\Http\Controllers\Api\DoctorController::class, 'dashboard']);
        Route::get('/appointments', [\App\Http\Controllers\Api\DoctorController::class, 'getAppointments']);
        Route::put('/appointments/{id}/status', [\App\Http\Controllers\Api\DoctorController::class, 'updateAppointmentStatus']);
    });

    // Staff Routes
    Route::prefix('staff')->group(function() {
        Route::get('/dashboard', [\App\Http\Controllers\Api\StaffController::class, 'dashboard']);
    });

    // Admin Routes
    Route::prefix('admin')->group(function() {
        Route::get('/dashboard', [\App\Http\Controllers\Api\AdminController::class, 'dashboard']);
        Route::get('/patients', [\App\Http\Controllers\Api\AdminController::class, 'getPatients']);
        Route::get('/doctors', [\App\Http\Controllers\Api\AdminController::class, 'getDoctors']);
        Route::put('/patients/{id}/status', [\App\Http\Controllers\Api\AdminController::class, 'updatePatientStatus']);
        Route::put('/doctors/{id}/status', [\App\Http\Controllers\Api\AdminController::class, 'updateDoctorStatus']);
    });
});

Route::get('/test', function () {
    return response()->json(['message' => 'React connected to Laravel', 'status' => 'ok']);
});