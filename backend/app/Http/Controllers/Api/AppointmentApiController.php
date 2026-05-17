<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Services\AppointmentService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AppointmentApiController extends Controller
{
    protected $appointmentService;

    public function __construct(AppointmentService $appointmentService)
    {
        $this->appointmentService = $appointmentService;
    }

    public function checkAvailability(Request $request): JsonResponse
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'starts_at' => 'required|date',
            'ends_at' => 'required|date|after:starts_at',
            'exclude_id' => 'nullable|integer',
        ]);

        $isAvailable = $this->appointmentService->isAvailable(
            $request->user_id,
            Carbon::parse($request->starts_at),
            Carbon::parse($request->ends_at),
            $request->exclude_id
        );

        return response()->json(['available' => $isAvailable]);
    }

    public function index(Request $request): JsonResponse
    {
        $query = Appointment::with(['patient', 'dentist', 'treatment']);

        if ($request->get('scope') !== 'all') {
            if ($request->has('date')) {
                $query->whereDate('appointment_date', $request->get('date'));
            } else {
                $query->whereDate('appointment_date', Carbon::today());
            }
        }

        if ($request->has('status')) {
            $query->where('status', $request->get('status'));
        }

        $appointments = $query->orderBy('start_time')->get();

        return response()->json($appointments);
    }

    public function show(Appointment $appointment): JsonResponse
    {
        $appointment->load(['patient', 'dentist', 'treatments']);
        return response()->json($appointment);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'patient_id' => 'required|exists:patients,id',
            'user_id' => 'required|exists:users,id',
            'treatment_id' => 'nullable|exists:treatments,id',
            'appointment_date' => 'required|date',
            'start_time' => 'required',
            'end_time' => 'required|after:start_time',
            'reason' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
            'status' => 'nullable|in:requested,proposed,confirmed,completed,cancelled',
        ]);

        if ($this->appointmentDateIsClosed($validated['appointment_date'])) {
            return $this->closedCalendarDayError();
        }

        $startsAt = Carbon::parse($validated['appointment_date'] . ' ' . $validated['start_time']);
        $endsAt = Carbon::parse($validated['appointment_date'] . ' ' . $validated['end_time']);

        if (!$this->appointmentService->isAvailable($validated['user_id'], $startsAt, $endsAt)) {
            return response()->json(['error' => 'Le dentiste n\'est pas disponible sur ce créneau (marge de 5 min incluse).'], 422);
        }

        $appointment = Appointment::create($validated)->load(['patient', 'dentist', 'treatment']);
        return response()->json($appointment, 201);
    }

    public function update(Request $request, Appointment $appointment): JsonResponse
    {
        $validated = $request->validate([
            'patient_id' => 'sometimes|required|exists:patients,id',
            'user_id' => 'sometimes|required|exists:users,id',
            'treatment_id' => 'nullable|exists:treatments,id',
            'appointment_date' => 'sometimes|required|date',
            'start_time' => 'sometimes|required',
            'end_time' => 'sometimes|required|after:start_time',
            'status' => 'sometimes|required|in:requested,proposed,confirmed,completed,cancelled',
            'reason' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
            'admin_note' => 'nullable|string|max:2000',
        ]);

        // Check if transition is allowed
        if (isset($validated['status']) && !$this->appointmentService->canTransitionTo($appointment, $validated['status'])) {
            return response()->json(['error' => "Transition de statut non autorisée : {$appointment->status} -> {$validated['status']}"], 422);
        }

        $dentistId = (int) ($validated['user_id'] ?? $appointment->user_id);

        // Check availability if time or dentist changes
        if (isset($validated['appointment_date']) || isset($validated['start_time']) || isset($validated['end_time']) || isset($validated['user_id'])) {
            $date = $validated['appointment_date'] ?? ($appointment->appointment_date ? $appointment->appointment_date->format('Y-m-d') : null);
            if (!$date) {
                return response()->json(['error' => 'La date du rendez-vous est requise.'], 422);
            }

            if ($this->appointmentDateIsClosed($date)) {
                return $this->closedCalendarDayError();
            }

            $start = $validated['start_time'] ?? $appointment->start_time;
            $end = $validated['end_time'] ?? $appointment->end_time;
            if (!$start || !$end) {
                return response()->json(['error' => 'Les heures de début et de fin sont requises.'], 422);
            }

            $startsAt = Carbon::parse($date . ' ' . $start);
            $endsAt = Carbon::parse($date . ' ' . $end);

            if (!$dentistId) {
                return response()->json(['error' => 'Veuillez sélectionner un dentiste.'], 422);
            }

            if (!$this->appointmentService->isAvailable($dentistId, $startsAt, $endsAt, $appointment->id)) {
                return response()->json(['error' => 'Le dentiste n\'est pas disponible sur ce créneau.'], 422);
            }
        }

        try {
            $appointment->update($validated);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 422);
        }

        $appointment->load(['patient', 'dentist', 'treatment']);

        return response()->json($appointment);
    }

    public function destroy(Appointment $appointment): JsonResponse
    {
        $appointment->delete();
        return response()->json(['message' => 'Appointment deleted successfully']);
    }

    /** Jours fériés fixes (Maroc) — format Y-m-d */
    private function moroccoFixedHolidayDates(): array
    {
        return [
            '2025-01-01', '2025-01-11', '2025-01-14', '2025-05-01', '2025-07-30', '2025-08-14',
            '2025-08-20', '2025-08-21', '2025-11-06', '2025-11-18',
            '2026-01-01', '2026-01-11', '2026-01-14', '2026-05-01', '2026-07-30', '2026-08-14',
            '2026-08-20', '2026-08-21', '2026-11-06', '2026-11-18',
            '2027-01-01', '2027-01-11', '2027-01-14', '2027-05-01', '2027-07-30', '2027-08-14',
            '2027-08-20', '2027-08-21', '2027-11-06', '2027-11-18',
        ];
    }

    private function appointmentDateIsClosed(string $dateYmd): bool
    {
        $d = Carbon::parse($dateYmd)->startOfDay();
        if ($d->isSunday()) {
            return true;
        }

        return in_array($d->format('Y-m-d'), $this->moroccoFixedHolidayDates(), true);
    }

    private function closedCalendarDayError(): JsonResponse
    {
        return response()->json([
            'error' => 'Les rendez-vous ne peuvent pas être planifiés un dimanche ni un jour férié (calendrier marocain, jours fériés fixes).',
        ], 422);
    }
}
