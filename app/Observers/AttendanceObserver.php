<?php

namespace App\Observers;

use App\Models\Attendance;
use App\Jobs\SyncAttendanceToClickHouse;

class AttendanceObserver
{
    /**
     * Handle the Attendance "saved" event.
     */
    public function saved(Attendance $attendance): void
    {
        SyncAttendanceToClickHouse::dispatch('attendance', $attendance->id);
    }

    /**
     * Handle the Attendance "deleted" event.
     */
    public function deleted(Attendance $attendance): void
    {
        SyncAttendanceToClickHouse::dispatch('attendance', $attendance->id, true);
    }
}
