<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StudentAttendance extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'date',
        'check_in_time',
        'check_out_time',
        'check_in_status',
        'check_out_status',
        'scanned_by_user_id',
        'is_unlocked',
        'unlocked_by_user_id',
        'unlocked_reason',
        'notes',
    ];

    protected $casts = [
        'date' => 'date',
        'is_unlocked' => 'boolean',
    ];

    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    public function scannedBy()
    {
        return $this->belongsTo(User::class, 'scanned_by_user_id');
    }
}
