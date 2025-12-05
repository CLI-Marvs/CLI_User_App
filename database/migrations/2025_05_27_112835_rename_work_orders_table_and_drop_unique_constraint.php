<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;

class RenameWorkOrdersTableAndDropUniqueConstraint extends Migration
{
    public function up()
    {
        Schema::table('work_orders', function (Blueprint $table) {
            $table->dropUnique('work_orders_work_order_number_unique');
        });

        Schema::rename('work_orders', 'work_order');
    }

    public function down()
    {
        Schema::rename('work_order', 'work_orders');

        Schema::table('work_orders', function (Blueprint $table) {
            $table->unique('work_order_number');
        });
    }
}