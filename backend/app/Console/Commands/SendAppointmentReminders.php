<?php

namespace App\Console\Commands;

use App\Models\Appointment;
use App\Mail\AppointmentReminderMail;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;
use Carbon\Carbon;

class SendAppointmentReminders extends Command
{
    protected $signature = 'app:send-appointment-reminders';
    protected $description = 'Envoyer les rappels de rendez-vous (24h et 10 min avant)';

    public function handle(): int
    {
        $this->send24hReminders();
        $this->send10minReminders();

        return self::SUCCESS;
    }

    private function send24hReminders()
    {
        $start = Carbon::now()->addHours(23)->addMinutes(50);
        $end = Carbon::now()->addHours(24)->addMinutes(10);

        $appointments = Appointment::with(['patient', 'dentist'])
            ->whereBetween('starts_at', [$start, $end])
            ->where('status', 'confirmed')
            ->get();

        foreach ($appointments as $appointment) {
            $this->sendEmail($appointment, "Rappel : Votre rendez-vous dans 24h");
        }
    }

    private function send10minReminders()
    {
        $start = Carbon::now()->addMinutes(5);
        $end = Carbon::now()->addMinutes(15);

        $appointments = Appointment::with(['patient', 'dentist'])
            ->whereBetween('starts_at', [$start, $end])
            ->where('status', 'confirmed')
            ->get();

        foreach ($appointments as $appointment) {
            $this->sendEmail($appointment, "Rappel : Votre rendez-vous commence dans 10 minutes");
        }
    }

    private function sendEmail(Appointment $appointment, string $subject)
    {
        if ($appointment->patient && $appointment->patient->email) {
            try {
                Mail::to($appointment->patient->email)
                    ->send(new AppointmentReminderMail($appointment));
                $this->info("Rappel envoyé à {$appointment->patient->email} pour {$appointment->starts_at}");
            } catch (\Exception $e) {
                $this->error("Erreur pour {$appointment->patient->email}: {$e->getMessage()}");
            }
        }
    }
}
