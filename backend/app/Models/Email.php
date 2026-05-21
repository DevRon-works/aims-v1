<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Email extends Model
{
    use HasFactory;

    protected $fillable = [
        'emails_type',
        'email_account',
        'password',
        'department',
        'person_used',
        'purpose',
        'recovery_email',
        'recovery_number_verification',
        'updated_by',
    ];

    protected function casts(): array
    {
        return [
            'password' => 'encrypted',
        ];
    }
}
