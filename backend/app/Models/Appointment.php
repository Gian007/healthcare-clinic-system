<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Appointment extends Model
{
    protected $primaryKey = 'appointment_id';
    protected $fillable = [
        'patient_id', 'doctor_id', 'service_id', 'schedule_id',
        'appointment_date', 'start_time', 'end_time',
        'appointment_type', 'reason_for_visit',
        'booking_status', 'checkin_deadline', 'attendance_status'
    ];

    public function patient()
    {
        return $this->belongsTo(Patient::class, 'patient_id', 'patient_id');
    }
    public function doctor()
    {
        return $this->belongsTo(Doctor::class, 'doctor_id', 'doctor_id');
    }
    public function service()
    {
        return $this->belongsTo(Service::class, 'service_id', 'service_id');
    }
    public function schedule()
    {
        return $this->belongsTo(DoctorSchedule::class, 'schedule_id', 'schedule_id');
    }
    public function consultation()
    {
        return $this->hasOne(Consultation::class, 'appointment_id', 'appointment_id');
    }
    public function reschedules()
    {
        return $this->hasMany(AppointmentReschedule::class, 'appointment_id', 'appointment_id');
    }
    public function cancellation()
    {
        return $this->hasOne(AppointmentCancellation::class, 'appointment_id', 'appointment_id');
    }
}