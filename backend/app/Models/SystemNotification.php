<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SystemNotification extends Model
{
    protected $primaryKey = 'notif_id';

    protected $fillable = [
        'notifiable_type',
        'notifiable_id',
        'title',
        'body',
        'type',
        'is_read',
    ];

    protected $casts = [
        'is_read' => 'boolean',
    ];

    /**
     * Scope to get notifications for a specific user.
     */
    public function scopeForUser($query, string $type, int $id)
    {
        return $query->where('notifiable_type', $type)->where('notifiable_id', $id);
    }

    /**
     * Create a welcome notification for a new user.
     */
    public static function createWelcome(string $type, int $id, string $name): self
    {
        return self::create([
            'notifiable_type' => $type,
            'notifiable_id'   => $id,
            'title'           => 'Welcome to HealthCare Clinic!',
            'body'            => "Hello, {$name}! Your account has been created successfully. We're glad to have you with us.",
            'type'            => 'success',
        ]);
    }
}
