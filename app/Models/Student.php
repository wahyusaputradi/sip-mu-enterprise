<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Student extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'nis',
        'nisn',
        'name',
        'gender',
        'school_class_id',
        'parent_name',
        'parent_phone',
        'qr_token',
        'status',
        'photo',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public static function generateQrToken($nis)
    {
        $hash = substr(hash_hmac('sha256', $nis, config('app.key')), 0, 16);
        return 'SIPMU-STD-' . strtoupper($nis) . '-' . strtoupper($hash);
    }

    public function schoolClass()
    {
        return $this->belongsTo(SchoolClass::class);
    }

    public function attendances()
    {
        return $this->hasMany(StudentAttendance::class);
    }

    public function todayAttendance()
    {
        return $this->hasOne(StudentAttendance::class)->whereDate('date', now());
    }
}
