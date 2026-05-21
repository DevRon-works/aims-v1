<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ImportHistory extends Model
{
    protected $fillable = [
        'module_name',
        'import_type',
        'file_name',
        'status',
        'total_rows',
        'imported_rows',
        'failed_rows',
        'imported_by',
        'imported_at',
    ];

    protected $casts = [
        'imported_at' => 'datetime',
    ];
}
