<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Specialization extends Model
{
    protected $primaryKey = 'specialization_id';
    protected $fillable = ['specialization_name', 'description'];

    public function doctors(){
        return $this->hasMany(Doctor::class, 'specialization_id', 'specialization_id');
    }
}
