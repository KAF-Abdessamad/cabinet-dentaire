<?php

namespace Tests\Feature;

use App\Models\Appointment;
use App\Models\User;
use App\Models\Patient;
use App\Services\AppointmentService;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AppointmentServiceTest extends TestCase
{
    use RefreshDatabase;

    protected $service;
    protected $dentist;
    protected $patient;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->seed(\Database\Seeders\RoleSeeder::class);
        
        $this->service = new AppointmentService();
        
        $this->dentist = User::create([
            'name' => 'Dr. ServiceTest',
            'email' => 'servicetest@dentistpro.com',
            'password' => bcrypt('password'),
        ]);
        
        $this->patient = Patient::create([
            'first_name' => 'Service',
            'last_name' => 'Patient',
            'phone' => '0600000000',
            'email' => 'service.patient@example.com',
            'address' => 'Test Address',
        ]);
    }

    public function test_dentist_is_available_when_no_appointments()
    {
        $startsAt = Carbon::now()->addDay()->setTime(10, 0);
        $endsAt = (clone $startsAt)->addMinutes(30);

        $available = $this->service->isAvailable($this->dentist->id, $startsAt, $endsAt);

        $this->assertTrue($available);
    }

    public function test_dentist_is_not_available_on_overlap()
    {
        $startsAt = Carbon::now()->addDay()->setTime(10, 0);
        $endsAt = (clone $startsAt)->addMinutes(30);

        Appointment::create([
            'user_id' => $this->dentist->id,
            'patient_id' => $this->patient->id,
            'starts_at' => $startsAt,
            'ends_at' => $endsAt,
            'status' => 'confirmed',
            'appointment_date' => $startsAt->toDateString(),
            'start_time' => $startsAt->toTimeString(),
            'end_time' => $endsAt->toTimeString(),
        ]);

        // Exact overlap
        $this->assertFalse($this->service->isAvailable($this->dentist->id, $startsAt, $endsAt));

        // Partial overlap
        $this->assertFalse($this->service->isAvailable($this->dentist->id, (clone $startsAt)->subMinutes(15), (clone $endsAt)->subMinutes(15)));
    }

    public function test_dentist_is_not_available_within_5_min_margin()
    {
        $startsAt = Carbon::now()->addDay()->setTime(10, 0);
        $endsAt = (clone $startsAt)->addMinutes(30);

        Appointment::create([
            'user_id' => $this->dentist->id,
            'patient_id' => $this->patient->id,
            'starts_at' => $startsAt,
            'ends_at' => $endsAt,
            'status' => 'confirmed',
            'appointment_date' => $startsAt->toDateString(),
            'start_time' => $startsAt->toTimeString(),
            'end_time' => $endsAt->toTimeString(),
        ]);

        // Check 3 mins after end (should be blocked by 5 min margin)
        $nextStartsAt = (clone $endsAt)->addMinutes(3);
        $nextEndsAt = (clone $nextStartsAt)->addMinutes(30);

        $this->assertFalse($this->service->isAvailable($this->dentist->id, $nextStartsAt, $nextEndsAt));

        // Check 6 mins after end (should be available)
        $okStartsAt = (clone $endsAt)->addMinutes(6);
        $okEndsAt = (clone $okStartsAt)->addMinutes(30);

        $this->assertTrue($this->service->isAvailable($this->dentist->id, $okStartsAt, $okEndsAt));
    }
}
