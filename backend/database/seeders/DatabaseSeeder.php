<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Add specializations
        $spec = \App\Models\Specialization::create([
            'specialization_name' => 'General Medicine',
            'description' => 'General health issues'
        ]);

        \App\Models\Specialization::create([
            'specialization_name' => 'Cardiology',
            'description' => 'Heart related issues'
        ]);

        // Seed Admin Staff
        \App\Models\Staff::create([
            'first_name' => 'Admin',
            'last_name' => 'User',
            'role' => 'Admin',
            'contact_number' => '1234567890',
            'email' => 'admin@clinic.com',
            'password' => \Illuminate\Support\Facades\Hash::make('password'),
            'account_status' => 'Active',
        ]);

        // Seed regular Staff
        \App\Models\Staff::create([
            'first_name' => 'Receptionist',
            'last_name' => 'User',
            'role' => 'Receptionist',
            'contact_number' => '0987654321',
            'email' => 'staff@clinic.com',
            'password' => \Illuminate\Support\Facades\Hash::make('password'),
            'account_status' => 'Active',
        ]);

        // Seed Doctor
        $doctor = \App\Models\Doctor::create([
            'first_name' => 'John',
            'last_name' => 'Doe',
            'specialization_id' => $spec->specialization_id,
            'license_number' => 'LIC12345',
            'contact_number' => '1122334455',
            'email' => 'doctor@clinic.com',
            'password' => \Illuminate\Support\Facades\Hash::make('password'),
            'status' => 'Active',
            'daily_booking_limit' => 20
        ]);

        // Seed Patient
        $patient = \App\Models\Patient::create([
            'patient_number' => 'PAT-20230101-0001',
            'first_name' => 'Jane',
            'last_name' => 'Smith',
            'middle_name' => 'A',
            'birth_date' => '1990-01-01',
            'sex' => 'Female',
            'civil_status' => 'Single',
            'contact_number' => '5544332211',
            'email' => 'patient@clinic.com',
            'password' => \Illuminate\Support\Facades\Hash::make('password'),
            'address' => '123 Main St',
            'registration_type' => 'Online',
            'account_status' => 'Active',
            'verification_status' => 'Approved',
        ]);

        $service = \App\Models\Service::create([
            'service_name' => 'General Checkup',
            'description' => 'Comprehensive general checkup',
            'base_fee' => 50.00,
            'estimated_duration' => 30,
            'service_status' => 'Available',
        ]);

        \App\Models\DoctorService::create([
            'doctor_id' => $doctor->doctor_id,
            'service_id' => $service->service_id,
            'status' => 'Active'
        ]);

        $schedule = \App\Models\DoctorSchedule::create([
            'doctor_id' => $doctor->doctor_id,
            'day_of_week' => 'Monday',
            'start_time' => '09:00:00',
            'end_time' => '17:00:00',
            'slot_limit' => 15,
            'schedule_status' => 'Active'
        ]);

        \App\Models\Appointment::create([
            'patient_id' => $patient->patient_id,
            'doctor_id' => $doctor->doctor_id,
            'service_id' => $service->service_id,
            'schedule_id' => $schedule->schedule_id,
            'appointment_date' => date('Y-m-d', strtotime('+1 day')),
            'start_time' => '09:00:00',
            'end_time' => '09:30:00',
            'appointment_type' => 'Online',
            'reason_for_visit' => 'Regular checkup',
            'booking_status' => 'Confirmed',
            'checkin_deadline' => date('Y-m-d', strtotime('+1 day')) . ' 08:45:00'
        ]);
    }
}
