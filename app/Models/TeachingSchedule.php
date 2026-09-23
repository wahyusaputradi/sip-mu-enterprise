<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TeachingSchedule extends Model
{
    use HasFactory;

    protected $fillable = [
        'employee_id',
        'school_class_id',
        'day_of_week',
        'hour_number',
        'subject',
    ];

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }

    public function schoolClass()
    {
        return $this->belongsTo(SchoolClass::class);
    }

    /**
     * Day labels in Indonesian.
     */
    public static function dayLabels(): array
    {
        return [
            1 => 'Senin',
            2 => 'Selasa',
            3 => 'Rabu',
            4 => 'Kamis',
            5 => 'Jumat',
        ];
    }

    /**
     * Regular hour time slots based on SMK Manbaul Ulum schedule.
     */
    public static function regularHourSlots(): array
    {
        return [
            1  => ['start' => '07:00', 'end' => '07:40'],
            2  => ['start' => '07:40', 'end' => '08:20'],
            3  => ['start' => '08:20', 'end' => '09:00'],
            4  => ['start' => '09:00', 'end' => '09:40'],
            5  => ['start' => '10:10', 'end' => '10:50'],
            6  => ['start' => '10:50', 'end' => '11:30'],
            7  => ['start' => '11:30', 'end' => '12:10'],
            8  => ['start' => '12:40', 'end' => '13:20'],
            9  => ['start' => '13:20', 'end' => '14:00'],
            10 => ['start' => '14:00', 'end' => '14:40'],
        ];
    }

    /**
     * Exam hour time slots (UTS / UAS).
     */
    public static function examHourSlots(): array
    {
        return [
            1 => ['start' => '07:30', 'end' => '08:30'],
            2 => ['start' => '08:30', 'end' => '09:30'],
            3 => ['start' => '10:00', 'end' => '11:00'],
            4 => ['start' => '11:00', 'end' => '12:00'],
        ];
    }

    /**
     * Check if exam mode is active for a given date.
     */
    public static function isExamMode(?string $date = null): bool
    {
        $dateStr = $date ?: \Carbon\Carbon::today()->format('Y-m-d');
        
        // 1. Check if date is listed in exam_days table
        $isExamDay = ExamDay::whereDate('date', $dateStr)->exists();
        if ($isExamDay) {
            return true;
        }

        // 2. Fallback check for global setting toggle
        $examEnabled = SystemSetting::where('key', 'exam_mode_enabled')->value('value');
        if ($examEnabled === '1' || $examEnabled === 1 || $examEnabled === 'true' || $examEnabled === true) {
            $startDate = SystemSetting::where('key', 'exam_mode_start_date')->value('value');
            $endDate = SystemSetting::where('key', 'exam_mode_end_date')->value('value');

            if ($startDate && $endDate) {
                return $dateStr >= $startDate && $dateStr <= $endDate;
            }
            return true;
        }

        return false;
    }

    /**
     * Get exam day details for a given date if active.
     */
    public static function getExamDayInfo(?string $date = null): ?array
    {
        $dateStr = $date ?: \Carbon\Carbon::today()->format('Y-m-d');
        $examDay = ExamDay::whereDate('date', $dateStr)->first();

        if ($examDay) {
            return [
                'name' => $examDay->name,
                'type' => strtoupper($examDay->type),
                'jam_keluar' => $examDay->jam_keluar,
                'date' => $examDay->date ? $examDay->date->format('Y-m-d') : $dateStr,
            ];
        }

        if (self::isExamMode($dateStr)) {
            $settings = SystemSetting::pluck('value', 'key');
            return [
                'name' => 'Ujian Tengah/Akhir Semester',
                'type' => 'UTS/UAS',
                'jam_keluar' => $settings['exam_mode_jam_pulang'] ?? '12:00',
                'date' => $dateStr,
            ];
        }

        return null;
    }

    /**
     * Get hour time slots dynamically based on exam mode.
     */
    public static function hourSlots(?string $date = null): array
    {
        return self::regularHourSlots();
    }
}
