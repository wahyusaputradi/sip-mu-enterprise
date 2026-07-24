<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Employee;
use App\Models\Attendance;
use App\Jobs\SyncAttendanceToClickHouse;
use App\Services\ClickHouseService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Queue;
use Tests\TestCase;

class ClickHouseIntegrationTest extends TestCase
{
    use RefreshDatabase;

    protected function createEmployee(): Employee
    {
        $user = User::factory()->create();
        return Employee::create([
            'user_id' => $user->id,
            'nik' => '12345678',
            'name' => 'John Doe ClickHouse',
            'gender' => 'Laki-laki',
            'status' => 'active',
        ]);
    }

    public function test_saving_attendance_dispatches_sync_job()
    {
        Queue::fake();

        $employee = $this->createEmployee();

        Attendance::create([
            'employee_id' => $employee->id,
            'type' => 'masuk',
            'date' => '2026-07-15',
            'time' => '07:00:00',
            'status' => 'present',
            'latitude' => -6.2,
            'longitude' => 106.8,
            'distance_meters' => 10.5,
            'is_dinas_luar' => false,
        ]);

        Queue::assertPushed(SyncAttendanceToClickHouse::class);
    }

    public function test_clickhouse_service_insert_sends_http_post()
    {
        Http::fake([
            'http://127.0.0.1:8123*' => Http::response('Ok', 200),
        ]);

        $service = new ClickHouseService();
        $service->insert('attendances', [
            ['id' => 1, 'employee_id' => 10, 'date' => '2026-07-15']
        ]);

        Http::assertSent(function ($request) {
            return str_contains($request->url(), 'http://127.0.0.1:8123')
                && str_contains($request->body(), '"employee_id":10');
        });
    }

    public function test_clickhouse_service_select_returns_parsed_data()
    {
        Http::fake([
            'http://127.0.0.1:8123*' => Http::response(json_encode([
                'data' => [
                    ['employee_id' => 10, 'total' => 5]
                ]
            ]), 200),
        ]);

        $service = new ClickHouseService();
        $results = $service->select("SELECT employee_id, count() as total FROM attendances GROUP BY employee_id");

        $this->assertCount(1, $results);
        $this->assertEquals(10, $results[0]['employee_id']);
        $this->assertEquals(5, $results[0]['total']);
    }
}
