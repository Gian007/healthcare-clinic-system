<!DOCTYPE html>
<html>
<head>
    <title>Appointment Update</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="text-align: center; margin-bottom: 20px;">
        @if(file_exists(public_path('logo2.png')))
            <img src="{{ $message->embed(public_path('logo2.png')) }}" alt="MediQueue Logo" style="max-height: 80px; margin-bottom: 10px;">
        @endif
        <h1 style="color: #0d9488; font-size: 20px; margin: 0;">MediQueue - Smart Healthcare Clinic System</h1>
    </div>
    <p>Hello {{ $appointment->patient->first_name }} {{ $appointment->patient->last_name }},</p>
    
    <p>Your appointment status has been updated to: <strong>{{ $status }}</strong>.</p>
    
    <div style="background: #f4f4f4; padding: 15px; border-radius: 5px; margin: 10px 0;">
        <p style="margin: 0;"><strong>Appointment Number:</strong> {{ $appointment->appointment_id }}</p>
        <p style="margin: 0;"><strong>Service:</strong> {{ $appointment->service ? $appointment->service->name : 'N/A' }}</p>
        @if($appointment->doctor)
            <p style="margin: 0;"><strong>Doctor:</strong> Dr. {{ $appointment->doctor->first_name }} {{ $appointment->doctor->last_name }}</p>
        @endif
        <p style="margin: 0;"><strong>Date:</strong> {{ \Carbon\Carbon::parse($appointment->appointment_date)->format('F d, Y') }}</p>
        <p style="margin: 0;"><strong>Time:</strong> {{ \Carbon\Carbon::parse($appointment->start_time)->format('h:i A') }}</p>
        <p style="margin: 0;"><strong>Payment Status:</strong> {{ $appointment->payment_status }}</p>
        @if($appointment->payment_method)
            <p style="margin: 0;"><strong>Payment Method:</strong> {{ $appointment->payment_method }}</p>
        @endif
        @if($appointment->amount_paid)
            <p style="margin: 0;"><strong>Amount Paid:</strong> ₱{{ number_format($appointment->amount_paid, 2) }}</p>
        @endif
    </div>

    @if(!empty($reason))
        <p><strong>Note:</strong> {{ $reason }}</p>
    @endif

    <p>Thank you for choosing MediQueue!</p>
    <p>Clinic Administration</p>
    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
    <div style="background: #fffbeb; border: 1px solid #fef3c7; padding: 15px; border-radius: 8px; text-align: center;">
        <p style="font-size: 11px; color: #92400e; margin: 0; font-weight: bold;">🚫 DO NOT REPLY TO THIS EMAIL</p>
        <p style="font-size: 10px; color: #b45309; margin: 5px 0 0;">This is an automated notification and this inbox is not monitored. For concerns, visit our office or contact us through our official phone lines.</p>
    </div>
</body>
</html>
