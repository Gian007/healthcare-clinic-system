<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DoctorServiceRequest extends Model
{
    protected $table = 'doctor_service_requests';

    protected $fillable = [
        'doctor_id', 'referred_doctor_id', 'patient_id', 'related_appointment_id',
        'remarks', 'priority', 'total_price', 'status', 'preferred_schedule'
    ];

    public function doctor()
    {
        return $this->belongsTo(Doctor::class, 'doctor_id', 'doctor_id');
    }

    public function referredDoctor()
    {
        return $this->belongsTo(Doctor::class, 'referred_doctor_id', 'doctor_id');
    }

    public function patient()
    {
        return $this->belongsTo(Patient::class, 'patient_id', 'patient_id');
    }

    public function relatedAppointment()
    {
        return $this->belongsTo(Appointment::class, 'related_appointment_id', 'appointment_id');
    }

    public function items()
    {
        return $this->hasMany(DoctorServiceRequestItem::class, 'request_id');
    }
}
