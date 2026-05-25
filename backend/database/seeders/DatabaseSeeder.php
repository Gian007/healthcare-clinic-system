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

        $dentistSpec = Specialization::create([
            'specialization_name' => 'Dentist',
            'description'         => 'Dental treatments and oral healthcare'
        ]);

        $pediaSpec = Specialization::create([
            'specialization_name' => 'Pediatrician',
            'description'         => 'Child healthcare and pediatric checkups'
        ]);

        $cardioSpec = Specialization::create([
            'specialization_name' => 'Cardiologist',
            'description'         => 'Heart health, cardiovascular screening, and consultation'
        ]);

        $obgyneSpec = Specialization::create([
            'specialization_name' => 'OB-Gyne',
            'description'         => 'Obstetrics, gynecology, and women healthcare'
        ]);

        // 2. Create Services (16 total)
        
        // --- CONSULTATION SERVICES ---
        $s1 = Service::create([
            'name'                     => 'General Consultation',
            'description'              => 'Basic medical consultation for common health concerns.',
            'price'                    => 500.00,
            'estimated_duration'       => 20,
            'service_type'             => 'consultation',
            'requires_doctor'          => true,
            'is_publicly_bookable'     => true,
            'required_specialization'  => $generalSpec->specialization_id,
            'is_active'                => true
        ]);
        $s1->specializations()->sync([$generalSpec->specialization_id]);

        $s2 = Service::create([
            'name'                     => 'Dental Consultation',
            'description'              => 'Dental check-up and oral health assessment.',
            'price'                    => 500.00,
            'estimated_duration'       => 20,
            'service_type'             => 'consultation',
            'requires_doctor'          => true,
            'is_publicly_bookable'     => true,
            'required_specialization'  => $dentistSpec->specialization_id,
            'is_active'                => true
        ]);
        $s2->specializations()->sync([$dentistSpec->specialization_id]);

        $s3 = Service::create([
            'name'                     => 'Pediatric Consultation',
            'description'              => 'Child health consultation and pediatric care.',
            'price'                    => 600.00,
            'estimated_duration'       => 25,
            'service_type'             => 'consultation',
            'requires_doctor'          => true,
            'is_publicly_bookable'     => true,
            'required_specialization'  => $pediaSpec->specialization_id,
            'is_active'                => true
        ]);
        $s3->specializations()->sync([$pediaSpec->specialization_id]);

        $s4 = Service::create([
            'name'                     => 'Cardiology Consultation',
            'description'              => 'Heart health assessment and cardiovascular consultation.',
            'price'                    => 900.00,
            'estimated_duration'       => 30,
            'service_type'             => 'consultation',
            'requires_doctor'          => true,
            'is_publicly_bookable'     => true,
            'required_specialization'  => $cardioSpec->specialization_id,
            'is_active'                => true
        ]);
        $s4->specializations()->sync([$cardioSpec->specialization_id]);

        $s5 = Service::create([
            'name'                     => 'OB-Gyne Consultation',
            'description'              => 'Women\'s health consultation and reproductive health care.',
            'price'                    => 800.00,
            'estimated_duration'       => 30,
            'service_type'             => 'consultation',
            'requires_doctor'          => true,
            'is_publicly_bookable'     => true,
            'required_specialization'  => $obgyneSpec->specialization_id,
            'is_active'                => true
        ]);
        $s5->specializations()->sync([$obgyneSpec->specialization_id]);

        // --- DIRECT SERVICES ---
        $s6 = Service::create([
            'name'                     => 'Pre-Employment Medical Exam',
            'description'              => 'Medical examination package for job requirements.',
            'price'                    => 1200.00,
            'estimated_duration'       => 60,
            'service_type'             => 'direct_service',
            'requires_doctor'          => false,
            'is_publicly_bookable'     => true,
            'is_active'                => true
        ]);

        $s7 = Service::create([
            'name'                     => 'School Medical Exam',
            'description'              => 'Basic medical assessment for school requirements.',
            'price'                    => 700.00,
            'estimated_duration'       => 45,
            'service_type'             => 'direct_service',
            'requires_doctor'          => false,
            'is_publicly_bookable'     => true,
            'is_active'                => true
        ]);

        $s8 = Service::create([
            'name'                     => 'Drug Test',
            'description'              => 'Drug testing service for employment, school, or compliance requirements.',
            'price'                    => 350.00,
            'estimated_duration'       => 15,
            'service_type'             => 'direct_service',
            'requires_doctor'          => false,
            'is_publicly_bookable'     => true,
            'is_active'                => true
        ]);

        $s9 = Service::create([
            'name'                     => 'CBC Blood Test',
            'description'              => 'Complete blood count laboratory test.',
            'price'                    => 250.00,
            'estimated_duration'       => 15,
            'service_type'             => 'direct_service',
            'requires_doctor'          => false,
            'is_publicly_bookable'     => true,
            'is_active'                => true
        ]);

        $s10 = Service::create([
            'name'                     => 'Urinalysis',
            'description'              => 'Urine laboratory test for common medical screening.',
            'price'                    => 150.00,
            'estimated_duration'       => 10,
            'service_type'             => 'direct_service',
            'requires_doctor'          => false,
            'is_publicly_bookable'     => true,
            'is_active'                => true
        ]);

        $s11 = Service::create([
            'name'                     => 'Chest X-Ray',
            'description'              => 'Chest imaging service commonly used for medical requirements.',
            'price'                    => 600.00,
            'estimated_duration'       => 20,
            'service_type'             => 'direct_service',
            'requires_doctor'          => false,
            'is_publicly_bookable'     => true,
            'is_active'                => true
        ]);

        $s12 = Service::create([
            'name'                     => 'ECG Test',
            'description'              => 'Electrocardiogram test for checking heart rhythm.',
            'price'                    => 500.00,
            'estimated_duration'       => 20,
            'service_type'             => 'direct_service',
            'requires_doctor'          => false,
            'is_publicly_bookable'     => true,
            'is_active'                => true
        ]);

        $s13 = Service::create([
            'name'                     => 'Medical Certificate Request',
            'description'              => 'Request for medical certificate processing after basic assessment.',
            'price'                    => 300.00,
            'estimated_duration'       => 20,
            'service_type'             => 'direct_service',
            'requires_doctor'          => false,
            'is_publicly_bookable'     => true,
            'is_active'                => true
        ]);

        // --- DOCTOR REQUESTED SERVICES ---
        $s14 = Service::create([
            'name'                     => 'Follow-up Laboratory Panel',
            'description'              => 'Laboratory package recommended by a doctor after consultation.',
            'price'                    => 1000.00,
            'estimated_duration'       => 45,
            'service_type'             => 'doctor_requested',
            'requires_doctor'          => true,
            'is_publicly_bookable'     => false,
            'is_active'                => true
        ]);

        $s15 = Service::create([
            'name'                     => 'Additional Diagnostic Review',
            'description'              => 'Additional diagnostic service requested by the attending doctor.',
            'price'                    => 700.00,
            'estimated_duration'       => 30,
            'service_type'             => 'doctor_requested',
            'requires_doctor'          => true,
            'is_publicly_bookable'     => false,
            'is_active'                => true
        ]);

        $s16 = Service::create([
            'name'                     => 'Follow-up Checkup',
            'description'              => 'Doctor-requested follow-up visit after initial consultation.',
            'price'                    => 400.00,
            'estimated_duration'       => 20,
            'service_type'             => 'doctor_requested',
            'requires_doctor'          => true,
            'is_publicly_bookable'     => false,
            'is_active'                => true
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
        $doc1 = Doctor::create([
            'first_name'          => 'Maria',
            'last_name'           => 'Santos',
            'specialization_id'   => $generalSpec->specialization_id,
            'license_number'      => 'MD-2026-001',
            'contact_number'      => '09181111111',
            'email'               => 'maria.santos@mediqueueclinic.com',
            'password'            => Hash::make('password'),
            'status'              => 'Active',
            'daily_booking_limit' => 20
        ]);
        $doc1->specializations()->sync([$generalSpec->specialization_id]);

        $doc2 = Doctor::create([
            'first_name'          => 'John',
            'last_name'           => 'Cruz',
            'specialization_id'   => $dentistSpec->specialization_id,
            'license_number'      => 'DENT-2026-002',
            'contact_number'      => '09182222222',
            'email'               => 'john.cruz@mediqueueclinic.com',
            'password'            => Hash::make('password'),
            'status'              => 'Active',
            'daily_booking_limit' => 15
        ]);
        $doc2->specializations()->sync([$dentistSpec->specialization_id]);

        $doc3 = Doctor::create([
            'first_name'          => 'Ana',
            'last_name'           => 'Reyes',
            'specialization_id'   => $pediaSpec->specialization_id,
            'license_number'      => 'MD-2026-003',
            'contact_number'      => '09183333333',
            'email'               => 'ana.reyes@mediqueueclinic.com',
            'password'            => Hash::make('password'),
            'status'              => 'Active',
            'daily_booking_limit' => 18
        ]);
        $doc3->specializations()->sync([$pediaSpec->specialization_id]);

        $doc4 = Doctor::create([
            'first_name'          => 'Carlo',
            'last_name'           => 'Mendoza',
            'specialization_id'   => $cardioSpec->specialization_id,
            'license_number'      => 'MD-2026-004',
            'contact_number'      => '09184444444',
            'email'               => 'carlo.mendoza@mediqueueclinic.com',
            'password'            => Hash::make('password'),
            'status'              => 'Active',
            'daily_booking_limit' => 20
        ]);
        $doc4->specializations()->sync([$cardioSpec->specialization_id]);

        $doc5 = Doctor::create([
            'first_name'          => 'Patricia',
            'last_name'           => 'Lim',
            'specialization_id'   => $obgyneSpec->specialization_id,
            'license_number'      => 'MD-2026-005',
            'contact_number'      => '09185555555',
            'email'               => 'patricia.lim@mediqueueclinic.com',
            'password'            => Hash::make('password'),
            'status'              => 'Active',
            'daily_booking_limit' => 12
        ]);
        $doc5->specializations()->sync([$obgyneSpec->specialization_id]);

        // 5. Link Doctors to Services (Consultation and Doctor Requested)
        DoctorService::create(['doctor_id' => $doc1->doctor_id, 'service_id' => $s1->id, 'status' => 'Active']);
        DoctorService::create(['doctor_id' => $doc2->doctor_id, 'service_id' => $s2->id, 'status' => 'Active']);
        DoctorService::create(['doctor_id' => $doc3->doctor_id, 'service_id' => $s3->id, 'status' => 'Active']);
        DoctorService::create(['doctor_id' => $doc4->doctor_id, 'service_id' => $s4->id, 'status' => 'Active']);
        DoctorService::create(['doctor_id' => $doc5->doctor_id, 'service_id' => $s5->id, 'status' => 'Active']);
        
        // Link doctor requested services to doctors as well (e.g. for selection)
        DoctorService::create(['doctor_id' => $doc1->doctor_id, 'service_id' => $s14->id, 'status' => 'Active']);
        DoctorService::create(['doctor_id' => $doc1->doctor_id, 'service_id' => $s16->id, 'status' => 'Active']);
        DoctorService::create(['doctor_id' => $doc2->doctor_id, 'service_id' => $s15->id, 'status' => 'Active']);

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
        // 3 not verified (patient1-3), 2 verified (patient4-5)
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
