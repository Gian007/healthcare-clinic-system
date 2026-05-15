<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DoctorAttachment extends Model
{
    protected $primaryKey = 'attachment_id';
    protected $fillable = ['doctor_id', 'file_path', 'file_name', 'file_type'];

    public function doctor()
    {
        return $this->belongsTo(Doctor::class, 'doctor_id', 'doctor_id');
    }
}
