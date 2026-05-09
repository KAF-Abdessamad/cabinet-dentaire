<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class DentistDemoSeeder extends Seeder
{
    /**
     * Dentistes fictifs pour remplir le select « Dentiste » (admin et API patient).
     */
    public function run(): void
    {
        $dentists = [
            ['Dr. Sophia Martin', 'sophia.martin@cabinet-dentaire.test'],
            ['Dr. Karim Alami', 'karim.alami@cabinet-dentaire.test'],
        ];

        foreach ($dentists as [$name, $email]) {
            if (User::where('email', $email)->exists()) {
                continue;
            }

            User::factory()->create([
                'name' => $name,
                'email' => $email,
                'password' => bcrypt('password'),
            ])->assignRole('dentiste');
        }
    }
}
