@extends('layouts.admin')

@section('title', 'Détails de la Facture #' . $invoice->id)

@section('content')
<div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Header -->
        <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
                <a href="{{ route('invoices.index') }}" class="inline-flex items-center text-gray-600 hover:text-sky-500 transition-colors mb-4">
                    <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
                    </svg>
                    Retour à la liste
                </a>
                <h1 class="text-3xl font-bold text-gray-900">Facture #{{ $invoice->id }}</h1>
                <p class="text-gray-600">Émise le {{ $invoice->invoice_date instanceof \Carbon\Carbon ? $invoice->invoice_date->format('d/m/Y') : $invoice->invoice_date }}</p>
            </div>
            <div class="mt-4 md:mt-0 flex space-x-3">
                <a href="{{ route('invoices.pdf', $invoice) }}" target="_blank"
                   class="inline-flex items-center px-4 py-2 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 transition-colors">
                    <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/>
                    </svg>
                    PDF
                </a>
                <form action="{{ route('invoices.send', $invoice) }}" method="POST">
                    @csrf
                    <button type="submit" 
                            class="inline-flex items-center px-4 py-2 bg-sky-500 text-white font-medium rounded-lg hover:bg-sky-600 transition-colors">
                        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                        </svg>
                        Envoyer par email
                    </button>
                </form>
            </div>
        </div>

        @if(session('success'))
            <div class="bg-green-50 border-l-4 border-green-500 p-4 mb-6 rounded-r-lg">
                <p class="text-green-700">{{ session('success') }}</p>
            </div>
        @endif

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <!-- Left: Info & Payments -->
            <div class="lg:col-span-2 space-y-6">
                <!-- Invoice Details -->
                <div class="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div class="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                        <h2 class="text-lg font-semibold text-gray-900">Détails de la prestation</h2>
                    </div>
                    <div class="p-6">
                        <table class="w-full">
                            <thead>
                                <tr class="text-left text-sm font-bold text-gray-500 uppercase tracking-wider">
                                    <th class="pb-4">Traitement</th>
                                    <th class="pb-4 text-center">Quantité</th>
                                    <th class="pb-4 text-right">Prix Unitaire</th>
                                    <th class="pb-4 text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-100">
                                @if($invoice->appointment && $invoice->appointment->treatments->count() > 0)
                                    @foreach($invoice->appointment->treatments as $treatment)
                                        <tr class="text-gray-700">
                                            <td class="py-4 font-medium">{{ $treatment->name }}</td>
                                            <td class="py-4 text-center">{{ $treatment->pivot->quantity }}</td>
                                            <td class="py-4 text-right">{{ number_format($treatment->pivot->applied_price, 2, ',', ' ') }} DH</td>
                                            <td class="py-4 text-right font-bold">{{ number_format($treatment->pivot->applied_price * $treatment->pivot->quantity, 2, ',', ' ') }} DH</td>
                                        </tr>
                                    @endforeach
                                @else
                                    <tr>
                                        <td colspan="4" class="py-8 text-center text-gray-500 italic">
                                            <div class="flex flex-col items-center">
                                                <svg class="w-12 h-12 text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                                </svg>
                                                Aucun détail de soin n'est associé à cette facture.
                                            </div>
                                        </td>
                                    </tr>
                                @endif
                            </tbody>
                            <tfoot>
                                <tr class="border-t-2 border-gray-100">
                                    <td colspan="3" class="pt-6 text-right font-bold text-gray-900 text-xl uppercase">Total Facture</td>
                                    <td class="pt-6 text-right font-bold text-sky-600 text-xl">{{ number_format($invoice->total_amount, 2, ',', ' ') }} DH</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>

                <!-- Payment History -->
                <div class="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div class="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                        <h2 class="text-lg font-semibold text-gray-900">Historique des paiements</h2>
                        <span class="px-3 py-1 text-xs font-bold rounded-full {{ 
                            $invoice->status === 'paid' ? 'bg-green-100 text-green-700' : 
                            ($invoice->status === 'partially_paid' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700') 
                        }} uppercase">
                            {{ $invoice->status }}
                        </span>
                    </div>
                    <div class="p-6">
                        @if($invoice->payments->count() > 0)
                            <table class="w-full">
                                <thead>
                                    <tr class="text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                                        <th class="pb-4">Date</th>
                                        <th class="pb-4">Méthode</th>
                                        <th class="pb-4 text-right">Montant</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-gray-100">
                                    @foreach($invoice->payments as $payment)
                                        <tr class="text-sm">
                                            <td class="py-3 text-gray-600">{{ $payment->payment_date->format('d/m/Y') }}</td>
                                            <td class="py-3 text-gray-600">{{ $payment->payment_method }}</td>
                                            <td class="py-3 text-right font-medium text-gray-900">{{ number_format($payment->amount, 2, ',', ' ') }} DH</td>
                                        </tr>
                                    @endforeach
                                </tbody>
                                <tfoot>
                                    <tr class="bg-gray-50/50">
                                        <td colspan="2" class="p-3 text-right font-semibold text-gray-600">Reste à payer</td>
                                        <td class="p-3 text-right font-bold text-red-600">{{ number_format($invoice->remaining_amount, 2, ',', ' ') }} DH</td>
                                    </tr>
                                </tfoot>
                            </table>
                        @else
                            <div class="text-center py-8 text-gray-500">
                                <svg class="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/>
                                </svg>
                                Aucun paiement enregistré
                            </div>
                        @endif
                        
                        @if($invoice->status !== 'paid')
                            <div class="mt-6 pt-6 border-t border-gray-100">
                                <h3 class="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Ajouter un paiement</h3>
                                <form action="{{ route('invoices.add-payment', $invoice) }}" method="POST" class="flex flex-wrap items-end gap-4">
                                    @csrf
                                    <div class="flex-1 min-w-[150px]">
                                        <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Montant</label>
                                        <input type="number" step="0.01" name="amount" max="{{ $invoice->remaining_amount }}" required
                                               class="w-full rounded-lg border-gray-300 focus:border-sky-500 focus:ring-sky-500"
                                               placeholder="0.00 DH">
                                    </div>
                                    <div class="flex-1 min-w-[150px]">
                                        <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Date</label>
                                        <input type="date" name="payment_date" value="{{ date('Y-m-d') }}" required
                                               class="w-full rounded-lg border-gray-300 focus:border-sky-500 focus:ring-sky-500">
                                    </div>
                                    <div class="flex-1 min-w-[150px]">
                                        <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Méthode</label>
                                        <select name="payment_method" required class="w-full rounded-lg border-gray-300 focus:border-sky-500 focus:ring-sky-500">
                                            <option value="cash">Espèces</option>
                                            <option value="card">Carte Bancaire</option>
                                            <option value="check">Chèque</option>
                                            <option value="transfer">Virement</option>
                                            <option value="insurance">Assurance</option>
                                        </select>
                                    </div>
                                    <button type="submit" class="bg-sky-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-sky-700 transition-colors h-[42px]">
                                        Valider
                                    </button>
                                </form>
                            </div>
                        @endif
                    </div>
                </div>
            </div>

            <!-- Right: Patient Info -->
            <div class="lg:col-span-1">
                <div class="bg-white rounded-xl shadow-sm p-6 sticky top-8">
                    <h2 class="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                        <svg class="w-5 h-5 mr-2 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                        </svg>
                        Patient
                    </h2>
                    
                    <div class="text-center mb-6">
                        <div class="h-20 w-20 rounded-full bg-sky-50 flex items-center justify-center mx-auto mb-3 border-2 border-sky-100">
                            <span class="text-sky-600 font-bold text-2xl">
                                {{ strtoupper(substr($invoice->patient->first_name, 0, 1) . substr($invoice->patient->last_name, 0, 1)) }}
                            </span>
                        </div>
                        <h3 class="text-xl font-bold text-gray-900">{{ $invoice->patient->full_name }}</h3>
                    </div>

                    <div class="space-y-4 pt-6 border-t border-gray-100">
                        <div>
                            <span class="text-xs font-bold text-gray-400 uppercase block mb-1">Téléphone</span>
                            <span class="text-gray-900 font-medium">{{ $invoice->patient->phone }}</span>
                        </div>
                        <div>
                            <span class="text-xs font-bold text-gray-400 uppercase block mb-1">Email</span>
                            <span class="text-gray-900 font-medium">{{ $invoice->patient->email }}</span>
                        </div>
                        <div>
                            <span class="text-xs font-bold text-gray-400 uppercase block mb-1">Adresse</span>
                            <span class="text-gray-900 font-medium leading-relaxed">{{ $invoice->patient->address ?? 'Non renseignée' }}</span>
                        </div>
                    </div>

                    <div class="mt-8 pt-6 border-t border-gray-100">
                        <a href="{{ route('patients.show', $invoice->patient) }}" 
                           class="w-full inline-flex justify-center items-center px-4 py-3 bg-gray-50 text-sky-600 font-bold rounded-xl hover:bg-sky-50 transition-colors border border-sky-100">
                            Voir le dossier complet
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection
