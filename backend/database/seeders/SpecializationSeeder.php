<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Specialization;

class SpecializationSeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            'Core General Specializations' => [
                'General Medicine', 'Family Medicine', 'Internal Medicine', 'General Practitioner (GP)',
                'Pediatrics', 'OB-GYNE (Obstetrics and Gynecology)', 'Dermatology', 'ENT (Ear, Nose, and Throat)',
                'Ophthalmology', 'Orthopedics', 'Cardiology', 'Neurology', 'Psychiatry', 'Pulmonology',
                'Gastroenterology', 'Nephrology', 'Urology', 'Endocrinology', 'Rheumatology',
                'Infectious Disease', 'Oncology', 'Geriatrics'
            ],
            'Surgical Specializations' => [
                'General Surgery', 'Cardiothoracic Surgery', 'Neurosurgery', 'Orthopedic Surgery',
                'Plastic Surgery', 'Vascular Surgery', 'Pediatric Surgery', 'Urologic Surgery',
                'Surgical Oncology'
            ],
            'Dental & Oral' => [
                'Dentistry', 'Orthodontics', 'Oral Surgery', 'Pediatric Dentistry', 'Prosthodontics'
            ],
            'Women & Child Care' => [
                'Maternal Care', 'Fertility Specialist', 'Neonatology', 'Pediatric Cardiology', 'Pediatric Neurology'
            ],
            'Diagnostic & Imaging' => [
                'Radiology', 'Ultrasound Specialist', 'Pathology', 'Laboratory Medicine'
            ],
            'Emergency & Critical Care' => [
                'Emergency Medicine', 'Trauma Care', 'Critical Care Medicine', 'Intensive Care Unit (ICU)'
            ],
            'Therapy & Rehabilitation' => [
                'Physical Therapy', 'Occupational Therapy', 'Speech Therapy', 'Rehabilitation Medicine'
            ],
            'Mental Health' => [
                'Psychology', 'Behavioral Therapy'
            ],
            'Clinic Support Roles' => [
                'Nurse', 'Nurse Assistant', 'Midwife', 'Pharmacist', 'Medical Technologist',
                'Receptionist', 'Laboratory Technician', 'Radiologic Technologist'
            ]
        ];

        foreach ($categories as $category => $names) {
            foreach ($names as $name) {
                Specialization::firstOrCreate(
                    ['specialization_name' => $name],
                    ['description' => $category]
                );
            }
        }
    }
}
