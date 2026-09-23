<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ExamSupervisionSchedule extends Model
{
    use HasFactory;

    protected $fillable = [
        'employee_id',
        'school_class_id',
        'day_of_week',
        'session_number',
        'subject',
        'room_name',
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
     * Session labels & time slots for Exam Supervision.
     */
    public static function sessionSlots(): array
    {
        return [
            1 => ['name' => 'Sesi 1', 'start' => '07:30', 'end' => '08:30'],
            2 => ['name' => 'Sesi 2', 'start' => '08:30', 'end' => '09:30'],
            3 => ['name' => 'Sesi 3', 'start' => '10:00', 'end' => '11:00'],
            4 => ['name' => 'Sesi 4', 'start' => '11:00', 'end' => '12:00'],
        ];
    }
}
