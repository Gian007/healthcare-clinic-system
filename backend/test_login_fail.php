<?php
$request = new \Illuminate\Http\Request();
$request->headers->set('Accept', 'application/json');
$request->merge(['email' => 'staff@clinic.com', 'password' => 'wrongpassword', 'role' => 'staff']);

$controller = new \App\Http\Controllers\Api\AuthController();
try {
    $res = $controller->login($request);
    echo json_encode($res->getData());
} catch (\Illuminate\Validation\ValidationException $e) {
    echo "422 Validation Error:\n";
    echo json_encode([
        'message' => $e->getMessage(),
        'errors' => $e->errors()
    ]);
} catch (\Exception $e) {
    echo "ERROR: " . get_class($e) . " - " . $e->getMessage();
}
