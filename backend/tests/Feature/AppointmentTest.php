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
        
        $this->admin = User::factory()->create();
        $this->admin->assignRole('admin');
        
        $this->secretary = User::factory()->create();
        $this->secretary->assignRole('secretary');
        
        $this->dentist = User::factory()->create();
        $this->dentist->assignRole('dentist');
        
        $this->patient = Patient::factory()->create();
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
            'status' => 'pending',
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
        
        Appointment::factory()->create([
            'user_id' => $this->dentist->id,
            'patient_id' => $this->patient->id,
            'appointment_date' => $date,
            'start_time' => '09:00',
            'end_time' => '10:00',
        ]);

        $conflictingData = [
            'patient_id' => Patient::factory()->create()->id,
            'user_id' => $this->dentist->id,
            'appointment_date' => $date,
            'start_time' => '09:30',
            'end_time' => '10:30',
            'status' => 'pending',
        ];

        $response = $this->actingAs($this->admin)
            ->post(route('appointments.store'), $conflictingData);

        $response->assertSessionHasErrors('start_time');
    }

    public function test_dentist_can_update_own_appointment(): void
    {
        $appointment = Appointment::factory()->create([
            'user_id' => $this->dentist->id,
            'patient_id' => $this->patient->id,
        ]);

        $response = $this->actingAs($this->dentist)
            ->patch(route('appointments.update', $appointment), [
                'status' => 'completed',
            ]);

        $response->assertOk();
        $this->assertDatabaseHas('appointments', [
            'id' => $appointment->id,
            'status' => 'completed',
        ]);
    }

    public function test_dentist_cannot_update_other_dentist_appointment(): void
    {
        $otherDentist = User::factory()->create();
        $otherDentist->assignRole('dentist');
        
        $appointment = Appointment::factory()->create([
            'user_id' => $otherDentist->id,
            'patient_id' => $this->patient->id,
        ]);

        $response = $this->actingAs($this->dentist)
            ->patch(route('appointments.update', $appointment), [
                'status' => 'completed',
            ]);

        $response->assertForbidden();
    }

    public function test_completed_appointment_creates_invoice(): void
    {
        $treatment = Treatment::factory()->create(['price' => 100]);
        
        $appointment = Appointment::factory()->create([
            'user_id' => $this->dentist->id,
            'patient_id' => $this->patient->id,
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

        $response->assertOk();
        
        $this->assertDatabaseHas('invoices', [
            'patient_id' => $this->patient->id,
            'appointment_id' => $appointment->id,
            'total_amount' => 100,
        ]);
    }

    public function test_admin_can_delete_appointment(): void
    {
        $appointment = Appointment::factory()->create([
            'user_id' => $this->dentist->id,
            'patient_id' => $this->patient->id,
        ]);

        $response = $this->actingAs($this->admin)
            ->delete(route('appointments.destroy', $appointment));

        $response->assertRedirect(route('appointments.index'));
        $this->assertDatabaseMissing('appointments', ['id' => $appointment->id]);
    }

    public function test_cannot_delete_appointment_with_invoice(): void
    {
        $appointment = Appointment::factory()->create([
            'user_id' => $this->dentist->id,
            'patient_id' => $this->patient->id,
        ]);
        
        \App\Models\Invoice::factory()->create([
            'appointment_id' => $appointment->id,
            'patient_id' => $this->patient->id,
        ]);

        $response = $this->actingAs($this->admin)
            ->delete(route('appointments.destroy', $appointment));

        $response->assertRedirect()
            ->assertSessionHas('error');
        
        $this->assertDatabaseHas('appointments', ['id' => $appointment->id]);
    }

    public function test_can_add_treatment_to_appointment(): void
    {
        $treatment = Treatment::factory()->create();
        
        $appointment = Appointment::factory()->create([
            'user_id' => $this->dentist->id,
            'patient_id' => $this->patient->id,
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
