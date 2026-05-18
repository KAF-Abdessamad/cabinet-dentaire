<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Patient;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PatientApiController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Patient::query();

        if ($request->filled('search')) {
            $search = $request->get('search');
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%")
                  ->orWhere('cin', 'like', "%{$search}%");
            });
        }

        if ($request->boolean('all')) {
            $patients = $query->latest()->get();
        } else {
            $patients = $query->latest()->paginate(10);
        }

        return response()->json($patients);
    }

    public function show(Patient $patient): JsonResponse
    {
        $patient->load([
            'appointments.dentist',
            'appointments.treatment',
            'invoices.payments',
            'prescriptions'
        ]);
        return response()->json($patient);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'first_name' => 'required|string|max:100',
            'last_name' => 'required|string|max:100',
            'email' => 'nullable|email|unique:patients,email',
            'phone' => 'nullable|string|max:20',
            'birth_date' => 'nullable|date',
            'address' => 'nullable|string|max:255',
            'cin' => 'nullable|string|max:20|unique:patients,cin',
            'gender' => 'nullable|string|max:20',
            'blood_group' => 'nullable|string|max:10',
            'allergies' => 'nullable|string',
            'medical_history' => 'nullable|string',
            'chronic_diseases' => 'nullable|string',
            'current_medications' => 'nullable|string',
            'emergency_contact_name' => 'nullable|string|max:100',
            'emergency_contact_relation' => 'nullable|string|max:50',
            'emergency_contact_phone' => 'nullable|string|max:25',
        ]);

        $patient = Patient::create($validated);

        return response()->json($patient, 201);
    }

    public function update(Request $request, Patient $patient): JsonResponse
    {
        $validated = $request->validate([
            'first_name' => 'sometimes|required|string|max:100',
            'last_name' => 'sometimes|required|string|max:100',
            'email' => 'nullable|email|unique:patients,email,' . $patient->id,
            'phone' => 'nullable|string|max:20',
            'birth_date' => 'nullable|date',
            'address' => 'nullable|string|max:255',
            'cin' => 'nullable|string|max:20|unique:patients,cin,' . $patient->id,
            'gender' => 'nullable|string|max:20',
            'blood_group' => 'nullable|string|max:10',
            'allergies' => 'nullable|string',
            'medical_history' => 'nullable|string',
            'chronic_diseases' => 'nullable|string',
            'current_medications' => 'nullable|string',
            'emergency_contact_name' => 'nullable|string|max:100',
            'emergency_contact_relation' => 'nullable|string|max:50',
            'emergency_contact_phone' => 'nullable|string|max:25',
        ]);

        $patient->update($validated);

        return response()->json($patient);
    }

    public function destroy(Patient $patient): JsonResponse
    {
        $patient->delete();
        return response()->json(['message' => 'Patient deleted successfully']);
    }
}
