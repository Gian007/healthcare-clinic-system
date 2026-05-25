<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class AppointmentStatusMail extends Mailable
{
    use Queueable, SerializesModels;

    public $appointment;
    public $status;
    public $reason;

    public function __construct($appointment, $status, $reason = '')
    {
        $this->appointment = $appointment;
        $this->status = $status;
        $this->reason = $reason;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Appointment Update: ' . $this->status . ' - MediQueue',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.appointment_status',
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
