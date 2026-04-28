<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WalkinVisit extends Model
{
     protected $primaryKey = 'walkin_id';
    protected $fillable = [
        'patient_id', 'doctor_id', 'service_id',
        'visit_date', 'arrival_time', 'reason_for_visit',
        'created_by', 'walkin_status'
    ];

    public function patient()
    {
        return $this->belongsTo(Patient::class, 'patient_id', 'patient_id');
    }
    public function doctor()
    {
        return $this->belongsTo(Doctor::class, 'doctor_id', 'doctor_id');
    }
    public function service()
    {
        return $this->belongsTo(Service::class, 'service_id', 'service_id');
    }
    public function staff()
    {
        return $this->belongsTo(Staff::class, 'created_by', 'staff_id');
    }
    public function consultation()
    {
        return $this->hasOne(Consultation::class, 'walkin_id', 'walkin_id');
    }
}
