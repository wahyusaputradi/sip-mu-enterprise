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
     * Hour time slots based on SMK Manbaul Ulum schedule.
     */
    public static function hourSlots(): array
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
}
