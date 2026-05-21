<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WarehouseOnlineCctv extends Model
{
    protected $fillable = [
        'branch',
        'brand',
        'model',
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
