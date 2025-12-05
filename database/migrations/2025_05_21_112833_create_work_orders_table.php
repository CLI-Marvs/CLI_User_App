<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('work_orders', function (Blueprint $table) {
            $table->id('work_order_id'); 
            $table->string('work_order_number', 50)->unique();

            $table->foreignId('account_id')->constrained('taken_out_accounts')->onDelete('restrict');
            $table->foreignId('assigned_to_user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('work_order_type_id')->constrained('work_order_types')->onDelete('restrict'); // New FK

            $table->date('work_order_deadline')->nullable();
            $table->string('status', 50)->default('Pending');
            $table->text('description')->nullable();
            $table->string('priority', 20)->nullable()->default('Medium'); 
            $table->timestamp('completed_at')->nullable();
            $table->text('completion_notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('work_orders');
    }
};