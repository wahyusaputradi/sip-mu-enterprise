<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LeaveRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'employee_id',
        'start_date',
        'end_date',
        'type',
        'reason',
        'attachment_path',
        'attachment_name',
        'status',
        'approved_by',
    ];

    protected $appends = ['attachment_url'];

    public function getAttachmentUrlAttribute()
    {
        if (!$this->attachment_path) {
            return null;
        }
        $disk = config('filesystems.default', 'public');
        return \Illuminate\Support\Facades\Storage::disk($disk)->url($this->attachment_path);
    }

    /**
     * Type labels for display purposes.
     */
    public const TYPE_LABELS = [
        'cuti' => 'Cuti',
        'izin_pribadi' => 'Izin Pribadi',
        'izin_dinas_luar' => 'Izin Dinas Luar',
        'izin_pulang_cepat' => 'Izin Pulang Cepat',
        'sakit' => 'Sakit',
    ];

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }

    public function approver()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    /**
     * Get the human-readable type label.
     */
    public function getTypeLabelAttribute(): string
    {
        return self::TYPE_LABELS[$this->type] ?? ucfirst($this->type);
    }
}
