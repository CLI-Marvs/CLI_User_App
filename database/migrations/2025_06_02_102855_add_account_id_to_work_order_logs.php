<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddAccountIdToWorkOrderLogs extends Migration
{
    public function up(): void
    {
        Schema::table('work_order_logs', function (Blueprint $table) {
            $table->unsignedBigInteger('account_id')->nullable()->after('work_order_id');

            $table->foreign('account_id')
                  ->references('id')
                  ->on('taken_out_accounts')
                  ->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::table('work_order_logs', function (Blueprint $table) {
            $table->dropForeign(['account_id']);
            $table->dropColumn('account_id');
        });
    }
}
