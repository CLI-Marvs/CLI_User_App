<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddForeignKeyToWorkOrderAccountTable extends Migration
{
    public function up()
    {
        if (!Schema::hasColumn('work_order_account', 'work_order_id')) {
            Schema::table('work_order_account', function (Blueprint $table) {
                $table->foreign('work_order_id')->references('work_order_id')->on('work_orders');
            });
        }
    }

    public function down()
    {
        Schema::table('work_order_account', function (Blueprint $table) {
            $table->dropForeign('work_order_account_work_order_id_foreign');
        });
    }
}