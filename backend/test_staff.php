<?php
$user = App\Models\Staff::where('email', 'staff@clinic.com')->first();
echo json_encode(['exists' => $user !== null, 'email' => $user->email ?? null, 'role' => $user->role ?? null, 'status' => $user->account_status ?? null]);
