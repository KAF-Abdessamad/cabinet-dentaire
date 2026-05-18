<?php

namespace Database\Seeders;

use App\Models\Holiday;
use App\Models\OpeningHour;
use Illuminate\Database\Seeder;

class HolidaysAndOpeningHoursSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Seed Morocco fixed holidays
        $holidays = [
            ['date' => '2026-01-01', 'label' => 'Jour de l\'an', 'is_recurring' => true],
            ['date' => '2026-01-11', 'label' => 'Manifeste de l\'Indépendance', 'is_recurring' => true],
            ['date' => '2026-01-14', 'label' => 'Nouvel an Amazigh', 'is_recurring' => true],
            ['date' => '2026-05-01', 'label' => 'Fête du Travail', 'is_recurring' => true],
            ['date' => '2026-07-30', 'label' => 'Fête du Trône', 'is_recurring' => true],
            ['date' => '2026-08-14', 'label' => 'Allégeance Oued Eddahab', 'is_recurring' => true],
            ['date' => '2026-08-20', 'label' => 'Révolution du Roi et du Peuple', 'is_recurring' => true],
            ['date' => '2026-08-21', 'label' => 'Fête de la Jeunesse', 'is_recurring' => true],
            ['date' => '2026-11-06', 'label' => 'Anniversaire de la Marche Verte', 'is_recurring' => true],
            ['date' => '2026-11-18', 'label' => 'Fête de l\'Indépendance', 'is_recurring' => true],
        ];

        foreach ($holidays as $holiday) {
            Holiday::updateOrCreate(
                ['date' => $holiday['date']],
                $holiday
            );
        }

        // 2. Seed default weekly opening hours (0=Sunday to 6=Saturday)
        $openingHours = [
            ['day_of_week' => 0, 'open_time' => null, 'close_time' => null, 'is_closed' => true],     // Dimanche
            ['day_of_week' => 1, 'open_time' => '08:00:00', 'close_time' => '18:00:00', 'is_closed' => false], // Lundi
            ['day_of_week' => 2, 'open_time' => '08:00:00', 'close_time' => '18:00:00', 'is_closed' => false], // Mardi
            ['day_of_week' => 3, 'open_time' => '08:00:00', 'close_time' => '18:00:00', 'is_closed' => false], // Mercredi
            ['day_of_week' => 4, 'open_time' => '08:00:00', 'close_time' => '18:00:00', 'is_closed' => false], // Jeudi
            ['day_of_week' => 5, 'open_time' => '08:00:00', 'close_time' => '18:00:00', 'is_closed' => false], // Vendredi
            ['day_of_week' => 6, 'open_time' => '08:00:00', 'close_time' => '13:00:00', 'is_closed' => false], // Samedi
        ];

        foreach ($openingHours as $oh) {
            OpeningHour::updateOrCreate(
                ['day_of_week' => $oh['day_of_week']],
                $oh
            );
        }
    }
}
