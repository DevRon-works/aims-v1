<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Illuminate\Validation\ValidationException;

Route::get('/', function () {
    return view('welcome');
});

Route::post('/login', function (Request $request) {
    $credentials = $request->validate([
        'email' => ['required_without:username', 'email'],
        'username' => ['required_without:email', 'string'],
        'password' => ['required', 'string'],
        'remember' => ['sometimes', 'boolean'],
    ]);

    $email = $credentials['email'] ?? $credentials['username'];

    if (! Auth::attempt([
        'email' => $email,
        'password' => $credentials['password'],
    ], $request->boolean('remember'))) {
        throw ValidationException::withMessages([
            'email' => __('auth.failed'),
        ]);
    }

    $request->session()->regenerate();

    return response()->json([
        'user' => $request->user(),
    ]);
});

Route::post('/logout', function (Request $request) {
    Auth::guard('web')->logout();

    $request->session()->invalidate();
    $request->session()->regenerateToken();

    return response()->noContent();
})->middleware('auth');
