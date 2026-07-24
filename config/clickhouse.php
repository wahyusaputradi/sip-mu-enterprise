<?php

return [
    'host' => env('CLICKHOUSE_HOST', '127.0.0.1'),
    'port' => env('CLICKHOUSE_PORT', '8123'),
    'username' => env('CLICKHOUSE_USERNAME', 'default'),
    'password' => env('CLICKHOUSE_PASSWORD', ''),
    'database' => env('CLICKHOUSE_DATABASE', 'sip_mu_analytics'),
    'timeout' => env('CLICKHOUSE_TIMEOUT', 10),
];
