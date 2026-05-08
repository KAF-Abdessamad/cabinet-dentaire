<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use App\Models\Payment;
use App\Mail\InvoiceMail;
use Illuminate\Http\Request;
use Illuminate\View\View;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Barryvdh\DomPDF\Facade\Pdf;

class InvoiceController extends Controller
{
    public function index(Request $request): View
    {
        Gate::authorize('viewAny', Invoice::class);

        $query = Invoice::with(['patient', 'appointment']);

        if ($request->has('status')) {
            $query->where('status', $request->get('status'));
        }

        $invoices = $query->orderBy('invoice_date', 'desc')->paginate(10);
        
        $totalUnpaid = Invoice::whereIn('status', ['pending', 'partial'])->sum('total_amount');
        
        return view('invoices.index', compact('invoices', 'totalUnpaid'));
    }

    public function create(): View
    {
        Gate::authorize('create', Invoice::class);
        
        $patients = \App\Models\Patient::orderBy('last_name')->get();
        $appointments = \App\Models\Appointment::with('patient')->whereDoesntHave('invoice')->get();
        
        return view('invoices.create', compact('patients', 'appointments'));
    }

    public function store(Request $request): RedirectResponse
    {
        Gate::authorize('create', Invoice::class);

        $validated = $request->validate([
            'patient_id' => 'required|exists:patients,id',
            'appointment_id' => 'nullable|exists:appointments,id',
            'total_amount' => 'required|numeric|min:0',
            'invoice_date' => 'required|date',
            'notes' => 'nullable|string',
        ]);

        $validated['status'] = 'pending';
        
        $invoice = Invoice::create($validated);

        return redirect()->route('invoices.show', $invoice)
            ->with('success', 'Facture créée avec succès.');
    }

    public function show(Invoice $invoice): View
    {
        Gate::authorize('view', $invoice);

        $invoice->load(['patient', 'appointment.treatments', 'payments']);
        return view('invoices.show', compact('invoice'));
    }

    public function update(Request $request, Invoice $invoice): RedirectResponse
    {
        Gate::authorize('update', $invoice);

        $validated = $request->validate([
            'status' => 'required|in:pending,partial,paid,cancelled',
        ]);

        $invoice->update($validated);

        return back()->with('success', 'Statut de la facture mis à jour.');
    }

    public function addPayment(Request $request, Invoice $invoice): RedirectResponse
    {
        Gate::authorize('create', Payment::class);

        $validated = $request->validate([
            'amount' => 'required|numeric|min:0.01|max:' . $invoice->remaining_amount,
            'payment_method' => 'required|in:cash,card,check,transfer,insurance',
            'payment_date' => 'required|date',
            'notes' => 'nullable|string|max:500',
        ]);

        $invoice->payments()->create($validated);

        $totalPaid = $invoice->payments()->sum('amount');
        if ($totalPaid >= $invoice->total_amount) {
            $invoice->update(['status' => 'paid']);
        } elseif ($totalPaid > 0) {
            $invoice->update(['status' => 'partial']);
        }

        return back()->with('success', 'Paiement enregistré avec succès.');
    }

    public function downloadPdf(Invoice $invoice)
    {
        Gate::authorize('view', $invoice);

        $invoice->load(['patient', 'appointment.treatments', 'payments']);

        $pdf = Pdf::loadView('invoices.pdf', compact('invoice'));

        return $pdf->download('facture-' . str_pad($invoice->id, 5, '0', STR_PAD_LEFT) . '.pdf');
    }

    public function sendEmail(Request $request, Invoice $invoice): RedirectResponse
    {
        Gate::authorize('update', $invoice);

        $validated = $request->validate([
            'email' => 'nullable|email',
        ]);

        $invoice->load(['patient', 'appointment.treatments', 'payments']);

        $email = $validated['email'] ?? $invoice->patient->email;

        if (!$email) {
            return back()->with('error', 'Aucune adresse email disponible pour ce patient.');
        }

        $pdf = Pdf::loadView('invoices.pdf', compact('invoice'));
        $pdfPath = 'invoices/facture-' . $invoice->id . '-' . time() . '.pdf';
        Storage::disk('local')->put($pdfPath, $pdf->output());

        Mail::to($email)->send(new InvoiceMail($invoice, Storage::disk('local')->path($pdfPath)));

        Storage::disk('local')->delete($pdfPath);

        return back()->with('success', 'Facture envoyée par email avec succès.');
    }

    public function destroy(Invoice $invoice): RedirectResponse
    {
        Gate::authorize('delete', $invoice);

        if ($invoice->payments()->count() > 0) {
            return back()->with('error', 'Impossible de supprimer une facture avec des paiements.');
        }

        $invoice->delete();

        return redirect()->route('invoices.index')
            ->with('success', 'Facture supprimée.');
    }
}
