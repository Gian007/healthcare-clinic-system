<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\PatientAuthController;
use App\Http\Controllers\Auth\StaffAuthController;
use App\Http\Controllers\DoctorController;


use App\Models\Appointment;
use Illuminate\Http\Request;

Route::get('/appointments', function () {
    return Appointment::with(['patient','doctor','service'])->get();
});

//for patient
//auth patient
Route::post('/patient/register', [PatientAuthController::class, 'register']);
Route::post('/patient/login', [PatientAuthController::class, 'login']);
Route::post('/patient/logout', [PatientAuthController::class, 'logout'])->middleware('auth:sanctum');

// staff or admin or doctor auth

Route::post('/staff/login', [StaffAuthController::class, 'login']);
Route::post('/staff/logout', [StaffAuthController::class, 'logout'])->middleware('auth:sanctum');

Route::get('/doctors', [DoctorController::class, 'index']);




Route::get('/test', function () {
    return response()->json([
        'message' => 'React connected to Laravel',
        'status' => 'ok'
    ]);
});