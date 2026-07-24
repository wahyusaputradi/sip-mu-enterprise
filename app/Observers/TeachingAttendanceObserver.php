<?php

namespace App\Observers;

use App\Models\TeachingAttendance;
use App\Jobs\SyncAttendanceToClickHouse;

class TeachingAttendanceObserver
{
    /**
     * Handle the TeachingAttendance "saved" event.
     */
    public function saved(TeachingAttendance $teachingAttendance): void
    {
        SyncAttendanceToClickHouse::dispatch('teaching_attendance', $teachingAttendance->id);
    }

    /**
     * Handle the TeachingAttendance "deleted" event.
     */
    public function deleted(TeachingAttendance $teachingAttendance): void
    {
        SyncAttendanceToClickHouse::dispatch('teaching_attendance', $teachingAttendance->id, true);
    }
}
