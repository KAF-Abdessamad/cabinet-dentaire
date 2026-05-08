<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::firstOrCreate(
            ['email' => 'admin@dentistpro.fr'],
            [
                'name' => 'Administrateur',
                'password' => Hash::make('password123'),
            ]
        );

        $admin->assignRole('admin');

        $this->command->info('Utilisateur admin créé :');
        $this->command->info('Email: admin@dentistpro.fr');
        $this->command->info('Mot de passe: password123');
    }
}
