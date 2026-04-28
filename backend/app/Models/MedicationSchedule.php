<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MedicationSchedule extends Model
{
    protected $primaryKey = 'schedule_item_id';
    protected $fillable = [
        'prescription_item_id', 'patient_id', 'scheduled_date',
        'scheduled_time', 'dose_instruction', 'reminder_status',
        'taken_status', 'taken_at'
    ];

    public function prescriptionItem()
    {
        return $this->belongsTo(PrescriptionItem::class, 'prescription_item_id', 'prescription_item_id');
    }
    public function patient()
    {
        return $this->belongsTo(Patient::class, 'patient_id', 'patient_id');
    }
}
