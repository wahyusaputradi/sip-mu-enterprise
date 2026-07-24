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
        'is_certified',
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
        'is_certified' => 'boolean',
    ];

    protected $appends = ['work_duration', 'photo_url'];

    public function getPhotoUrlAttribute()
    {
        if (!$this->photo_path) {
            return null;
        }
        return route('media.stream', ['path' => $this->photo_path]);
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



    public function teachingSchedules()
    {
        return $this->hasMany(TeachingSchedule::class);
    }

    /**
     * Cascading delete for employee, purging storage files and all related database records.
     */
    public function purgeWithRelations()
    {
        $disk = config('filesystems.default', 'public');

        // 1. Delete physical profile photo
        if ($this->photo_path && \Illuminate\Support\Facades\Storage::disk($disk)->exists($this->photo_path)) {
            \Illuminate\Support\Facades\Storage::disk($disk)->delete($this->photo_path);
        }

        // 2. Delete physical daily attendance photos
        $attendances = Attendance::where('employee_id', $this->id)->get();
        foreach ($attendances as $att) {
            if ($att->photo_check_in && \Illuminate\Support\Facades\Storage::disk($disk)->exists($att->photo_check_in)) {
                \Illuminate\Support\Facades\Storage::disk($disk)->delete($att->photo_check_in);
            }
            if ($att->photo_check_out && \Illuminate\Support\Facades\Storage::disk($disk)->exists($att->photo_check_out)) {
                \Illuminate\Support\Facades\Storage::disk($disk)->delete($att->photo_check_out);
            }
        }

        // 3. Delete physical teaching attendance photos
        $teachingAtts = TeachingAttendance::where('employee_id', $this->id)->get();
        foreach ($teachingAtts as $tAtt) {
            if ($tAtt->photo && \Illuminate\Support\Facades\Storage::disk($disk)->exists($tAtt->photo)) {
                \Illuminate\Support\Facades\Storage::disk($disk)->delete($tAtt->photo);
            }
        }

        // 4. Delete database records in relational tables
        Attendance::where('employee_id', $this->id)->delete();
        TeachingAttendance::where('employee_id', $this->id)->delete();
        TeachingSchedule::where('employee_id', $this->id)->delete();
        SubstituteTeaching::where('absent_employee_id', $this->id)
            ->orWhere('substitute_employee_id', $this->id)
            ->delete();
        LeaveRequest::where('employee_id', $this->id)->delete();
        AttendanceUnlock::where('employee_id', $this->id)->delete();

        // 5. Detach pivot positions & delete associated user
        $this->positions()->detach();

        if ($this->user) {
            $this->user->delete();
        }

        // 6. Delete employee record
        $this->delete();
    }
}

