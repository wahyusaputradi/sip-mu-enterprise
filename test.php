<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$request = Illuminate\Http\Request::create('/salary-settings/cutoff-date', 'PUT', [
    'month' => 5, 
    'year' => 2026, 
    'payroll_cutoff_start_date' => 20, 
    'payroll_cutoff_end_date' => 19
]);
$controller = app()->make(\App\Http\Controllers\SalarySettingController::class);
$response = $controller->updateCutoffDate($request);

print_r(\App\Models\SystemSetting::where('key', 'like', 'payroll%')->get()->toArray());
