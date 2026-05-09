@extends('layouts.admin')

@section('title', 'Détail Rendez-vous - Cabinet Dentaire')

@section('content')
<div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Header -->
        <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
                <a href="{{ route('appointments.index') }}" class="inline-flex items-center text-gray-600 hover:text-sky-500 transition-colors mb-4">
                    <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
                    </svg>
                    Retour à la liste
                </a>
                <h1 class="text-3xl font-bold text-gray-900">Détail du Rendez-vous</h1>
                <p class="text-gray-600 mt-2">#{{ str_pad($appointment->id, 5, '0', STR_PAD_LEFT) }}</p>
            </div>
            <div class="mt-4 md:mt-0 flex space-x-3">
                <a href="{{ route('appointments.edit', $appointment) }}" 
                   class="inline-flex items-center px-4 py-2 bg-sky-500 text-white font-medium rounded-lg hover:bg-sky-600 transition-colors">
                    <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                    </svg>
                    Modifier
                </a>
                <form action="{{ route('appointments.destroy', $appointment) }}" method="POST" class="inline" onsubmit="return confirm('Êtes-vous sûr de vouloir supprimer ce rendez-vous ?');">
                    @csrf
                    @method('DELETE')
                    <button type="submit" class="inline-flex items-center px-4 py-2 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 transition-colors">
                        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                        </svg>
                        Supprimer
                    </button>
                </form>
            </div>
        </div>

        <!-- Alert Messages -->
        @if(session('success'))
            <div class="bg-sky-50 border-l-4 border-sky-500 p-4 mb-6 rounded-r-lg">
                <p class="text-sky-700">{{ session('success') }}</p>
            </div>
        @endif

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <!-- Main Info -->
            <div class="lg:col-span-2 space-y-6">
                <!-- Appointment Details -->
                <div class="bg-white rounded-xl shadow-sm p-6">
                    <h2 class="text-lg font-semibold text-gray-900 mb-4">Informations du Rendez-vous</h2>
                    <div class="grid grid-cols-2 gap-4">
                        <div class="p-4 bg-gray-50 rounded-lg">
                            <p class="text-sm text-gray-500">Date</p>
                            <p class="text-lg font-semibold text-gray-900">{{ $appointment->appointment_date ? $appointment->appointment_date->format('d/m/Y') : 'À planifier' }}</p>
                        </div>
                        <div class="p-4 bg-gray-50 rounded-lg">
                            <p class="text-sm text-gray-500">Heure</p>
                            <p class="text-lg font-semibold text-gray-900">{{ $appointment->start_time ?? '--:--' }} - {{ $appointment->end_time ?? '--:--' }}</p>
                        </div>
                        <div class="p-4 bg-gray-50 rounded-lg">
                            <p class="text-sm text-gray-500">Motif</p>
                            <p class="text-lg font-semibold text-gray-900">{{ $appointment->reason ?? 'Non spécifié' }}</p>
                        </div>
                        <div class="p-4 bg-gray-50 rounded-lg">
                            <p class="text-sm text-gray-500">Statut</p>
                            <span class="inline-flex px-3 py-1 text-sm font-medium rounded-full mt-1
                                @if($appointment->status == 'pending') bg-yellow-100 text-yellow-800
                                @elseif($appointment->status == 'confirmed') bg-green-100 text-green-800
                                @elseif($appointment->status == 'completed') bg-sky-100 text-sky-800
                                @elseif($appointment->status == 'cancelled') bg-red-100 text-red-800
                                @else bg-gray-100 text-gray-800 @endif">
                                @switch($appointment->status)
                                    @case('pending') En attente @break
                                    @case('confirmed') Confirmé @break
                                    @case('completed') Terminé @break
                                    @case('cancelled') Annulé @break
                                    @case('no_show') Non présenté @break
                                    @default {{ $appointment->status }}
                                @endswitch
                            </span>
                        </div>
                    </div>

                    <!-- Change Status -->
                    <div class="mt-6 pt-6 border-t border-gray-200">
                        <h3 class="text-sm font-medium text-gray-700 mb-3">Changer le statut</h3>
                        <form action="{{ route('appointments.update', $appointment) }}" method="POST" class="flex items-center space-x-3">
                            @csrf
                            @method('PATCH')
                            <select name="status" class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500">
                                <option value="requested" {{ $appointment->status == 'requested' ? 'selected' : '' }}>Nouvelle Demande</option>
                                <option value="proposed" {{ $appointment->status == 'proposed' ? 'selected' : '' }}>Proposition Envoyée</option>
                                <option value="pending" {{ $appointment->status == 'pending' ? 'selected' : '' }}>En attente</option>
                                <option value="confirmed" {{ $appointment->status == 'confirmed' ? 'selected' : '' }}>Confirmé</option>
                                <option value="completed" {{ $appointment->status == 'completed' ? 'selected' : '' }}>Terminé</option>
                                <option value="cancelled" {{ $appointment->status == 'cancelled' ? 'selected' : '' }}>Annulé</option>
                                <option value="no_show" {{ $appointment->status == 'no_show' ? 'selected' : '' }}>Non présenté</option>
                            </select>
                            <button type="submit" class="px-4 py-2 bg-sky-500 text-white font-medium rounded-lg hover:bg-sky-600 transition-colors">
                                Mettre à jour
                            </button>
                        </form>
                    </div>
                </div>

                <!-- Treatments -->
                <div class="bg-white rounded-xl shadow-sm p-6">
                    <div class="flex justify-between items-center mb-4">
                        <h2 class="text-lg font-semibold text-gray-900">Soins Effectués</h2>
                        @if($appointment->status != 'cancelled')
                            <button onclick="document.getElementById('add-treatment-modal').classList.remove('hidden')" 
                                    class="px-4 py-2 bg-sky-500 text-white text-sm font-medium rounded-lg hover:bg-sky-600 transition-colors">
                                + Ajouter un soin
                            </button>
                        @endif
                    </div>
                    
                    @if($appointment->treatments->count() > 0)
                        <div class="overflow-x-auto">
                            <table class="min-w-full divide-y divide-gray-200">
                                <thead class="bg-gray-50">
                                    <tr>
                                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Soin</th>
                                        <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Qté</th>
                                        <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Prix</th>
                                        <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-gray-200">
                                    @foreach($appointment->treatments as $treatment)
                                        <tr>
                                            <td class="px-4 py-3">
                                                <div class="text-sm font-medium text-gray-900">{{ $treatment->name }}</div>
                                                @if($treatment->pivot->notes)
                                                    <div class="text-xs text-gray-500">{{ $treatment->pivot->notes }}</div>
                                                @endif
                                            </td>
                                            <td class="px-4 py-3 text-center text-sm text-gray-900">{{ $treatment->pivot->quantity }}</td>
                                            <td class="px-4 py-3 text-right text-sm text-gray-900">{{ number_format($treatment->pivot->applied_price, 2, ',', ' ') }} DH</td>
                                            <td class="px-4 py-3 text-right text-sm font-medium text-gray-900">
                                                {{ number_format($treatment->pivot->applied_price * $treatment->pivot->quantity, 2, ',', ' ') }} DH
                                            </td>
                                        </tr>
                                    @endforeach
                                </tbody>
                                <tfoot class="bg-gray-50">
                                    <tr>
                                        <td colspan="3" class="px-4 py-3 text-right font-medium text-gray-900">Total</td>
                                        <td class="px-4 py-3 text-right font-bold text-gray-900">
                                            {{ number_format($appointment->treatments->sum(function($t) { return $t->pivot->applied_price * $t->pivot->quantity; }), 2, ',', ' ') }} DH
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    @else
                        <p class="text-gray-500 text-center py-4">Aucun soin enregistré pour ce rendez-vous</p>
                    @endif
                </div>
            </div>

            <!-- Sidebar -->
            <div class="space-y-6">
                <!-- Patient Card -->
                <div class="bg-white rounded-xl shadow-sm p-6">
                    <h2 class="text-lg font-semibold text-gray-900 mb-4">Patient</h2>
                    <div class="flex items-center mb-4">
                        <div class="h-12 w-12 rounded-full bg-sky-100 flex items-center justify-center">
                            <span class="text-sky-600 font-bold text-lg">
                                {{ strtoupper(substr($appointment->patient->first_name, 0, 1) . substr($appointment->patient->last_name, 0, 1)) }}
                            </span>
                        </div>
                        <div class="ml-3">
                            <p class="font-semibold text-gray-900">{{ $appointment->patient->full_name }}</p>
                            <p class="text-sm text-gray-500">{{ $appointment->patient->phone }}</p>
                        </div>
                    </div>
                    <a href="{{ route('patients.show', $appointment->patient) }}" class="block w-full text-center px-4 py-2 border border-sky-500 text-sky-500 font-medium rounded-lg hover:bg-sky-50 transition-colors">
                        Voir la fiche patient
                    </a>
                </div>

                <!-- Dentist Card -->
                <div class="bg-white rounded-xl shadow-sm p-6">
                    <h2 class="text-lg font-semibold text-gray-900 mb-4">Dentiste</h2>
                    <div class="flex items-center mb-4">
                        <div class="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                            <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                            </svg>
                        </div>
                        <div class="ml-3">
                            <p class="font-semibold text-gray-900">Dr. {{ $appointment->dentist->name ?? 'Non assigné' }}</p>
                            <p class="text-sm text-gray-500">{{ $appointment->dentist->email ?? '' }}</p>
                        </div>
                    </div>
                </div>

                <!-- Invoice Card -->
                @if($appointment->invoice)
                    <div class="bg-white rounded-xl shadow-sm p-6">
                        <h2 class="text-lg font-semibold text-gray-900 mb-4">Facture Associée</h2>
                        <div class="p-4 bg-green-50 rounded-lg mb-4">
                            <p class="text-sm text-gray-500">N° Facture</p>
                            <p class="text-lg font-semibold text-gray-900">#{{ str_pad($appointment->invoice->id, 5, '0', STR_PAD_LEFT) }}</p>
                            <p class="text-sm text-gray-600 mt-1">Montant: {{ number_format($appointment->invoice->total_amount, 2, ',', ' ') }} €</p>
                            <span class="inline-flex px-2 py-1 text-xs rounded-full mt-2
                                @if($appointment->invoice->status == 'paid') bg-green-100 text-green-800
                                @elseif($appointment->invoice->status == 'partially_paid') bg-yellow-100 text-yellow-800
                                @else bg-red-100 text-red-800
                                @endif">
                                @if($appointment->invoice->status == 'paid') Payée
                                @elseif($appointment->invoice->status == 'partially_paid') Partielle
                                @else Impayée @endif
                            </span>
                        </div>
                        <a href="{{ route('invoices.show', $appointment->invoice) }}" class="block w-full text-center px-4 py-2 bg-sky-500 text-white font-medium rounded-lg hover:bg-sky-600 transition-colors">
                            Voir la facture
                        </a>
                    </div>
                @elseif($appointment->status == 'completed' && $appointment->treatments->count() > 0)
                    <div class="bg-white rounded-xl shadow-sm p-6">
                        <h2 class="text-lg font-semibold text-gray-900 mb-4">Facturation</h2>
                        <p class="text-sm text-gray-600 mb-4">Ce rendez-vous est terminé mais n'a pas encore de facture.</p>
                        <a href="{{ route('invoices.create', ['appointment_id' => $appointment->id]) }}" class="block w-full text-center px-4 py-2 bg-sky-500 text-white font-medium rounded-lg hover:bg-sky-600 transition-colors">
                            Créer une facture
                        </a>
                    </div>
                @endif

                <!-- Actions -->
                <div class="bg-white rounded-xl shadow-sm p-6">
                    <h2 class="text-lg font-semibold text-gray-900 mb-4">Actions</h2>
                    <div class="space-y-3">
                        @if($appointment->status == 'confirmed' && $appointment->appointment_date > now())
                            <form action="{{ route('appointments.reminder', $appointment) }}" method="POST">
                                @csrf
                                <button type="submit" class="w-full px-4 py-2 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-colors">
                                    Envoyer un rappel
                                </button>
                            </form>
                        @endif
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Add Treatment Modal -->
<div id="add-treatment-modal" class="hidden fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
    <div class="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Ajouter un soin</h3>
        <form action="{{ route('appointments.add-treatment', $appointment) }}" method="POST">
            @csrf
            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Soin</label>
                    <select name="treatment_id" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500">
                        <option value="">Sélectionner un soin</option>
                        @foreach($treatments ?? [] as $treatment)
                            <option value="{{ $treatment->id }}">{{ $treatment->name }} - {{ number_format($treatment->price, 2, ',', ' ') }} €</option>
                        @endforeach
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Quantité</label>
                    <input type="number" name="quantity" value="1" min="1" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                    <textarea name="notes" rows="2" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500" placeholder="Notes éventuelles..."></textarea>
                </div>
            </div>
            <div class="flex justify-end space-x-3 mt-6">
                <button type="button" onclick="document.getElementById('add-treatment-modal').classList.add('hidden')" class="px-4 py-2 text-gray-600 hover:text-gray-800">
                    Annuler
                </button>
                <button type="submit" class="px-4 py-2 bg-sky-500 text-white font-medium rounded-lg hover:bg-sky-600">
                    Ajouter
                </button>
            </div>
        </form>
    </div>
</div>
@endsection
