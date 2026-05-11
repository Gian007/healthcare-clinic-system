<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DoctorService extends Model
{
    protected $table = 'doctor_service';
    protected $primaryKey = 'doctor_service_id';
    protected $fillable = [
        'doctor_id', 'service_id', 'status'
        ];

        public function doctor(){
            return $this->belongsTo(Doctor::class, 'doctor_id', 'doctor_id');
        }

        public function service(){
            return $this->belongsTo(Service::class, 'service_id', 'service_id');
        }
}
