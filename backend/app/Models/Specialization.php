<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Specialization extends Model
{
    protected $primaryKey = 'specialization_id';
    protected $fillable = ['specialization_name', 'description'];

    // Virtual 'name' attribute for frontend compatibility
    protected $appends = ['name'];

    public function getNameAttribute(): string
    {
        return $this->specialization_name ?? '';
    }

    public function doctors()
    {
        return $this->hasMany(Doctor::class, 'specialization_id', 'specialization_id');
    }
}
