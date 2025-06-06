<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('work_order_documents', function (Blueprint $table) {
            $table->string('file_type', 255)->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('work_order_documents', function (Blueprint $table) {
            $table->string('file_type', 50)->nullable()->change();
        });
    }
};
