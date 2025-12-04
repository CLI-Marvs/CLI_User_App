<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('submilestones', function (Blueprint $table) {
            $table->id();
            $table->foreignId('work_order_type_id')
                  ->constrained('work_order_types')
                  ->onDelete('cascade');
            $table->string('name', 200);
            $table->text('description')->nullable();
            $table->timestamps(); // created_at, updated_at
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('submilestones');
    }
};
