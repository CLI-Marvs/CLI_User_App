<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class RenameWorkOrderTableAndFieldToWorkOrders extends Migration

{
    public function up()
    {
        Schema::rename('work_order', 'work_orders');

        Schema::table('work_orders', function (Blueprint $table) {
            $table->renameColumn('work_order_number', 'work_order');
        });
    }

    public function down()
    {
        Schema::table('work_orders', function (Blueprint $table) {
            $table->renameColumn('work_order', 'work_order_number');
        });

        Schema::rename('work_orders', 'work_order');
    }
}
