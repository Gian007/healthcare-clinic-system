<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ClinicOperatingHour extends Model
{
    protected $fillable = ['day_of_week', 'is_open', 'open_time', 'close_time'];
}
