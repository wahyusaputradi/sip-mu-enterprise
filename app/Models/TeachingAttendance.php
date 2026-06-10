<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TeachingAttendance extends Model
{
    use HasFactory;

    protected $fillable = [
        'employee_id',
        'teaching_schedule_id',
        'date',
        'time',
        'photo',
        'latitude',
        'longitude',
        'campus_location_id',
        'status',
    ];

    protected $appends = ['photo_url'];

    public function getPhotoUrlAttribute()
    {
        if (!$this->photo) {
            return null;
        }
        $disk = config('filesystems.default', 'public');
        return \Illuminate\Support\Facades\Storage::disk($disk)->url($this->photo);
    }

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }

    public function teachingSchedule()
    {
        return $this->belongsTo(TeachingSchedule::class);
    }

    public function campusLocation()
    {
        return $this->belongsTo(CampusLocation::class);
    }
}
