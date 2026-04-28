<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PrescriptionItem extends Model
{
    protected $primaryKey = 'prescription_item_id';
    protected $fillable = [
        'prescription_id', 'medicine_name', 'generic_name',
        'strength', 'dosage_amount', 'dosage_unit',
        'frequency_per_day', 'interval_hours', 'time_instruction',
        'meal_instruction', 'duration_value', 'duration_unit',
        'quantity', 'route', 'start_date', 'end_date', 'special_instruction'
    ];

    public function prescription()
    {
        return $this->belongsTo(Prescription::class, 'prescription_id', 'prescription_id');
    }
    public function medicationSchedules()
    {
        return $this->hasMany(MedicationSchedule::class, 'prescription_item_id', 'prescription_item_id');
    }
}
