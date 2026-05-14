<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PatientVerification extends Model
{
    protected $primaryKey = 'verification_id';
    protected $fillable = [
        'patient_id', 'id_type', 'id_number', 'id_image', 'id_back_image',
        'selfie_image', 'sim_verified', 'status',
        'submitted_at', 'reviewed_by', 'reviewed_at', 'rejection_reason'
    ];

    public function patient(){
        return $this->belongsTo(Patient::class, 'patient_id', 'patient_id');
    }
    public function reviewer(){
        return $this->belongsTo(Staff::class, 'reviewed_by', 'staff_id');
    }
}
