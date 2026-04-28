<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Consultation extends Model
{
    protected $primaryKey = 'consultation_id';
    protected $fillable = [
        'patient_id', 'doctor_id', 'appointment_id', 'walkin_id',
        'consultation_date', 'chief_complaint', 'findings',
        'diagnosis', 'treatment_plan', 'follow_up_instruction',
        'doctor_notes', 'encoded_by', 'approved_by',
        'approved_at', 'consultation_status'
    ];

    public function patient()
    {
        return $this->belongsTo(Patient::class, 'patient_id', 'patient_id');
    }
    public function doctor()
    {
        return $this->belongsTo(Doctor::class, 'doctor_id', 'doctor_id');
    }
    public function appointment()
    {
        return $this->belongsTo(Appointment::class, 'appointment_id', 'appointment_id');
    }
    public function walkinVisit()
    {
        return $this->belongsTo(WalkinVisit::class, 'walkin_id', 'walkin_id');
    }
    public function prescriptions()
    {
        return $this->hasMany(Prescription::class, 'consultation_id', 'consultation_id');
    }
}
