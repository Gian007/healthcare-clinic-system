<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Queue extends Model
{
    protected $primaryKey = 'queue_id';
    protected $fillable = [
        'queue_date', 'doctor_id', 'patient_id',
        'appointment_id', 'walkin_id', 'queue_source',
        'queue_number', 'priority_number', 'checked_in_at',
        'is_activated', 'queue_status', 'estimated_wait_time'
    ];

    public function doctor()
    {
        return $this->belongsTo(Doctor::class, 'doctor_id', 'doctor_id');
    }
    public function patient()
    {
        return $this->belongsTo(Patient::class, 'patient_id', 'patient_id');
    }
    public function appointment()
    {
        return $this->belongsTo(Appointment::class, 'appointment_id', 'appointment_id');
    }
    public function walkinVisit()
    {
        return $this->belongsTo(WalkinVisit::class, 'walkin_id', 'walkin_id');
    }
}
