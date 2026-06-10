<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Attendance extends Model
{
    use HasFactory;

    protected $fillable = [
        'employee_id',
        'date',
        'check_in',
        'check_out',
        'latitude',
        'longitude',
        'campus_location_id',
        'photo_check_in',
        'photo_check_out',
        'teaching_hours',
        'inval_hours',
        'status',
    ];

    protected $appends = ['photo_check_in_url', 'photo_check_out_url'];

    public function getPhotoCheckInUrlAttribute()
    {
        if (!$this->photo_check_in) {
            return null;
        }
        $disk = config('filesystems.default', 'public');
        return \Illuminate\Support\Facades\Storage::disk($disk)->url($this->photo_check_in);
    }

    public function getPhotoCheckOutUrlAttribute()
    {
        if (!$this->photo_check_out) {
            return null;
        }
        $disk = config('filesystems.default', 'public');
        return \Illuminate\Support\Facades\Storage::disk($disk)->url($this->photo_check_out);
    }

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }

    public function campusLocation()
    {
        return $this->belongsTo(CampusLocation::class);
    }
}
