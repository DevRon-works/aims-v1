<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::query()->updateOrCreate(
            ['email' => 'superadmin@example.com'],
            [
                'name' => 'superadmin',
                'role' => 'Super Administrator',
                'password' => 'Password@1',
            ],
        );

        User::query()->updateOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'admin',
                'role' => 'Administrator',
                'password' => 'Password@1',
            ],
        );
    }
}
