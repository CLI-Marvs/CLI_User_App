<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('work_order_logs', function (Blueprint $table) {
            $table->bigInteger('assigned_user_id')->nullable()->after('created_by_user_id');

            $table->timestamp('updated_at', 0)->nullable()->useCurrent()->after('created_at');

            $table->foreign('assigned_user_id')
                ->references('id')
                ->on('employee')
                ->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('work_order_logs', function (Blueprint $table) {

            $table->dropForeign(['assigned_user_id']);

            $table->dropColumn('assigned_user_id');
            $table->dropColumn('updated_at');
        });
    }
};