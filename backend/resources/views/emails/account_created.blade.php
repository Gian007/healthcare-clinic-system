<!DOCTYPE html>
<html>
<head>
    <title>Your Account Details</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="text-align: center; margin-bottom: 20px;">
        <img src="{{ $message->embed(public_path('logo2.png')) }}" alt="SHQMS Logo" style="max-height: 80px; margin-bottom: 10px;">
        <h1 style="color: #0d9488; font-size: 20px; margin: 0;">Smart Healthcare Availability and Queue Management System (SHQMS)</h1>
    </div>
    <p>Hello {{ $user->first_name }} {{ $user->last_name }},</p>
    <p>An account has been created for you as a <strong>{{ $role }}</strong>.</p>
    <p>Here are your temporary login credentials:</p>
    <div style="background: #f4f4f4; padding: 15px; border-radius: 5px; margin: 10px 0;">
        <p style="margin: 0;"><strong>Email / Username:</strong> {{ $user->email }}</p>
        <p style="margin: 0;"><strong>Temporary Password:</strong> <span style="font-family: monospace; font-weight: bold; font-size: 1.2em;">{{ $tempPassword }}</span></p>
    </div>
    <p>Please log in and change your password immediately for security reasons.</p>
    <p>Clinic Administration</p>
    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
    <div style="background: #fffbeb; border: 1px solid #fef3c7; padding: 15px; border-radius: 8px; text-align: center;">
        <p style="font-size: 11px; color: #92400e; margin: 0; font-weight: bold;">🚫 DO NOT REPLY TO THIS EMAIL</p>
        <p style="font-size: 10px; color: #b45309; margin: 5px 0 0;">This is an automated notification and this inbox is not monitored. For concerns, visit our office or contact us through our official phone lines.</p>
    </div>
</body>
</html>
