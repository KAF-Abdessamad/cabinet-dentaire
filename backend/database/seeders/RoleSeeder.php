<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use App\Models\User;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Création des rôles (utilise firstOrCreate pour éviter les doublons)
        $adminRole = Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);
        $dentisteRole = Role::firstOrCreate(['name' => 'dentiste', 'guard_name' => 'web']);
        $assistantRole = Role::firstOrCreate(['name' => 'assistant', 'guard_name' => 'web']);
        $secretaryRole = Role::firstOrCreate(['name' => 'secretary', 'guard_name' => 'web']);
        $patientRole = Role::firstOrCreate(['name' => 'patient', 'guard_name' => 'web']);

        // Création des permissions
        Permission::firstOrCreate(['name' => 'manage users', 'guard_name' => 'web']);
        Permission::firstOrCreate(['name' => 'manage appointments', 'guard_name' => 'web']);
        Permission::firstOrCreate(['name' => 'view medical records', 'guard_name' => 'web']);

        // Assignation des permissions aux rôles
        $adminRole->givePermissionTo(Permission::all());
        $dentisteRole->givePermissionTo(['manage appointments', 'view medical records']);
        $assistantRole->givePermissionTo(['manage appointments']);
        $secretaryRole->givePermissionTo(['manage appointments']);

        $this->command->info('Rôles créés : admin, dentiste, assistant, secretary, patient');
    }
}
