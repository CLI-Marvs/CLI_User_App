<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class BankStatementSeeder extends Seeder
{
    public function run()
    {
        $bankStatements = [
            [
                'bank_name' => 'BDO',
                'account_number' => '1234567890',
                'transaction_number' => 'TXN001',
                'transaction_date' => Carbon::now()->subDays(10)->toDateString(),
                'reference_number' => '5CYBBQ7Mhk',
                'payment_option' => 'Credit/Debit Card',
                'running_balance' => 1000.00,
                'particulars' => 'Deposit',
                'transaction_code' => 'DEP001',
                'transaction_description' => 'Initial deposit',
                'status_of_posting' => 'Uncleared',
                'document_number' => 'DOC001',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'bank_name' => 'BPI',
                'account_number' => '0987654321',
                'transaction_number' => 'TXN002',
                'transaction_date' => Carbon::now()->subDays(5)->toDateString(),
                'reference_number' => '5CYBBQ7Mhk12',
                'payment_option' => 'Credit/Debit Card',
                'running_balance' => 1000.00                ,
                'particulars' => 'Withdrawal',
                'transaction_code' => 'WDL001',
                'transaction_description' => 'Monthly bill payment',
                'status_of_posting' => 'Uncleared',
                'document_number' => 'DOC002',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'bank_name' => 'Metrobank',
                'account_number' => '5678901234',
                'transaction_number' => 'TXN003',
                'transaction_date' => Carbon::now()->subDays(3)->toDateString(),
                'reference_number' => '1000000024780',
                'payment_option' => 'PayMaya',
                'running_balance' => 7668.00,
                'particulars' => 'Deposit',
                'transaction_code' => 'DEP002',
                'transaction_description' => 'Salary deposit',
                'status_of_posting' => 'Uncleared',
                'document_number' => 'DOC003',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        // Insert the data into the table
        DB::table('bank_statements')->insert($bankStatements);
    }
}
