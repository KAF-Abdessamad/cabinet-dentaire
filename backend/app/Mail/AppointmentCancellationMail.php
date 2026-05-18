<?php

namespace App\Mail;

use App\Models\Appointment;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class AppointmentCancellationMail extends Mailable
{
    use Queueable, SerializesModels;

    public Appointment $appointment;

    public function __construct(Appointment $appointment)
    {
        $this->appointment = $appointment;
    }

    public function build(): self
    {
        $this->appointment->load('patient', 'dentist');

        return $this->subject('Annulation de votre rendez-vous - Cabinet Dentaire DentistPro')
            ->view('emails.appointments.cancellation');
    }
}
