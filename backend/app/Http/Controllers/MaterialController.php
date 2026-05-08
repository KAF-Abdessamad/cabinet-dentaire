<?php

namespace App\Http\Controllers;

use App\Models\Material;
use Illuminate\Http\Request;
use Illuminate\View\View;
use Illuminate\Http\RedirectResponse;

class MaterialController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): View
    {
        $materials = Material::orderBy('name')->paginate(10);
        
        $lowStockCount = Material::whereColumn('quantity', '<=', 'alert_threshold')->count();
        
        return view('materials.index', compact('materials', 'lowStockCount'));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): View
    {
        return view('materials.create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'reference' => 'nullable|string|unique:materials,reference',
            'quantity' => 'required|integer|min:0',
            'unit' => 'required|string',
            'alert_threshold' => 'required|integer|min:0',
            'description' => 'nullable|string',
        ]);

        Material::create($data);

        return redirect()->route('materials.index')
            ->with('success', 'Article ajouté au stock.');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Material $material): View
    {
        return view('materials.edit', compact('material'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Material $material): RedirectResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'reference' => 'nullable|string|unique:materials,reference,' . $material->id,
            'quantity' => 'required|integer|min:0',
            'unit' => 'required|string',
            'alert_threshold' => 'required|integer|min:0',
            'description' => 'nullable|string',
        ]);

        $material->update($data);

        return redirect()->route('materials.index')
            ->with('success', 'Stock mis à jour.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Material $material): RedirectResponse
    {
        $material->delete();

        return redirect()->route('materials.index')
            ->with('success', 'Article supprimé.');
    }
}
