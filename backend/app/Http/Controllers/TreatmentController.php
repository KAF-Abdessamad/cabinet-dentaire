<?php

namespace App\Http\Controllers;

use App\Models\Treatment;
use Illuminate\Http\Request;
use Illuminate\View\View;
use Illuminate\Http\RedirectResponse;

class TreatmentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): View
    {
        $treatments = Treatment::orderBy('name')->paginate(10);
        return view('treatments.index', compact('treatments'));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): View
    {
        return view('treatments.create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
        ]);

        Treatment::create($data);

        return redirect()->route('treatments.index')
            ->with('success', 'Soin ajouté au catalogue.');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Treatment $treatment): View
    {
        return view('treatments.edit', compact('treatment'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Treatment $treatment): RedirectResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
        ]);

        $treatment->update($data);

        return redirect()->route('treatments.index')
            ->with('success', 'Soin mis à jour.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Treatment $treatment): RedirectResponse
    {
        $treatment->delete();

        return redirect()->route('treatments.index')
            ->with('success', 'Soin supprimé du catalogue.');
    }
}
