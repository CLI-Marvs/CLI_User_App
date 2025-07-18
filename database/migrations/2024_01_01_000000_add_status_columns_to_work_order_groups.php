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
        Schema::table('work_order_groups', function (Blueprint $table) {
            $table->string('status', 50)->default('Pending')->after('updated_at');
            $table->timestamp('completed_at')->nullable()->after('status');
            $table->timestamp('started_at')->nullable()->after('completed_at');
            $table->date('due_date')->nullable()->after('started_at');
            
            // Add indexes for better performance
            $table->index('status');
            $table->index('due_date');
        });
    }    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('work_order_groups', function (Blueprint $table) {
            $table->dropIndex(['status']);
            $table->dropIndex(['due_date']);
            $table->dropColumn(['status', 'completed_at', 'started_at', 'due_date']);
        });
    }
};
