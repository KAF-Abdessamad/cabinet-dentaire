<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\Invoice;
use App\Models\Patient;
use App\Models\Treatment;
use App\Models\User;
use App\Mail\AppointmentConfirmationMail;
use Illuminate\Http\Request;
use Illuminate\View\View;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Carbon\Carbon;

class PatientPortalController extends Controller
{
    public function showRegistrationForm(): View
    {
        return view('patient.register');
    }

    public function register(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'first_name' => 'required|string|max:100',
            'last_name' => 'required|string|max:100',
            'email' => 'required|email|unique:patients,email|unique:users,email',
            'phone' => 'required|string|max:20',
            'birth_date' => 'nullable|date',
            'address' => 'nullable|string|max:255',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $patient = Patient::create([
            'first_name' => $validated['first_name'],
            'last_name' => $validated['last_name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'],
            'birth_date' => $validated['birth_date'] ?? null,
            'address' => $validated['address'] ?? null,
        ]);

        $user = User::create([
            'name' => $validated['first_name'] . ' ' . $validated['last_name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'patient_id' => $patient->id,
        ]);

        $user->assignRole('patient');

        Auth::login($user);

        return redirect()->route('patient.dashboard')
            ->with('success', 'Votre compte a été créé avec succès !');
    }

    public function dashboard(): View
    {
        $user = Auth::user();
        $patient = $user->patient;

        if (!$patient) {
            return view('patient.dashboard', [
                'upcomingAppointments' => collect(),
                'pastAppointments' => collect(),
                'invoices' => collect(),
                'patient' => null,
            ]);
        }

        $upcomingAppointments = Appointment::with(['dentist'])
            ->where('patient_id', $patient->id)
            ->whereDate('appointment_date', '>=', Carbon::today())
            ->where('status', '!=', 'cancelled')
            ->orderBy('appointment_date')
            ->orderBy('start_time')
            ->get();

        $pastAppointments = Appointment::with(['dentist', 'treatments'])
            ->where('patient_id', $patient->id)
            ->whereDate('appointment_date', '<', Carbon::today())
            ->orWhere('status', 'completed')
            ->orderBy('appointment_date', 'desc')
            ->limit(5)
            ->get();

        $invoices = Invoice::where('patient_id', $patient->id)
            ->with(['appointment'])
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        return view('patient.dashboard', compact(
            'upcomingAppointments',
            'pastAppointments',
            'invoices',
            'patient'
        ));
    }

    public function showBookingForm(): View
    {
        $dentists = User::role('dentist')->get();
        $treatments = Treatment::all();

        return view('patient.book', compact('dentists', 'treatments'));
    }

    public function bookAppointment(Request $request): RedirectResponse
    {
        $user = Auth::user();
        $patient = $user->patient;

        if (!$patient) {
            return back()->with('error', 'Profil patient non trouvé.');
        }

        $validated = $request->validate([
            'dentist_id' => 'required|exists:users,id',
            'appointment_date' => 'required|date|after_or_equal:today',
            'start_time' => 'required',
            'end_time' => 'required|after:start_time',
            'reason' => 'required|string|max:255',
        ]);

        $conflict = Appointment::where('user_id', $validated['dentist_id'])
            ->where('appointment_date', $validated['appointment_date'])
            ->where('status', '!=', 'cancelled')
            ->where(function ($query) use ($validated) {
                $query->whereBetween('start_time', [$validated['start_time'], $validated['end_time']])
                      ->orWhereBetween('end_time', [$validated['start_time'], $validated['end_time']])
                      ->orWhere(function ($q) use ($validated) {
                          $q->where('start_time', '<=', $validated['start_time'])
                            ->where('end_time', '>=', $validated['end_time']);
                      });
            })
            ->exists();

        if ($conflict) {
            return back()->withErrors(['start_time' => 'Ce créneau horaire n\'est pas disponible.'])->withInput();
        }

        $appointment = Appointment::create([
            'patient_id' => $patient->id,
            'user_id' => $validated['dentist_id'],
            'appointment_date' => $validated['appointment_date'],
            'start_time' => $validated['start_time'],
            'end_time' => $validated['end_time'],
            'status' => 'pending',
            'reason' => $validated['reason'],
        ]);

        $appointment->load('patient', 'dentist');

        if ($appointment->patient->email) {
            Mail::to($appointment->patient->email)->send(new AppointmentConfirmationMail($appointment));
        }

        return redirect()->route('patient.dashboard')
            ->with('success', 'Votre rendez-vous a été demandé. Vous recevrez une confirmation par email.');
    }

    public function cancelAppointment(Appointment $appointment): RedirectResponse
    {
        $user = Auth::user();
        $patient = $user->patient;

        if (!$patient || $appointment->patient_id !== $patient->id) {
            return back()->with('error', 'Vous n\'êtes pas autorisé à annuler ce rendez-vous.');
        }

        if ($appointment->status === 'completed') {
            return back()->with('error', 'Impossible d\'annuler un rendez-vous déjà effectué.');
        }

        $appointment->update(['status' => 'cancelled']);

        return back()->with('success', 'Rendez-vous annulé avec succès.');
    }
}
