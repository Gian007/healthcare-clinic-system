<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DoctorDayOff extends Model
{
    protected $primaryKey = 'dayoff_id';
    protected $fillable = [
        'doctor_id', 'dayoff_date', 'is_half_day', 'start_time', 'end_time', 'reason', 'priority', 'status', 
        'admin_remarks', 'approved_by', 'approved_at'
    ];

    public function doctor(){
        return $this->belongsTo(Doctor::class, 'doctor_id', 'doctor_id');
    }
}
