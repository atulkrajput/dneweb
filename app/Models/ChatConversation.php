<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Prunable;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ChatConversation extends Model
{
    use Prunable;

    protected $fillable = [
        'uuid', 'lead_id', 'messages', 'message_count', 'page_url',
        'ip_address', 'user_agent', 'last_message_at',
    ];

    protected $casts = [
        'messages' => 'array',
        'last_message_at' => 'datetime',
    ];

    /**
     * Chats are kept for 12 months (see the Privacy Policy). Conversations that
     * became a lead live on in the lead's notes, so they follow the same rule.
     */
    public function prunable(): Builder
    {
        return static::where('last_message_at', '<', now()->subMonths(12));
    }

    public function lead(): BelongsTo
    {
        return $this->belongsTo(Lead::class);
    }
}
