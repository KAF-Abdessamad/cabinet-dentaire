<?php

namespace Tests\Feature;

use App\Models\Patient;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PatientTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;
    private User $secretary;
    private User $dentist;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->seed(\Database\Seeders\RoleSeeder::class);
        
        // Create Admin
        $this->admin = User::create([
            'name' => 'Admin User',
            'email' => 'admin@dentistpro.com',
            'password' => bcrypt('password'),
        ]);
        $this->admin->assignRole('admin');
        
        // Create Secretary (we assign assistant role so it passes the route:admin|dentiste|assistant check)
        $this->secretary = User::create([
            'name' => 'Secretary User',
            'email' => 'secretary@dentistpro.com',
            'password' => bcrypt('password'),
        ]);
        $this->secretary->assignRole('assistant');
        
        // Create Dentist
        $this->dentist = User::create([
            'name' => 'Dentist User',
            'email' => 'dentist@dentistpro.com',
            'password' => bcrypt('password'),
        ]);
        $this->dentist->assignRole('dentiste');
    }

    public function test_admin_can_view_patients_list(): void
    {
        $response = $this->actingAs($this->admin)
            ->get(route('patients.index'));

        $response->assertOk()
            ->assertViewIs('patients.index');
    }

    public function test_secretary_can_view_patients_list(): void
    {
        $response = $this->actingAs($this->secretary)
            ->get(route('patients.index'));

        $response->assertOk();
    }

    public function test_dentist_can_view_patients_list(): void
    {
        $response = $this->actingAs($this->dentist)
            ->get(route('patients.index'));

        $response->assertOk();
    }

    public function test_guest_cannot_view_patients(): void
    {
        $response = $this->get(route('patients.index'));

        $response->assertRedirect(route('login'));
    }

    public function test_admin_can_create_patient(): void
    {
        $patientData = [
            'first_name' => 'Jean',
            'last_name' => 'Dupont',
            'email' => 'jean@example.com',
            'phone' => '0123456789',
            'birth_date' => '1980-01-01',
            'address' => '123 Rue Test',
        ];

        $response = $this->actingAs($this->admin)
            ->post(route('patients.store'), $patientData);

        $response->assertRedirect(route('patients.index'))
            ->assertSessionHas('success');

        $this->assertDatabaseHas('patients', [
            'email' => 'jean@example.com',
            'first_name' => 'Jean',
        ]);
    }

    public function test_secretary_can_create_patient(): void
    {
        $patientData = [
            'first_name' => 'Marie',
            'last_name' => 'Marie',
            'email' => 'marie@example.com',
            'phone' => '0123456789',
        ];

        $response = $this->actingAs($this->secretary)
            ->post(route('patients.store'), $patientData);

        $response->assertRedirect(route('patients.index'));
        $this->assertDatabaseHas('patients', ['email' => 'marie@example.com']);
    }

    public function test_patient_creation_requires_valid_email(): void
    {
        $patientData = [
            'first_name' => 'Test',
            'last_name' => 'User',
            'email' => 'invalid-email',
            'phone' => '0123456789',
        ];

        $response = $this->actingAs($this->admin)
            ->post(route('patients.store'), $patientData);

        $response->assertSessionHasErrors('email');
    }

    public function test_patient_creation_requires_first_name(): void
    {
        $patientData = [
            'last_name' => 'User',
            'email' => 'test@example.com',
            'phone' => '0123456789',
        ];

        $response = $this->actingAs($this->admin)
            ->post(route('patients.store'), $patientData);

        $response->assertSessionHasErrors('first_name');
    }

    public function test_admin_can_update_patient(): void
    {
        $patient = Patient::create([
            'first_name' => 'Original',
            'last_name' => 'Name',
            'email' => 'original@example.com',
            'phone' => '0123456789',
        ]);

        $response = $this->actingAs($this->admin)
            ->put(route('patients.update', $patient), [
                'first_name' => 'Updated',
                'last_name' => $patient->last_name,
                'email' => $patient->email,
                'phone' => $patient->phone,
            ]);

        $response->assertRedirect(route('patients.index'))
            ->assertSessionHas('success');

        $this->assertDatabaseHas('patients', [
            'id' => $patient->id,
            'first_name' => 'Updated',
        ]);
    }

    public function test_admin_can_delete_patient(): void
    {
        $patient = Patient::create([
            'first_name' => 'To',
            'last_name' => 'Delete',
            'email' => 'delete@example.com',
            'phone' => '0123456789',
        ]);

        $response = $this->actingAs($this->admin)
            ->delete(route('patients.destroy', $patient));

        $response->assertRedirect(route('patients.index'));
        $this->assertSoftDeleted($patient);
    }

    public function test_secretary_cannot_delete_patient(): void
    {
        $patient = Patient::create([
            'first_name' => 'To',
            'last_name' => 'Delete',
            'email' => 'delete@example.com',
            'phone' => '0123456789',
        ]);

        $response = $this->actingAs($this->secretary)
            ->delete(route('patients.destroy', $patient));

        $response->assertForbidden();
        $this->assertDatabaseHas('patients', ['id' => $patient->id]);
    }
}
