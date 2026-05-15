<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SpecialSchedule extends Model
{
    protected $fillable = [
        'title', 'date', 'type', 'applies_to_type', 'applies_to_id', 
        'start_time', 'end_time', 'reason', 'notify_patients', 'is_active'
    ];

    public function appliesTo()
    {
        if ($this->applies_to_type === 'Specific Doctor') {
            return $this->belongsTo(Doctor::class, 'applies_to_id', 'doctor_id');
        }
        if ($this->applies_to_type === 'Specific Service') {
            return $this->belongsTo(Service::class, 'applies_to_id', 'service_id');
        }
        return null;
    }
}
