<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\ClickHouseService;
use Exception;

class ClickHouseMigrate extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'clickhouse:migrate';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Initialize database and tables in ClickHouse';

    protected ClickHouseService $clickHouseService;

    public function __construct(ClickHouseService $clickHouseService)
    {
        parent::__construct();
        $this->clickHouseService = $clickHouseService;
    }

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $dbName = config('clickhouse.database');
        $this->info("Initializing ClickHouse integration...");

        try {
            // 1. Create database
            $this->info("Creating ClickHouse database: {$dbName}...");
            $this->clickHouseService->execute("CREATE DATABASE IF NOT EXISTS {$dbName}", false);
            $this->info("Database initialized successfully.");

            // 2. Create attendances table
            $this->info("Creating table: attendances...");
            $createAttendancesSql = "
                CREATE TABLE IF NOT EXISTS attendances (
                    id UInt64,
                    employee_id UInt64,
                    type String,
                    date Date,
                    time String,
                    status String,
                    latitude Nullable(Float64),
                    longitude Nullable(Float64),
                    distance_meters Nullable(Float64),
                    photo_path Nullable(String),
                    device_info Nullable(String),
                    is_dinas_luar UInt8,
                    created_at DateTime,
                    updated_at DateTime
                ) ENGINE = ReplacingMergeTree(updated_at)
                ORDER BY (id, employee_id, date)
            ";
            $this->clickHouseService->execute($createAttendancesSql);
            $this->info("Table 'attendances' initialized successfully.");

            // 3. Create teaching_attendances table
            $this->info("Creating table: teaching_attendances...");
            $createTeachingAttendancesSql = "
                CREATE TABLE IF NOT EXISTS teaching_attendances (
                    id UInt64,
                    employee_id UInt64,
                    subject_name Nullable(String),
                    date Date,
                    time String,
                    status String,
                    latitude Nullable(Float64),
                    longitude Nullable(Float64),
                    distance_meters Nullable(Float64),
                    photo_path Nullable(String),
                    is_dinas_luar UInt8,
                    created_at DateTime,
                    updated_at DateTime
                ) ENGINE = ReplacingMergeTree(updated_at)
                ORDER BY (id, employee_id, date)
            ";
            $this->clickHouseService->execute($createTeachingAttendancesSql);
            $this->info("Table 'teaching_attendances' initialized successfully.");

            $this->info("ClickHouse migration completed successfully!");
            return Command::SUCCESS;
        } catch (Exception $e) {
            $this->error("ClickHouse migration failed: " . $e->getMessage());
            return Command::FAILURE;
        }
    }
}
