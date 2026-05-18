<?php

namespace App\Jobs;

use App\Models\Appointment;
use App\Mail\AppointmentConfirmationMail;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;

class SendAppointmentConfirmationJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public Appointment $appointment;

    public function __construct(Appointment $appointment)
    {
        $this->appointment = $appointment;
    }

    public function handle(): void
    {
        $this->appointment->load('patient', 'dentist');
        
        if ($this->appointment->patient && $this->appointment->patient->email) {
            Mail::to($this->appointment->patient->email)
                ->send(new AppointmentConfirmationMail($this->appointment));
        }
    }
}
