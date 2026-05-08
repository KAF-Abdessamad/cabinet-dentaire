<?php

namespace App\Mail;

use App\Models\Appointment;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class AppointmentReminderMail extends Mailable
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

        return $this->subject('Rappel: Votre rendez-vous demain - Cabinet Dentaire DentistPro')
            ->view('emails.appointments.reminder');
    }
}
