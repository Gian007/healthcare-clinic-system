<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Appointment;

class PatientController extends Controller
{
    public function dashboard(Request $request)
    {
        $patientId = $request->user()->patient_id;

        $appointments = Appointment::with(['doctor', 'service'])
            ->where('patient_id', $patientId)
            ->orderBy('appointment_date', 'asc')
            ->orderBy('start_time', 'asc')
            ->get();

        return response()->json([
            'appointments' => $appointments,
            'notifications' => [] // implement notifications later
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'doctor_id' => 'required',
            'service_id' => 'required',
            'appointment_date' => 'required|date',
            'start_time' => 'required',
            'notes' => 'nullable|string'
        ]);

        $appointment = Appointment::create([
            'patient_id' => $request->user()->patient_id,
            'doctor_id' => $request->doctor_id,
            'service_id' => $request->service_id,
            'appointment_date' => $request->appointment_date,
            'start_time' => $request->start_time,
            'notes' => $request->notes,
            'booking_status' => 'Confirmed', // Automatically confirm for now, or 'Pending'
        ]);

        return response()->json(['message' => 'Appointment booked successfully', 'appointment' => $appointment]);
    }
}
