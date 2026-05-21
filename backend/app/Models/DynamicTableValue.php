<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DynamicTableValue extends Model
{
    protected $fillable = [
        'module',
        'record_id',
        'dynamic_table_column_id',
        'value',
    ];

    protected $casts = [
        'value' => 'array',
    ];

    public function column(): BelongsTo
    {
        return $this->belongsTo(DynamicTableColumn::class, 'dynamic_table_column_id');
    }
}
