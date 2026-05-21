<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CctvImportHistory extends Model
{
    protected $fillable = [
        'section',
        'file_name',
        'total_rows',
        'imported_rows',
        'skipped_duplicate_rows',
        'updated_rows',
        'failed_rows',
        'validation_errors',
        'status',
        'imported_by',
    ];

    protected $casts = [
        'validation_errors' => 'array',
    ];
}
