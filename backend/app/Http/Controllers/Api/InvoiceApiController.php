<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Models\Payment;
use App\Mail\InvoiceMail;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;

class InvoiceApiController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Invoice::with(['patient', 'appointment']);

        // Date range filter
        if ($request->filled('start_date') && $request->filled('end_date')) {
            $query->whereBetween('invoice_date', [
                Carbon::parse($request->get('start_date'))->startOfDay(),
                Carbon::parse($request->get('end_date'))->endOfDay()
            ]);
        }

        // Status filter
        if ($request->filled('status')) {
            $query->where('status', $request->get('status'));
        }

        // Patient search
        if ($request->filled('search')) {
            $search = $request->get('search');
            $query->whereHas('patient', function($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%")
                  ->orWhere('cin', 'like', "%{$search}%");
            });
        }

        $invoices = $query->orderBy('invoice_date', 'desc')->get();

        // Calculate KPI Statistics
        $totalBilled = Invoice::where('status', '!=', 'cancelled')->sum('total_amount');
        
        $totalEncashed = Payment::whereHas('invoice', function($q) {
            $q->where('status', '!=', 'cancelled');
        })->sum('amount');
        
        $remainingBalance = max(0, $totalBilled - $totalEncashed);

        return response()->json([
            'invoices' => $invoices,
            'stats' => [
                'total_billed' => (float) $totalBilled,
                'total_encashed' => (float) $totalEncashed,
                'remaining_balance' => (float) $remainingBalance,
            ]
        ]);
    }

    public function show(Invoice $invoice): JsonResponse
    {
        $invoice->load(['patient', 'appointment.treatments', 'payments']);
        
        // Auto-compute HT & TVA
        $ttc = (float) $invoice->total_amount;
        $ht = $ttc / 1.2;
        $tva = $ttc - $ht;

        return response()->json([
            'invoice' => $invoice,
            'pricing' => [
                'ht' => round($ht, 2),
                'tva' => round($tva, 2),
                'ttc' => round($ttc, 2)
            ]
        ]);
    }

    public function addPayment(Request $request, Invoice $invoice): JsonResponse
    {
        $maxAmount = $invoice->remaining_amount;

        $validated = $request->validate([
            'amount' => 'required|numeric|min:0.01|max:' . $maxAmount,
            'payment_method' => 'required|in:cash,card,transfer,check',
            'payment_date' => 'required|date',
            'reference' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
        ]);

        // Create payment
        $payment = $invoice->payments()->create([
            'amount' => $validated['amount'],
            'payment_method' => $validated['payment_method'],
            'payment_date' => $validated['payment_date'],
            'reference' => $validated['reference'] ?? null,
            'notes' => $validated['notes'] ?? null,
        ]);

        // Recompute invoice status
        $totalPaid = $invoice->payments()->sum('amount');
        if ($totalPaid >= $invoice->total_amount) {
            $invoice->update(['status' => 'paid']);
        } else {
            $invoice->update(['status' => 'partially_paid']);
        }

        return response()->json([
            'message' => 'Paiement enregistré avec succès',
            'payment' => $payment,
            'invoice' => $invoice->load(['patient', 'payments'])
        ], 201);
    }

    public function downloadPdf(Invoice $invoice)
    {
        $invoice->load(['patient', 'appointment.treatments', 'payments']);

        $pdf = Pdf::loadView('invoices.pdf', compact('invoice'));

        return $pdf->download('facture-' . str_pad($invoice->id, 5, '0', STR_PAD_LEFT) . '.pdf');
    }

    public function sendEmail(Request $request, Invoice $invoice): JsonResponse
    {
        $invoice->load(['patient', 'appointment.treatments', 'payments']);
        $email = $request->get('email') ?? $invoice->patient->email;

        if (!$email) {
            return response()->json(['error' => 'Aucune adresse email disponible pour ce patient.'], 422);
        }

        $pdf = Pdf::loadView('invoices.pdf', compact('invoice'));
        $pdfPath = 'invoices/facture-' . $invoice->id . '-' . time() . '.pdf';
        Storage::disk('local')->put($pdfPath, $pdf->output());

        try {
            Mail::to($email)->send(new InvoiceMail($invoice, Storage::disk('local')->path($pdfPath)));
            Storage::disk('local')->delete($pdfPath);
            return response()->json(['message' => 'Facture envoyée avec succès par e-mail.']);
        } catch (\Exception $e) {
            Storage::disk('local')->delete($pdfPath);
            return response()->json(['error' => 'Erreur lors de l\'envoi : ' . $e->getMessage()], 500);
        }
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'patient_id' => 'required|exists:patients,id',
            'appointment_id' => 'nullable|exists:appointments,id',
            'total_amount' => 'required|numeric|min:0',
            'invoice_date' => 'required|date',
            'notes' => 'nullable|string',
        ]);

        $validated['status'] = 'pending';
        
        $invoice = \App\Models\Invoice::create($validated);

        return response()->json([
            'message' => 'Facture créée avec succès.',
            'invoice' => $invoice->load('patient')
        ], 201);
    }
}
