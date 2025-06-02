<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddLogIdToWorkOrderDocuments extends Migration
{
    public function up(): void
    {
        Schema::table('work_order_documents', function (Blueprint $table) {
            $table->unsignedBigInteger('log_id')->nullable()->after('work_order_id');

            $table->foreign('log_id')
                  ->references('id')
                  ->on('work_order_logs')
                  ->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::table('work_order_documents', function (Blueprint $table) {
            $table->dropForeign(['log_id']);
            $table->dropColumn('log_id');
        });
    }
}
