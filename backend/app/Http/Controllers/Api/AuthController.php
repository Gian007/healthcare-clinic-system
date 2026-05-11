<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Patient;
use App\Models\Doctor;
use App\Models\Staff;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
            'role' => 'required|in:patient,doctor,staff,admin'
        ]);

        $role = $request->role;
        $user = null;

        if ($role === 'patient') {
            $user = Patient::where('email', $request->email)->first();
        } elseif ($role === 'doctor') {
            $user = Doctor::where('email', $request->email)->first();
        } elseif ($role === 'staff' || $role === 'admin') {
            $user = Staff::where('email', $request->email)->first();
        }

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials do not match our records.'],
            ]);
        }

        // Determine token abilities based on role
        $abilities = [$role];
        if ($role === 'staff' && $user->role === 'Admin') {
            $abilities[] = 'admin';
        }

        $token = $user->createToken('auth_token', $abilities)->plainTextToken;

        return response()->json([
            'user' => $user,
            'role' => $role === 'admin' ? 'admin' : ($role === 'staff' && $user->role === 'Admin' ? 'admin' : $role),
            'token' => $token
        ]);
    }

    public function register(Request $request)
    {
        $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'birth_date' => 'required|date',
            'sex' => 'required|in:Male,Female',
            'contact_number' => 'required|string|regex:/^[0-9]+$/|max:20',
            'email' => 'required|string|email|max:255|unique:patients',
            'password' => 'required|string|min:8|confirmed',
            'address' => 'required|string',
        ], [
            'contact_number.regex' => 'The contact number must contain numbers only.',
            'email.email' => 'Please provide a valid email address.',
            'password.confirmed' => 'The passwords do not match.',
            'password.min' => 'Password must be at least 8 characters long.'
        ]);

        $patient = Patient::create([
            'patient_number' => 'PAT-' . date('Ymd') . '-' . rand(1000, 9999),
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
            'middle_name' => $request->middle_name,
            'birth_date' => $request->birth_date,
            'sex' => $request->sex,
            'civil_status' => $request->civil_status ?? 'Single',
            'contact_number' => $request->contact_number,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'address' => $request->address,
            'registration_type' => 'Online',
            'account_status' => 'Active',
            'verification_status' => 'Pending',
        ]);

        $token = $patient->createToken('auth_token', ['patient'])->plainTextToken;

        return response()->json([
            'user' => $patient,
            'role' => 'patient',
            'token' => $token
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logged out successfully']);
    }

    public function me(Request $request)
    {
        return response()->json([
            'user' => $request->user(),
            'abilities' => $request->user()->currentAccessToken()->abilities
        ]);
    }
}
