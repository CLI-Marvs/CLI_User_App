<?php

use App\Http\Middleware\HstsMiddleware;
use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Support\Facades\DB;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        api: __DIR__ . '/../routes/api.php',
        commands: __DIR__ . '/../routes/console.php',
        channels: __DIR__ . '/../routes/channels.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->append(HstsMiddleware::class);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })
    /* ->withSchedule(function (Schedule $schedule) {
        $schedule->call(function () {
            info('Hello world!');
            DB::table('transaction')
                ->join('bank_statements', function ($join) {
                    $join->on('transaction.reference_number', '=', 'bank_statements.reference_number')
                        ->whereColumn('transaction.amount', '=', 'bank_statements.running_balance')
                        ->where('bank_statements.status_of_posting', 'Pending')
                        ->where('transaction.status', 'Pending');
                })
                ->update(['transaction.status' => 'Cleared']);

            DB::table('bank_statements')
                ->join('transaction', 'bank_statements.reference_number', '=', 'transaction.reference_number')
                ->where('bank_statements.status_of_posting', 'Pending')
                ->where('transaction.status' ,'Cleared')
                ->update(['bank_statements.status_of_posting' => 'Cleared']);
        })->everyMinute();
    }) */->create();
