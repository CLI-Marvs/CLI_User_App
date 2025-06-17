<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Carbon\Carbon;

class PreSubmissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('pre_submission_online_transaction')->insert([
            [
                'transaction_id' => 1,
                'transaction_type' => 'Reservation Fee',
                'reference_number' => Str::random(10),
                'amount' => 1000.00,
                'id' => 1,
                'email' => 'user1@example.com',
                'remarks' => 'Initial deposit',
                'transaction_date' => Carbon::today(),
                'transaction_time' => Carbon::now()->format('H:i:s'),
                'payment_method' => 'Bank Transfer',
                'payment_option' => 'Online',
                'payment_transaction_id' => str_replace('-', '', Str::uuid()),
                'status' => 'Completed',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'transaction_id' => 2,
                'transaction_type' => 'Move-in Fee',
                'reference_number' => Str::random(10),
                'amount' => 500.00,
                'id' => 2,
                'email' => 'user2@example.com',
                'remarks' => 'Partial withdrawal',
                'transaction_date' => Carbon::today(),
                'transaction_time' => Carbon::now()->format('H:i:s'),
                'payment_method' => 'Credit Card',
                'payment_option' => 'Manual',
                'payment_transaction_id' => str_replace('-', '', Str::uuid()),
                'status' => 'Pending',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
