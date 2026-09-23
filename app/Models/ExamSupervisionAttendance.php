<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ExamSupervisionAttendance extends Model
{
    use HasFactory;

    protected $fillable = [
        'exam_supervision_schedule_id',
        'employee_id',
        'date',
        'status',
        'photo_path',
        'latitude',
        'longitude',
    ];

    public function examSupervisionSchedule()
    {
        return $this->belongsTo(ExamSupervisionSchedule::class);
    }

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }
}
