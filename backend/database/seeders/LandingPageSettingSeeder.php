<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\LandingPageSetting;

class LandingPageSettingSeeder extends Seeder
{
    public function run(): void
    {
        $settings = [
            [
                'section_key' => 'hero',
                'title' => 'Ready to Skip the Wait and Get the Care?',
                'subtitle' => 'Join thousands of patients and healthcare providers already using MediQueue to transform their healthcare experience.',
                'content' => '',
                'image_url' => '',
                'button_text' => 'Book Appointment',
                'button_link' => '/patient/book',
                'sort_order' => 1,
                'is_visible' => true,
            ],
            [
                'section_key' => 'about',
                'title' => 'About MediQueue',
                'subtitle' => 'Smart Healthcare Availability and Queue Management System — transforming how clinics manage appointments and patients access care.',
                'content' => '',
                'image_url' => '',
                'button_text' => 'Learn More',
                'button_link' => '#features',
                'sort_order' => 2,
                'is_visible' => true,
            ],
            [
                'section_key' => 'features',
                'title' => 'Why Choose MediQueue',
                'subtitle' => 'Powerful features designed for modern healthcare delivery',
                'content' => json_encode([
                    [
                        'title' => 'Real-Time Availability',
                        'desc' => 'Track doctor schedules and availability in real-time with instant updates',
                        'icon' => 'clock'
                    ],
                    [
                        'title' => 'Smart Queue Tracking',
                        'desc' => 'Monitor patient queues with accurate wait time predictions and live status',
                        'icon' => 'users'
                    ],
                    [
                        'title' => 'Online Appointment Booking',
                        'desc' => 'Book, reschedule, and manage appointments seamlessly through our platform',
                        'icon' => 'calendar'
                    ],
                    [
                        'title' => 'Secure Patient Data',
                        'desc' => 'Enterprise-grade security with encrypted data storage and HIPAA compliance',
                        'icon' => 'shield'
                    ],
                    [
                        'title' => 'Multi-Role Access',
                        'desc' => 'Dedicated portals for admins, staff, doctors, and patients with role-based permissions',
                        'icon' => 'desktop'
                    ],
                    [
                        'title' => 'Automated Notifications',
                        'desc' => 'Smart reminders and alerts via SMS, email, and push notifications',
                        'icon' => 'bell'
                    ]
                ]),
                'image_url' => '',
                'button_text' => '',
                'button_link' => '',
                'sort_order' => 3,
                'is_visible' => true,
            ],
            [
                'section_key' => 'how_it_works',
                'title' => 'Our Journey',
                'subtitle' => 'From problem to solution, building the future of healthcare access',
                'content' => json_encode([
                    [
                        'title' => 'Long Wait Times & Poor Communication',
                        'desc' => 'Patients waste hours in waiting rooms without knowing queue status. Clinics struggle with manual scheduling and missed appointments.',
                        'label' => 'PROBLEM',
                        'color' => 'rose'
                    ],
                    [
                        'title' => 'Smart Digital Queue Management',
                        'desc' => 'MediQueue provides real-time visibility into doctor availability, queue status, and automated appointment management.',
                        'label' => 'SOLUTION',
                        'color' => 'teal'
                    ],
                    [
                        'title' => 'Built for Philippine Healthcare',
                        'desc' => 'Designed specifically for small to medium clinics in the Philippines, with local needs and workflows in mind.',
                        'label' => 'DEVELOPMENT',
                        'color' => 'purple'
                    ],
                    [
                        'title' => 'AI-Powered Healthcare Access',
                        'desc' => 'Expanding to AI-driven appointment optimization, telemedicine integration, and nationwide clinic network.',
                        'label' => 'FUTURE VISION',
                        'color' => 'blue'
                    ]
                ]),
                'image_url' => '',
                'button_text' => '',
                'button_link' => '',
                'sort_order' => 4,
                'is_visible' => true,
            ],
            [
                'section_key' => 'professionals',
                'title' => 'Designed for Healthcare Professionals',
                'subtitle' => 'Experienced professionals committed to your care',
                'content' => '',
                'image_url' => '',
                'button_text' => '',
                'button_link' => '',
                'sort_order' => 5,
                'is_visible' => true,
            ],
            [
                'section_key' => 'benefits',
                'title' => 'Expected Benefits',
                'subtitle' => 'Real results driving better healthcare outcomes',
                'content' => json_encode([
                    [
                        'title' => 'Reduced Waiting Time',
                        'desc' => 'Wait times decreased from manual scheduling to real-time live monitoring',
                        'stat' => 'Efficiency',
                        'color' => 'teal'
                    ],
                    [
                        'title' => 'Patient Convenience',
                        'desc' => 'Patients can check queue status anywhere, anytime',
                        'stat' => 'Convenience',
                        'color' => 'purple'
                    ],
                    [
                        'title' => 'Faster Appointment Scheduling',
                        'desc' => 'Book appointments in seconds, not minutes',
                        'stat' => '3x Faster',
                        'color' => 'blue'
                    ]
                ]),
                'image_url' => '',
                'button_text' => '',
                'button_link' => '',
                'sort_order' => 6,
                'is_visible' => true,
            ],
            [
                'section_key' => 'cta',
                'title' => 'Ready to Skip the Wait and Get the Care?',
                'subtitle' => 'Join thousands of patients and healthcare providers already using MediQueue to transform their healthcare experience.',
                'content' => '',
                'image_url' => '',
                'button_text' => 'Book Appointment',
                'button_link' => '/patient/book',
                'sort_order' => 7,
                'is_visible' => true,
            ],
        ];

        foreach ($settings as $s) {
            LandingPageSetting::updateOrCreate(
                ['section_key' => $s['section_key']],
                $s
            );
        }
    }
}
