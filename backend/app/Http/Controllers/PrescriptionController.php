<?php

namespace App\Http\Controllers;

use App\Models\Prescription;
use App\Models\Patient;
use Illuminate\Http\Request;
use Illuminate\View\View;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;

class PrescriptionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): View
    {
        $prescriptions = Prescription::with(['patient', 'dentist'])
            ->orderBy('prescription_date', 'desc')
            ->paginate(10);
            
        return view('prescriptions.index', compact('prescriptions'));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Request $request): View
    {
        $patient = null;
        if ($request->has('patient_id')) {
            $patient = Patient::findOrFail($request->get('patient_id'));
        }
        
        $patients = Patient::all();
        return view('prescriptions.create', compact('patients', 'patient'));
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'patient_id' => 'required|exists:patients,id',
            'medications' => 'required|string',
            'instructions' => 'nullable|string',
            'prescription_date' => 'required|date',
        ]);

        $data['user_id'] = Auth::id();

        Prescription::create($data);

        return redirect()->route('prescriptions.index')
            ->with('success', 'Ordonnance créée avec succès.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Prescription $prescription): View
    {
        return view('prescriptions.show', compact('prescription'));
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Prescription $prescription): View
    {
        $patients = Patient::all();
        return view('prescriptions.edit', compact('prescription', 'patients'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Prescription $prescription): RedirectResponse
    {
        $data = $request->validate([
            'patient_id' => 'required|exists:patients,id',
            'medications' => 'required|string',
            'instructions' => 'nullable|string',
            'prescription_date' => 'required|date',
        ]);

        $prescription->update($data);

        return redirect()->route('prescriptions.index')
            ->with('success', 'Ordonnance mise à jour.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Prescription $prescription): RedirectResponse
    {
        $prescription->delete();

        return redirect()->route('prescriptions.index')
            ->with('success', 'Ordonnance supprimée.');
    }
    
    /**
     * Print the prescription.
     */
    public function print(Prescription $prescription): View
    {
        return view('prescriptions.print', compact('prescription'));
    }
}
