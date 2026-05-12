<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SystemNotification;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    /**
     * Resolve the notifiable type string from user model class.
     */
    private function resolveType($user): string
    {
        $class = get_class($user);
        if (str_contains($class, 'Patient')) return 'patient';
        if (str_contains($class, 'Doctor'))  return 'doctor';
        if (str_contains($class, 'Staff'))   return 'staff';
        return 'unknown';
    }

    private function resolveId($user): int
    {
        return $user->patient_id ?? $user->doctor_id ?? $user->staff_id ?? $user->id;
    }

    /**
     * GET /notifications — list all notifications for authenticated user.
     */
    public function index(Request $request)
    {
        $user   = $request->user();
        $type   = $this->resolveType($user);
        $id     = $this->resolveId($user);

        $notifications = SystemNotification::forUser($type, $id)
            ->orderBy('created_at', 'desc')
            ->get();

        // If user has no notifications at all, create a welcome one
        if ($notifications->isEmpty()) {
            $name  = ($user->first_name ?? '') . ' ' . ($user->last_name ?? '');
            $welcome = SystemNotification::createWelcome($type, $id, trim($name));
            $notifications = collect([$welcome]);
        }

        return response()->json($notifications);
    }

    /**
     * PUT /notifications/{id}/read — mark single as read.
     */
    public function markRead(Request $request, $id)
    {
        $user   = $request->user();
        $type   = $this->resolveType($user);
        $uid    = $this->resolveId($user);

        $notif = SystemNotification::where('notif_id', $id)
            ->where('notifiable_type', $type)
            ->where('notifiable_id', $uid)
            ->firstOrFail();

        $notif->update(['is_read' => true]);

        return response()->json(['message' => 'Marked as read']);
    }

    /**
     * PUT /notifications/read-all — mark all as read.
     */
    public function markAllRead(Request $request)
    {
        $user   = $request->user();
        $type   = $this->resolveType($user);
        $uid    = $this->resolveId($user);

        SystemNotification::forUser($type, $uid)->update(['is_read' => true]);

        return response()->json(['message' => 'All marked as read']);
    }

    /**
     * GET /notifications/unread-count
     */
    public function unreadCount(Request $request)
    {
        $user   = $request->user();
        $type   = $this->resolveType($user);
        $uid    = $this->resolveId($user);

        $count = SystemNotification::forUser($type, $uid)->where('is_read', false)->count();

        return response()->json(['count' => $count]);
    }
}
