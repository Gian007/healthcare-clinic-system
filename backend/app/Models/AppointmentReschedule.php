<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AppointmentReschedule extends Model
{
    protected $primaryKey = 'reschedule_id';
    protected $fillable = [
        'appointment_id', 'old_date', 'old_start_time', 'old_end_time',
        'new_date', 'new_start_time', 'new_end_time',
        'reason', 'requested_by', 'reschedule_status'
    ];

    public function appointment()
    {
        return $this->belongsTo(Appointment::class, 'appointment_id', 'appointment_id');
    }
}
