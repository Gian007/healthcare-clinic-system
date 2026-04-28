<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DoctorDayOff extends Model
{
    protected $primaryKey = 'dayoff_id';
    protected $fillable = ['doctor_id', 'dayoff_date', 'reason', 'status'];

    public function doctor(){
        return $this->belongsTo(Doctor::class, 'doctor_id', 'doctor_id');
    }
}
