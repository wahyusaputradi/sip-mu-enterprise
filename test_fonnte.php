<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$fonnteToken = 'V3XmmiSYkD4raZzktz9LR3hgDjVm3XUiP2AhGYrZreL';

// Cek device
$response = \Illuminate\Support\Facades\Http::withHeaders([
    'Authorization' => $fonnteToken,
])->post('https://api.fonnte.com/device');

var_dump("DEVICE STATUS:");
var_dump($response->status());
var_dump($response->body());

// Cek send message
$response2 = \Illuminate\Support\Facades\Http::withHeaders([
    'Authorization' => $fonnteToken,
])->post('https://api.fonnte.com/send', [
    'target' => '08123456789',
    'message' => 'test message sip-mu'
]);

var_dump("SEND MESSAGE STATUS:");
var_dump($response2->status());
var_dump($response2->body());
