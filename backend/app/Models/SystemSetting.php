<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SystemSetting extends Model
{
    protected $fillable = ['key', 'value'];

    protected $casts = [
        'value' => 'array',
    ];

    public const ADMIN_PORTAL_KEY = 'admin_portal';

    public static function adminPortalDefaults(): array
    {
        return [
            'branding' => [
                'clinicName' => 'MediQueue',
                'tagline' => 'Admin Portal',
                'logoPath' => '',
            ],
            'features' => [
                'menuItems' => [
                    'doctors' => true,
                    'schedules' => true,
                    'services' => true,
                    'staff' => true,
                    'patients' => true,
                    'calendar' => true,
                    'notifications' => true,
                    'reports' => true,
                ],
                'dashboardWidgets' => [
                    'totalPatients' => true,
                    'totalDoctors' => true,
                    'totalStaff' => true,
                    'appointmentsToday' => true,
                    'pendingVerifications' => true,
                    'activeAppointments' => true,
                    'recentPatients' => true,
                    'quickActions' => true,
                    'recentAppointments' => true,
                ],
                'patientMenuItems' => [
                    'dashboard' => true,
                    'bookAppointment' => true,
                    'calendar' => true,
                    'profile' => true,
                ],
                'doctorMenuItems' => [
                    'dashboard' => true,
                    'schedule' => true,
                    'dayOff' => true,
                    'appointments' => true,
                    'queue' => true,
                    'attendance' => true,
                    'calendar' => true,
                    'notifications' => true,
                    'profile' => true,
                ],
                'guestMenuItems' => [
                    'doctors' => true,
                    'services' => true,
                    'queue' => true,
                    'announcements' => true,
                ],
            ],
            'theme' => [
                'accentColor' => '#1FA4A9',
                'sidebarColor' => '#0f172a',
                'fontSize' => 'comfortable',
            ],
            'homepage' => [
                'hero' => [
                    'subtitle' => 'Smart Healthcare Availability and Queue Management System',
                    'quote' => '"Skip the Wait, Get the Care."',
                    'ctaLabel' => 'Book Appointment',
                ],
                'schedule' => [
                    'title' => "Today's Schedule",
                    'loadingText' => 'Fetching hours...',
                    'closedTodayText' => 'Closed Today',
                    'closedNowText' => 'Closed Now',
                    'openText' => 'Now Open',
                    'openShortenedText' => 'Open (Shortened)',
                    'clinicClosedText' => 'CLINIC CLOSED',
                    'specialScheduleLabel' => 'Special Schedule',
                ],
                'emergency' => [
                    'title' => 'Emergency?',
                    'message' => 'Call national emergency services immediately:',
                    'hotline' => '911',
                    'caption' => 'National Emergency Hotline',
                ],
                'contact' => [
                    'description' => 'MediQueue - Smart Healthcare Availability and Queue Management System. Streamlining patient care with modern technology.',
                    'locationTitle' => 'Location',
                    'address' => 'Regalado Road, Quezon City',
                    'sectionTitle' => 'Contact Information',
                    'emailLabel' => 'Email Address',
                    'email' => 'smarthealthcare@gmail.com',
                    'customerServiceLabel' => 'Customer Service',
                    'customerServicePhone' => '+639999046290',
                    'managerLabel' => 'General Manager',
                    'managerPhone' => '+639511246060',
                ],
                'social' => [
                    'sectionTitle' => 'Connect With Us',
                    'facebookLabel' => 'Smart Healthcare Availability and Queue Management',
                    'facebookUrl' => 'https://imgs.search.brave.com/K6P0AEBGlnzkaHI_RgWnVhabSmflD3sRLiCAIeTPrtQ/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pbWFn/ZXMubWVtZS1hcnNl/bmFsLmNvbS8zOTMz/MjY5MjdmNzU3ZTA3/ZDc4NjkzNmFkNWQx/ZjM1ZS5qcGc',
                    'instagramLabel' => '@smart_healthcaresys',
                    'instagramUrl' => 'https://imgs.search.brave.com/K6P0AEBGlnzkaHI_RgWnVhabSmflD3sRLiCAIeTPrtQ/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pbWFn/ZXMubWVtZS1hcnNl/bmFsLmNvbS8zOTMz/MjY5MjdmNzU3ZTA3/ZDc4NjkzNmFkNWQx/ZjM1ZS5qcGc',
                ],
                'footer' => [
                    'copyright' => 'Copyright 2026 MediQueue. All Rights Reserved.',
                    'privacyLabel' => 'Privacy Policy',
                    'privacyUrl' => '#',
                    'termsLabel' => 'Terms of Service',
                    'termsUrl' => '#',
                ],
            ],
            'rooms' => [],
        ];
    }

    public static function getAdminPortalSettings(): array
    {
        $setting = static::where('key', static::ADMIN_PORTAL_KEY)->first();

        return static::mergeSettings(static::adminPortalDefaults(), $setting?->value ?? []);
    }

    public static function saveAdminPortalSettings(array $settings): array
    {
        $merged = static::mergeSettings(static::adminPortalDefaults(), $settings);

        static::updateOrCreate(
            ['key' => static::ADMIN_PORTAL_KEY],
            ['value' => $merged]
        );

        return $merged;
    }

    private static function mergeSettings(array $defaults, array $settings): array
    {
        foreach ($defaults as $key => $defaultValue) {
            if (is_array($defaultValue)) {
                $defaults[$key] = static::mergeSettings(
                    $defaultValue,
                    is_array($settings[$key] ?? null) ? $settings[$key] : []
                );
                continue;
            }

            if (array_key_exists($key, $settings)) {
                $defaults[$key] = $settings[$key];
            }
        }

        return $defaults;
    }
}
