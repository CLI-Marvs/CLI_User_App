<?php

namespace App\Repositories\Implementations;

use App\Models\BankStatement;
use App\Models\BankTransaction;
use App\Models\Invoices;
use App\Models\PreSubmissionOnlinePayments;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class TransactionRepository
{
    protected $invoicesModel;
    protected $transactionModel;
    protected $preSubmissionModel;
    protected $bankStatementModel;

    public function __construct(Invoices $invoicesModel, BankTransaction $transactionModel, PreSubmissionOnlinePayments $preSubmissionModel, BankStatement $bankStatementModel)
    {
        $this->invoicesModel = $invoicesModel;
        $this->transactionModel = $transactionModel;
        $this->preSubmissionModel = $preSubmissionModel;
        $this->bankStatementModel = $bankStatementModel;
    }

    public function retrieveInvoicesFromSap(array $data)
    {
        $existingInvoice = $this->invoicesModel
            ->where('invoice_number', $data['D_BELNR'])
            ->where('flow_type', $data['D_VBEWA'])
            ->first();

        if (!$existingInvoice) {
            $invoice = new $this->invoicesModel;
            $invoice->contract_number = $data['D_RECNNR'];
            $invoice->invoice_number = $data['D_BELNR'];
            $invoice->customer_bp_number = $data['D_KUNNR'];
            $invoice->sap_unique_id = $data['D_BUZEI'];
            $invoice->company_code = $data['D_BUKRS'];
            $invoice->project_code = $data['D_SWENR'];
            $invoice->description = $data['D_SGTXT'];
            $invoice->invoice_amount = $data['lv_dmbtr'];
            $invoice->entry_date = $data['D_CPUDT'];
            $invoice->due_date = $data['D_ZFBDT'];
            $invoice->post_date = $data['D_BUDAT'];
            $invoice->customer_name = $data['D_NAME1'];
            $invoice->flow_type = $data['D_VBEWA'];
            $invoice->invoice_status = $data['D_STATS'];

            $invoice->save();
            return $invoice;
        }

        return $existingInvoice;
    }

    public function runAutoPosting()
    {
        $bankTransactions = $this->transactionModel::where('status', 'not_posted')->get();

        $matchingInvoices = [];
        foreach ($bankTransactions as $bankTransaction) {
            $invoices = $this->invoicesModel::where('contract_number', $bankTransaction->reference_number)
                ->where('invoice_amount', $bankTransaction->invoice_amount)
                ->get();

            if ($invoices->isNotEmpty()) {
                foreach ($invoices as $invoice) {
                    $matchingInvoices[] = [
                        'ID' => $bankTransaction->id,
                        'BUKRS' => $invoice->company_code,
                        'RECNNR' => $invoice->contract_number,
                        'VBEWA' => $invoice->flow_type,
                        'BELNR' => $invoice->document_number,
                        'AMT' => $invoice->invoice_amount,
                        'D_NAME1' => $invoice->customer_name,
                        'PAYD' => "Cash",
                        'INVID' => $invoice->id,
                    ];
                }
            }
        }

        return $matchingInvoices;
    }

    public function paygateWebHook(array $data)
    {
        if ($data['status'] !== 'success') {
            return ['message' => 'Payment not successful'];
        }

        return DB::transaction(function () use ($data) {
            $preSubmissionData = $this->preSubmissionModel->where('payment_transaction_id', $data['transactionId'])->first();

            if (!$preSubmissionData) {
                return ['message' => 'Transaction ID not found'];
            }

            $preSubmissionData->update(['status' => 'Closed']);

            $this->transactionModel->create([
                'reference_number' => $preSubmissionData->reference_number,
                'transaction_date' => $preSubmissionData->transaction_date,
                'transaction_time' => $preSubmissionData->transaction_time,
                'payment_method_transaction_id' => $preSubmissionData->payment_transaction_id,
                'transaction_type' => $preSubmissionData->transaction_type,
                'amount' => $preSubmissionData->amount,
                'id' => $preSubmissionData->id,
                'remarks' => $preSubmissionData->remarks,
                'payment_method' => "Online Payment Aggregator",
                'payment_option' => $preSubmissionData->payment_option,
                'email' => $preSubmissionData->email,
                'status' => "Floating",
                'destination_bank' => "BDO",
            ]);

            return ['message' => 'Transaction processed successfully'];
        });
    }



    public function clearedBankStatements(array $data)
    {
        $clearedData = [];
        $transactionData = $this->transactionModel::where('reference_number', $data['reference_number'])->get();
        return $transactionData;
    }


    public function retrieveTransactions(array $data)
    {
        $startDate = $data['start_date'] ?? null;
        $endDate = $data['end_date'] ?? null;

        $query = $this->transactionModel
            ->join('property_masters', 'property_masters.id', '=', 'transaction.id')
            ->select('transaction.*', 'property_masters.property_name')
            ->orderBy('transaction.created_at', 'desc')
            ->when(!empty($data['status']), fn($q) => $q->where('transaction.status', $data['status']))
            ->when(!empty($data['email']), fn($q) => $q->where('transaction.email', $data['email']))
            ->when(!empty($data['destination_bank']), fn($q) => $q->where('transaction.destination_bank', $data['destination_bank']))
            ->when(!empty($data['property_name']), fn($q) => $q->where('property_masters.property_name', $data['property_name']))
            ->when(!empty($data['invoice_number']), fn($q) => $q->where('transaction.invoice_number', $data['invoice_number']))
            ->when(!empty($data['document_number']), fn($q) => $q->where('transaction.document_number', $data['document_number']))
            ->when(!empty($data['reference_number']), fn($q) => $q->where('transaction.reference_number', $data['reference_number']))
            ->when($startDate && $endDate, fn($q) => $q->whereBetween('transaction.transaction_date', [$startDate, $endDate]))
            ->when($startDate && !$endDate, fn($q) => $q->whereDate('transaction.transaction_date', $startDate))
            ->when($endDate && !$startDate, fn($q) => $q->whereDate('transaction.transaction_date', $endDate))
            ->paginate(2);

        return $query;
    }

    public function retrieveInvoices(array $data)
    {
        $query = $this->invoicesModel
            ->when(!empty($data['status']), fn($q) => $q->where('transaction.status', $data['status']))
            ->when(!empty($data['invoice_number']), fn($q) => $q->where('invoice_number', $data['invoice_number']))
            ->when(!empty($data['customer_name']), fn($q) => $q->whereRaw('customer_name ILIKE ?', ["%{$data['customer_name']}%"]))
            ->when(!empty($data['contract_number']), fn($q) => $q->where('contract_number', $data['contract_number']))
            ->paginate(2);

        return $query;
    }


    public function updateTransactionStatus(array $data)
    {
        $transactionData = null;

        foreach ($data as $item) {
            $transactionData = $this->transactionModel
                ->where('transaction_id', $item['id'])
                ->update(['status' => $item['statusRef']]);
        }

        return $transactionData;
    }
}
