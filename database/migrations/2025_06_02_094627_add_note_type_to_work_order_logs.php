<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddNoteTypeToWorkOrderLogs extends Migration
{
    public function up(): void
    {
        Schema::table('work_order_logs', function (Blueprint $table) {
            $table->string('note_type', 50)->nullable()->after('log_message');
            
            $table->string('log_message', 500)->change();
        });
    }

    public function down(): void
    {
        Schema::table('work_order_logs', function (Blueprint $table) {
            $table->dropColumn('note_type');
            
            $table->text('log_message')->change();
        });
    }
}
