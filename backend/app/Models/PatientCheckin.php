<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PatientCheckin extends Model
{
    protected $primaryKey = 'checkin_id';
    protected $fillable = [
        'patient_id', 'appointment_id', 'walkin_id',
        'checkin_time', 'checkin_method', 'checkin_status'
    ];

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
