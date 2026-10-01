<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Outcome extends Model
{
    protected $fillable = [
        'goal_id',
        'task_id',
        'user_id',
        'type',
        'value',
        'unit',
        'note',
        'occurred_on',
    ];

    protected $casts = [
        'value' => 'decimal:2',
        'occurred_on' => 'date',
    ];

    const TYPE_QUALIFIED_LEAD = 'qualified_lead';
    const TYPE_MEETING = 'meeting';
    const TYPE_CONVERSION = 'conversion';
    const TYPE_REVENUE = 'revenue';
    const TYPE_HOURS = 'hours';
    const TYPE_COST = 'cost';
    const TYPE_OTHER = 'other';

    const TYPES = [
        self::TYPE_QUALIFIED_LEAD,
        self::TYPE_MEETING,
        self::TYPE_CONVERSION,
        self::TYPE_REVENUE,
        self::TYPE_HOURS,
        self::TYPE_COST,
        self::TYPE_OTHER,
    ];

    const TYPE_LABELS = [
        self::TYPE_QUALIFIED_LEAD => 'Qualified Lead',
        self::TYPE_MEETING => 'Meeting Booked',
        self::TYPE_CONVERSION => 'Conversion',
        self::TYPE_REVENUE => 'Revenue',
        self::TYPE_HOURS => 'Hours Spent',
        self::TYPE_COST => 'Cost',
        self::TYPE_OTHER => 'Other',
    ];

    public function goal(): BelongsTo
    {
        return $this->belongsTo(Goal::class);
    }

    public function task(): BelongsTo
    {
        return $this->belongsTo(Task::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
