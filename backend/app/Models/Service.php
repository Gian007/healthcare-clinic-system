<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Service extends Model
{
    protected $primaryKey = 'service_id';
    protected $fillable = [
        'service_name', 'description', 'base_fee',
        'estimated_duration', 'service_status', 'specialization_id'
    ];

    public function specialization()
    {
        return $this->belongsTo(Specialization::class, 'specialization_id');
    }

    public function specializations()
    {
        return $this->belongsToMany(Specialization::class, 'service_specializations', 'service_id', 'specialization_id')->withTimestamps();
    }

    public function doctors()
    {
        return $this->belongsToMany(Doctor::class, 'doctor_service', 'service_id', 'doctor_id');
    }
}
