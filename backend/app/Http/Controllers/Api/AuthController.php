<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Handle an incoming API authentication request.
     */
    public function store(Request $request)
    {
        \Log::info('Login attempt', ['email' => $request->email, 'cookies' => $request->cookies->all()]);
        
        $request->validate([
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
        ]);

        if (! Auth::attempt($request->only('email', 'password'))) {
            \Log::warning('Login failed', ['email' => $request->email]);
            throw ValidationException::withMessages([
                'email' => __('auth.failed'),
            ]);
        }

        $request->session()->regenerate();
        \Log::info('Login successful', ['user_id' => Auth::id(), 'session_id' => $request->session()->getId()]);

        // Get the XSRF token for the frontend
        $xsrfToken = $request->cookie('XSRF-TOKEN');

        $user = Auth::user();

        return response()->json([
            'message' => 'Authenticated successfully',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->roles->first()?->name ?? null,
            ],
            'xsrf_token' => $xsrfToken,
        ]);
    }

    /**
     * Handle admin authentication request with role check.
     */
    public function storeAdmin(Request $request)
    {
        \Log::info('Admin login attempt', ['email' => $request->email]);
        
        $request->validate([
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
        ]);

        // Check if already authenticated
        if (Auth::check()) {
            $user = Auth::user();
            $role = $user->roles->first()?->name;
            if (in_array($role, ['admin', 'dentiste', 'assistant'])) {
                return response()->json([
                    'message' => 'Already authenticated',
                    'user' => [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'role' => $role,
                    ],
                ]);
            }
            Auth::logout();
        }

        if (! Auth::attempt($request->only('email', 'password'))) {
            \Log::warning('Admin login failed', ['email' => $request->email]);
            throw ValidationException::withMessages([
                'email' => __('auth.failed'),
            ]);
        }

        $request->session()->regenerate();

        $user = Auth::user();
        $role = $user->roles->first()?->name;

        // Check if user has admin or dentist role
        if (!in_array($role, ['admin', 'dentiste', 'assistant'])) {
            Auth::logout();
            \Log::warning('Access denied - insufficient role', ['email' => $user->email, 'role' => $role]);
            return response()->json([
                'message' => 'Access denied. Insufficient permissions.',
            ], 403);
        }

        \Log::info('Admin login successful', ['user_id' => Auth::id(), 'role' => $role]);

        return response()->json([
            'message' => 'Admin authenticated successfully',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $role,
            ],
        ]);
    }

    /**
     * Destroy an authenticated session for API.
     */
    public function destroy(Request $request)
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json([
            'message' => 'Logged out successfully',
        ]);
    }
}
