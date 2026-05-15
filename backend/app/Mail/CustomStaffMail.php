<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class CustomStaffMail extends Mailable
{
    use Queueable, SerializesModels;

    public $staff;
    public $subjectLine;
    public $messageBody;

    public function __construct($staff, $subjectLine, $messageBody)
    {
        $this->staff = $staff;
        $this->subjectLine = $subjectLine;
        $this->messageBody = $messageBody;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: $this->subjectLine,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.custom_staff_msg',
        );
    }
}
