<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddIsNewFlagToWorkOrderLogs extends Migration
{
    public function up(): void
    {
        Schema::table('work_order_logs', function (Blueprint $table) {
            $table->boolean('is_new')->default(true)->after('lot_title');
        });
    }

    public function down(): void
    {
        Schema::table('work_order_logs', function (Blueprint $table) {
            $table->dropColumn('is_new');
        });
    }
}
