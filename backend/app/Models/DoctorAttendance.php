<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DoctorAttendance extends Model
{
    protected $primaryKey = 'attendance_id';
    protected $fillable = [
        'doctor_id', 'attendance_date', 'time_in',
        'time_out', 'attendance_status'
    ];

     public function doctor()
    {
        return $this->belongsTo(Doctor::class, 'doctor_id', 'doctor_id');
    }
}
