<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Appointment extends Model
{
    protected static function booted()
    {
        static::created(function ($appointment) {
            if ($appointment->booking_status === 'Confirmed') {
                dispatch(function() use ($appointment) {
                    try {
                        $appointment->refresh();
                        if ($appointment->patient && $appointment->patient->email) {
                            \Illuminate\Support\Facades\Mail::to($appointment->patient->email)
                                ->send(new \App\Mail\AppointmentStatusMail($appointment, 'Confirmed', 'Your appointment has been confirmed after successful payment.'));
                        }
                    } catch (\Exception $e) {
                        \Illuminate\Support\Facades\Log::error('Failed to send appointment creation email: ' . $e->getMessage());
                    }
                })->afterResponse();
            }
        });

        static::updated(function ($appointment) {
            if ($appointment->isDirty('booking_status')) {
                $status = $appointment->booking_status;
                if (in_array($status, ['Confirmed', 'Cancelled', 'Rescheduled', 'No Show'])) {
                    dispatch(function() use ($appointment, $status) {
                        try {
                            $appointment->refresh();
                            if ($appointment->patient && $appointment->patient->email) {
                                $reason = '';
                                if ($status === 'Cancelled') {
                                    $reason = $appointment->cancellation 
                                        ? $appointment->cancellation->cancellation_reason 
                                        : 'Cancelled by clinic staff.';
                                } elseif ($status === 'No Show') {
                                    $reason = 'You were marked as a no-show for this appointment slot.';
                                } elseif ($status === 'Rescheduled') {
                                    $reason = 'Your appointment date or time has been changed.';
                                }
                                
                                \Illuminate\Support\Facades\Mail::to($appointment->patient->email)
                                    ->send(new \App\Mail\AppointmentStatusMail($appointment, $status, $reason));
                            }
                        } catch (\Exception $e) {
                            \Illuminate\Support\Facades\Log::error('Failed to send appointment status email: ' . $e->getMessage());
                        }
                    })->afterResponse();
                }
            }
        });
    }
    protected $primaryKey = 'appointment_id';
    protected $fillable = [
        'patient_id', 'doctor_id', 'service_id', 'schedule_id',
        'appointment_date', 'start_time', 'end_time',
        'appointment_type', 'reason_for_visit',
        'booking_status', 'checkin_deadline', 'attendance_status', 'reminder_sent',
        'payment_method', 'payment_status', 'amount_paid', 'payment_reference'
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
        return $this->belongsTo(Service::class, 'service_id', 'id');
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
    public function queue()
    {
        return $this->hasOne(Queue::class, 'appointment_id', 'appointment_id');
    }

    public static function processNoShows()
    {
        $now = now();
        $today = $now->toDateString();

        $appointments = self::where('appointment_date', $today)
            ->whereIn('booking_status', ['Confirmed', 'Pending'])
            ->get();

        foreach ($appointments as $appointment) {
            $startTime = \Carbon\Carbon::parse($appointment->appointment_date . ' ' . $appointment->start_time);
            $deadline = $startTime->copy()->addMinutes(15);

            if ($now->greaterThan($deadline)) {
                $queue = $appointment->queue;

                if (!$queue || !$queue->is_activated) {
                    $appointment->booking_status = 'No Show';
                    $appointment->save();

                    if ($queue) {
                        $queue->queue_status = 'Cancelled';
                        $queue->save();
                    }

                    AppointmentCancellation::create([
                        'appointment_id' => $appointment->appointment_id,
                        'cancelled_by' => 'Staff',
                        'cancellation_reason' => 'Patient failed to check in within 15 minutes of the appointment start time.',
                        'cancelled_at' => now(),
                    ]);

                    if ($appointment->patient_id) {
                        SystemNotification::create([
                            'notifiable_type' => 'patient',
                            'notifiable_id' => $appointment->patient_id,
                            'title' => 'Missed Appointment',
                            'body' => 'Your appointment with Dr. ' . ($appointment->doctor ? $appointment->doctor->first_name . ' ' . $appointment->doctor->last_name : 'the doctor') . ' at ' . \Carbon\Carbon::parse($appointment->start_time)->format('h:i A') . ' has been marked as a No Show because you did not check in within 15 minutes of the start time.',
                            'type' => 'warning',
                        ]);
                    }
                }
            }
        }
    }
}

