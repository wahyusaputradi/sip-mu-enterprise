<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();
        $hasSession = $request->hasSession();

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user ? [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'roles' => method_exists($user, 'getRoleNames') ? $user->getRoleNames() : [],
                    'permissions' => method_exists($user, 'getAllPermissions') ? $user->getAllPermissions()->pluck('name') : [],
                    'employee_photo' => $user->employee?->photo_url ?? null,
                ] : null,
            ],
            'flash' => [
                'message' => fn () => $hasSession ? $request->session()->get('message') : null,
                'success' => fn () => $hasSession ? $request->session()->get('success') : null,
                'error' => fn () => $hasSession ? $request->session()->get('error') : null,
            ],
        ];
    }

}
