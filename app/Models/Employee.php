<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Employee extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'nik',
        'nik_kependudukan',
        'nuptk',
        'name',
        'birth_place',
        'birth_date',
        'gender',
        'phone',
        'photo_path',
        'address',
        'join_date',
        'education',
        'subject',
        'ukg_number',
        'teaching_hours',
        'status',
        'is_homeroom_teacher',
        'homeroom_class',
        'is_extracurricular_builder',
        'extracurricular_name',
        'bpjs_deduction',
        'school_loan',
        'bmt_loan',
        'cooperative_deduction',
    ];

    protected $casts = [
        'birth_date' => 'date',
        'join_date' => 'date',
        'is_homeroom_teacher' => 'boolean',
        'is_extracurricular_builder' => 'boolean',
        'bpjs_deduction' => 'decimal:2',
        'school_loan' => 'decimal:2',
        'bmt_loan' => 'decimal:2',
        'cooperative_deduction' => 'decimal:2',
    ];

    protected $appends = ['work_duration', 'photo_url'];

    public function getPhotoUrlAttribute()
    {
        if (!$this->photo_path) {
            return null;
        }
        $disk = config('filesystems.default', 'public');
        return \Illuminate\Support\Facades\Storage::disk($disk)->url($this->photo_path);
    }

    public function getWorkDurationAttribute()
    {
        if (!$this->join_date) {
            return '0 Tahun 0 Bulan';
        }

        $now = \Carbon\Carbon::now();
        $joinDate = \Carbon\Carbon::parse($this->join_date);
        
        $totalMonths = (int) $joinDate->diffInMonths($now);
        $years = floor($totalMonths / 12);
        $months = $totalMonths % 12;

        return "{$years} Tahun {$months} Bulan";
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Many-to-many relationship with positions (rangkap jabatan).
     */
    public function positions()
    {
        return $this->belongsToMany(Position::class, 'employee_position')
                    ->withPivot('is_primary')
                    ->withTimestamps();
    }

    /**
     * Get the primary position for this employee.
     */
    public function primaryPosition()
    {
        return $this->positions()->wherePivot('is_primary', true)->first();
    }

    /**
     * Backward-compatible: return primary position as "position" attribute.
     * This is used by existing code that references $employee->position.
     */
    public function getPositionAttribute()
    {
        return $this->primaryPosition();
    }

    /**
     * Check if this employee has teaching schedules on a given day.
     */
    public function hasTeachingScheduleToday()
    {
        $todayDow = \Carbon\Carbon::now()->dayOfWeekIso;
        return $this->teachingSchedules()->where('day_of_week', $todayDow)->exists();
    }

    public function attendances()
    {
        return $this->hasMany(Attendance::class);
    }

    public function leaveRequests()
    {
        return $this->hasMany(LeaveRequest::class);
    }

    public function salarySettings()
    {
        return $this->hasMany(SalarySetting::class);
    }

    public function payrolls()
    {
        return $this->hasMany(Payroll::class);
    }

    public function teachingSchedules()
    {
        return $this->hasMany(TeachingSchedule::class);
    }
}
