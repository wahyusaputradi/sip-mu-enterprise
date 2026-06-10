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

echo 'Allowance: ' . $p->allowance_other . "\n";
echo 'Deduction: ' . $p->deduction_other . "\n";
echo 'Net Salary: ' . $p->net_salary . "\n";
