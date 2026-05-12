<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Specialization;

$specializations = [
    'General Medicine',
    'Pediatrics',
    'Cardiology',
    'Dermatology',
    'Orthopedics',
    'Obstetrics & Gynecology',
    'Neurology',
    'Ophthalmology',
    'Ear, Nose & Throat (ENT)',
    'Psychiatry',
    'Pulmonology',
    'Endocrinology',
];

foreach ($specializations as $name) {
    Specialization::firstOrCreate(
        ['specialization_name' => $name],
        ['description' => '']
    );
}

echo "Seeded " . count($specializations) . " specializations.\n";
