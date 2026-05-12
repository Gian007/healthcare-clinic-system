<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px; }
        .header { text-align: center; margin-bottom: 30px; }
        .footer { margin-top: 30px; font-size: 12px; color: #777; text-align: center; }
        .password-box { background: #f4f4f4; padding: 15px; text-align: center; font-size: 20px; font-weight: bold; border-radius: 5px; letter-spacing: 2px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 style="color: #0D8BFF;">HealthCare Clinic</h1>
        </div>
        <p>Hello {{ $user->first_name }},</p>
        <p>We received a request to reset your password. Your password has been automatically reset to the following:</p>
        
        <div class="password-box">
            {{ $newPassword }}
        </div>
        
        <p>Please log in using this password and change it immediately in your profile settings for security.</p>
        
        <p>If you did not request this, please contact us immediately.</p>
        
        <div class="footer">
            &copy; {{ date('Y') }} HealthCare Clinic. All rights reserved.
        </div>
    </div>
</body>
</html>
