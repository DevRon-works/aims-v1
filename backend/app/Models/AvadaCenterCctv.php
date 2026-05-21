<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AvadaCenterCctv extends Model
{
    protected $fillable = [
        'floor_name',
        'camera_number',
        'camera_name',
        'username',
        'password',
        'nvr_ip',
        'camera_ip',
        'status',
        'notes',
        'updated_by',
        'logs',
    ];

    protected $casts = [
        'logs' => 'array',
    ];
}
