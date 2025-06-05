<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('work_order_documents', function (Blueprint $table) {
            $table->dropForeign('work_order_documents_uploaded_by_user_id_foreign');

            $table->foreign('uploaded_by_user_id')
                  ->references('id')
                  ->on('employee') 
                  ->onDelete('restrict') 
                  ->onUpdate('cascade'); 
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('work_order_documents', function (Blueprint $table) {
            $table->dropForeign(['uploaded_by_user_id']);

            $table->foreign('uploaded_by_user_id', 'work_order_documents_uploaded_by_user_id_foreign') 
                  ->references('id')
                  ->on('users') 
                  ->onDelete('restrict')
                  ->onUpdate('cascade');
        });
    }
};
