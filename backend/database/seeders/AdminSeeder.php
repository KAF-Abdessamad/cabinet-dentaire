<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Créer ou récupérer le rôle admin
        $adminRole = Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);

        // Créer l'utilisateur admin par défaut
        $admin = User::firstOrCreate(
            ['email' => 'admin@cabinet.com'],
            [
                'name' => 'Administrateur',
                'email' => 'admin@cabinet.com',
                'password' => Hash::make('admin123'),
            ]
        );

        // Assigner le rôle admin
        $admin->assignRole('admin');

        $this->command->info('Compte admin créé : admin@cabinet.com / admin123');
    }
}
