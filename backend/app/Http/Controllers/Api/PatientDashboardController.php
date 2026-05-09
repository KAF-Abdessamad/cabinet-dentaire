<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\Invoice;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PatientDashboardController extends Controller
{
    /**
     * Get patient statistics.
     */
    public function stats(Request $request)
    {
        $user = Auth::user();
        $patient = $user->patient;

        if (!$patient) {
            return response()->json(['error' => 'Patient profile not found'], 404);
        }

        $upcomingAppointments = Appointment::where('patient_id', $patient->id)
            ->where('appointment_date', '>=', now())
            ->where('status', '!=', 'cancelled')
            ->count();

        $activeTreatments = Appointment::where('patient_id', $patient->id)
            ->whereHas('treatments')
            ->whereIn('status', ['pending', 'confirmed'])
            ->where('appointment_date', '>=', now()->toDateString())
            ->count();

        $profileComplete = !empty($patient->cin) && 
                           !empty($patient->blood_group) && 
                           !empty($patient->medical_history);

        return response()->json([
            'upcoming_appointments' => $upcomingAppointments,
            'active_treatments' => $activeTreatments,
            'profile_complete' => $profileComplete,
        ]);
    }

    /**
     * Get patient's upcoming appointments.
     */
    public function appointments(Request $request)
    {
        $user = Auth::user();
        $patient = $user->patient;

        if (!$patient) {
            return response()->json(['error' => 'Patient profile not found'], 404);
        }

        $appointments = Appointment::where('patient_id', $patient->id)
            ->where('appointment_date', '>=', now())
            ->where('status', '!=', 'cancelled')
            ->with(['dentist', 'treatments'])
            ->orderBy('appointment_date')
            ->orderBy('start_time')
            ->limit(5)
            ->get();

        return response()->json($appointments);
    }

    /**
     * Get patient's medical records.
     */
    public function medicalRecords(Request $request)
    {
        $user = Auth::user();
        $patient = $user->patient;

        if (!$patient) {
            return response()->json(['error' => 'Patient profile not found'], 404);
        }

        return response()->json([
            'patient' => $patient,
            'appointments' => $patient->appointments()
                ->with(['dentist', 'treatments'])
                ->orderBy('appointment_date', 'desc')
                ->get(),
            'medical_records' => $patient->medicalRecords()
                ->with('dentist')
                ->orderByDesc('record_date')
                ->get(),
        ]);
    }

    /**
     * Liste des utilisateurs ayant le rôle dentiste (prise de RDV / tests admin).
     */
    public function dentists(): JsonResponse
    {
        $dentists = User::role('dentiste')
            ->select('id', 'name')
            ->orderBy('name')
            ->get();

        return response()->json($dentists);
    }

    /**
     * Factures et paiements du patient connecté.
     */
    public function invoices(): JsonResponse
    {
        $user = Auth::user();
        $patient = $user->patient;

        if (!$patient) {
            return response()->json(['error' => 'Patient profile not found'], 404);
        }

        $invoices = Invoice::query()
            ->where('patient_id', $patient->id)
            ->with(['payments', 'appointment'])
            ->orderByDesc('invoice_date')
            ->get();

        return response()->json($invoices);
    }

    /**
     * Crée un rendez-vous pour le patient connecté.
     */
    public function storeAppointment(Request $request): JsonResponse
    {
        $user = Auth::user();
        $patient = $user->patient;

        if (!$patient) {
            return response()->json(['error' => 'Patient profile not found'], 404);
        }

        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'appointment_date' => 'required|date|after_or_equal:today',
            'start_time' => ['required', 'regex:/^\d{2}:\d{2}(:\d{2})?$/'],
            'end_time' => ['required', 'regex:/^\d{2}:\d{2}(:\d{2})?$/'],
            'reason' => 'nullable|string|max:500',
        ]);

        $isDentist = User::role('dentiste')->whereKey($validated['user_id'])->exists();
        if (!$isDentist) {
            return response()->json(['message' => 'Le professionnel sélectionné n’est pas un dentiste.'], 422);
        }

        if ($validated['end_time'] <= $validated['start_time']) {
            return response()->json(['message' => 'L’heure de fin doit être après l’heure de début.'], 422);
        }

        $conflict = Appointment::where('user_id', $validated['user_id'])
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
            return response()->json(['message' => 'Ce créneau n’est pas disponible pour ce dentiste.'], 422);
        }

        $data = [
            'patient_id' => $patient->id,
            'user_id' => $validated['user_id'],
            'appointment_date' => $validated['appointment_date'],
            'start_time' => $validated['start_time'],
            'end_time' => $validated['end_time'],
            'reason' => $validated['reason'] ?? null,
            'status' => 'pending',
        ];

        $appointment = Appointment::create($data)->load(['dentist']);

        return response()->json($appointment, 201);
    }
}
