<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AppointmentCancellation extends Model
{
    protected $primaryKey = 'cancel_id';
    protected $fillable = [
        'appointment_id', 'cancelled_by',
        'cancellation_reason', 'cancelled_at'
    ];

     public function appointment()
    {
        return $this->belongsTo(Appointment::class, 'appointment_id', 'appointment_id');
    }
}
