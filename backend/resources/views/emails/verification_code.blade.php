<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px; }
        .header { text-align: center; margin-bottom: 30px; }
        .footer { margin-top: 30px; font-size: 12px; color: #777; text-align: center; }
        .code-box { background: #f4f4f4; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; border-radius: 8px; letter-spacing: 5px; color: #0D8BFF; border: 2px dashed #0D8BFF; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            @php
                $logoFile = public_path('logo2.png');
                if (!empty($logoPath) && file_exists(storage_path('app/public/' . $logoPath))) {
                    $logoFile = storage_path('app/public/' . $logoPath);
                }
            @endphp
            <img src="{{ $message->embed($logoFile) }}" alt="{{ $clinicName }} Logo" style="max-height: 80px; margin-bottom: 10px;">
            <h1 style="color: #0D8BFF; font-size: 20px; margin: 0;">{{ $tagline }} ({{ $clinicName }})</h1>
        </div>
        <p>Hello,</p>
        <p>Thank you for choosing {{ $clinicName }}. To complete your registration, please use the verification code below:</p>
        
        <div class="code-box">
            {{ $code }}
        </div>
        
        <p>This code will expire in 15 minutes. If you did not request this code, please ignore this email.</p>
        
        <div class="footer">
            &copy; {{ date('Y') }} {{ $clinicName }}. All rights reserved.
        </div>
    </div>
</body>
</html>
