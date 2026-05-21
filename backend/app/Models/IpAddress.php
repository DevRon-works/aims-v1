<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class IpAddress extends Model
{
    protected $fillable = [
        'location',
        'device_type',
        'device_name',
        'name',
        'department',
        'computer_name',
        'mac_address',
        'ip_address',
        'status',
        'notes',
        'updated_by',
        'duplicate_ip',
        'duplicate_mac',
        'missing_fields',
        'logs',
    ];

    protected $casts = [
        'duplicate_ip' => 'boolean',
        'duplicate_mac' => 'boolean',
        'missing_fields' => 'array',
        'logs' => 'array',
    ];
}
