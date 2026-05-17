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
use App\Models\Appointment;
use App\Models\Queue;
use Carbon\Carbon;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
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
        $generalService = Service::create([
            'service_name'       => 'General Consultation',
            'description'        => 'Standard body screening and clinical diagnosis',
            'base_fee'           => 50.00,
            'estimated_duration' => 30,
            'service_status'     => 'Available'
        ]);

        $cardioService = Service::create([
            'service_name'       => 'Cardiology Diagnostic',
            'description'        => 'Advanced ECG tracking and heart wellness evaluation',
            'base_fee'           => 120.00,
            'estimated_duration' => 45,
            'service_status'     => 'Available'
        ]);

        $pediaService = Service::create([
            'service_name'       => 'Pediatric Checkup',
            'description'        => 'Comprehensive development check for infants and children',
            'base_fee'           => 65.00,
            'estimated_duration' => 30,
            'service_status'     => 'Available'
        ]);

        // 3. Create Staff Accounts (Admin, Receptionist, Nurse)
        Staff::create([
            'first_name'     => 'Charles',
            'last_name'      => 'Xavier',
            'role'           => 'Admin',
            'contact_number' => '09171112222',
            'email'          => 'admin@clinic.com',
            'password'       => Hash::make('password'),
            'account_status' => 'Active'
        ]);

        Staff::create([
            'first_name'     => 'Maria',
            'last_name'      => 'Reyes',
            'role'           => 'Receptionist',
            'contact_number' => '09173334444',
            'email'          => 'staff@clinic.com',
            'password'       => Hash::make('password'),
            'account_status' => 'Active'
        ]);

        Staff::create([
            'first_name'     => 'John',
            'last_name'      => 'Watson',
            'role'           => 'Nurse',
            'contact_number' => '09175556666',
            'email'          => 'nurse@clinic.com',
            'password'       => Hash::make('password'),
            'account_status' => 'Active'
        ]);

        // 4. Create Doctors
        $docSarah = Doctor::create([
            'first_name'          => 'Sarah',
            'last_name'           => 'Johnson',
            'specialization_id'   => $generalSpec->specialization_id,
            'license_number'      => 'LIC-55001',
            'contact_number'      => '09181111111',
            'email'               => 'sarah@clinic.com',
            'password'            => Hash::make('password'),
            'status'              => 'Active',
            'daily_booking_limit' => 20
        ]);

        $docMichael = Doctor::create([
            'first_name'          => 'Michael',
            'last_name'           => 'Chen',
            'specialization_id'   => $cardioSpec->specialization_id,
            'license_number'      => 'LIC-55002',
            'contact_number'      => '09182222222',
            'email'               => 'michael@clinic.com',
            'password'            => Hash::make('password'),
            'status'              => 'Active',
            'daily_booking_limit' => 15
        ]);

        $docEmily = Doctor::create([
            'first_name'          => 'Emily',
            'last_name'           => 'Rodriguez',
            'specialization_id'   => $pediaSpec->specialization_id,
            'license_number'      => 'LIC-55003',
            'contact_number'      => '09183333333',
            'email'               => 'emily@clinic.com',
            'password'            => Hash::make('password'),
            'status'              => 'Active',
            'daily_booking_limit' => 18
        ]);

        // 5. Link Doctors to Services
        DoctorService::create(['doctor_id' => $docSarah->doctor_id, 'service_id' => $generalService->service_id, 'status' => 'Active']);
        DoctorService::create(['doctor_id' => $docMichael->doctor_id, 'service_id' => $cardioService->service_id, 'status' => 'Active']);
        DoctorService::create(['doctor_id' => $docEmily->doctor_id, 'service_id' => $pediaService->service_id, 'status' => 'Active']);

        // 6. Create Monday to Friday Schedules for Doctors
        $weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
        $schedules = [];

        foreach ($weekdays as $day) {
            // Dr. Sarah Johnson - Room 101
            $schedules[$docSarah->doctor_id][$day] = DoctorSchedule::create([
                'doctor_id'       => $docSarah->doctor_id,
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

            // Dr. Michael Chen - Room 102
            $schedules[$docMichael->doctor_id][$day] = DoctorSchedule::create([
                'doctor_id'       => $docMichael->doctor_id,
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

            // Dr. Emily Rodriguez - Room 103
            $schedules[$docEmily->doctor_id][$day] = DoctorSchedule::create([
                'doctor_id'       => $docEmily->doctor_id,
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
        }

        // 7. Create 10 Patient Accounts
        $patientsData = [
            ['first_name' => 'Juan', 'last_name' => 'Dela Cruz', 'sex' => 'Male', 'birth' => '1990-05-12'],
            ['first_name' => 'Jane', 'last_name' => 'Smith', 'sex' => 'Female', 'birth' => '1995-09-22'],
            ['first_name' => 'Alice', 'last_name' => 'Green', 'sex' => 'Female', 'birth' => '1988-11-04'],
            ['first_name' => 'Bob', 'last_name' => 'Baker', 'sex' => 'Male', 'birth' => '1992-02-17'],
            ['first_name' => 'Charlie', 'last_name' => 'Miller', 'sex' => 'Male', 'birth' => '1985-07-31'],
            ['first_name' => 'Diana', 'last_name' => 'Prince', 'sex' => 'Female', 'birth' => '1993-04-09'],
            ['first_name' => 'Edward', 'last_name' => 'Elric', 'sex' => 'Male', 'birth' => '2000-01-20'],
            ['first_name' => 'Fiona', 'last_name' => 'Gallagher', 'sex' => 'Female', 'birth' => '1996-08-15'],
            ['first_name' => 'George', 'last_name' => 'Stark', 'sex' => 'Male', 'birth' => '1979-12-05'],
            ['first_name' => 'Hannah', 'last_name' => 'Abbott', 'sex' => 'Female', 'birth' => '1998-03-25']
        ];

        $patients = [];
        foreach ($patientsData as $idx => $p) {
            $num = $idx + 1;
            $patients[] = Patient::create([
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
                'verification_status' => 'Approved'
            ]);
        }

        // 8. Simulate 1 Month of Historical Clinic Operations (last 30 days)
        $doctorsList = [$docSarah, $docMichael, $docEmily];
        $servicesList = [
            $docSarah->doctor_id => $generalService,
            $docMichael->doctor_id => $cardioService,
            $docEmily->doctor_id => $pediaService
        ];

        $startDate = Carbon::now()->subDays(30);
        $endDate = Carbon::now()->subDay(); // Up to yesterday

        for ($date = clone $startDate; $date->lte($endDate); $date->addDay()) {
            $dayOfWeek = $date->format('l');
            // Check if day is Monday to Friday
            if (in_array($dayOfWeek, $weekdays)) {
                // For each doctor, add 3-5 completed consultations
                foreach ($doctorsList as $doc) {
                    $numAppts = rand(3, 5);
                    $sched = $schedules[$doc->doctor_id][$dayOfWeek];
                    $service = $servicesList[$doc->doctor_id];

                    for ($i = 1; $i <= $numAppts; $i++) {
                        $pat = $patients[array_rand($patients)];
                        $hr = 9 + $i; // e.g. 10:00, 11:00, 12:00, etc.
                        $timeStr = sprintf('%02d:00:00', $hr);
                        $endTimeStr = sprintf('%02d:30:00', $hr);

                        $appt = Appointment::create([
                            'patient_id'       => $pat->patient_id,
                            'doctor_id'        => $doc->doctor_id,
                            'service_id'       => $service->service_id,
                            'schedule_id'      => $sched->schedule_id,
                            'appointment_date' => $date->format('Y-m-d'),
                            'start_time'       => $timeStr,
                            'end_time'         => $endTimeStr,
                            'appointment_type' => rand(0, 4) === 0 ? 'Walk-in' : 'Online',
                            'reason_for_visit' => 'Standard checkup and medical validation',
                            'booking_status'   => 'Completed',
                            'checkin_deadline' => $date->format('Y-m-d') . ' ' . sprintf('%02d:45:00', $hr - 1)
                        ]);

                        Queue::create([
                            'queue_date'       => $date->format('Y-m-d'),
                            'doctor_id'        => $doc->doctor_id,
                            'patient_id'       => $pat->patient_id,
                            'appointment_id'   => $appt->appointment_id,
                            'queue_source'     => $appt->appointment_type === 'Walk-in' ? 'Walk-in' : 'Appointment',
                            'queue_number'     => $i,
                            'priority_number'  => $i,
                            'checked_in_at'    => $date->format('Y-m-d') . ' ' . sprintf('%02d:45:00', $hr - 1),
                            'is_activated'     => true,
                            'queue_status'     => 'Done',
                            'estimated_wait_time' => 0
                        ]);
                    }
                }
            }
        }

        // 9. Simulate Today's Active Queues & Upcoming Bookings (Real-time demo)
        $todayStr = Carbon::now()->format('Y-m-d');
        $todayOfWeek = Carbon::now()->format('l');

        if (in_array($todayOfWeek, $weekdays)) {
            // Populate today's appointments and live queues
            foreach ($doctorsList as $doc) {
                $sched = $schedules[$doc->doctor_id][$todayOfWeek];
                $service = $servicesList[$doc->doctor_id];

                // Patient 1: Checked-in and waiting
                $pat1 = $patients[0];
                $appt1 = Appointment::create([
                    'patient_id'       => $pat1->patient_id,
                    'doctor_id'        => $doc->doctor_id,
                    'service_id'       => $service->service_id,
                    'schedule_id'      => $sched->schedule_id,
                    'appointment_date' => $todayStr,
                    'start_time'       => '09:30:00',
                    'end_time'         => '10:00:00',
                    'appointment_type' => 'Online',
                    'reason_for_visit' => 'Follow up consultation',
                    'booking_status'   => 'Confirmed',
                    'checkin_deadline' => $todayStr . ' 09:15:00'
                ]);
                Queue::create([
                    'queue_date'       => $todayStr,
                    'doctor_id'        => $doc->doctor_id,
                    'patient_id'       => $pat1->patient_id,
                    'appointment_id'   => $appt1->appointment_id,
                    'queue_source'     => 'Appointment',
                    'queue_number'     => 1,
                    'priority_number'  => 1,
                    'checked_in_at'    => $todayStr . ' 09:10:00',
                    'is_activated'     => true,
                    'queue_status'     => 'Waiting',
                    'estimated_wait_time' => 0
                ]);

                // Patient 2: Checked-in and now in Consultation (Serving)
                $pat2 = $patients[1];
                $appt2 = Appointment::create([
                    'patient_id'       => $pat2->patient_id,
                    'doctor_id'        => $doc->doctor_id,
                    'service_id'       => $service->service_id,
                    'schedule_id'      => $sched->schedule_id,
                    'appointment_date' => $todayStr,
                    'start_time'       => '10:00:00',
                    'end_time'         => '10:30:00',
                    'appointment_type' => 'Online',
                    'reason_for_visit' => 'Regular assessment',
                    'booking_status'   => 'Confirmed',
                    'checkin_deadline' => $todayStr . ' 09:45:00'
                ]);
                Queue::create([
                    'queue_date'       => $todayStr,
                    'doctor_id'        => $doc->doctor_id,
                    'patient_id'       => $pat2->patient_id,
                    'appointment_id'   => $appt2->appointment_id,
                    'queue_source'     => 'Appointment',
                    'queue_number'     => 2,
                    'priority_number'  => 2,
                    'checked_in_at'    => $todayStr . ' 09:40:00',
                    'is_activated'     => true,
                    'queue_status'     => 'Serving',
                    'estimated_wait_time' => 0
                ]);

                // Patient 3: Booked but not checked in yet (No Queue record yet)
                $pat3 = $patients[2];
                Appointment::create([
                    'patient_id'       => $pat3->patient_id,
                    'doctor_id'        => $doc->doctor_id,
                    'service_id'       => $service->service_id,
                    'schedule_id'      => $sched->schedule_id,
                    'appointment_date' => $todayStr,
                    'start_time'       => '14:00:00',
                    'end_time'         => '14:30:00',
                    'appointment_type' => 'Online',
                    'reason_for_visit' => 'Health monitoring',
                    'booking_status'   => 'Confirmed',
                    'checkin_deadline' => $todayStr . ' 13:45:00'
                ]);
            }
        }

        // 10. Simulate Future Bookings (Next 7 days)
        for ($dayOffset = 1; $dayOffset <= 7; $dayOffset++) {
            $futureDate = Carbon::now()->addDays($dayOffset);
            $futureDayOfWeek = $futureDate->format('l');

            if (in_array($futureDayOfWeek, $weekdays)) {
                foreach ($doctorsList as $doc) {
                    $sched = $schedules[$doc->doctor_id][$futureDayOfWeek];
                    $service = $servicesList[$doc->doctor_id];

                    // Seed 2 future booked appointments for each doctor
                    for ($j = 1; $j <= 2; $j++) {
                        $pat = $patients[($j + $dayOffset) % 10];
                        $hr = 9 + $j * 2; // e.g. 11:00, 13:00
                        $timeStr = sprintf('%02d:00:00', $hr);
                        $endTimeStr = sprintf('%02d:30:00', $hr);

                        Appointment::create([
                            'patient_id'       => $pat->patient_id,
                            'doctor_id'        => $doc->doctor_id,
                            'service_id'       => $service->service_id,
                            'schedule_id'      => $sched->schedule_id,
                            'appointment_date' => $futureDate->format('Y-m-d'),
                            'start_time'       => $timeStr,
                            'end_time'         => $endTimeStr,
                            'appointment_type' => 'Online',
                            'reason_for_visit' => 'Routine monitoring visit',
                            'booking_status'   => rand(0, 4) === 0 ? 'Pending' : 'Confirmed',
                            'checkin_deadline' => $futureDate->format('Y-m-d') . ' ' . sprintf('%02d:45:00', $hr - 1)
                        ]);
                    }
                }
            }
        }
    }
}
