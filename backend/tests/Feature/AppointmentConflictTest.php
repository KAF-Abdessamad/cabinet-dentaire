<?php

namespace Tests\Feature;

use App\Models\Appointment;
use App\Models\Patient;
use App\Models\Holiday;
use App\Models\OpeningHour;
use App\Models\User;
use App\Models\Treatment;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class AppointmentConflictTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;
    private User $dentist;
    private Patient $patient;
    private Treatment $treatment;

    protected function setUp(): void
    {
        parent::setUp();

        // Seed roles using the RoleSeeder
        $this->seed(\Database\Seeders\RoleSeeder::class);

        // Create admin user and assign role
        $this->admin = User::create([
            'name' => 'Admin User',
            'email' => 'admin@dentistpro.com',
            'password' => bcrypt('password'),
        ]);
        $this->admin->assignRole('admin');

        // Create dentist
        $this->dentist = User::create([
            'name' => 'Dr. Smith',
            'email' => 'smith@dentistpro.com',
            'password' => bcrypt('password'),
        ]);
        $this->dentist->assignRole('dentiste');

        // Create patient
        $this->patient = Patient::create([
            'first_name' => 'Jean',
            'last_name' => 'Dupont',
            'phone' => '0612345678',
            'email' => 'jean.dupont@example.com',
            'address' => '123 Rue Principale'
        ]);

        // Create standard treatment
        $this->treatment = Treatment::create([
            'name' => 'Consultation',
            'price' => 200,
            'duration' => 30
        ]);

        // Seed opening hours
        foreach (range(1, 6) as $day) { // Monday to Saturday
            OpeningHour::create([
                'day_of_week' => $day,
                'open_time' => '08:00:00',
                'close_time' => '18:00:00',
                'is_closed' => false,
            ]);
        }
        // Sunday
        OpeningHour::create([
            'day_of_week' => 0,
            'open_time' => '08:00:00',
            'close_time' => '18:00:00',
            'is_closed' => true,
        ]);
    }

    /**
     * Test simple conflict (same hour, same dentist -> 409).
     */
    public function test_simple_conflict_same_hour_same_dentist_returns_409(): void
    {
        $date = Carbon::tomorrow()->next(Carbon::MONDAY);
        
        // Pre-create appointment
        Appointment::create([
            'user_id' => $this->dentist->id,
            'patient_id' => $this->patient->id,
            'treatment_id' => $this->treatment->id,
            'appointment_date' => $date->toDateString(),
            'start_time' => '09:00:00',
            'end_time' => '09:30:00',
            'starts_at' => $date->copy()->setTime(9, 0),
            'ends_at' => $date->copy()->setTime(9, 30),
            'status' => 'confirmed'
        ]);

        $otherPatient = Patient::create([
            'first_name' => 'Marc',
            'last_name' => 'Lenoir',
            'phone' => '0698765432',
            'email' => 'marc.lenoir@example.com'
        ]);

        $payload = [
            'patient_id' => $otherPatient->id,
            'user_id' => $this->dentist->id,
            'treatment_id' => $this->treatment->id,
            'appointment_date' => $date->toDateString(),
            'start_time' => '09:00:00',
            'status' => 'confirmed'
        ];

        $response = $this->actingAs($this->admin)
            ->postJson('/api/appointments', $payload);

        $response->assertStatus(409);
    }

    /**
     * Test overlapping conflict (RDV A: 9h-10h, RDV B: 9h30-10h30 -> 409).
     */
    public function test_overlapping_conflict_returns_409(): void
    {
        $date = Carbon::tomorrow()->next(Carbon::MONDAY);
        $longTreatment = Treatment::create([
            'name' => 'Extraction',
            'price' => 500,
            'duration' => 60
        ]);

        Appointment::create([
            'user_id' => $this->dentist->id,
            'patient_id' => $this->patient->id,
            'treatment_id' => $longTreatment->id,
            'appointment_date' => $date->toDateString(),
            'start_time' => '09:00:00',
            'end_time' => '10:00:00',
            'starts_at' => $date->copy()->setTime(9, 0),
            'ends_at' => $date->copy()->setTime(10, 0),
            'status' => 'confirmed'
        ]);

        $otherPatient = Patient::create([
            'first_name' => 'Marc',
            'last_name' => 'Lenoir',
            'phone' => '0698765432',
            'email' => 'marc.lenoir@example.com'
        ]);

        $payload = [
            'patient_id' => $otherPatient->id,
            'user_id' => $this->dentist->id,
            'treatment_id' => $longTreatment->id,
            'appointment_date' => $date->toDateString(),
            'start_time' => '09:30:00',
            'status' => 'confirmed'
        ];

        $response = $this->actingAs($this->admin)
            ->postJson('/api/appointments', $payload);

        $response->assertStatus(409);
    }

    /**
     * Test adjacent slots (RDV A: 9h-10h, RDV B: 10h10-11h with 10-min gap -> 201).
     */
    public function test_adjacent_appointment_with_gap_succeeds_201(): void
    {
        $date = Carbon::tomorrow()->next(Carbon::MONDAY);
        $longTreatment = Treatment::create([
            'name' => 'Extraction',
            'price' => 500,
            'duration' => 60
        ]);

        Appointment::create([
            'user_id' => $this->dentist->id,
            'patient_id' => $this->patient->id,
            'treatment_id' => $longTreatment->id,
            'appointment_date' => $date->toDateString(),
            'start_time' => '09:00:00',
            'end_time' => '10:00:00',
            'starts_at' => $date->copy()->setTime(9, 0),
            'ends_at' => $date->copy()->setTime(10, 0),
            'status' => 'confirmed'
        ]);

        $otherPatient = Patient::create([
            'first_name' => 'Marc',
            'last_name' => 'Lenoir',
            'phone' => '0698765432',
            'email' => 'marc.lenoir@example.com'
        ]);

        $payload = [
            'patient_id' => $otherPatient->id,
            'user_id' => $this->dentist->id,
            'treatment_id' => $longTreatment->id,
            'appointment_date' => $date->toDateString(),
            'start_time' => '10:10:00',
            'status' => 'confirmed'
        ];

        $response = $this->actingAs($this->admin)
            ->postJson('/api/appointments', $payload);

        $response->assertStatus(201);
    }

    /**
     * Test cancelled appointments are ignored in overlaps -> 201.
     */
    public function test_cancelled_appointment_ignored_in_conflict_returns_201(): void
    {
        $date = Carbon::tomorrow()->next(Carbon::MONDAY);

        Appointment::create([
            'user_id' => $this->dentist->id,
            'patient_id' => $this->patient->id,
            'treatment_id' => $this->treatment->id,
            'appointment_date' => $date->toDateString(),
            'start_time' => '09:00:00',
            'end_time' => '09:30:00',
            'starts_at' => $date->copy()->setTime(9, 0),
            'ends_at' => $date->copy()->setTime(9, 30),
            'status' => 'cancelled'
        ]);

        $otherPatient = Patient::create([
            'first_name' => 'Marc',
            'last_name' => 'Lenoir',
            'phone' => '0698765432',
            'email' => 'marc.lenoir@example.com'
        ]);

        $payload = [
            'patient_id' => $otherPatient->id,
            'user_id' => $this->dentist->id,
            'treatment_id' => $this->treatment->id,
            'appointment_date' => $date->toDateString(),
            'start_time' => '09:00:00',
            'status' => 'confirmed'
        ];

        $response = $this->actingAs($this->admin)
            ->postJson('/api/appointments', $payload);

        $response->assertStatus(201);
    }

    /**
     * Test Sunday booking fails -> 422.
     */
    public function test_sunday_appointment_fails_422(): void
    {
        $sunday = Carbon::tomorrow()->next(Carbon::SUNDAY);

        $payload = [
            'patient_id' => $this->patient->id,
            'user_id' => $this->dentist->id,
            'treatment_id' => $this->treatment->id,
            'appointment_date' => $sunday->toDateString(),
            'start_time' => '09:00:00',
            'status' => 'confirmed'
        ];

        $response = $this->actingAs($this->admin)
            ->postJson('/api/appointments', $payload);

        $response->assertStatus(422);
        $response->assertJsonFragment(['error' => 'Le cabinet est fermé le dimanche.']);
    }

    /**
     * Test Monday booking succeeds -> 201.
     */
    public function test_monday_appointment_succeeds_201(): void
    {
        $monday = Carbon::tomorrow()->next(Carbon::MONDAY);

        $payload = [
            'patient_id' => $this->patient->id,
            'user_id' => $this->dentist->id,
            'treatment_id' => $this->treatment->id,
            'appointment_date' => $monday->toDateString(),
            'start_time' => '09:00:00',
            'status' => 'confirmed'
        ];

        $response = $this->actingAs($this->admin)
            ->postJson('/api/appointments', $payload);

        $response->assertStatus(201);
    }

    /**
     * Test Holiday booking (fixed date -> 422).
     */
    public function test_holiday_fixed_date_fails_422(): void
    {
        $date = Carbon::tomorrow()->next(Carbon::MONDAY);
        Holiday::create([
            'date' => $date->toDateString(),
            'label' => 'Fête Nationale',
            'is_recurring' => false
        ]);

        $payload = [
            'patient_id' => $this->patient->id,
            'user_id' => $this->dentist->id,
            'treatment_id' => $this->treatment->id,
            'appointment_date' => $date->toDateString(),
            'start_time' => '09:00:00',
            'status' => 'confirmed'
        ];

        $response = $this->actingAs($this->admin)
            ->postJson('/api/appointments', $payload);

        $response->assertStatus(422);
    }

    /**
     * Test recurring Holiday booking (same day/month, different year -> 422).
     */
    public function test_holiday_recurring_date_fails_422(): void
    {
        $holidayDate = Carbon::parse('2025-05-01');
        Holiday::create([
            'date' => $holidayDate->toDateString(),
            'label' => 'Fête du travail',
            'is_recurring' => true
        ]);

        // Requesting in 2027 same day & month
        $payload = [
            'patient_id' => $this->patient->id,
            'user_id' => $this->dentist->id,
            'treatment_id' => $this->treatment->id,
            'appointment_date' => '2027-05-01',
            'start_time' => '09:00:00',
            'status' => 'confirmed'
        ];

        $response = $this->actingAs($this->admin)
            ->postJson('/api/appointments', $payload);

        $response->assertStatus(422);
    }

    /**
     * Test deleted Holiday booking succeeds -> 201.
     */
    public function test_deleted_holiday_booking_succeeds_201(): void
    {
        $date = Carbon::tomorrow()->next(Carbon::MONDAY);
        $holiday = Holiday::create([
            'date' => $date->toDateString(),
            'label' => 'Fête supprimée',
            'is_recurring' => false
        ]);
        
        $holiday->delete();

        $payload = [
            'patient_id' => $this->patient->id,
            'user_id' => $this->dentist->id,
            'treatment_id' => $this->treatment->id,
            'appointment_date' => $date->toDateString(),
            'start_time' => '09:00:00',
            'status' => 'confirmed'
        ];

        $response = $this->actingAs($this->admin)
            ->postJson('/api/appointments', $payload);

        $response->assertStatus(201);
    }

    /**
     * Test booking before opening hours fails -> 422.
     */
    public function test_booking_before_opening_hours_fails_422(): void
    {
        $date = Carbon::tomorrow()->next(Carbon::MONDAY);

        $payload = [
            'patient_id' => $this->patient->id,
            'user_id' => $this->dentist->id,
            'treatment_id' => $this->treatment->id,
            'appointment_date' => $date->toDateString(),
            'start_time' => '06:00:00', // cabinet opens at 08:00
            'status' => 'confirmed'
        ];

        $response = $this->actingAs($this->admin)
            ->postJson('/api/appointments', $payload);

        $response->assertStatus(422);
    }

    /**
     * Test booking after closing hours fails -> 422.
     */
    public function test_booking_after_closing_hours_fails_422(): void
    {
        $date = Carbon::tomorrow()->next(Carbon::MONDAY);

        $payload = [
            'patient_id' => $this->patient->id,
            'user_id' => $this->dentist->id,
            'treatment_id' => $this->treatment->id,
            'appointment_date' => $date->toDateString(),
            'start_time' => '20:30:00', // cabinet closes at 18:00
            'status' => 'confirmed'
        ];

        $response = $this->actingAs($this->admin)
            ->postJson('/api/appointments', $payload);

        $response->assertStatus(422);
    }

    /**
     * Test double appointments per day per patient.
     */
    public function test_double_appointment_per_patient_per_day(): void
    {
        $date = Carbon::tomorrow()->next(Carbon::MONDAY);

        // Pre-create appointment for patient
        Appointment::create([
            'user_id' => $this->dentist->id,
            'patient_id' => $this->patient->id,
            'treatment_id' => $this->treatment->id,
            'appointment_date' => $date->toDateString(),
            'start_time' => '09:00:00',
            'end_time' => '09:30:00',
            'starts_at' => $date->copy()->setTime(9, 0),
            'ends_at' => $date->copy()->setTime(9, 30),
            'status' => 'confirmed'
        ]);

        $payload = [
            'patient_id' => $this->patient->id,
            'user_id' => $this->dentist->id,
            'treatment_id' => $this->treatment->id,
            'appointment_date' => $date->toDateString(),
            'start_time' => '11:00:00', // completely distinct slot
            'status' => 'confirmed'
        ];

        // 1. With setting ONE_APPOINTMENT_PER_DAY_PER_PATIENT enabled
        config(['app.one_appointment_per_day_per_patient' => true]);
        // Set env value programmatically for test
        putenv('ONE_APPOINTMENT_PER_DAY_PER_PATIENT=true');

        $response = $this->actingAs($this->admin)
            ->postJson('/api/appointments', $payload);

        $response->assertStatus(422);

        // 2. With setting disabled
        putenv('ONE_APPOINTMENT_PER_DAY_PER_PATIENT=false');

        $response = $this->actingAs($this->admin)
            ->postJson('/api/appointments', $payload);

        $response->assertStatus(201);
    }
}
