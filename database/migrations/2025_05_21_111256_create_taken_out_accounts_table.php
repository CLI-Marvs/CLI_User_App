<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('taken_out_accounts', function (Blueprint $table) {
            $table->id();
            $table->text('account_name');
            $table->string('contract_no', 50);
            $table->text('property_name')->nullable();
            $table->string('unit_no', 20)->nullable();
            $table->string('financing', 50)->nullable();
            $table->date('take_out_date')->nullable();
            $table->date('dou_expiry')->nullable();
            $table->timestamps();
            $table->boolean('added_status')->default(false);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('taken_out_accounts');
    }
};