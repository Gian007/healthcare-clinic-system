<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DoctorSchedule extends Model
{
    protected $primaryKey = 'schedule_id';
    protected $fillable = [
        'doctor_id', 'day_of_week', 'start_time', 'end_time', 
        'slot_minutes', 'max_patients', 'room', 'schedule_status'
    ];

    public function doctor(){
        return $this->belongsTo(Doctor::class, 'doctor_id', 'doctor_id');
    }
    public function appointments(){
        return $this->hasMany(Appointment::class, 'schedule_id', 'schedule_id');
    
    }
}
