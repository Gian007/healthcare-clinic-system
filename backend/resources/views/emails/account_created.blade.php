<!DOCTYPE html>
<html>
<head>
    <title>Your Account Details</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <h2>Welcome to HealthCare Clinic!</h2>
    <p>Hello {{ $user->first_name }} {{ $user->last_name }},</p>
    <p>An account has been created for you as a <strong>{{ $role }}</strong>.</p>
    <p>Here are your temporary login credentials:</p>
    <div style="background: #f4f4f4; padding: 15px; border-radius: 5px; margin: 10px 0;">
        <p style="margin: 0;"><strong>Email / Username:</strong> {{ $user->email }}</p>
        <p style="margin: 0;"><strong>Temporary Password:</strong> <span style="font-family: monospace; font-weight: bold; font-size: 1.2em;">{{ $tempPassword }}</span></p>
    </div>
    <p>Please log in and change your password immediately for security reasons.</p>
    <br>
    <p>Best regards,</p>
    <p>HealthCare Clinic Management</p>
</body>
</html>
