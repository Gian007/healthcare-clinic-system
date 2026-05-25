<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Service extends Model
{
    protected $primaryKey = 'id';
    protected $fillable = [
        'name', 'description', 'price', 'estimated_duration',
        'service_type', 'requires_doctor', 'is_publicly_bookable',
        'required_specialization', 'requirements_notes', 'is_active'
    ];

    protected $casts = [
        'requires_doctor' => 'boolean',
        'is_publicly_bookable' => 'boolean',
        'is_active' => 'boolean',
        'price' => 'float',
    ];

    protected $appends = ['service_id', 'service_name', 'base_fee', 'service_status', 'specialization_id'];

    public function getServiceIdAttribute()
    {
        return $this->id;
    }

    public function getServiceNameAttribute()
    {
        return $this->name;
    }

    public function getBaseFeeAttribute()
    {
        return $this->price;
    }

    public function getServiceStatusAttribute()
    {
        return $this->is_active ? 'Available' : 'Unavailable';
    }

    public function getSpecializationIdAttribute()
    {
        return $this->required_specialization;
    }

    public function specialization()
    {
        return $this->belongsTo(Specialization::class, 'required_specialization', 'specialization_id');
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
