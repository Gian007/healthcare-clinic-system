<?php

use App\Models\Staff;
use Illuminate\Support\Facades\Hash;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('staff login with correct credentials', function () {
    // Ensure the staff account exists
    $staff = Staff::updateOrCreate(
        ['email' => 'staff@clinic.com'],
        [
            'first_name'     => 'Staff',
            'last_name'      => 'User',
            'role'           => 'Receptionist',
            'contact_number' => '09000000001',
            'password'       => Hash::make('staff'),
            'account_status' => 'Active',
        ]
    );

    $response = $this->postJson('/api/login', [
        'email' => 'staff@clinic.com',
        'password' => 'staff',
        'role' => 'staff'
    ]);

    $response->assertStatus(200);
    $response->assertJsonStructure([
        'token',
        'user' => [
            'email',
            'role'
        ]
    ]);
});

test('staff login with incorrect credentials fails with 422', function () {
    // Ensure the staff account exists
    Staff::updateOrCreate(
        ['email' => 'staff@clinic.com'],
        [
            'first_name'     => 'Staff',
            'last_name'      => 'User',
            'role'           => 'Receptionist',
            'contact_number' => '09000000001',
            'password'       => Hash::make('staff'),
            'account_status' => 'Active',
        ]
    );

    $response = $this->postJson('/api/login', [
        'email' => 'staff@clinic.com',
        'password' => 'wrongpassword',
        'role' => 'staff'
    ]);

    $response->assertStatus(422);
    $response->assertJsonValidationErrors(['email']);
});

test('staff user exists in database and is Active', function () {
    // Ensure the staff account exists
    Staff::updateOrCreate(
        ['email' => 'staff@clinic.com'],
        [
            'first_name'     => 'Staff',
            'last_name'      => 'User',
            'role'           => 'Receptionist',
            'contact_number' => '09000000001',
            'password'       => Hash::make('staff'),
            'account_status' => 'Active',
        ]
    );

    $user = Staff::where('email', 'staff@clinic.com')->first();
    
    expect($user)->not->toBeNull();
    expect($user->email)->toBe('staff@clinic.com');
    expect($user->role)->toBe('Receptionist');
    expect($user->account_status)->toBe('Active');
});
