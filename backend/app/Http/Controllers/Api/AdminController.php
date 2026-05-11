<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Patient;
use App\Models\Doctor;
use App\Models\Staff;
use App\Models\Appointment;

class AdminController extends Controller
{
    public function dashboard(Request $request)
    {
        $today = date('Y-m-d');

        $stats = [
            'total_patients' => Patient::count(),
            'total_doctors' => Doctor::count(),
            'total_staff' => Staff::count(),
            'appointments_today' => Appointment::where('appointment_date', $today)->count(),
        ];

        $recentPatients = Patient::orderBy('created_at', 'desc')->take(5)->get();

        return response()->json([
            'stats' => $stats,
            'recent_patients' => $recentPatients
        ]);
    }

    public function getPatients() {
        return response()->json(Patient::all());
    }

    public function getDoctors() {
        return response()->json(Doctor::with('specialization')->get());
    }

    public function updatePatientStatus(Request $request, $id) {
        $patient = Patient::findOrFail($id);
        $patient->account_status = $request->status;
        $patient->save();
        return response()->json($patient);
    }

    public function updateDoctorStatus(Request $request, $id) {
        $doctor = Doctor::findOrFail($id);
        $doctor->status = $request->status;
        $doctor->save();
        return response()->json($doctor);
    }
}
