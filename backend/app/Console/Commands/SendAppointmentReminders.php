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
    protected $description = 'Envoyer les rappels de rendez-vous pour demain';

    public function handle(): int
    {
        $tomorrow = Carbon::tomorrow();

        $appointments = Appointment::with(['patient', 'dentist'])
            ->whereDate('appointment_date', $tomorrow)
            ->where('status', '!=', 'cancelled')
            ->get();

        $count = 0;

        foreach ($appointments as $appointment) {
            if ($appointment->patient->email) {
                try {
                    Mail::to($appointment->patient->email)
                        ->send(new AppointmentReminderMail($appointment));
                    $count++;
                    $this->info("Rappel envoyé à {$appointment->patient->email}");
                } catch (\Exception $e) {
                    $this->error("Erreur pour {$appointment->patient->email}: {$e->getMessage()}");
                }
            }
        }

        $this->info("{$count} rappels envoyés avec succès.");

        return self::SUCCESS;
    }
}
