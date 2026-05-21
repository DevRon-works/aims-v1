<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class DynamicTableColumn extends Model
{
    protected $fillable = [
        'module',
        'key',
        'label',
        'field_type',
        'options',
        'is_custom',
        'is_protected',
        'is_required',
        'is_hidden',
        'sort_order',
    ];

    protected $casts = [
        'options' => 'array',
        'is_custom' => 'boolean',
        'is_protected' => 'boolean',
        'is_required' => 'boolean',
        'is_hidden' => 'boolean',
    ];

    public function values(): HasMany
    {
        return $this->hasMany(DynamicTableValue::class);
    }
}
