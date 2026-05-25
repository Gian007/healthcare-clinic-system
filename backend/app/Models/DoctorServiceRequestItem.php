<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DoctorServiceRequestItem extends Model
{
    protected $table = 'doctor_service_request_items';

    protected $fillable = [
        'request_id', 'service_id', 'price'
    ];

    public function request()
    {
        return $this->belongsTo(DoctorServiceRequest::class, 'request_id');
    }

    public function service()
    {
        return $this->belongsTo(Service::class, 'service_id');
    }
}
