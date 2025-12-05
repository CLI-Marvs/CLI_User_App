<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddWorkOrderLogs extends Migration
{
    public function up()
    {
        Schema::create('work_order_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('work_order_id')->constrained('work_orders', 'work_order_id')->onDelete('cascade');
            $table->string('log_type', 50);
            $table->text('log_message');
            $table->timestamp('created_at')->useCurrent();
            $table->foreignId('created_by_user_id')->constrained('employee', 'id')->onDelete('cascade');

        });
    }

    public function down()
    {
        Schema::dropIfExists('work_order_logs');
    }
}