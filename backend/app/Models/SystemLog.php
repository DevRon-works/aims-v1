<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SystemLog extends Model
{
    protected $fillable = [
        'module_name',
        'action',
        'detail',
        'actor',
        'metadata',
    ];

    protected $casts = [
        'metadata' => 'array',
    ];
}
