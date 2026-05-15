<!DOCTYPE html>
<html>
<head>
    <title>Reset Your Password</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div class="container">
        <div class="header">
            <img src="{{ $message->embed(public_path('logo2.png')) }}" alt="SHQMS Logo" style="max-height: 80px; margin-bottom: 10px;">
            <h1 style="color: #0d9488; font-size: 24px; margin: 0;">Smart Healthcare Availability and Queue Management System</h1>
        </div>
        <p>Hello,</p>
    </div>
    <p>We received a request to reset the password for your account associated with {{ $email }}.</p>
    <p>Please click the button below to reset your password:</p>
    <a href="{{ config('app.frontend_url') }}/reset-password?token={{ $token }}&email={{ urlencode($email) }}" 
       style="display: inline-block; background-color: #0d9488; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 15px 0; font-weight: bold;">
       Reset Password
    </a>
    <p>If you did not request a password reset, no further action is required.</p>
    <br>
    <p>Best regards,</p>
    <p>HealthCare Clinic Management</p>
</body>
</html>
