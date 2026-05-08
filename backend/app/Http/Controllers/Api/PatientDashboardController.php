<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\Patient;
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
            ->where('status', 'in_progress')
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
                ->with(['dentist', 'treatments', 'medicalRecords'])
                ->orderBy('appointment_date', 'desc')
                ->get(),
        ]);
    }
}
