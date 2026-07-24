<?php
/**
 * SIP-MU Enterprise - Automatic Production Cache Clear & Maintenance Helper
 */
$key = $_GET['key'] ?? '';
if ($key !== 'sipmu2026') {
    http_response_code(403);
    echo "<h3>403 Unauthorized Access</h3>";
    exit;
}

header('Content-Type: text/html; charset=utf-8');
echo "<style>body{font-family:sans-serif;padding:2rem;background:#0f172a;color:#f8fafc;} .success{color:#34d399;} .info{color:#38bdf8;}</style>";
echo "<h2>🚀 SIP-MU Enterprise Automatic Maintenance & Cache Clear</h2>";

// 1. Delete cached files in bootstrap/cache
$cacheFiles = [
    __DIR__ . '/../bootstrap/cache/config.php',
    __DIR__ . '/../bootstrap/cache/routes-v7.php',
    __DIR__ . '/../bootstrap/cache/services.php',
    __DIR__ . '/../bootstrap/cache/packages.php',
];

echo "<h3 class='info'>1. Cleaning Bootstrap Cache Files...</h3>";
foreach ($cacheFiles as $file) {
    if (file_exists($file)) {
        if (@unlink($file)) {
            echo "<p class='success'>✓ Deleted: " . htmlspecialchars(basename($file)) . "</p>";
        } else {
            echo "<p style='color:#f87171;'>✗ Failed to delete: " . htmlspecialchars(basename($file)) . "</p>";
        }
    } else {
        echo "<p style='color:#94a3b8;'>- File not present: " . htmlspecialchars(basename($file)) . "</p>";
    }
}

// 2. Execute Artisan Commands
echo "<h3 class='info'>2. Executing Artisan Commands...</h3>";
try {
    require __DIR__ . '/../vendor/autoload.php';
    $app = require_once __DIR__ . '/../bootstrap/app.php';
    $kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);

    // Optimize clear
    $kernel->call('optimize:clear');
    echo "<p class='success'>✓ <strong>optimize:clear:</strong><br><pre>" . htmlspecialchars($kernel->output()) . "</pre></p>";

    // Migration
    $kernel->call('migrate', ['--force' => true]);
    echo "<p class='success'>✓ <strong>migrate --force:</strong><br><pre>" . htmlspecialchars($kernel->output()) . "</pre></p>";

} catch (\Throwable $e) {
    echo "<p style='color:#f87171;'><strong>Notice/Exception:</strong> " . htmlspecialchars($e->getMessage()) . "</p>";
}

echo "<hr><h3 class='success'>✅ Automatic Fix Completed!</h3>";
echo "<p><a href='/' style='color:#38bdf8;font-weight:bold;'>Click here to return to SIP-MU Enterprise Portal</a></p>";
