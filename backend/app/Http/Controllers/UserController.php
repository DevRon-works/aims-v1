<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\DynamicTableValueService;
use Illuminate\Http\JsonResponse;

class UserController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'data' => User::query()
                ->latest('updated_at')
                ->get()
                ->map(fn (User $user) => [
                    'id' => (string) $user->id,
                    'name' => $user->name,
                    'username' => $user->email,
                    'email' => $user->email,
                    'role' => $user->role,
                    'status' => 'Active',
                    'avatarUrl' => '',
                    'lastActive' => optional($user->updated_at)->toDateTimeString(),
                    'custom_fields' => app(DynamicTableValueService::class)->values('users', $user->id),
                ])
                ->values(),
        ]);
    }
}
