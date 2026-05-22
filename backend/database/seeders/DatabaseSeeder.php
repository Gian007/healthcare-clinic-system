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
use App\Models\DoctorDayOff;
use App\Models\Appointment;
use App\Models\SystemSetting;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 0. Seed Default Rooms if empty
        $settings = SystemSetting::getAdminPortalSettings();
        if (empty($settings['rooms'])) {
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
            ];
            SystemSetting::saveAdminPortalSettings($settings);
        }

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

        // 2. Create 10 Services
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

        $s6 = Service::create([
            'service_name'       => 'Comprehensive Blood Panel',
            'description'        => 'Full screening of CBC, lipid profiles, and metabolic health',
            'base_fee'           => 75.00,
            'estimated_duration' => 15,
            'service_status'     => 'Available'
        ]);

        $s7 = Service::create([
            'service_name'       => 'Physical Therapy Rehab',
            'description'        => 'Tailored recovery and movement therapy session',
            'base_fee'           => 90.00,
            'estimated_duration' => 60,
            'service_status'     => 'Available'
        ]);

        $s8 = Service::create([
            'service_name'       => 'Dermatology Consult',
            'description'        => 'Skin screening and customized allergy consultation',
            'base_fee'           => 85.00,
            'estimated_duration' => 30,
            'service_status'     => 'Available'
        ]);

        $s9 = Service::create([
            'service_name'       => 'Nutritional Guidance',
            'description'        => 'Personalized metabolic diet assessment and support plan',
            'base_fee'           => 55.00,
            'estimated_duration' => 45,
            'service_status'     => 'Available'
        ]);

        $s10 = Service::create([
            'service_name'       => 'Flu Immunization Shot',
            'description'        => 'Annual influenza vaccine dose with basic screening',
            'base_fee'           => 25.00,
            'estimated_duration' => 15,
            'service_status'     => 'Available'
        ]);

        // 3. Create 1 Admin & 1 Staff Account
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

        // 4. Create 4 Doctors
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

        $doc4 = Doctor::create([
            'first_name'          => 'David',
            'last_name'           => 'Smith',
            'specialization_id'   => $generalSpec->specialization_id,
            'license_number'      => 'LIC-55004',
            'contact_number'      => '09184444444',
            'email'               => 'doctor4@clinic.com',
            'password'            => Hash::make('password'),
            'status'              => 'Active',
            'daily_booking_limit' => 20
        ]);

        // 5. Link Doctors to Core Services
        DoctorService::create(['doctor_id' => $doc1->doctor_id, 'service_id' => $s1->service_id, 'status' => 'Active']);
        DoctorService::create(['doctor_id' => $doc2->doctor_id, 'service_id' => $s2->service_id, 'status' => 'Active']);
        DoctorService::create(['doctor_id' => $doc3->doctor_id, 'service_id' => $s3->service_id, 'status' => 'Active']);
        DoctorService::create(['doctor_id' => $doc4->doctor_id, 'service_id' => $s4->service_id, 'status' => 'Active']);
        $this->call(DoctorsSeeder::class);
        $this->call(DentalDoctorsSeeder::class);
        $this->call(DoctorScheduleSeeder::class);

        // Link other general services to Doctor 1
        DoctorService::create(['doctor_id' => $doc1->doctor_id, 'service_id' => $s4->service_id, 'status' => 'Active']);
        DoctorService::create(['doctor_id' => $doc1->doctor_id, 'service_id' => $s5->service_id, 'status' => 'Active']);
        DoctorService::create(['doctor_id' => $doc1->doctor_id, 'service_id' => $s6->service_id, 'status' => 'Active']);
        DoctorService::create(['doctor_id' => $doc1->doctor_id, 'service_id' => $s7->service_id, 'status' => 'Active']);
        DoctorService::create(['doctor_id' => $doc1->doctor_id, 'service_id' => $s8->service_id, 'status' => 'Active']);
        DoctorService::create(['doctor_id' => $doc1->doctor_id, 'service_id' => $s9->service_id, 'status' => 'Active']);
        DoctorService::create(['doctor_id' => $doc1->doctor_id, 'service_id' => $s10->service_id, 'status' => 'Active']);

        // 6. Create Monday to Friday Schedules for Doctors
        $weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
        $schedules = [];

        foreach ($weekdays as $day) {
            // Dr. 1 - Room 101
            $schedules[$doc1->doctor_id][$day] = DoctorSchedule::create([
                'doctor_id'       => $doc1->doctor_id,
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
                'room'            => 'Room 101'
            ]);

            // Dr. 2 - Room 102
            $schedules[$doc2->doctor_id][$day] = DoctorSchedule::create([
                'doctor_id'       => $doc2->doctor_id,
                'day_of_week'     => $day,
                'start_time'      => '09:00:00',
                'end_time'        => '17:00:00',
                'lunch_start'     => '12:00:00',
                'lunch_end'       => '13:00:00',
                'break1_start'    => '10:30:00',
                'break1_end'      => '10:45:00',
                'break2_start'    => '15:30:00',
                'break2_end'      => '15:45:00',
                'slot_limit'      => 12,
                'schedule_status' => 'Active',
                'room'            => 'Room 102'
            ]);

            // Dr. 3 - Room 103
            $schedules[$doc3->doctor_id][$day] = DoctorSchedule::create([
                'doctor_id'       => $doc3->doctor_id,
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
                'room'            => 'Room 103'
            ]);

            // Dr. 4 - Room 104
            $schedules[$doc4->doctor_id][$day] = DoctorSchedule::create([
                'doctor_id'       => $doc4->doctor_id,
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
                'room'            => 'Room 104'
            ]);
        }

        // 7. Day-offs for today (May 19, 2026) for all doctors to ensure schedules start tomorrow
        $allDocs = [$doc1, $doc2, $doc3, $doc4];
        foreach ($allDocs as $doc) {
            DoctorDayOff::create([
                'doctor_id'    => $doc->doctor_id,
                'dayoff_date'  => '2026-05-19',
                'reason'       => 'Clinic Closed / Starts Tomorrow',
                'status'       => 'Approved'
            ]);
        }

        // 8. Create 8 Patient Accounts (No history, completely fresh, not verified!)
        $patientsData = [
            ['first_name' => 'Juan', 'last_name' => 'Dela Cruz', 'sex' => 'Male', 'birth' => '1990-05-12'],
            ['first_name' => 'Jane', 'last_name' => 'Smith', 'sex' => 'Female', 'birth' => '1995-09-22'],
            ['first_name' => 'Alice', 'last_name' => 'Green', 'sex' => 'Female', 'birth' => '1988-11-04'],
            ['first_name' => 'Bob', 'last_name' => 'Baker', 'sex' => 'Male', 'birth' => '1992-02-17'],
            ['first_name' => 'Charlie', 'last_name' => 'Miller', 'sex' => 'Male', 'birth' => '1985-07-31'],
            ['first_name' => 'Diana', 'last_name' => 'Prince', 'sex' => 'Female', 'birth' => '1991-03-14'],
            ['first_name' => 'Evan', 'last_name' => 'Wright', 'sex' => 'Male', 'birth' => '1989-10-05'],
            ['first_name' => 'Fiona', 'last_name' => 'Gallagher', 'sex' => 'Female', 'birth' => '1994-12-01'],
        ];

        foreach ($patientsData as $idx => $p) {
            $num = $idx + 1;
            Patient::create([
                'patient_number'      => sprintf('PAT-%04d', $num),
                'first_name'          => $p['first_name'],
                'last_name'           => $p['last_name'],
                'middle_name'         => 'Cruz',
                'birth_date'          => $p['birth'],
                'sex'                 => $p['sex'],
                'civil_status'        => 'Single',
                'contact_number'      => sprintf('091700000%02d', $num),
                'email'               => "patient{$num}@clinic.com",
                'password'            => Hash::make('password'),
                'address'             => 'Metropolitan Area, PH',
                'registration_type'   => 'Online',
                'account_status'      => 'Active',
                'verification_status' => 'Pending'
            ]);
        }

        // 9. Seed appointments for April and May 2026
        $startDate = new \DateTime('2026-04-01');
        $endDate = new \DateTime('2026-05-31');
        $todayStr = '2026-05-19';

        $dbPatients = Patient::all();
        $patientCount = $dbPatients->count();
        $doctorsList = [$doc1, $doc2, $doc3, $doc4];

        for ($date = clone $startDate; $date <= $endDate; $date->modify('+1 day')) {
            $currentDateStr = $date->format('Y-m-d');
            $dayOfWeek = $date->format('l');

            // Skip weekends
            if ($dayOfWeek === 'Saturday' || $dayOfWeek === 'Sunday') {
                continue;
            }

            // Skip today (May 19, 2026)
            if ($currentDateStr === $todayStr) {
                continue;
            }

            // Skip days where the day number is divisible by 3 (leaves some days empty)
            $dayNum = (int)$date->format('d');
            if ($dayNum % 3 === 0) {
                continue;
            }

            // Seed 1 to 2 appointments for this day
            $appointmentCount = ($dayNum % 2 === 0) ? 2 : 1;

            for ($i = 0; $i < $appointmentCount; $i++) {
                $docIndex = ($dayNum + $i) % 4;
                $currentDoc = $doctorsList[$docIndex];

                $patIndex = ($dayNum * ($i + 1)) % $patientCount;
                $currentPat = $dbPatients[$patIndex];

                $schedule = $schedules[$currentDoc->doctor_id][$dayOfWeek] ?? null;
                if (!$schedule) {
                    continue;
                }

                $slotTime = ($i === 0) ? '10:00:00' : '14:00:00';
                $endTime = ($i === 0) ? '10:30:00' : '14:30:00';

                // Past dates (before today) -> Completed or Cancelled
                // Future dates (starting tomorrow, May 20) -> Confirmed or Pending
                if ($currentDateStr < $todayStr) {
                    $status = ($dayNum % 5 === 0) ? 'Cancelled' : 'Completed';
                } else {
                    $status = ($dayNum % 4 === 0) ? 'Pending' : 'Confirmed';
                }

                Appointment::create([
                    'patient_id'       => $currentPat->patient_id,
                    'doctor_id'        => $currentDoc->doctor_id,
                    'service_id'       => ($currentDoc->doctor_id === $doc1->doctor_id) ? $s1->service_id : 
                                          (($currentDoc->doctor_id === $doc2->doctor_id) ? $s2->service_id : 
                                          (($currentDoc->doctor_id === $doc3->doctor_id) ? $s3->service_id : $s4->service_id)),
                    'schedule_id'      => $schedule->schedule_id,
                    'appointment_date' => $currentDateStr,
                    'start_time'       => $slotTime,
                    'end_time'         => $endTime,
                    'appointment_type' => 'Online',
                    'reason_for_visit' => 'Regular Checkup',
                    'booking_status'   => $status,
                    'checkin_deadline' => \Carbon\Carbon::parse($currentDateStr . ' ' . $slotTime)->subHours(2),
                ]);
            }
        }
    }
}
