<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('work_order_documents', function (Blueprint $table) {
            $table->id('document_id');
            $table->foreignId('work_order_id')
                ->constrained('work_orders', 'work_order_id')
                ->onDelete('cascade');

            $table->foreignId('uploaded_by_user_id')->constrained('users')->onDelete('restrict');
            $table->string('file_name', 255);
            $table->string('file_path', 500);
            $table->string('file_type', 50)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('work_order_documents');
    }
};