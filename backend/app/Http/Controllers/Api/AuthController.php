<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Doctor;
use App\Models\Patient;
use App\Models\Staff;
use App\Models\SystemNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required',
            'role'     => 'required|in:patient,doctor,staff,admin',
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

        if (! $user || ! Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials do not match our records.'],
            ]);
        }

        // Determine abilities
        $abilities = [$role];
        $resolvedRole = $role;
        if ($role === 'staff' && $user->role === 'Admin') {
            $abilities[]  = 'admin';
            $resolvedRole = 'admin';
        }

        $token = $user->createToken('auth_token', $abilities)->plainTextToken;

        return response()->json([
            'user'  => $user,
            'role'  => $resolvedRole,
            'token' => $token,
        ]);
    }

    public function register(Request $request)
    {
        $request->validate([
            'first_name'            => 'required|string|max:255',
            'last_name'             => 'required|string|max:255',
            'middle_name'           => 'nullable|string|max:255',
            'birth_date'            => 'required|date',
            'sex'                   => 'required|in:Male,Female',
            'contact_number'        => 'required|string|regex:/^[0-9]+$/|max:20',
            'email'                 => 'required|string|email|max:255|unique:patients',
            'password'              => 'required|string|min:8|confirmed',
            'address'               => 'required|string',
            'terms'                 => 'accepted',
        ], [
            'contact_number.regex'  => 'The contact number must contain numbers only.',
            'email.email'           => 'Please provide a valid email address.',
            'email.unique'          => 'An account with this email already exists.',
            'password.confirmed'    => 'The passwords do not match.',
            'password.min'          => 'Password must be at least 8 characters long.',
            'terms.accepted'        => 'You must accept the Terms and Conditions.',
        ]);

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
            'password'            => Hash::make($request->password),
            'address'             => $request->address,
            'registration_type'   => 'Online',
            'account_status'      => 'Active',
            'verification_status' => 'Pending',
        ]);

        // Create welcome notification
        SystemNotification::createWelcome('patient', $patient->patient_id, trim($patient->first_name . ' ' . $patient->last_name));

        $token = $patient->createToken('auth_token', ['patient'])->plainTextToken;

        return response()->json([
            'user'  => $patient,
            'role'  => 'patient',
            'token' => $token,
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
            'user'      => $request->user(),
            'abilities' => $request->user()->currentAccessToken()->abilities,
        ]);
    }
}
