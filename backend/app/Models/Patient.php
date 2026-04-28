<?php

namespace App\Models;


use Laravel\Sanctum\HasApiTokens;
use Illuminate\Foundation\Auth\User as Authenticatable;

class Patient extends Authenticatable
{

    use HasApiTokens;
    protected $primaryKey = 'patient_id';
    protected $fillable = [
        'patient_number', 'first_name', 'last_name', 'middle_name',
        'birth_date', 'sex', 'civil_status', 'contact_number',
        'email', 'password', 'address', 'registration_type',
        'account_status', 'verification_status'
    ];

    protected $hidden = ['password'];

    public function appointments()
    {
        return $this->hasMany(Appointment::class, 'patient_id', 'patient_id');
    }
    public function walkinVisits()
    {
        return $this->hasMany(WalkinVisit::class, 'patient_id', 'patient_id');
    }
    public function consultations()
    {
        return $this->hasMany(Consultation::class, 'patient_id', 'patient_id');
    }
    public function verifications()
    {
        return $this->hasMany(PatientVerification::class, 'patient_id', 'patient_id');
    }
    public function notifications()
    {
        return $this->hasMany(Notification::class, 'patient_id', 'patient_id');
    }
}
