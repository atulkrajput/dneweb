<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\Concerns\HasNotes;

class Lead extends Model
{
    use SoftDeletes, HasNotes;

    protected $fillable = [
        'contact_id',
        'name',
        'company',
        'email',
        'phone',
        'country',
        'interested_service',
        'notes',
        'status',
        // Tracking fields
        'landing_url',
        'referrer',
        'utm_source',
        'utm_medium',
        'utm_campaign',
        'utm_content',
        'utm_term',
        'gclid',
        'fbclid',
        'msclkid',
        'browser',
        'device',
        'visitor_country',
        'ip_address',
        'first_visit_at',
        'last_visit_at',
    ];

    protected $casts = [
        'first_visit_at' => 'datetime',
        'last_visit_at' => 'datetime',
    ];

    const STATUS_NEW = 'new';
    const STATUS_CONTACTED = 'contacted';
    const STATUS_QUALIFIED = 'qualified';
    const STATUS_PROPOSAL_SENT = 'proposal_sent';
    const STATUS_NEGOTIATION = 'negotiation';
    const STATUS_WON = 'won';
    const STATUS_LOST = 'lost';

    const STATUSES = [
        self::STATUS_NEW,
        self::STATUS_CONTACTED,
        self::STATUS_QUALIFIED,
        self::STATUS_PROPOSAL_SENT,
        self::STATUS_NEGOTIATION,
        self::STATUS_WON,
        self::STATUS_LOST,
    ];

    public function contact(): BelongsTo
    {
        return $this->belongsTo(Contact::class);
    }

    public function client()
    {
        return $this->hasOne(Client::class);
    }

    public function activities(): HasMany
    {
        return $this->hasMany(LeadActivity::class)->latest();
    }

    public function logActivity(string $type, string $description, ?array $properties = null, ?int $userId = null): LeadActivity
    {
        return $this->activities()->create([
            'user_id' => $userId ?? auth()->id(),
            'type' => $type,
            'description' => $description,
            'properties' => $properties,
        ]);
    }

    public function scopeStatus($query, string $status)
    {
        return $query->where('status', $status);
    }

    public function scopeNew($query)
    {
        return $query->where('status', self::STATUS_NEW);
    }

    public function scopeOpen($query)
    {
        return $query->whereNotIn('status', [self::STATUS_WON, self::STATUS_LOST]);
    }
}
