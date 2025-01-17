<?php

namespace App\Repositories\Implementations;

use App\Models\Concerns;
use App\Models\Feature;
use App\Models\EmployeeDepartment;
use Illuminate\Support\Facades\DB;

class CustomerMasterlistRepository
{
    protected $model;

    public function __construct(Concerns $model)
    {
        $this->model = $model;
    }


    public function getCustomerInquiries(array $data)
    {
        $specificMessage = $this->model::from('concerns as c')
            ->select('c.ticket_id', 'm.details_message')
            ->join('messages as m', 'm.ticket_id', '=', 'c.ticket_id')
            ->where('c.ticket_id', $data['ticketId'])
            ->orderBy('m.created_at', 'asc')
            ->paginate(15);

        return $specificMessage;
    }

    public function getCustomerData()
    {
        $data = $this->model::select('buyer_email', 'property', 'buyer_name', 'ticket_id', 'id')
                            ->paginate(20);
        
        return $data;
    }


    public function getCustomerDetailsByEmail(string $email) 
    {
        $data = $this->model::where('buyer_email', $email)
                            ->get();
        
        return $data;
    }
    

   /*  public function getCustomerInquiries(array $data) {
        $messages = $this->model::whereHas('messages', function ($query) use ($data) {
            $query->where('ticket_id', $data['ticketId']);
        })
        ->with(['messages' => function ($query) {
            $query->select('details_message', 'ticket_id');
        }])
        ->paginate(20);
    
        return $messages->pluck('messages'); 
    } */
    
}
