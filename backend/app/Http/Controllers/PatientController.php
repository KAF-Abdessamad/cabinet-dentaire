<?php

namespace App\Http\Controllers;

use App\Models\Patient;
use App\Http\Requests\StorePatientRequest;
use App\Http\Requests\UpdatePatientRequest;
use Illuminate\Http\Request;
use Illuminate\View\View;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;

class PatientController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): View
    {
        Gate::authorize('viewAny', Patient::class);

        $query = Patient::query();

        // Search by keyword (name, phone, email, CIN)
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

        // Filter by phone number
        if ($request->filled('phone')) {
            $query->where('phone', 'like', '%' . $request->get('phone') . '%');
        }

        // Filter by CIN (Carte Identité Nationale)
        if ($request->filled('cin')) {
            $query->where('cin', 'like', '%' . $request->get('cin') . '%');
        }

        $patients = $query->latest()->paginate(10)->withQueryString();

        return view('patients.index', compact('patients'));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): View
    {
        Gate::authorize('create', Patient::class);

        return view('patients.create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StorePatientRequest $request): RedirectResponse
    {
        Gate::authorize('create', Patient::class);

        Patient::create($request->validated());

        return redirect()->route('patients.index')
            ->with('success', 'Patient créé avec succès.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Patient $patient): View
    {
        Gate::authorize('view', $patient);

        $patient->load([
            'appointments' => function ($query) {
                $query->latest();
            },
            'appointments.dentist',
            'appointments.treatments',
            'invoices' => function ($query) {
                $query->latest();
            },
            'invoices.payments'
        ]);

        return view('patients.show', compact('patient'));
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Patient $patient): View
    {
        Gate::authorize('update', $patient);

        return view('patients.edit', compact('patient'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdatePatientRequest $request, Patient $patient): RedirectResponse
    {
        Gate::authorize('update', $patient);

        $patient->update($request->validated());

        return redirect()->route('patients.index')
            ->with('success', 'Patient mis à jour avec succès.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Patient $patient): RedirectResponse
    {
        Gate::authorize('delete', $patient);

        $patient->delete();

        return redirect()->route('patients.index')
            ->with('success', 'Patient supprimé avec succès.');
    }
}
