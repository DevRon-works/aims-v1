<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BoutiqueCctv extends Model
{
    protected $fillable = [
        'branch',
        'brand',
        'working_cameras',
        'serial',
        'username',
        'password',
        'web_ip',
        'storage',
        'status',
        'notes',
        'updated_by',
        'logs',
    ];

    protected $casts = [
        'logs' => 'array',
    ];
}
