<?php

namespace App\Http\Requests\Auth;

use App\Models\LoginLog;
use Illuminate\Auth\Events\Lockout;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class LoginRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'login' => ['required', 'string'],
            'password' => ['required', 'string'],
            'login_mode' => ['nullable', 'string', 'in:pegawai,siswa'],
        ];
    }

    /**
     * Get custom validation messages.
     */
    public function messages(): array
    {
        return [
            'login.required' => 'Email atau username wajib diisi.',
            'password.required' => 'Password wajib diisi.',
        ];
    }

    /**
     * Attempt to authenticate the request's credentials.
     * Supports login via email OR username.
     * Includes per-account lockout and login activity logging.
     *
     * @throws ValidationException
     */
    public function authenticate(): void
    {
        // 1. IP-based rate limiting (existing)
        $this->ensureIsNotRateLimited();

        // 2. Per-account lockout check
        $login = $this->input('login');
        $this->ensureAccountIsNotLocked($login);

        // 3. Auto-detect credential type
        $fieldType = filter_var($login, FILTER_VALIDATE_EMAIL) ? 'email' : 'username';

        $credentials = [
            $fieldType => $login,
            'password' => $this->input('password'),
        ];

        if (! Auth::attempt($credentials, $this->boolean('remember'))) {
            RateLimiter::hit($this->throttleKey());

            // Log failed attempt
            LoginLog::create([
                'login_credential' => Str::lower($login),
                'user_id' => null,
                'ip_address' => $this->ip(),
                'user_agent' => $this->userAgent(),
                'status' => 'failed',
                'attempted_at' => now(),
            ]);

            // Check if this failure triggers account lockout
            $failedCount = LoginLog::recentFailedAttempts(Str::lower($login));
            $maxAttempts = 5;
            $remaining = $maxAttempts - $failedCount;

            if ($remaining <= 0) {
                throw ValidationException::withMessages([
                    'login' => "Akun telah dikunci sementara karena terlalu banyak percobaan gagal. Silakan coba lagi dalam 15 menit atau hubungi Administrator.",
                ]);
            }

            throw ValidationException::withMessages([
                'login' => "Kombinasi email/username atau kata sandi salah. Sisa percobaan: {$remaining}.",
            ]);
        }

        // 4. Strict Role-Mode Matching Check
        $user = Auth::user();
        $loginMode = $this->input('login_mode');

        if ($loginMode === 'siswa' && !$user->hasRole(['Siswa', 'Wali Murid'])) {
            Auth::logout();
            RateLimiter::hit($this->throttleKey());
            throw ValidationException::withMessages([
                'login' => 'Mode login tidak sesuai! Akun Anda terdaftar sebagai Pegawai/Guru. Silakan gunakan tab "Pegawai / Guru" untuk masuk.',
            ]);
        }

        if ($loginMode === 'pegawai' && $user->hasRole(['Siswa', 'Wali Murid'])) {
            Auth::logout();
            RateLimiter::hit($this->throttleKey());
            throw ValidationException::withMessages([
                'login' => 'Mode login tidak sesuai! Akun Anda terdaftar sebagai Siswa/Wali Murid. Silakan gunakan tab "Siswa / Wali Murid" untuk masuk.',
            ]);
        }

        RateLimiter::clear($this->throttleKey());

        // Log successful login
        LoginLog::create([
            'login_credential' => Str::lower($login),
            'user_id' => Auth::id(),
            'ip_address' => $this->ip(),
            'user_agent' => $this->userAgent(),
            'status' => 'success',
            'attempted_at' => now(),
        ]);
    }

    /**
     * Ensure the account is not temporarily locked due to failed attempts.
     *
     * @throws ValidationException
     */
    protected function ensureAccountIsNotLocked(string $login): void
    {
        $lockoutSeconds = LoginLog::isAccountLocked(Str::lower($login), 5, 15);

        if ($lockoutSeconds > 0) {
            $minutes = ceil($lockoutSeconds / 60);

            // Log the locked attempt
            LoginLog::create([
                'login_credential' => Str::lower($login),
                'user_id' => null,
                'ip_address' => $this->ip(),
                'user_agent' => $this->userAgent(),
                'status' => 'locked',
                'attempted_at' => now(),
            ]);

            throw ValidationException::withMessages([
                'login' => "Akun dikunci sementara. Silakan coba lagi dalam {$minutes} menit atau hubungi Administrator.",
            ]);
        }
    }

    /**
     * Ensure the login request is not rate limited (IP-based).
     *
     * @throws ValidationException
     */
    public function ensureIsNotRateLimited(): void
    {
        if (! RateLimiter::tooManyAttempts($this->throttleKey(), 5)) {
            return;
        }

        event(new Lockout($this));

        $seconds = RateLimiter::availableIn($this->throttleKey());

        throw ValidationException::withMessages([
            'login' => trans('auth.throttle', [
                'seconds' => $seconds,
                'minutes' => ceil($seconds / 60),
            ]),
        ]);
    }

    /**
     * Get the rate limiting throttle key for the request.
     */
    public function throttleKey(): string
    {
        return Str::transliterate(Str::lower($this->string('login')).'|'.$this->ip());
    }
}
