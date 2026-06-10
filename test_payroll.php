<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$p = App\Models\Payroll::first();
if(!$p) {
    echo "No payroll found\n";
    exit;
}

$c = app(App\Http\Controllers\PayrollController::class);
$req = new Illuminate\Http\Request();
$req->merge(['allowance_other' => 500, 'deduction_other' => 0, 'notes' => 'Test']);

try {
    $c->update($req, $p);
    echo "Success!\n";
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n" . $e->getTraceAsString();
}
