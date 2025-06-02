<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up(): void
    {
        Schema::table('work_orders', function (Blueprint $table) {

            $table->dropForeign(['assigned_to_user_id']);
            $table->foreign('assigned_to_user_id')
                  ->references('id')->on('employee')
                  ->onUpdate('NO ACTION')
                  ->onDelete('SET NULL');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down(): void
    {
        Schema::table('work_orders', function (Blueprint $table) {

            $table->dropForeign(['assigned_to_user_id']);

            $table->foreign('assigned_to_user_id')
                  ->references('id')->on('users') 
                  ->onUpdate('NO ACTION')
                  ->onDelete('SET NULL');
        });
    }
};