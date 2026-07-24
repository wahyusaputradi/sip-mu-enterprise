<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\Schema;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DatabaseCacheOptimizationTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test that performance indexes exist on attendances table.
     */
    public function test_attendances_table_has_composite_indexes()
    {
        $this->assertTrue(Schema::hasTable('attendances'));

        $indexes = Schema::getIndexes('attendances');
        $indexNames = collect($indexes)->pluck('name')->toArray();

        $this->assertContains('attendances_employee_date_status_index', $indexNames);
        $this->assertContains('attendances_date_index', $indexNames);
    }

    /**
     * Test that performance indexes exist on teaching_attendances table.
     */
    public function test_teaching_attendances_table_has_composite_indexes()
    {
        $this->assertTrue(Schema::hasTable('teaching_attendances'));

        $indexes = Schema::getIndexes('teaching_attendances');
        $indexNames = collect($indexes)->pluck('name')->toArray();

        $this->assertContains('teaching_attendances_employee_date_status_index', $indexNames);
        $this->assertContains('teaching_attendances_date_index', $indexNames);
    }

    /**
     * Test that cache and session configurations match expected high-performance settings in .env.
     */
    public function test_redis_caching_and_session_configs_in_env()
    {
        $envContent = file_get_contents(base_path('.env'));
        
        $this->assertStringContainsString('CACHE_STORE=redis', $envContent);
        $this->assertStringContainsString('SESSION_DRIVER=redis', $envContent);
    }
}
