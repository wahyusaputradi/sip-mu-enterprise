<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LoginLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'login_credential',
        'user_id',
        'ip_address',
        'user_agent',
        'status',
        'attempted_at',
    ];

    protected $casts = [
        'attempted_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Check if an account is currently locked out.
     * Returns remaining lockout seconds or 0 if not locked.
     */
    public static function isAccountLocked(string $loginCredential, int $maxAttempts = 5, int $lockoutMinutes = 15): int
    {
        $since = now()->subMinutes($lockoutMinutes);

        $failedAttempts = static::where('login_credential', $loginCredential)
            ->where('status', 'failed')
            ->where('attempted_at', '>=', $since)
            ->count();

        if ($failedAttempts >= $maxAttempts) {
            $lastAttempt = static::where('login_credential', $loginCredential)
                ->where('status', 'failed')
                ->where('attempted_at', '>=', $since)
                ->latest('attempted_at')
                ->first();

            if ($lastAttempt) {
                $unlockAt = $lastAttempt->attempted_at->addMinutes($lockoutMinutes);
                $remaining = now()->diffInSeconds($unlockAt, false);
                return max(0, (int) $remaining);
            }
        }

        return 0;
    }

    /**
     * Get the number of recent failed attempts for an account.
     */
    public static function recentFailedAttempts(string $loginCredential, int $lockoutMinutes = 15): int
    {
        return static::where('login_credential', $loginCredential)
            ->where('status', 'failed')
            ->where('attempted_at', '>=', now()->subMinutes($lockoutMinutes))
            ->count();
    }
}
