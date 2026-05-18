<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\Invoice;
use App\Models\User;
use App\Models\Treatment;
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
            'unread_notifications' => Auth::user()->unreadNotifications()->count(),
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
            ->with(['dentist', 'treatment'])
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
                ->with(['dentist', 'treatment'])
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
     * Liste des traitements disponibles pour la demande de RDV.
     */
    public function treatments(): JsonResponse
    {
        $treatments = Treatment::select('id', 'name', 'price', 'description')
            ->orderBy('name')
            ->get();

        return response()->json($treatments);
    }

    /**
     * Enregistrer un nouveau soin dans le cabinet (Admin uniquement).
     */
    public function storeTreatment(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100|unique:treatments,name',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
        ]);

        $treatment = Treatment::create($validated);

        return response()->json($treatment, 201);
    }

    /**
     * Get a list of closed holidays (Morocco fixed dates + Dynamic DB).
     */
    public function holidays(): JsonResponse
    {
        $dbHolidays = \App\Models\Holiday::all()->map(function($h) {
            return $h->date instanceof \Carbon\Carbon ? $h->date->format('Y-m-d') : substr($h->date, 0, 10);
        })->toArray();

        $staticHolidays = [
            '2025-01-01', '2025-01-11', '2025-01-14', '2025-05-01', '2025-07-30', '2025-08-14',
            '2025-08-20', '2025-08-21', '2025-11-06', '2025-11-18',
            '2026-01-01', '2026-01-11', '2026-01-14', '2026-05-01', '2026-07-30', '2026-08-14',
            '2026-08-20', '2026-08-21', '2026-11-06', '2026-11-18',
            '2027-01-01', '2027-01-11', '2027-01-14', '2027-05-01', '2027-07-30', '2027-08-14',
            '2027-08-20', '2027-08-21', '2027-11-06', '2027-11-18',
        ];

        $allHolidays = array_unique(array_merge($dbHolidays, $staticHolidays));
        sort($allHolidays);

        return response()->json($allHolidays);
    }

    /**
     * Get available 30-min slots for a given dentist, care type, and date.
     */
    public function availableSlots(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'date' => 'required|date_format:Y-m-d',
            'dentist_id' => 'required|exists:users,id',
            'care_type_id' => 'required|exists:treatments,id',
        ]);

        $date = $validated['date'];
        $dentistId = (int)$validated['dentist_id'];

        // Sunday or Holiday check
        $carbonDate = \Carbon\Carbon::parse($date)->startOfDay();
        $holidays = [
            '2025-01-01', '2025-01-11', '2025-01-14', '2025-05-01', '2025-07-30', '2025-08-14',
            '2025-08-20', '2025-08-21', '2025-11-06', '2025-11-18',
            '2026-01-01', '2026-01-11', '2026-01-14', '2026-05-01', '2026-07-30', '2026-08-14',
            '2026-08-20', '2026-08-21', '2026-11-06', '2026-11-18',
            '2027-01-01', '2027-01-11', '2027-01-14', '2027-05-01', '2027-07-30', '2027-08-14',
            '2027-08-20', '2027-08-21', '2027-11-06', '2027-11-18',
        ];

        if ($carbonDate->isSunday() || in_array($date, $holidays, true)) {
            return response()->json([]);
        }

        // Daily working hours: 08:00 to 12:30 and 14:00 to 18:00
        $allSlots = [
            '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30',
            '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
        ];

        $availableSlots = [];
        $appointmentService = app(\App\Services\AppointmentService::class);

        foreach ($allSlots as $slot) {
            $startsAt = \Carbon\Carbon::parse($date . ' ' . $slot);
            $endsAt = (clone $startsAt)->addMinutes(30);

            // Must be in the future
            if ($startsAt->isPast()) {
                continue;
            }

            // Dentist availability checks
            if ($appointmentService->isAvailable($dentistId, $startsAt, $endsAt)) {
                $availableSlots[] = $slot;
            }
        }

        return response()->json($availableSlots);
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
            'treatment_id' => 'required|exists:treatments,id',
            'patient_note' => 'nullable|string|max:1000',
            'dentist_id' => 'nullable|exists:users,id',
            'appointment_date' => 'nullable|date_format:Y-m-d',
            'start_time' => 'nullable|string',
        ]);

        // Slot-based direct booking
        if (!empty($validated['appointment_date']) && !empty($validated['start_time']) && !empty($validated['dentist_id'])) {
            $date = $validated['appointment_date'];
            $startTime = $validated['start_time'];
            $dentistId = (int)$validated['dentist_id'];

            // 1. Block Sundays & Holidays
            $carbonDate = \Carbon\Carbon::parse($date)->startOfDay();
            $holidays = [
                '2025-01-01', '2025-01-11', '2025-01-14', '2025-05-01', '2025-07-30', '2025-08-14',
                '2025-08-20', '2025-08-21', '2025-11-06', '2025-11-18',
                '2026-01-01', '2026-01-11', '2026-01-14', '2026-05-01', '2026-07-30', '2026-08-14',
                '2026-08-20', '2026-08-21', '2026-11-06', '2026-11-18',
                '2027-01-01', '2027-01-11', '2027-01-14', '2027-05-01', '2027-07-30', '2027-08-14',
                '2027-08-20', '2027-08-21', '2027-11-06', '2027-11-18',
            ];
            if ($carbonDate->isSunday() || in_array($date, $holidays, true)) {
                return response()->json(['message' => 'Le cabinet est fermé ce jour.'], 422);
            }

            $startsAt = \Carbon\Carbon::parse($date . ' ' . $startTime);
            $endsAt = (clone $startsAt)->addMinutes(30);

            // 2. Check dentist availability
            $appointmentService = app(\App\Services\AppointmentService::class);
            if (!$appointmentService->isAvailable($dentistId, $startsAt, $endsAt)) {
                return response()->json(['message' => 'Ce créneau vient d\'être pris par un autre patient. Veuillez choisir un autre horaire.'], 409);
            }

            // 3. Durée minimum entre deux RDV du même patient: configurable (default: 24h)
            $minHours = (int) env('MIN_HOURS_BETWEEN_APPOINTMENTS', 24);
            $hasCloseAppointment = Appointment::where('patient_id', $patient->id)
                ->where('status', 'confirmed')
                ->where(function ($query) use ($startsAt, $minHours) {
                    $query->whereBetween('starts_at', [
                        (clone $startsAt)->subHours($minHours),
                        (clone $startsAt)->addHours($minHours)
                    ]);
                })
                ->exists();

            if ($hasCloseAppointment) {
                return response()->json([
                    'message' => "❌ Durée minimum entre deux RDV du même patient non respectée. (Minimum {$minHours}h requises entre chaque rendez-vous)."
                ], 422);
            }

            // Create appointment
            $appointment = Appointment::create([
                'patient_id' => $patient->id,
                'user_id' => $dentistId,
                'treatment_id' => $validated['treatment_id'],
                'appointment_date' => $date,
                'start_time' => $startTime,
                'end_time' => $endsAt->format('H:i'),
                'patient_note' => $validated['patient_note'] ?? null,
                'status' => 'confirmed',
            ])->load(['treatment', 'dentist']);

            // Notify admins about the confirmed appointment
            $admins = User::role('admin')->get();
            foreach ($admins as $admin) {
                \App\Models\Notification::create([
                    'user_id' => $admin->id,
                    'title' => 'Nouveau RDV en ligne',
                    'message' => "Le patient {$patient->full_name} a planifié et confirmé un RDV pour le {$date} à {$startTime} (Soin : " . ($appointment->treatment->name ?? 'Soin') . ")",
                    'type' => 'success',
                    'link' => '/admin/appointments/' . $appointment->id,
                ]);
            }

            return response()->json($appointment, 201);
        }

        // Standard fallback appointment request
        $data = [
            'patient_id' => $patient->id,
            'treatment_id' => $validated['treatment_id'],
            'patient_note' => $validated['patient_note'] ?? null,
            'status' => 'requested',
        ];

        $appointment = Appointment::create($data)->load(['treatment']);

        // Notify admins about the new appointment request
        $admins = User::role('admin')->get();
        foreach ($admins as $admin) {
            \App\Models\Notification::create([
                'user_id' => $admin->id,
                'title' => 'Nouvelle demande de RDV',
                'message' => "Le patient {$patient->full_name} a demandé un rendez-vous pour : " . ($appointment->treatment->name ?? 'Soin'),
                'type' => 'info',
                'link' => '/admin/appointments/' . $appointment->id,
            ]);
        }

        return response()->json($appointment, 201);
    }

    /**
     * Confirme une proposition de rendez-vous.
     */
    public function confirmAppointment(Appointment $appointment): JsonResponse
    {
        $user = Auth::user();
        $patient = $user->patient;

        if ($appointment->patient_id !== $patient->id) {
            return response()->json(['message' => 'Action non autorisée.'], 403);
        }

        if ($appointment->status !== 'proposed') {
            return response()->json(['message' => 'Ce rendez-vous ne peut pas être confirmé.'], 422);
        }

        // Check if slot is still available
        $conflict = Appointment::where('user_id', $appointment->user_id)
            ->where('appointment_date', $appointment->appointment_date)
            ->where('id', '!=', $appointment->id)
            ->where('status', 'confirmed')
            ->where(function ($query) use ($appointment) {
                $query->whereBetween('start_time', [$appointment->start_time, $appointment->end_time])
                      ->orWhereBetween('end_time', [$appointment->start_time, $appointment->end_time])
                      ->orWhere(function ($q) use ($appointment) {
                          $q->where('start_time', '<=', $appointment->start_time)
                            ->where('end_time', '>=', $appointment->end_time);
                      });
            })
            ->exists();

        if ($conflict) {
            return response()->json(['message' => 'Désolé, ce créneau n\'est plus disponible. Veuillez nous contacter ou attendre une nouvelle proposition.'], 422);
        }

        $appointment->update(['status' => 'confirmed']);

        // Notify admins about the confirmation
        $admins = User::role('admin')->get();
        foreach ($admins as $admin) {
            \App\Models\Notification::create([
                'user_id' => $admin->id,
                'title' => 'RDV Confirmé par le patient',
                'message' => "Le patient {$patient->full_name} a accepté la proposition de créneau pour le " . $appointment->appointment_date->format('d/m/Y'),
                'type' => 'success',
                'link' => '/admin/appointments/' . $appointment->id,
            ]);
        }

        return response()->json(['message' => 'Rendez-vous confirmé avec succès.', 'appointment' => $appointment->load('dentist', 'treatment')]);
    }

    /**
     * Refuse une proposition de rendez-vous.
     */
    public function rejectAppointment(Appointment $appointment): JsonResponse
    {
        $user = Auth::user();
        $patient = $user->patient;

        if ($appointment->patient_id !== $patient->id) {
            return response()->json(['message' => 'Action non autorisée.'], 403);
        }

        if ($appointment->status !== 'proposed') {
            return response()->json(['message' => 'Cette proposition ne peut pas être refusée.'], 422);
        }

        $appointment->update(['status' => 'requested', 'appointment_date' => null, 'start_time' => null, 'end_time' => null]);

        // Notify admins about the rejection
        $admins = User::role('admin')->get();
        foreach ($admins as $admin) {
            \App\Models\Notification::create([
                'user_id' => $admin->id,
                'title' => 'Proposition de RDV refusée',
                'message' => "Le patient {$patient->full_name} a refusé la proposition de créneau. Sa demande est repassée en attente.",
                'type' => 'warning',
                'link' => '/admin/appointments/' . $appointment->id,
            ]);
        }

        return response()->json(['message' => 'Proposition refusée. Votre demande repasse en attente.', 'appointment' => $appointment->load('treatment')]);
    }

    /**
     * Annule un rendez-vous (patient).
     */
    public function cancelAppointment(Appointment $appointment): JsonResponse
    {
        $user = Auth::user();
        $patient = $user->patient;

        if (!$patient || $appointment->patient_id !== $patient->id) {
            return response()->json(['message' => 'Action non autorisée.'], 403);
        }

        if (in_array($appointment->status, ['completed', 'cancelled'], true)) {
            return response()->json(['message' => 'Ce rendez-vous ne peut pas être annulé.'], 422);
        }

        $appointment->update(['status' => 'cancelled']);

        return response()->json([
            'message' => 'Rendez-vous annulé.',
            'appointment' => $appointment->load(['dentist', 'treatment']),
        ]);
    }
}
