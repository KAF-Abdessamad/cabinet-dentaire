<?php

namespace Tests\Feature;

use App\Models\Invoice;
use App\Models\Patient;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class InvoiceTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;
    private Patient $patient;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(\Database\Seeders\RoleSeeder::class);

        $this->admin = User::create([
            'name' => 'Admin User',
            'email' => 'admin@dentistpro.com',
            'password' => bcrypt('password'),
        ]);
        $this->admin->assignRole('admin');

        $this->patient = Patient::create([
            'first_name' => 'Jean',
            'last_name' => 'Dupont',
            'phone' => '0612345678',
            'email' => 'jean.dupont@example.com',
            'address' => '123 Rue Principale'
        ]);
    }

    public function test_invoice_creation_calculates_correctly(): void
    {
        $invoice = Invoice::create([
            'patient_id' => $this->patient->id,
            'total_amount' => 1200.00,
            'status' => 'unpaid',
            'invoice_date' => now(),
        ]);

        $this->assertEquals(1200.00, $invoice->total_amount);
        $this->assertEquals(1200.00, $invoice->remaining_amount);
        $this->assertEquals('unpaid', $invoice->status);
    }

    public function test_invoice_with_partial_payment(): void
    {
        $invoice = Invoice::create([
            'patient_id' => $this->patient->id,
            'total_amount' => 1500.00,
            'status' => 'unpaid',
            'invoice_date' => now(),
        ]);

        Payment::create([
            'invoice_id' => $invoice->id,
            'amount' => 600.00,
            'payment_date' => now(),
            'payment_method' => 'cash',
        ]);

        $this->assertEquals(900.00, $invoice->remaining_amount);
    }

    public function test_invoice_with_total_payment(): void
    {
        $invoice = Invoice::create([
            'patient_id' => $this->patient->id,
            'total_amount' => 800.00,
            'status' => 'unpaid',
            'invoice_date' => now(),
        ]);

        Payment::create([
            'invoice_id' => $invoice->id,
            'amount' => 800.00,
            'payment_date' => now(),
            'payment_method' => 'card',
        ]);

        $this->assertEquals(0.00, $invoice->remaining_amount);
    }
}
