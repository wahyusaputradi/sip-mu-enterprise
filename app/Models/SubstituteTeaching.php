<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SubstituteTeaching extends Model
{
    use HasFactory;

    protected $fillable = [
        'date',
        'absent_employee_id',
        'substitute_employee_id',
        'teaching_schedule_id',
        'reason',
        'status',
        'approved_by',
    ];

    public function absentEmployee()
    {
        return $this->belongsTo(Employee::class, 'absent_employee_id');
    }

    public function substituteEmployee()
    {
        return $this->belongsTo(Employee::class, 'substitute_employee_id');
    }

    public function teachingSchedule()
    {
        return $this->belongsTo(TeachingSchedule::class);
    }

    public function approver()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }
}
