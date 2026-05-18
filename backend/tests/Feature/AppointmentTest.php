<?php

namespace Tests\Feature;

use App\Models\Appointment;
use App\Models\Patient;
use App\Models\Treatment;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Carbon\Carbon;

class AppointmentTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;
    private User $secretary;
    private User $dentist;
    private Patient $patient;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->seed(\Database\Seeders\RoleSeeder::class);
        
        // Admin
        $this->admin = User::create([
            'name' => 'Admin User',
            'email' => 'admin@dentistpro.com',
            'password' => bcrypt('password'),
        ]);
        $this->admin->assignRole('admin');
        
        // Secretary (we assign assistant role to pass role:admin|dentiste|assistant middleware)
        $this->secretary = User::create([
            'name' => 'Secretary User',
            'email' => 'secretary@dentistpro.com',
            'password' => bcrypt('password'),
        ]);
        $this->secretary->assignRole('assistant');
        
        // Dentist (we assign dentiste role)
        $this->dentist = User::create([
            'name' => 'Dentist User',
            'email' => 'dentist@dentistpro.com',
            'password' => bcrypt('password'),
        ]);
        $this->dentist->assignRole('dentiste');
        
        // Patient
        $this->patient = Patient::create([
            'first_name' => 'Jean',
            'last_name' => 'Dupont',
            'phone' => '0612345678',
            'email' => 'jean.dupont@example.com',
            'address' => '123 Rue Principale'
        ]);
    }

    public function test_admin_can_view_appointments(): void
    {
        $response = $this->actingAs($this->admin)
            ->get(route('appointments.index'));

        $response->assertOk()
            ->assertViewIs('appointments.index');
    }

    public function test_secretary_can_create_appointment(): void
    {
        $appointmentData = [
            'patient_id' => $this->patient->id,
            'user_id' => $this->dentist->id,
            'appointment_date' => Carbon::tomorrow()->format('Y-m-d'),
            'start_time' => '09:00',
            'end_time' => '10:00',
            'status' => 'confirmed',
            'reason' => 'Consultation',
        ];

        $response = $this->actingAs($this->secretary)
            ->post(route('appointments.store'), $appointmentData);

        $response->assertRedirect(route('appointments.index'))
            ->assertSessionHas('success');

        $this->assertDatabaseHas('appointments', [
            'patient_id' => $this->patient->id,
            'user_id' => $this->dentist->id,
        ]);
    }

    public function test_cannot_create_conflicting_appointment(): void
    {
        $date = Carbon::tomorrow()->format('Y-m-d');
        
        Appointment::create([
            'user_id' => $this->dentist->id,
            'patient_id' => $this->patient->id,
            'appointment_date' => $date,
            'start_time' => '09:00',
            'end_time' => '10:00',
            'starts_at' => Carbon::tomorrow()->setTime(9, 0),
            'ends_at' => Carbon::tomorrow()->setTime(10, 0),
            'status' => 'confirmed',
        ]);

        $otherPatient = Patient::create([
            'first_name' => 'Marc',
            'last_name' => 'Lenoir',
            'phone' => '0698765432',
            'email' => 'marc.lenoir@example.com'
        ]);

        $conflictingData = [
            'patient_id' => $otherPatient->id,
            'user_id' => $this->dentist->id,
            'appointment_date' => $date,
            'start_time' => '09:30',
            'end_time' => '10:30',
            'status' => 'confirmed',
        ];

        $response = $this->actingAs($this->admin)
            ->post(route('appointments.store'), $conflictingData);

        $response->assertSessionHasErrors('start_time');
    }

    public function test_dentist_can_update_own_appointment(): void
    {
        $appointment = Appointment::create([
            'user_id' => $this->dentist->id,
            'patient_id' => $this->patient->id,
            'appointment_date' => Carbon::tomorrow()->format('Y-m-d'),
            'start_time' => '09:00',
            'end_time' => '09:30',
            'starts_at' => Carbon::tomorrow()->setTime(9, 0),
            'ends_at' => Carbon::tomorrow()->setTime(9, 30),
            'status' => 'confirmed',
        ]);

        $response = $this->actingAs($this->dentist)
            ->patch(route('appointments.update', $appointment), [
                'status' => 'completed',
            ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('appointments', [
            'id' => $appointment->id,
            'status' => 'completed',
        ]);
    }

    public function test_dentist_cannot_update_other_dentist_appointment(): void
    {
        $otherDentist = User::create([
            'name' => 'Dr. Jones',
            'email' => 'jones@dentistpro.com',
            'password' => bcrypt('password'),
        ]);
        $otherDentist->assignRole('dentiste');
        
        $appointment = Appointment::create([
            'user_id' => $otherDentist->id,
            'patient_id' => $this->patient->id,
            'appointment_date' => Carbon::tomorrow()->format('Y-m-d'),
            'start_time' => '09:00',
            'end_time' => '09:30',
            'starts_at' => Carbon::tomorrow()->setTime(9, 0),
            'ends_at' => Carbon::tomorrow()->setTime(9, 30),
            'status' => 'confirmed',
        ]);

        $response = $this->actingAs($this->dentist)
            ->patch(route('appointments.update', $appointment), [
                'status' => 'completed',
            ]);

        $response->assertForbidden();
    }

    public function test_completed_appointment_creates_invoice(): void
    {
        $treatment = Treatment::create([
            'name' => 'Consultation',
            'price' => 100,
            'duration' => 30
        ]);
        
        $appointment = Appointment::create([
            'user_id' => $this->dentist->id,
            'patient_id' => $this->patient->id,
            'appointment_date' => Carbon::tomorrow()->format('Y-m-d'),
            'start_time' => '09:00',
            'end_time' => '09:30',
            'starts_at' => Carbon::tomorrow()->setTime(9, 0),
            'ends_at' => Carbon::tomorrow()->setTime(9, 30),
            'status' => 'confirmed',
        ]);
        
        $appointment->treatments()->attach($treatment->id, [
            'applied_price' => 100,
            'quantity' => 1,
        ]);

        $response = $this->actingAs($this->admin)
            ->patch(route('appointments.update', $appointment), [
                'status' => 'completed',
            ]);

        $response->assertRedirect();
        
        $this->assertDatabaseHas('invoices', [
            'patient_id' => $this->patient->id,
            'appointment_id' => $appointment->id,
            'total_amount' => 100,
        ]);
    }

    public function test_admin_can_delete_appointment(): void
    {
        $appointment = Appointment::create([
            'user_id' => $this->dentist->id,
            'patient_id' => $this->patient->id,
            'appointment_date' => Carbon::tomorrow()->format('Y-m-d'),
            'start_time' => '09:00',
            'end_time' => '09:30',
            'starts_at' => Carbon::tomorrow()->setTime(9, 0),
            'ends_at' => Carbon::tomorrow()->setTime(9, 30),
            'status' => 'confirmed',
        ]);

        $response = $this->actingAs($this->admin)
            ->delete(route('appointments.destroy', $appointment));

        $response->assertRedirect(route('appointments.index'));
        $this->assertSoftDeleted($appointment);
    }

    public function test_cannot_delete_appointment_with_invoice(): void
    {
        $appointment = Appointment::create([
            'user_id' => $this->dentist->id,
            'patient_id' => $this->patient->id,
            'appointment_date' => Carbon::tomorrow()->format('Y-m-d'),
            'start_time' => '09:00',
            'end_time' => '09:30',
            'starts_at' => Carbon::tomorrow()->setTime(9, 0),
            'ends_at' => Carbon::tomorrow()->setTime(9, 30),
            'status' => 'confirmed',
        ]);
        
        \App\Models\Invoice::create([
            'appointment_id' => $appointment->id,
            'patient_id' => $this->patient->id,
            'total_amount' => 100,
            'status' => 'unpaid',
            'invoice_date' => now(),
        ]);

        $response = $this->actingAs($this->admin)
            ->delete(route('appointments.destroy', $appointment));

        $response->assertRedirect()
            ->assertSessionHas('error');
        
        $this->assertDatabaseHas('appointments', ['id' => $appointment->id]);
    }

    public function test_can_add_treatment_to_appointment(): void
    {
        $treatment = Treatment::create([
            'name' => 'Consultation',
            'price' => 100,
            'duration' => 30
        ]);
        
        $appointment = Appointment::create([
            'user_id' => $this->dentist->id,
            'patient_id' => $this->patient->id,
            'appointment_date' => Carbon::tomorrow()->format('Y-m-d'),
            'start_time' => '09:00',
            'end_time' => '09:30',
            'starts_at' => Carbon::tomorrow()->setTime(9, 0),
            'ends_at' => Carbon::tomorrow()->setTime(9, 30),
            'status' => 'confirmed',
        ]);

        $response = $this->actingAs($this->admin)
            ->post(route('appointments.add-treatment', $appointment), [
                'treatment_id' => $treatment->id,
                'quantity' => 2,
                'notes' => 'Test notes',
            ]);

        $response->assertRedirect()
            ->assertSessionHas('success');

        $this->assertDatabaseHas('appointment_treatment', [
            'appointment_id' => $appointment->id,
            'treatment_id' => $treatment->id,
            'quantity' => 2,
        ]);
    }
}
