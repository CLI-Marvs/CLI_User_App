<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('work_order_updates', function (Blueprint $table) {
            $table->id('update_id');
            $table->foreignId('work_order_id')
                ->constrained('work_orders', 'work_order_id')
                ->onDelete('cascade');

            $table->foreignId('updated_by_user_id')->constrained('users')->onDelete('restrict');
            $table->text('update_note');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('work_order_updates');
    }
};