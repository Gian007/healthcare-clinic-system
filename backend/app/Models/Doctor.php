<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

class Doctor extends Authenticatable
{
    use HasApiTokens;
    protected $primaryKey = 'doctor_id';
    protected $fillable = [
        'first_name', 'last_name', 'specialization_id', 'license_number', 'contact_number', 'email', 'password', 'status', 'daily_booking_limit'
    ];
    
    protected $hidden = ['password'];

    public function specialization(){
        return $this->belongsTo(Specialization::class, 'specialization_id', 'specialization_id');
    }

    public function schedules(){
        return $this->hasMany(DoctorSchedule::class, 'doctor_id', 'doctor_id');
    }

    public function dayOffs(){
        return $this->hasMany(DoctorDayOff::class, 'doctor_id', 'doctor_id');
    }

    public function attendances(){
         return $this->hasMany(DoctorAttendance::class, 'doctor_id', 'doctor_id');
    }

    public function services(){
        return $this->belongsToMany(Service::class, 'doctor_service', 'doctor_id', 'service_id');
    }

    public function appointments(){
        return $this->hasMany(Appointment::class, 'doctor_id', 'doctor_id');
    }
}
