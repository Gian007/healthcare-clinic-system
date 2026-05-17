<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DoctorSchedule extends Model
{
    protected $primaryKey = 'schedule_id';
    protected $fillable = [
        'doctor_id', 'day_of_week', 'start_time', 'end_time', 
        'lunch_start', 'lunch_end', 'break1_start', 'break1_end', 'break2_start', 'break2_end',
        'slot_minutes', 'max_patients', 'slot_limit', 'room', 'schedule_status'
    ];

    public function doctor(){
        return $this->belongsTo(Doctor::class, 'doctor_id', 'doctor_id');
    }
    public function appointments(){
        return $this->hasMany(Appointment::class, 'schedule_id', 'schedule_id');
    
    }
}
