<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\Patient;
use App\Models\Doctor;
use App\Models\Staff;

class CheckRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string $role): Response
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $userRole = null;

        if ($user instanceof Patient) {
            $userRole = 'patient';
        } elseif ($user instanceof Doctor) {
            $userRole = 'doctor';
        } elseif ($user instanceof Staff) {
            $userRole = ($user->role === 'Admin') ? 'admin' : 'staff';
        }

        if ($role === 'admin' && $userRole !== 'admin') {
            return response()->json(['message' => 'Forbidden. Admin role required.'], 403);
        }

        if ($role === 'staff') {
            if ($userRole !== 'staff' && $userRole !== 'admin') {
                return response()->json(['message' => 'Forbidden. Staff role required.'], 403);
            }
        }

        if ($role === 'patient' && $userRole !== 'patient') {
            return response()->json(['message' => 'Forbidden. Patient role required.'], 403);
        }

        if ($role === 'doctor' && $userRole !== 'doctor') {
            return response()->json(['message' => 'Forbidden. Doctor role required.'], 403);
        }

        return $next($request);
    }
}
