<?php

namespace App\Models;


use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;
class Staff extends Authenticatable
{
    use HasApiTokens;
    protected $primaryKey = 'staff_id';
    protected $fillable = [
        'first_name', 'last_name', 'role', 'contact_number', 'email', 'password', 'account_status'
    ];
    protected $hidden = ['password'];

    public function patientVerifications(){
        return $this->hasMany(PatientVerification::class, 'reviewed_by', 'staff_id');


        }
}
