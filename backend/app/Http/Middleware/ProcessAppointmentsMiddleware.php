<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Cache;
use App\Models\Appointment;

class ProcessAppointmentsMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (!Cache::has('process_appointments_last_run')) {
            Cache::put('process_appointments_last_run', true, now()->addMinute());

            try {
                Appointment::processNoShows();
            } catch (\Exception $e) {
                \Illuminate\Support\Facades\Log::error('Error processing no show appointments in middleware: ' . $e->getMessage());
            }
        }

        return $next($request);
    }
}
