<?php
$request = new \Illuminate\Http\Request();
$request->merge(['email' => 'staff@clinic.com', 'password' => 'password', 'role' => 'staff']);

$controller = new \App\Http\Controllers\Api\AuthController();
try {
    $res = $controller->login($request);
    echo json_encode($res->getData());
} catch (\Exception $e) {
    echo "ERROR: " . get_class($e) . " - " . $e->getMessage();
    if (method_exists($e, 'errors')) {
        echo "\nValidation errors: " . json_encode($e->errors());
    }
}
