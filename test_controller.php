<?php
require 'vendor/autoload.php';

use Illuminate\Foundation\Application;
use Illuminate\Http\Request;

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

try {
    // Test the controller
    $controller = new App\Http\Controllers\AllAccountsController();
    $response = $controller->getAllAccountsWithDetails();

    echo "Status: " . $response->getStatusCode() . "\n";
    echo "Response: " . substr($response->getContent(), 0, 200) . "...\n";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo "Trace: " . $e->getTraceAsString() . "\n";
}