<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class QueueDisplayScreen extends Model
{
    protected $primaryKey = 'screen_id';
    protected $fillable = ['screen_name', 'location', 'doctor_id', 'status'];

    public function doctor()
    {
        return $this->belongsTo(Doctor::class, 'doctor_id', 'doctor_id');
    }
}
