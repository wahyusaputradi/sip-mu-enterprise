<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AttendanceUnlock extends Model
{
    use HasFactory;

    protected $fillable = [
        'employee_id',
        'date',
        'type',
        'teaching_schedule_id',
        'unlocked_by',
        'reason',
        'is_lateness_violation',
        'used',
        'expires_at',
    ];

    protected $casts = [
        'date' => 'date',
        'used' => 'boolean',
        'expires_at' => 'datetime',
        'is_lateness_violation' => 'boolean',
    ];

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }

    public function teachingSchedule()
    {
        return $this->belongsTo(TeachingSchedule::class);
    }

    public function unlockedByUser()
    {
        return $this->belongsTo(User::class, 'unlocked_by');
    }
}
