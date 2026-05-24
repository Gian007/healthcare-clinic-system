<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Doctor;
use App\Models\Patient;
use App\Models\Staff;
use App\Models\SystemNotification;
use App\Mail\ResetPasswordMail;
use App\Mail\PasswordResetAutoMail;
use App\Mail\VerificationCodeMail;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Log;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required',
        ]);

        $email = $request->email;
        $throttleKey = Str::lower($email) . '|' . $request->ip();

        if (\Illuminate\Support\Facades\RateLimiter::tooManyAttempts($throttleKey, 5)) {
            $seconds = \Illuminate\Support\Facades\RateLimiter::availableIn($throttleKey);
            $minutes = ceil($seconds / 60);
            throw ValidationException::withMessages([
                'email' => ["Too many login attempts. Please try again in {$minutes} minutes."],
            ]);
        }

        $user = null;
        $role = null;

        // Try to find the user in different tables
        $patient = Patient::where('email', $email)->first();
        if ($patient) {
            $user = $patient;
            $role = 'patient';
        } else {
            $doctor = Doctor::where('email', $email)->first();
            if ($doctor) {
                $user = $doctor;
                $user->load(['specialization', 'specializations']);
                $role = 'doctor';
            } else {
                $staff = Staff::where('email', $email)->first();
                if ($staff) {
                    $user = $staff;
                    $role = ($staff->role === 'Admin') ? 'admin' : 'staff';
                }
            }
        }

        if (! $user || ! Hash::check($request->password, $user->password)) {
            \Illuminate\Support\Facades\RateLimiter::hit($throttleKey, 600); // 10 minutes (600 seconds)
            throw ValidationException::withMessages([
                'email' => ['Invalid email or password.'],
            ]);
        }

        // Login success - clear rate limiter
        \Illuminate\Support\Facades\RateLimiter::clear($throttleKey);

        // Determine abilities based on the detected role
        $abilities = [$role];
        if ($role === 'staff' && $user->role === 'Admin') {
            $role = 'admin';
            $abilities = ['admin'];
        }

        $token = $user->createToken('auth_token', $abilities)->plainTextToken;

        return response()->json([
            'user'  => $user,
            'role'  => $role,
            'token' => $token,
        ]);
    }

    public function sendOTP(Request $request)
    {
        $request->validate(['email' => 'required|email|unique:patients,email']);
        $email = $request->email;
        $code = rand(100000, 999999);

        // Store code in cache for 15 minutes
        Cache::put('otp_' . $email, $code, now()->addMinutes(15));

        try {
            Mail::to($email)->send(new VerificationCodeMail($code));
            return response()->json(['message' => 'Verification code sent to your email.']);
        } catch (\Exception $e) {
            Log::error("OTP Email failed: " . $e->getMessage());

            if (app()->environment(['local', 'testing'])) {
                return response()->json([
                    'message' => 'Verification code generated. Email delivery is not available on this local setup.',
                    'otp_code' => (string) $code,
                ]);
            }

            return response()->json([
                'message' => 'Failed to send verification code. Please try again later.'
            ], 500);
        }
    }

    public function register(Request $request)
    {
        $request->validate([
            'first_name'            => 'required|string|max:255',
            'last_name'             => 'required|string|max:255',
            'middle_name'           => 'nullable|string|max:255',
            'birth_date'            => 'required|date',
            'sex'                   => 'required|in:Male,Female',
            'contact_number'        => 'required|string|regex:/^\+?[0-9]+$/|max:20',
            'email'                 => 'required|string|email|max:255|unique:patients',
            'password'              => 'required|string|min:8|confirmed',
            'address'               => 'required|string',
            'otp_code'              => 'required|string',
            'terms'                 => 'accepted',
        ], [
            'otp_code.required'     => 'The verification code is required.',
            'contact_number.regex'  => 'The contact number must contain numbers only (optionally starting with +).',
            'email.email'           => 'Please provide a valid email address.',
            'email.unique'          => 'An account with this email already exists.',
            'password.confirmed'    => 'The passwords do not match.',
            'password.min'          => 'Password must be at least 8 characters long.',
            'terms.accepted'        => 'You must accept the Terms and Conditions.',
        ]);

        // Verify OTP
        $cachedCode = Cache::get('otp_' . $request->email);
        if (!$cachedCode || $cachedCode != $request->otp_code) {
            throw ValidationException::withMessages([
                'otp_code' => ['Invalid or expired verification code.'],
            ]);
        }

        try {
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
            try {
                SystemNotification::createWelcome('patient', $patient->patient_id, trim($patient->first_name . ' ' . $patient->last_name));
            } catch (\Exception $e) {
                Log::error("Registration notification failed: " . $e->getMessage());
            }

            $token = $patient->createToken('auth_token', ['patient'])->plainTextToken;

            return response()->json([
                'user'  => $patient,
                'role'  => 'patient',
                'token' => $token,
            ]);
        } catch (\Exception $e) {
            Log::error("Registration failed: " . $e->getMessage());
            return response()->json([
                'message' => 'Registration failed. ' . $e->getMessage(),
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logged out successfully']);
    }

    public function me(Request $request)
    {
        $user = $request->user();
        if ($user instanceof \App\Models\Doctor) {
            $user->load(['specialization', 'specializations']);
        }
        return response()->json([
            'user'      => $user,
            'abilities' => $request->user()->currentAccessToken()->abilities,
        ]);
    }

    public function forgotPassword(Request $request)
    {
        $request->validate(['email' => 'required|email']);
        $email = $request->email;

        // Find user in any table
        $user = Patient::where('email', $email)->first() 
             ?? Doctor::where('email', $email)->first() 
             ?? Staff::where('email', $email)->first();

        if (!$user) {
            // Return success anyway to prevent email enumeration
            return response()->json(['message' => 'If your email is registered, you will receive a password reset link shortly.']);
        }

        // Check if Admin (Staff with role Admin)
        if (get_class($user) === Staff::class && $user->role === 'Admin') {
            return response()->json(['message' => 'Admin password reset is restricted. Please contact system support.'], 403);
        }

        // Generate token
        $token = Str::random(60);
        DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $email],
            ['token' => $token, 'created_at' => now()]
        );

        try {
            Mail::to($email)->send(new ResetPasswordMail($token, $email));
        } catch (\Exception $e) {
            Log::error("Password reset email failed: " . $e->getMessage());
        }

        return response()->json(['message' => 'If your email is registered, you will receive a password reset link shortly.']);
    }

    public function resetPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'token' => 'required',
            'password' => 'required|min:8|confirmed'
        ]);

        $record = DB::table('password_reset_tokens')->where('email', $request->email)->first();

        if (!$record || $record->token !== $request->token) {
            throw ValidationException::withMessages(['email' => ['Invalid or expired reset token.']]);
        }

        // Find user and update
        $user = Patient::where('email', $request->email)->first() 
             ?? Doctor::where('email', $request->email)->first() 
             ?? Staff::where('email', $request->email)->first();

        if ($user) {
            $user->password = Hash::make($request->password);
            $user->save();
        }

        DB::table('password_reset_tokens')->where('email', $request->email)->delete();

        return response()->json(['message' => 'Password reset successfully.']);
    }
}
