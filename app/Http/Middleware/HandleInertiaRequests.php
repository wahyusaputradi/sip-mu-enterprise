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
        $locale = $request->cookie('app_locale', 'id');
        if (in_array($locale, ['id', 'en'])) {
            app()->setLocale($locale);
        } else {
            $locale = 'id';
        }

        $jsonPath = base_path("lang/{$locale}.json");
        $laravelTranslations = file_exists($jsonPath) ? json_decode(file_get_contents($jsonPath), true) : [];

        $employee = $user?->employee;
        $isHomeroomTeacher = false;
        if ($employee) {
            $isHomeroomTeacher = (bool) (
                $employee->is_homeroom_teacher ||
                !empty($employee->homeroom_class) ||
                \App\Models\SchoolClass::where('homeroom_teacher_id', $employee->id)->exists()
            );
        }

        return [
            ...parent::share($request),
            'locale' => $locale,
            'translations' => $laravelTranslations,
            'auth' => [
                'user' => $user ? [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'roles' => method_exists($user, 'getRoleNames') ? array_values($user->getRoleNames()->toArray()) : [],
                    'permissions' => method_exists($user, 'getAllPermissions') ? array_values($user->getAllPermissions()->pluck('name')->toArray()) : [],
                    'employee_photo' => $employee?->photo_url ?? null,
                    'is_homeroom_teacher' => $isHomeroomTeacher,
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
