@extends('layouts.admin')

@section('content')
<div class="max-w-3xl mx-auto">
    <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-slate-800">Enregistrer un paiement</h1>
        <a href="{{ route('payments.index') }}" class="text-sky-700 hover:underline">← Retour</a>
    </div>

    @if ($errors->any())
        <div class="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            @foreach ($errors->all() as $error)
                <p>{{ $error }}</p>
            @endforeach
        </div>
    @endif

    <form method="POST" action="{{ route('payments.store') }}" class="bg-white rounded-2xl shadow-sm p-6 space-y-5">
        @csrf

        <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">Facture</label>
            <select name="invoice_id" required class="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500">
                <option value="">-- Choisir une facture --</option>
                @foreach($invoices as $inv)
                    <option value="{{ $inv->id }}" @selected(old('invoice_id', $invoice?->id) == $inv->id)>
                        #{{ $inv->id }} — {{ $inv->patient?->full_name ?? 'Patient' }} — {{ number_format($inv->total_amount, 2) }} DH
                    </option>
                @endforeach
            </select>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label class="block text-sm font-medium text-slate-700 mb-2">Montant</label>
                <input name="amount" type="number" step="0.01" min="0.01" value="{{ old('amount') }}" required class="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500" />
            </div>
            <div>
                <label class="block text-sm font-medium text-slate-700 mb-2">Date</label>
                <input name="payment_date" type="date" value="{{ old('payment_date', now()->toDateString()) }}" required class="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500" />
            </div>
        </div>

        <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">Mode de paiement</label>
            <select name="payment_method" required class="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500">
                @php($method = old('payment_method', 'cash'))
                <option value="cash" @selected($method === 'cash')>Espèces</option>
                <option value="card" @selected($method === 'card')>Carte</option>
                <option value="check" @selected($method === 'check')>Chèque</option>
                <option value="transfer" @selected($method === 'transfer')>Virement</option>
                <option value="insurance" @selected($method === 'insurance')>Assurance</option>
            </select>
        </div>

        <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">Notes</label>
            <textarea name="notes" rows="3" class="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500">{{ old('notes') }}</textarea>
        </div>

        <div class="flex justify-end gap-3">
            <a href="{{ route('payments.index') }}" class="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50">Annuler</a>
            <button type="submit" class="px-6 py-2 rounded-xl bg-sky-600 text-white font-semibold hover:bg-sky-700">Enregistrer</button>
        </div>
    </form>
</div>
@endsection

