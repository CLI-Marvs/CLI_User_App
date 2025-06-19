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
        Schema::table('taken_out_accounts', function (Blueprint $table) {
            $table->boolean('checklist_status')->default(false)->after('added_status');
        });
    }

    public function down(): void
    {
        Schema::table('taken_out_accounts', function (Blueprint $table) {
            $table->dropColumn('checklist_status');
        });
    }
};

