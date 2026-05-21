<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Account extends Model
{
    protected $fillable = [
        'account_type',
        'merchant_name',
        'store_location_name',
        'store_address',
        'store_manager',
        'store_email',
        'store_contact_number',
        'bank',
        'account_name',
        'account_number',
        'company',
        'branch',
        'pldt_status',
        'remarks',
        'check',
        'company_account',
        'department',
        'email',
        'username',
        'password',
        'link',
        'status',
        'notes',
        'updated_by',
        'duplicate_account_number',
        'invalid_url',
        'missing_link',
        'missing_fields',
        'logs',
    ];

    protected $casts = [
        'duplicate_account_number' => 'boolean',
        'invalid_url' => 'boolean',
        'missing_link' => 'boolean',
        'missing_fields' => 'array',
        'logs' => 'array',
    ];
}
