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
        'account_status', 'verification_status', 'profile_picture'
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
    public function patientVerification()
    {
        return $this->hasOne(PatientVerification::class, 'patient_id', 'patient_id');
    }
    public function systemNotifications()
    {
        return $this->hasMany(SystemNotification::class, 'notifiable_id', 'patient_id')
            ->where('notifiable_type', 'patient');
    }
}
