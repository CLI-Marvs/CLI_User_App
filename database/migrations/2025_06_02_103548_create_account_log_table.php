<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateAccountLogTable extends Migration
{
    public function up(): void
    {
        Schema::create('account_log', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('work_order_log_id');
            $table->unsignedBigInteger('account_id');
            $table->timestamps();

            $table->foreign('work_order_log_id')
                  ->references('id')
                  ->on('work_order_logs')
                  ->onDelete('cascade');

            $table->foreign('account_id')
                  ->references('id')
                  ->on('taken_out_accounts')
                  ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('account_log');
    }
}
