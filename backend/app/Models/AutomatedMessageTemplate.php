<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AutomatedMessageTemplate extends Model
{
    protected $primaryKey = 'template_id';
    protected $fillable = [
        'template_name', 'event_trigger', 'message_subject',
        'message_body', 'channel', 'status'
    ];
}
