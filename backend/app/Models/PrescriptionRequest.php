<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PrescriptionRequest extends Model
{
    protected $primaryKey = 'request_id';
    protected $fillable = [
        'prescription_id', 'patient_id', 'request_type',
        'reason', 'request_status', 'requested_at', 'processed_by'
    ];

    public function prescription()
    {
        return $this->belongsTo(Prescription::class, 'prescription_id', 'prescription_id');
    }
    public function patient()
    {
        return $this->belongsTo(Patient::class, 'patient_id', 'patient_id');
    }
    public function processedBy()
    {
        return $this->belongsTo(Staff::class, 'processed_by', 'staff_id');
    }
}
