<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class AccountCreatedMail extends Mailable
{
    use Queueable, SerializesModels;

    public $user;
    public $tempPassword;
    public $role;

    public function __construct($user, $tempPassword, $role)
    {
        $this->user = $user;
        $this->tempPassword = $tempPassword;
        $this->role = $role;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Welcome to HealthCare Clinic - Your Account Details',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.account_created',
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
