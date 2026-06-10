<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SchoolClass extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'level', 'major', 'order', 'homeroom_teacher_id'];

    public function teachingSchedules()
    {
        return $this->hasMany(TeachingSchedule::class);
    }

    public function homeroomTeacher()
    {
        return $this->belongsTo(Employee::class, 'homeroom_teacher_id');
    }
}
