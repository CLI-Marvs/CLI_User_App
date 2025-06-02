<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;

class CreateWorkOrderAccountTable extends Migration
{
    public function up()
    {
        Schema::create('work_order_account', function (Blueprint $table) {
            $table->id();
            $table->foreignId('work_order_id')->constrained('work_orders', 'work_order_id')->onDelete('cascade');
            $table->foreignId('account_id')->constrained('taken_out_accounts')->onDelete('cascade');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('work_order_account');
    }
}