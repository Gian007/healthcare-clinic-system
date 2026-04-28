<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Patient;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Hash;
class PatientAuthController extends Controller
{
    public function register(Request $request){
        $validator = Validator::make($request->all(),[
        'first_name' => 'required|string',
        'last_name' => 'required|string',
        'middle_name' => 'required|string',
        'birth_date' => 'required|date',
        'sex' => 'required|in:Male,Female',
        'civil_status'  => 'required|string',
        'contact_number'=> 'required|string',
        'email'         => 'required|email|unique:patients,email',
        'password'      => 'required|min:6|confirmed',
        'address'       => 'required|string',
        ]);
        
        if($validator->fails()){
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $patient = Patient::create([
            'patient_number'      => 'P-' . strtoupper(uniqid()),
            'first_name'          => $request->first_name,
            'last_name'           => $request->last_name,
            'middle_name'         => $request->middle_name,
            'birth_date'          => $request->birth_date,
            'sex'                 => $request->sex,
            'civil_status'        => $request->civil_status,
            'contact_number'      => $request->contact_number,
            'email'               => $request->email,
            'password'            => Hash::make($request->password),
            'address'             => $request->address,
            'registration_type'   => 'Online',
            'account_status'      => 'Active',
            'verification_status' => 'Pending',
        ]);

        $token = $patient->createToken('patient_token')->plainTextToken;

        return response()->json([
           'message' => 'Registration successful',
           'token' => 'token',
           'patient' => $patient, 
        ], 201);
    }

    public function login (Request $request){
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $patient = Patient::where('email', $request->email)->first();

        if(!$patient || !Hash::check($request->password, $patient->password)){
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        if($patient->account_status !== 'Active'){
            return response ()->json(['message' => 'Account is ' . $patient->account_status], 403);
        }

        $token = $patient->createToken('patient_token')->plainTextToken;

        return response()->json([
           'message' => 'Login successful',
           'token' => $token,
           'patient' => $patient 
        ]);
    }

    public function logout(Request $request){
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logged out successfully']);
    }
}
