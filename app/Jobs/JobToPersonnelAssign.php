<?php

namespace App\Jobs;

use App\Mail\EmailToPersonnelAssign;
use Illuminate\Contracts\Mail\Mailer;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class JobToPersonnelAssign implements ShouldQueue
{
    use Queueable, InteractsWithQueue, Queueable, SerializesModels;

    protected $email;

    protected $data;

    /* protected $admin_name; */



    public function __construct($email, $data /* $admin_name */)
    {
        $this->email = $email;
        $this->data = $data;
       /*  $this->admin_name = $admin_name; */
    }

    /**
     * Execute the job.
     */
    public function handle(Mailer $mailer): void
    {
        $mailer->to($this->email)
            ->send(new EmailToPersonnelAssign($this->email, $this->data /* $this->admin_name */));
    }
}
