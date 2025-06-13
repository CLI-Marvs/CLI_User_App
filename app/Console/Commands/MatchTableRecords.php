<?php

namespace App\Console\Commands;

use App\Models\BankStatement;
use App\Models\BankTransaction;
use App\Models\Invoices;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class MatchTableRecords extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:match-table-records';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Automated Clearing';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        DB::transaction(function() {
            $matches = DB::table('transaction as t')
                         ->join('bank_statements as bs', function($join) {
                            $join->on('t.reference_number', '=', 'bs.reference_number')
                                ->on('t.amount', '=', 'bs.running_balance');
                         })
                         ->where('bs.status_of_posting', '!=', 'Cleared')
                         ->where('t.status', '!=', 'Cleared')
                         ->select('t.transaction_id', 'bs.id as bank_statement_id')
                         ->get();
            
            foreach($matches as $match) {
                BankTransaction::where('transaction_id', $match->transaction_id)->update(['status' => 'Cleared']);
                BankStatement::where('id', $match->bank_statement_id)->update(['status_of_posting' => 'Cleared']);
            }

            info('matches count'. $matches->count());
        }); 
    }
}
