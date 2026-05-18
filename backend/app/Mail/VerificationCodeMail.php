<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

use App\Models\SystemSetting;

class VerificationCodeMail extends Mailable
{
    use Queueable, SerializesModels;

    public $code;
    public $clinicName;
    public $tagline;
    public $logoPath;

    public function __construct($code)
    {
        $this->code = $code;
        
        $settingsObj = SystemSetting::where('key', 'admin_portal_settings')->first();
        $settings = $settingsObj ? $settingsObj->value : [];
        $branding = $settings['branding'] ?? [];
        
        $this->clinicName = $branding['clinicName'] ?? 'SHQMS';
        $this->tagline = $branding['tagline'] ?? 'Smart Healthcare Availability and Queue Management System';
        $this->logoPath = $branding['logoPath'] ?? '';
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Your Registration Verification Code',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.verification_code',
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
