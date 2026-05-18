<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\Holiday;
use App\Services\AppointmentService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use App\Jobs\SendAppointmentConfirmationJob;

class AppointmentApiController extends Controller
{
    protected $appointmentService;

    public function __construct(AppointmentService $appointmentService)
    {
        $this->appointmentService = $appointmentService;
    }

    private function getTreatmentDuration(string $treatmentName): int
    {
        $name = mb_strtolower($treatmentName, 'UTF-8');
        if (str_contains($name, 'détartrage') || str_contains($name, 'detartrage')) return 30;
        if (str_contains($name, 'consultation')) return 30;
        if (str_contains($name, 'extraction')) return 60;
        if (str_contains($name, 'plombage')) return 45;
        if (str_contains($name, 'blanchiment')) return 60;
        if (str_contains($name, 'implant')) return 90;
        return 30; // default duration
    }

    public function getAvailableSlots(Request $request): JsonResponse
    {
        $request->validate([
            'date' => 'required|date_format:Y-m-d',
            'user_id' => 'required|exists:users,id',
            'duration' => 'nullable|integer|min:15',
        ]);

        $date = $request->date;
        $dentistId = (int) $request->user_id;
        $duration = (int) ($request->duration ?? 30);

        $carbonDate = Carbon::parse($date)->startOfDay();

        // 1. Sunday check
        if ($this->appointmentService->isSunday($carbonDate)) {
            return response()->json([]);
        }

        // 2. Holiday check
        if ($this->appointmentService->isHoliday($carbonDate)) {
            return response()->json([]);
        }

        // Standard 30-min intervals
        $allSlots = [
            '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30',
            '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30'
        ];

        $availableSlots = [];

        foreach ($allSlots as $slot) {
            $startsAt = Carbon::parse($date . ' ' . $slot);
            $endsAt = (clone $startsAt)->addMinutes($duration);

            // Time must be inside cabinet open hours
            if ($this->appointmentService->isOutsideOpeningHours($startsAt, $endsAt)) {
                continue;
            }

            // Must be future
            if ($startsAt->isPast()) {
                continue;
            }

            if ($this->appointmentService->isAvailable($dentistId, $startsAt, $endsAt)) {
                $availableSlots[] = $slot;
            }
        }

        return response()->json($availableSlots);
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
            'end_time' => 'nullable',
            'reason' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
            'status' => 'nullable|in:requested,proposed,confirmed,completed,cancelled',
        ]);

        $date = $validated['appointment_date'];
        $startTime = $validated['start_time'];
        $dentistId = (int)$validated['user_id'];
        
        $start = Carbon::parse($date . ' ' . $startTime);

        // Get treatment duration
        $duration = 30;
        if (!empty($validated['treatment_id'])) {
            $treatment = \App\Models\Treatment::find($validated['treatment_id']);
            if ($treatment) {
                $duration = $this->getTreatmentDuration($treatment->name);
            }
        }
        
        $end = $start->copy()->addMinutes($duration);
        $validated['end_time'] = $end->format('H:i:s');

        // Order of verification:
        // 1. Sunday
        if ($this->appointmentService->isSunday($start)) {
            return response()->json(['error' => 'Le cabinet est fermé le dimanche.'], 422);
        }

        // 2. Holiday
        if ($this->appointmentService->isHoliday($start)) {
            return response()->json(['error' => 'Ce jour est un jour férié — le cabinet est fermé.'], 422);
        }

        // 3. Hors horaires
        if ($this->appointmentService->isOutsideOpeningHours($start, $end)) {
            return response()->json(['error' => 'L\'heure choisie est en dehors des horaires d\'ouverture du cabinet.'], 422);
        }

        // 4. Double RDV même patient
        if (env('ONE_APPOINTMENT_PER_DAY_PER_PATIENT', false)) {
            $exists = Appointment::where('patient_id', $validated['patient_id'])
                ->whereDate('appointment_date', $start->toDateString())
                ->whereNotIn('status', ['cancelled'])
                ->exists();
            if ($exists) {
                return response()->json(['error' => 'Ce patient a déjà un rendez-vous ce jour-là.'], 422);
            }
        }

        // 5. Conflit chevauchement avec lock pessimiste
        try {
            $appointment = DB::transaction(function() use ($validated, $dentistId, $start, $end) {
                // Pessimistic lock
                $conflict = Appointment::where('user_id', $dentistId)
                    ->lockForUpdate()
                    ->whereNotIn('status', ['cancelled'])
                    ->where(function($query) use ($start, $end) {
                        $query->where('starts_at', '<', $end)
                              ->where('ends_at', '>', $start);
                    })
                    ->exists();

                if ($conflict) {
                    throw new \Exception('Ce créneau est déjà réservé par un autre patient.');
                }

                // Force status to confirmed for admin bookings unless specified
                $validated['status'] = $validated['status'] ?? 'confirmed';

                return Appointment::create($validated);
            });

            // Dispatch Queued Confirmation Mail
            if ($appointment->status === 'confirmed') {
                SendAppointmentConfirmationJob::dispatch($appointment);
            }

            return response()->json($appointment->load(['patient', 'dentist', 'treatment']), 201);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 409);
        }
    }

    public function update(Request $request, Appointment $appointment): JsonResponse
    {
        $validated = $request->validate([
            'patient_id' => 'sometimes|required|exists:patients,id',
            'user_id' => 'sometimes|required|exists:users,id',
            'treatment_id' => 'nullable|exists:treatments,id',
            'appointment_date' => 'sometimes|required|date',
            'start_time' => 'sometimes|required',
            'end_time' => 'nullable',
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
        $patientId = (int) ($validated['patient_id'] ?? $appointment->patient_id);
        $date = $validated['appointment_date'] ?? $appointment->appointment_date->format('Y-m-d');
        $startTime = $validated['start_time'] ?? $appointment->start_time;

        $start = Carbon::parse($date . ' ' . $startTime);

        // Get treatment duration
        $treatmentId = $validated['treatment_id'] ?? $appointment->treatment_id;
        $duration = 30;
        if ($treatmentId) {
            $treatment = \App\Models\Treatment::find($treatmentId);
            if ($treatment) {
                $duration = $this->getTreatmentDuration($treatment->name);
            }
        }
        
        $end = $start->copy()->addMinutes($duration);
        $validated['end_time'] = $end->format('H:i:s');

        // Order of verification:
        // 1. Sunday
        if ($this->appointmentService->isSunday($start)) {
            return response()->json(['error' => 'Le cabinet est fermé le dimanche.'], 422);
        }

        // 2. Holiday
        if ($this->appointmentService->isHoliday($start)) {
            return response()->json(['error' => 'Ce jour est un jour férié — le cabinet est fermé.'], 422);
        }

        // 3. Hors horaires
        if ($this->appointmentService->isOutsideOpeningHours($start, $end)) {
            return response()->json(['error' => 'L\'heure choisie est en dehors des horaires d\'ouverture du cabinet.'], 422);
        }

        // 4. Double RDV même patient
        if (env('ONE_APPOINTMENT_PER_DAY_PER_PATIENT', false)) {
            $exists = Appointment::where('patient_id', $patientId)
                ->where('id', '!=', $appointment->id)
                ->whereDate('appointment_date', $start->toDateString())
                ->whereNotIn('status', ['cancelled'])
                ->exists();
            if ($exists) {
                return response()->json(['error' => 'Ce patient a déjà un rendez-vous ce jour-là.'], 422);
            }
        }

        // 5. Conflit chevauchement avec lock pessimiste
        try {
            $oldStatus = $appointment->status;
            DB::transaction(function() use ($validated, $dentistId, $start, $end, $appointment) {
                // Pessimistic lock
                $conflict = Appointment::where('user_id', $dentistId)
                    ->where('id', '!=', $appointment->id)
                    ->lockForUpdate()
                    ->whereNotIn('status', ['cancelled'])
                    ->where(function($query) use ($start, $end) {
                        $query->where('starts_at', '<', $end)
                              ->where('ends_at', '>', $start);
                    })
                    ->exists();

                if ($conflict) {
                    throw new \Exception('Ce créneau est déjà réservé par un autre patient.');
                }

                $oldStatus = $appointment->status;
                $appointment->update($validated);

                if ($appointment->status === 'completed' && $oldStatus !== 'completed') {
                    $totalAmount = $appointment->treatments->sum(function($treatment) {
                        return $treatment->pivot->applied_price * $treatment->pivot->quantity;
                    });
                    
                    if ($totalAmount === 0 && $appointment->treatment) {
                        $totalAmount = $appointment->treatment->price;
                    }

                    if (!$appointment->invoice && $totalAmount > 0) {
                        \App\Models\Invoice::create([
                            'patient_id' => $appointment->patient_id,
                            'appointment_id' => $appointment->id,
                            'total_amount' => $totalAmount,
                            'status' => 'pending',
                            'invoice_date' => now(),
                        ]);
                    }
                }
            });

            // Dispatch notification triggers post-update
            if ($appointment->status === 'confirmed' && $oldStatus !== 'confirmed') {
                SendAppointmentConfirmationJob::dispatch($appointment);
            } elseif ($appointment->status === 'cancelled' && $oldStatus !== 'cancelled') {
                if ($appointment->patient && $appointment->patient->email) {
                    try {
                        Mail::to($appointment->patient->email)
                            ->send(new \App\Mail\AppointmentCancellationMail($appointment));
                    } catch (\Exception $ex) {
                        Log::error("Failed to send cancellation email: " . $ex->getMessage());
                    }
                }
            }

            return response()->json($appointment->load(['patient', 'dentist', 'treatment']));
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 409);
        }
    }

    public function destroy(Appointment $appointment): JsonResponse
    {
        $appointment->delete();
        return response()->json(['message' => 'Appointment deleted successfully']);
    }

    // Holidays Admin Management
    public function getHolidays(): JsonResponse
    {
        return response()->json(Holiday::orderBy('date')->get());
    }

    public function storeHoliday(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'date' => 'required|date|unique:holidays,date',
            'label' => 'required|string|max:255',
            'is_recurring' => 'nullable|boolean',
        ]);

        $holiday = Holiday::create($validated);
        return response()->json($holiday, 201);
    }

    public function deleteHoliday(Holiday $holiday): JsonResponse
    {
        $holiday->delete();
        return response()->json(['message' => 'Jour férié supprimé avec succès']);
    }
}
