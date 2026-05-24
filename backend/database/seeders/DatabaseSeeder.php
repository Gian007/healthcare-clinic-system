<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\Specialization;
use App\Models\Staff;
use App\Models\Doctor;
use App\Models\Patient;
use App\Models\Service;
use App\Models\DoctorService;
use App\Models\DoctorSchedule;
use App\Models\SystemSetting;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 0. Seed Default Rooms
        $settings = SystemSetting::getAdminPortalSettings();
        $settings['rooms'] = [
            [
                'id' => 'room-101',
                'name' => 'Room 101',
                'purpose' => 'General Medicine Consultations',
                'status' => 'Active',
            ],
            [
                'id' => 'room-102',
                'name' => 'Room 102',
                'purpose' => 'Cardiology Screenings',
                'status' => 'Active',
            ],
            [
                'id' => 'room-103',
                'name' => 'Room 103',
                'purpose' => 'Pediatric Consultations',
                'status' => 'Active',
            ],
            [
                'id' => 'room-104',
                'name' => 'Room 104',
                'purpose' => 'General Consultations',
                'status' => 'Active',
            ],
            [
                'id' => 'room-105',
                'name' => 'Room 105',
                'purpose' => 'Specialist Consultations',
                'status' => 'Active',
            ],
        ];
        SystemSetting::saveAdminPortalSettings($settings);

        // 1. Create Specializations
        $generalSpec = Specialization::create([
            'specialization_name' => 'General Medicine',
            'description'         => 'General checkups and common medical care'
        ]);

        $cardioSpec = Specialization::create([
            'specialization_name' => 'Cardiology',
            'description'         => 'Heart health, cardiovascular screening, and consultation'
        ]);

        $pediaSpec = Specialization::create([
            'specialization_name' => 'Pediatrics',
            'description'         => 'Child healthcare and pediatric checkups'
        ]);

        // 2. Create Services
        $s1 = Service::create([
            'service_name'       => 'General Consultation',
            'description'        => 'Standard body screening and clinical diagnosis',
            'base_fee'           => 50.00,
            'estimated_duration' => 30,
            'service_status'     => 'Available'
        ]);

        $s2 = Service::create([
            'service_name'       => 'Cardiology Diagnostic',
            'description'        => 'Advanced ECG tracking and heart wellness evaluation',
            'base_fee'           => 120.00,
            'estimated_duration' => 45,
            'service_status'     => 'Available'
        ]);

        $s3 = Service::create([
            'service_name'       => 'Pediatric Checkup',
            'description'        => 'Comprehensive development check for infants and children',
            'base_fee'           => 65.00,
            'estimated_duration' => 30,
            'service_status'     => 'Available'
        ]);

        $s4 = Service::create([
            'service_name'       => 'Dental Cleaning & Exam',
            'description'        => 'Professional dental scale and polish with exam',
            'base_fee'           => 45.00,
            'estimated_duration' => 30,
            'service_status'     => 'Available'
        ]);

        $s5 = Service::create([
            'service_name'       => 'Standard Eye Assessment',
            'description'        => 'Visual acuity testing and general eye health review',
            'base_fee'           => 40.00,
            'estimated_duration' => 20,
            'service_status'     => 'Available'
        ]);

        // 3. Create Admin & Staff Account
        Staff::create([
            'first_name'     => 'Admin',
            'last_name'      => 'User',
            'role'           => 'Admin',
            'contact_number' => '09171112222',
            'email'          => 'admin@clinic.com',
            'password'       => Hash::make('password'),
            'account_status' => 'Active'
        ]);

        Staff::create([
            'first_name'     => 'Staff',
            'last_name'      => 'User',
            'role'           => 'Receptionist',
            'contact_number' => '09173334444',
            'email'          => 'staff@clinic.com',
            'password'       => Hash::make('password'),
            'account_status' => 'Active'
        ]);

        // 4. Create 5 Doctors
        // 3 configured with specialization, 2 not configured.
        $doc1 = Doctor::create([
            'first_name'          => 'Sarah',
            'last_name'           => 'Johnson',
            'specialization_id'   => $generalSpec->specialization_id,
            'license_number'      => 'LIC-55001',
            'contact_number'      => '09181111111',
            'email'               => 'doctor1@clinic.com',
            'password'            => Hash::make('password'),
            'status'              => 'Active',
            'daily_booking_limit' => 20
        ]);
        $doc1->specializations()->sync([$generalSpec->specialization_id]);

        $doc2 = Doctor::create([
            'first_name'          => 'Michael',
            'last_name'           => 'Chen',
            'specialization_id'   => $cardioSpec->specialization_id,
            'license_number'      => 'LIC-55002',
            'contact_number'      => '09182222222',
            'email'               => 'doctor2@clinic.com',
            'password'            => Hash::make('password'),
            'status'              => 'Active',
            'daily_booking_limit' => 15
        ]);
        $doc2->specializations()->sync([$cardioSpec->specialization_id]);

        $doc3 = Doctor::create([
            'first_name'          => 'Emily',
            'last_name'           => 'Rodriguez',
            'specialization_id'   => $pediaSpec->specialization_id,
            'license_number'      => 'LIC-55003',
            'contact_number'      => '09183333333',
            'email'               => 'doctor3@clinic.com',
            'password'            => Hash::make('password'),
            'status'              => 'Active',
            'daily_booking_limit' => 18
        ]);
        $doc3->specializations()->sync([$pediaSpec->specialization_id]);

        $doc4 = Doctor::create([
            'first_name'          => 'David',
            'last_name'           => 'Smith',
            'specialization_id'   => null,
            'license_number'      => 'LIC-55004',
            'contact_number'      => '09184444444',
            'email'               => 'doctor4@clinic.com',
            'password'            => Hash::make('password'),
            'status'              => 'Active',
            'daily_booking_limit' => 20
        ]);

        $doc5 = Doctor::create([
            'first_name'          => 'James',
            'last_name'           => 'Wilson',
            'specialization_id'   => null,
            'license_number'      => 'LIC-55005',
            'contact_number'      => '09185555555',
            'email'               => 'doctor5@clinic.com',
            'password'            => Hash::make('password'),
            'status'              => 'Active',
            'daily_booking_limit' => 12
        ]);

        // 5. Link Doctors to Services
        DoctorService::create(['doctor_id' => $doc1->doctor_id, 'service_id' => $s1->service_id, 'status' => 'Active']);
        DoctorService::create(['doctor_id' => $doc2->doctor_id, 'service_id' => $s2->service_id, 'status' => 'Active']);
        DoctorService::create(['doctor_id' => $doc3->doctor_id, 'service_id' => $s3->service_id, 'status' => 'Active']);
        DoctorService::create(['doctor_id' => $doc4->doctor_id, 'service_id' => $s4->service_id, 'status' => 'Active']);
        DoctorService::create(['doctor_id' => $doc5->doctor_id, 'service_id' => $s5->service_id, 'status' => 'Active']);

        // 6. Create Monday to Friday Schedules for Doctors
        $weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
        $docs = [$doc1, $doc2, $doc3, $doc4, $doc5];
        $rooms = ['Room 101', 'Room 102', 'Room 103', 'Room 104', 'Room 105'];

        foreach ($docs as $dIdx => $doc) {
            foreach ($weekdays as $day) {
                DoctorSchedule::create([
                    'doctor_id'       => $doc->doctor_id,
                    'day_of_week'     => $day,
                    'start_time'      => '09:00:00',
                    'end_time'        => '17:00:00',
                    'lunch_start'     => '12:00:00',
                    'lunch_end'       => '13:00:00',
                    'break1_start'    => '10:30:00',
                    'break1_end'      => '10:45:00',
                    'break2_start'    => '15:30:00',
                    'break2_end'      => '15:45:00',
                    'slot_limit'      => 15,
                    'schedule_status' => 'Active',
                    'room'            => $rooms[$dIdx] ?? 'Room 101'
                ]);
            }
        }

        // 7. Seed 5 Patients
        // 3 not verified, 2 verified
        $patientsData = [
            ['first_name' => 'Juan', 'last_name' => 'Dela Cruz', 'email' => 'patient1@clinic.com', 'verified' => 'Pending'],
            ['first_name' => 'Jane', 'last_name' => 'Smith', 'email' => 'patient2@clinic.com', 'verified' => 'Pending'],
            ['first_name' => 'Alice', 'last_name' => 'Green', 'email' => 'patient3@clinic.com', 'verified' => 'Pending'],
            ['first_name' => 'Bob', 'last_name' => 'Baker', 'email' => 'patient4@clinic.com', 'verified' => 'Approved'],
            ['first_name' => 'Charlie', 'last_name' => 'Miller', 'email' => 'patient5@clinic.com', 'verified' => 'Approved'],
        ];

        foreach ($patientsData as $idx => $p) {
            $num = $idx + 1;
            Patient::create([
                'patient_number'      => sprintf('PAT-%04d', $num),
                'first_name'          => $p['first_name'],
                'last_name'           => $p['last_name'],
                'middle_name'         => 'Cruz',
                'birth_date'          => '1990-01-01',
                'sex'                 => 'Male',
                'civil_status'        => 'Single',
                'contact_number'      => sprintf('091700000%02d', $num),
                'email'               => $p['email'],
                'password'            => Hash::make('password'),
                'address'             => 'Metropolitan Area, PH',
                'registration_type'   => 'Online',
                'account_status'      => 'Active',
                'verification_status' => $p['verified']
            ]);
        }

        // 8. Call Landing Page Settings Seeder
        $this->call([
            LandingPageSettingSeeder::class,
        ]);
    }
}
