<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use App\Services\ClickHouseService;
use App\Models\Attendance;
use App\Models\TeachingAttendance;
use Illuminate\Support\Facades\Log;
use Exception;

class SyncAttendanceToClickHouse implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Number of times the job may be attempted.
     */
    public int $tries = 3;

    /**
     * The number of seconds to wait before retrying the job.
     */
    public int $backoff = 15;

    protected string $type;
    protected int $id;
    protected bool $isDelete;

    /**
     * Create a new job instance.
     */
    public function __construct(string $type, int $id, bool $isDelete = false)
    {
        $this->type = $type;
        $this->id = $id;
        $this->isDelete = $isDelete;
    }

    /**
     * Execute the job.
     */
    public function handle(ClickHouseService $clickHouseService): void
    {
        if (app()->environment('testing')) {
            return;
        }

        $table = $this->type === 'attendance' ? 'attendances' : 'teaching_attendances';

        if ($this->isDelete) {
            try {
                $clickHouseService->execute("ALTER TABLE {$table} DELETE WHERE id = {$this->id}");
                Log::info("Deleted record from ClickHouse table: {$table}", ['id' => $this->id]);
            } catch (Exception $e) {
                Log::error("Failed to delete record from ClickHouse: " . $e->getMessage());
                throw $e;
            }
            return;
        }

        // Find the model
        $model = $this->type === 'attendance' 
            ? Attendance::find($this->id) 
            : TeachingAttendance::find($this->id);

        if (!$model) {
            Log::warning("Model not found in MySQL during ClickHouse sync, ignoring", [
                'type' => $this->type,
                'id' => $this->id
            ]);
            return;
        }

        // Construct ClickHouse payload
        $data = [
            'id' => (int) $model->id,
            'employee_id' => (int) $model->employee_id,
            'date' => $model->date,
            'time' => $model->time,
            'status' => $model->status,
            'latitude' => $model->latitude !== null ? (float) $model->latitude : null,
            'longitude' => $model->longitude !== null ? (float) $model->longitude : null,
            'distance_meters' => $model->distance_meters !== null ? (float) $model->distance_meters : null,
            'photo_path' => $model->photo_path !== null ? (string) $model->photo_path : null,
            'is_dinas_luar' => $model->is_dinas_luar ? 1 : 0,
            'created_at' => $model->created_at ? $model->created_at->format('Y-m-d H:i:s') : date('Y-m-d H:i:s'),
            'updated_at' => $model->updated_at ? $model->updated_at->format('Y-m-d H:i:s') : date('Y-m-d H:i:s'),
        ];

        // Specific fields based on type
        if ($this->type === 'attendance') {
            $data['type'] = (string) $model->type;
            $data['device_info'] = $model->device_info !== null ? (string) $model->device_info : null;
        } else {
            $data['subject_name'] = $model->subject_name !== null ? (string) $model->subject_name : null;
        }

        try {
            $clickHouseService->insert($table, [$data]);
            Log::info("Synced record to ClickHouse table: {$table}", ['id' => $this->id]);
        } catch (Exception $e) {
            Log::error("Failed to sync record to ClickHouse: " . $e->getMessage(), ['id' => $this->id]);
            throw $e;
        }
    }
}
