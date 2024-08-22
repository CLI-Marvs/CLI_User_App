<?php

namespace App\Http\Controllers;

use App\Models\Concerns;
use App\Models\Messages;
use Illuminate\Http\Request;

class ConcernController extends Controller
{
    //*FOR CSR Department
    
    public function getAllConcerns()
    {
        $allConcerns = Concerns::paginate(20);
        return response()->json($allConcerns);
    }


    public function addConcernPublic(Request $request)
    {
        try {

            $lastConcern = Concerns::latest()->first();
            $nextId = $lastConcern ? $lastConcern->id + 1 : 1;

            $formattedId = str_pad($nextId, 7, '0', STR_PAD_LEFT);

            $ticketId = 'Ticket#24' . $formattedId;


            $concerns = new Concerns();
            $concerns->details_concern = $request->details_concern;
            $concerns->property = $request->property;
            $concerns->details_message = $request->details_message;
            $concerns->status = "unresolved";
            $concerns->ticket_id = $ticketId;
            $concerns->user_type = $request->user_type;
            $concerns->buyer_name = $request->buyer_name;
            $concerns->user_type = $request->mobile_number;
            $concerns->contract_number = $request->contract_number;
            $concerns->unit_number = $request->unit_number;
            $concerns->buyer_email = $request->buyer_email;
    /*         $concerns->message_id = $messageId; */
            $concerns->save();

            $messages = new Messages();
            $messages->buyer_id = $request->buyer_id;
            $messages->admin_id = $request->admin_id;
            $messages->attachment = $request->attachment;
            $messages->ticket_id = $concerns->ticket_id;
            $messages->details_message = $request->details_message;
            $messages->buyer_email = $request->buyer_email;
            $messages->save();



            return response()->json('Successfully added');
        } catch (\Exception $e) {
            return response()->json(['message' => 'error.', 'error' => $e->getMessage()], 500);
        }
    }

}
