<!DOCTYPE html>
<html>
<head>
    <title>{{ $subjectLine }}</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="text-align: center; margin-bottom: 20px;">
        <img src="{{ $message->embed(public_path('logo2.png')) }}" alt="MediQueue Logo" style="max-height: 80px; margin-bottom: 10px;">
        <h1 style="color: #0d9488; font-size: 20px; margin: 0;">MediQueue - Clinic Management</h1>
    </div>
    <p>Dear {{ $staff->first_name }} {{ $staff->last_name }},</p>
    
    <div style="background: #f9fafb; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb; margin: 20px 0;">
        {!! nl2br(e($messageBody)) !!}
    </div>

    <p>Best regards,</p>
    <p>Clinic Administration</p>
    
    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
    <div style="background: #fffbeb; border: 1px solid #fef3c7; padding: 15px; border-radius: 8px; text-align: center;">
        <p style="font-size: 11px; color: #92400e; margin: 0; font-weight: bold;">🚫 DO NOT REPLY TO THIS EMAIL</p>
        <p style="font-size: 10px; color: #b45309; margin: 5px 0 0;">This is an automated notification and this inbox is not monitored. If you need assistance, please contact the clinic administrator directly.</p>
    </div>
</body>
</html>
