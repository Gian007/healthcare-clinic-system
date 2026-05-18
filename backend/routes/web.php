<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json([
        'name' => 'Health Care Clinic API',
        'status' => 'Online',
        'message' => 'The backend service is running successfully.'
    ]);
});