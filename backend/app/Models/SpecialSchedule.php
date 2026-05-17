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
        return $this->morphTo(__FUNCTION__, 'applies_to_type', 'applies_to_id');
    }
}
