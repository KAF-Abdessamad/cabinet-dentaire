<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\Patient;
use App\Models\User;
use App\Models\Invoice;
use App\Models\Treatment;
use App\Mail\AppointmentConfirmationMail;
use App\Mail\AppointmentReminderMail;
use App\Http\Requests\StoreAppointmentRequest;
use Illuminate\Http\Request;
use Illuminate\View\View;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class AppointmentController extends Controller
{
    public function index(Request $request): View
    {
        Gate::authorize('viewAny', Appointment::class);

        $query = Appointment::with(['patient', 'dentist', 'treatment']);

        if ($request->has('date') && $request->get('date')) {
            $query->whereDate('appointment_date', $request->get('date'));
        }

        if ($request->has('status') && $request->get('status')) {
            $query->where('status', $request->get('status'));
        }

        if ($request->has('patient') && $request->get('patient')) {
            $query->whereHas('patient', function($q) use ($request) {
                $q->where('first_name', 'like', '%' . $request->get('patient') . '%')
                  ->orWhere('last_name', 'like', '%' . $request->get('patient') . '%');
            });
        }

        $appointments = $query->orderByRaw("CASE WHEN status = 'requested' THEN 1 WHEN status = 'proposed' THEN 2 ELSE 3 END")
            ->orderByDesc('created_at')
            ->paginate(15);

        $patients = Patient::orderBy('last_name')->get();
        $dentists = User::role('dentiste')->get();
        $availableTreatments = Treatment::all();

        return view('appointments.index', compact('appointments', 'patients', 'dentists', 'availableTreatments'));
    }

    /**
     * Affiche le formulaire pour proposer un créneau à un patient.
     */
    public function propose(Appointment $appointment): View
    {
        Gate::authorize('update', $appointment);
        
        $dentists = User::role('dentiste')->get();
        $treatments = Treatment::all();
        
        return view('appointments.propose', compact('appointment', 'dentists', 'treatments'));
    }

    /**
     * Enregistre la proposition de créneau.
     */
    public function storeProposal(Request $request, Appointment $appointment): RedirectResponse
    {
        Gate::authorize('update', $appointment);

        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'appointment_date' => 'required|date|after_or_equal:today',
            'start_time' => 'required',
            'duration' => 'required|integer|min:15',
            'admin_note' => 'nullable|string|max:1000',
        ]);

        $startTime = Carbon::parse($validated['appointment_date'] . ' ' . $validated['start_time']);
        $endTime = (clone $startTime)->addMinutes($validated['duration']);

        // Conflict check
        $conflict = Appointment::where('user_id', $validated['user_id'])
            ->where('appointment_date', $validated['appointment_date'])
            ->where('id', '!=', $appointment->id)
            ->whereIn('status', ['confirmed', 'proposed'])
            ->where(function ($query) use ($startTime, $endTime) {
                $query->whereBetween('start_time', [$startTime->format('H:i'), $endTime->format('H:i')])
                      ->orWhereBetween('end_time', [$startTime->format('H:i'), $endTime->format('H:i')])
                      ->orWhere(function ($q) use ($startTime, $endTime) {
                          $q->where('start_time', '<=', $startTime->format('H:i'))
                            ->where('end_time', '>=', $endTime->format('H:i'));
                      });
            })
            ->exists();

        if ($conflict) {
            return back()->withErrors(['start_time' => 'Ce créneau est déjà occupé par un autre rendez-vous confirmé.'])->withInput();
        }

        $appointment->update([
            'user_id' => $validated['user_id'],
            'appointment_date' => $validated['appointment_date'],
            'start_time' => $startTime->format('H:i'),
            'end_time' => $endTime->format('H:i'),
            'admin_note' => $validated['admin_note'],
            'status' => 'proposed',
        ]);

        // Notify the patient about the proposal
        if ($appointment->patient && $appointment->patient->user_id) {
            \App\Models\Notification::create([
                'user_id' => $appointment->patient->user_id,
                'title' => 'Nouvelle proposition de créneau',
                'message' => "Le cabinet vous propose un rendez-vous le " . $startTime->format('d/m/Y') . " à " . $startTime->format('H:i') . ". Veuillez confirmer ou refuser.",
                'type' => 'info',
            ]);
        }

        return redirect()->route('appointments.show', $appointment)->with('success', 'Proposition de créneau envoyée au patient.');
    }

    public function create(): View
    {
        Gate::authorize('create', Appointment::class);

        $patients = Patient::orderBy('last_name')->orderBy('first_name')->get();
        $dentists = User::role('dentiste')->get();
        $treatments = Treatment::orderBy('name')->get();

        return view('appointments.create', compact('patients', 'dentists', 'treatments'));
    }

    public function show(Appointment $appointment): View
    {
        Gate::authorize('view', $appointment);

        $appointment->load(['patient', 'dentist', 'treatments', 'invoice']);

        return view('appointments.show', compact('appointment'));
    }

    public function edit(Appointment $appointment): View
    {
        Gate::authorize('update', $appointment);

        $patients = Patient::orderBy('last_name')->orderBy('first_name')->get();
        $dentists = User::role('dentiste')->get();
        $treatments = Treatment::orderBy('name')->get();

        return view('appointments.edit', compact('appointment', 'patients', 'dentists', 'treatments'));
    }

    public function store(StoreAppointmentRequest $request): RedirectResponse
    {
        Gate::authorize('create', Appointment::class);

        $data = $request->validated();

        if (isset($data['appointment_date']) && isset($data['start_time']) && isset($data['user_id'])) {
            $conflict = Appointment::where('user_id', $data['user_id'])
                ->where('appointment_date', $data['appointment_date'])
                ->where('status', 'confirmed')
                ->where(function ($query) use ($data) {
                    $query->whereBetween('start_time', [$data['start_time'], $data['end_time']])
                        ->orWhereBetween('end_time', [$data['start_time'], $data['end_time']])
                        ->orWhere(function ($q) use ($data) {
                            $q->where('start_time', '<=', $data['start_time'])
                                ->where('end_time', '>=', $data['end_time']);
                        });
                })
                ->exists();

            if ($conflict) {
                return back()->withErrors(['start_time' => 'Le dentiste n\'est pas disponible sur ce créneau horaire.'])->withInput();
            }
        }

        $appointment = Appointment::create($data);
        $appointment->load('patient', 'dentist');

        if ($appointment->patient->email && $appointment->status === 'confirmed') {
            Mail::to($appointment->patient->email)->send(new AppointmentConfirmationMail($appointment));
        }

        return redirect()->route('appointments.index')
            ->with('success', 'Rendez-vous enregistré avec succès. Un email de confirmation a été envoyé au patient.');
    }

    public function update(Request $request, Appointment $appointment): RedirectResponse
    {
        Gate::authorize('update', $appointment);

        $validated = $request->validate([
            'status' => 'required|in:pending,confirmed,completed,cancelled,no_show,requested,proposed',
        ]);

        $oldStatus = $appointment->status;
        $appointment->update($validated);

        if ($appointment->status === 'completed' && $oldStatus !== 'completed') {
            $totalAmount = $appointment->treatments->sum(function($treatment) {
                return $treatment->pivot->applied_price * $treatment->pivot->quantity;
            });

            if (!$appointment->invoice && $totalAmount > 0) {
                Invoice::create([
                    'patient_id' => $appointment->patient_id,
                    'appointment_id' => $appointment->id,
                    'total_amount' => $totalAmount,
                    'status' => 'pending',
                    'invoice_date' => now(),
                ]);
            }
        }

        return back()->with('success', 'Statut mis à jour.');
    }

    public function sendReminder(Appointment $appointment): RedirectResponse
    {
        Gate::authorize('update', $appointment);

        $appointment->load('patient', 'dentist');

        if (!$appointment->patient->email) {
            return back()->with('error', 'Le patient n\'a pas d\'adresse email.');
        }

        Mail::to($appointment->patient->email)->send(new AppointmentReminderMail($appointment));

        return back()->with('success', 'Rappel envoyé par email avec succès.');
    }

    public function addTreatment(Request $request, Appointment $appointment): RedirectResponse
    {
        Gate::authorize('update', $appointment);

        $validated = $request->validate([
            'treatment_id' => 'required|exists:treatments,id',
            'quantity' => 'required|integer|min:1',
            'notes' => 'nullable|string|max:500',
        ]);

        $treatment = Treatment::find($validated['treatment_id']);

        $appointment->treatments()->attach($treatment->id, [
            'applied_price' => $treatment->price,
            'quantity' => $validated['quantity'],
            'notes' => $validated['notes'],
        ]);

        // Recalculate invoice if it exists
        if ($appointment->invoice) {
            $totalAmount = $appointment->treatments()->sum(DB::raw('applied_price * quantity'));
            $appointment->invoice->update(['total_amount' => $totalAmount]);
        }

        return back()->with('success', 'Soin ajouté au rendez-vous.');
    }

    public function destroy(Appointment $appointment): RedirectResponse
    {
        Gate::authorize('delete', $appointment);

        if ($appointment->invoice) {
            return back()->with('error', 'Impossible de supprimer un rendez-vous avec une facture associée.');
        }

        $appointment->delete();

        return redirect()->route('appointments.index')
            ->with('success', 'Rendez-vous supprimé.');
    }
}
