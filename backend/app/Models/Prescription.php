<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Prescription extends Model
{
    protected $primaryKey = 'prescription_id';
    protected $fillable = [
        'consultation_id', 'doctor_id', 'patient_id',
        'issued_date', 'valid_until', 'general_instruction',
        'prescription_status', 'encoded_by', 'approved_by',
        'approved_at', 'digital_signature', 'attachment_file'
    ];

    public function consultation()
    {
        return $this->belongsTo(Consultation::class, 'consultation_id', 'consultation_id');
    }
    public function doctor()
    {
        return $this->belongsTo(Doctor::class, 'doctor_id', 'doctor_id');
    }
    public function patient()
    {
        return $this->belongsTo(Patient::class, 'patient_id', 'patient_id');
    }
    public function items()
    {
        return $this->hasMany(PrescriptionItem::class, 'prescription_id', 'prescription_id');
    }
    public function requests()
    {
        return $this->hasMany(PrescriptionRequest::class, 'prescription_id', 'prescription_id');
    }
}
