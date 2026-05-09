<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\View\View;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class PaymentController extends Controller
{
    public function index(): View
    {
        Gate::authorize('viewAny', Payment::class);

        $payments = Payment::with(['invoice.patient'])
            ->latest()
            ->paginate(20);

        return view('payments.index', compact('payments'));
    }

    public function create(Request $request): View
    {
        Gate::authorize('create', Payment::class);

        $invoiceId = $request->input('invoice_id');
        $invoice = $invoiceId ? Invoice::with('patient')->findOrFail($invoiceId) : null;
        $invoices = Invoice::with('patient')->where('status', '!=', 'paid')->get();

        return view('payments.create', compact('invoice', 'invoices'));
    }

    public function store(Request $request): RedirectResponse
    {
        Gate::authorize('create', Payment::class);

        $validated = $request->validate([
            'invoice_id' => 'required|exists:invoices,id',
            'amount' => 'required|numeric|min:0.01',
            'payment_method' => 'required|in:cash,card,check,transfer,insurance',
            'payment_date' => 'required|date',
            'notes' => 'nullable|string|max:500',
        ]);

        $invoice = Invoice::findOrFail($validated['invoice_id']);
        $remainingAmount = $invoice->remaining_amount;

        $validated['amount'] = min($validated['amount'], $remainingAmount);

        DB::transaction(function () use ($validated, $invoice) {
            Payment::create($validated);
            $this->updateInvoiceStatus($invoice);
        });

        return redirect()->route('invoices.show', $invoice)
            ->with('success', 'Paiement enregistré avec succès.');
    }

    public function show(Payment $payment): View
    {
        Gate::authorize('view', $payment);

        $payment->load(['invoice.patient', 'invoice.appointment']);

        return view('payments.show', compact('payment'));
    }

    public function edit(Payment $payment): View
    {
        Gate::authorize('update', $payment);

        $payment->load('invoice.patient');
        $invoices = Invoice::with('patient')->get();

        return view('payments.edit', compact('payment', 'invoices'));
    }

    public function update(Request $request, Payment $payment): RedirectResponse
    {
        Gate::authorize('update', $payment);

        $validated = $request->validate([
            'amount' => 'required|numeric|min:0.01',
            'payment_method' => 'required|in:cash,card,check,transfer,insurance',
            'payment_date' => 'required|date',
            'notes' => 'nullable|string|max:500',
        ]);

        $invoice = $payment->invoice;
        $oldAmount = $payment->amount;
        $newAmount = $validated['amount'];
        $remainingWithOld = $invoice->remaining_amount + $oldAmount;

        $validated['amount'] = min($newAmount, $remainingWithOld);

        DB::transaction(function () use ($payment, $validated, $invoice) {
            $payment->update($validated);
            $this->updateInvoiceStatus($invoice);
        });

        return redirect()->route('invoices.show', $invoice)
            ->with('success', 'Paiement mis à jour avec succès.');
    }

    public function destroy(Payment $payment): RedirectResponse
    {
        Gate::authorize('delete', $payment);

        $invoice = $payment->invoice;

        DB::transaction(function () use ($payment, $invoice) {
            $payment->delete();
            $this->updateInvoiceStatus($invoice);
        });

        return redirect()->route('invoices.show', $invoice)
            ->with('success', 'Paiement supprimé avec succès.');
    }

    public function history(Invoice $invoice): View
    {
        Gate::authorize('viewAny', Payment::class);

        $payments = $invoice->payments()->latest()->get();
        $totalPaid = $payments->sum('amount');
        $remainingAmount = $invoice->total_amount - $totalPaid;

        return view('payments.history', compact('invoice', 'payments', 'totalPaid', 'remainingAmount'));
    }

    private function updateInvoiceStatus(Invoice $invoice): void
    {
        $totalPaid = $invoice->payments()->sum('amount');
        $totalAmount = $invoice->total_amount;

        if ($totalPaid >= $totalAmount) {
            $invoice->update(['status' => 'paid']);
        } elseif ($totalPaid > 0) {
            $invoice->update(['status' => 'partially_paid']);
        } else {
            $invoice->update(['status' => 'pending']);
        }
    }
}

