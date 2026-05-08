@extends('layouts.admin')

@section('title', 'Fiche Patient - ' . $patient->full_name)

@section('content')
<div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Header -->
        <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
                <a href="{{ route('patients.index') }}" class="inline-flex items-center text-gray-600 hover:text-sky-500 transition-colors mb-4">
                    <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
                    </svg>
                    Retour à la liste
                </a>
                <div class="flex items-center space-x-4">
                    <div class="h-16 w-16 rounded-full bg-sky-100 flex items-center justify-center">
                        <span class="text-sky-600 font-bold text-xl">
                            {{ strtoupper(substr($patient->first_name, 0, 1) . substr($patient->last_name, 0, 1)) }}
                        </span>
                    </div>
                    <div>
                        <h1 class="text-3xl font-bold text-gray-900">{{ $patient->full_name }}</h1>
                        <p class="text-gray-600">Patient depuis {{ $patient->created_at->diffForHumans() }}</p>
                    </div>
                </div>
            </div>
            <div class="mt-4 md:mt-0 flex space-x-3">
                <a href="{{ route('patients.edit', $patient) }}" 
                   class="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">
                    <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                    </svg>
                    Modifier
                </a>
                <a href="{{ route('appointments.create', ['patient_id' => $patient->id]) }}" 
                   class="inline-flex items-center px-4 py-2 bg-sky-500 text-white font-medium rounded-lg hover:bg-sky-600 transition-colors">
                    <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                    </svg>
                    Nouveau RDV
                </a>
            </div>
        </div>

        <!-- Alert Messages -->
        @if(session('success'))
            <div class="bg-sky-50 border-l-4 border-sky-500 p-4 mb-6 rounded-r-lg">
                <p class="text-sky-700">{{ session('success') }}</p>
            </div>
        @endif

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <!-- Left Column: Patient Info -->
            <div class="lg:col-span-1">
                <!-- Informations Personnelles -->
                <div class="bg-white rounded-xl shadow-sm p-6 mb-6">
                    <h2 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <svg class="w-5 h-5 mr-2 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                        </svg>
                        Informations Personnelles
                    </h2>
                    <div class="space-y-3">
                        <div class="flex justify-between">
                            <span class="text-gray-500">Email</span>
                            <span class="text-gray-900">{{ $patient->email }}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-500">Téléphone</span>
                            <span class="text-gray-900">{{ $patient->phone }}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-500">Date de naissance</span>
                            <span class="text-gray-900">{{ $patient->birth_date ? $patient->birth_date->format('d/m/Y') : 'Non renseignée' }}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-500">Sexe</span>
                            <span class="text-gray-900">{{ $patient->gender == 'male' ? 'Homme' : 'Femme' }}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-500">CIN</span>
                            <span class="text-gray-900">{{ $patient->cin ?? 'Non renseigné' }}</span>
                        </div>
                        @if($patient->address)
                            <div class="pt-3 border-t border-gray-100">
                                <span class="text-gray-500 block mb-1">Adresse</span>
                                <span class="text-gray-900">{{ $patient->address }}</span>
                            </div>
                        @endif
                    </div>
                </div>

                <!-- Informations Médicales -->
                <div class="bg-white rounded-xl shadow-sm p-6 mb-6">
                    <h2 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <svg class="w-5 h-5 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                        </svg>
                        Informations Médicales
                    </h2>
                    <div class="space-y-4">
                        @if($patient->blood_group)
                            <div>
                                <span class="text-gray-500 block text-sm">Groupe Sanguin</span>
                                <span class="inline-flex items-center px-3 py-1 mt-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                                    {{ $patient->blood_group }}
                                </span>
                            </div>
                        @endif
                        @if($patient->allergies)
                            <div>
                                <span class="text-gray-500 block text-sm">Allergies</span>
                                <p class="mt-1 text-gray-900 bg-yellow-50 p-2 rounded-lg">{{ $patient->allergies }}</p>
                            </div>
                        @endif
                        @if($patient->medical_history)
                            <div>
                                <span class="text-gray-500 block text-sm">Antécédents Médicaux</span>
                                <p class="mt-1 text-gray-900 bg-blue-50 p-2 rounded-lg">{{ $patient->medical_history }}</p>
                            </div>
                        @endif
                    </div>
                </div>

                <!-- Statistiques -->
                <div class="bg-white rounded-xl shadow-sm p-6">
                    <h2 class="text-lg font-semibold text-gray-900 mb-4">Statistiques</h2>
                    <div class="grid grid-cols-2 gap-4">
                        <div class="text-center p-3 bg-sky-50 rounded-lg">
                            <div class="text-2xl font-bold text-sky-600">{{ $patient->appointments->count() }}</div>
                            <div class="text-sm text-gray-600">Rendez-vous</div>
                        </div>
                        <div class="text-center p-3 bg-blue-50 rounded-lg">
                            <div class="text-2xl font-bold text-blue-600">{{ $patient->invoices->count() }}</div>
                            <div class="text-sm text-gray-600">Factures</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Right Column: History -->
            <div class="lg:col-span-2">
                <!-- Rendez-vous -->
                <div class="bg-white rounded-xl shadow-sm p-6 mb-6">
                    <div class="flex items-center justify-between mb-4">
                        <h2 class="text-lg font-semibold text-gray-900 flex items-center">
                            <svg class="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                            </svg>
                            Historique des Rendez-vous
                        </h2>
                        <a href="{{ route('appointments.index', ['patient_id' => $patient->id]) }}" class="text-sky-600 hover:text-sky-700 text-sm font-medium">
                            Voir tout →
                        </a>
                    </div>
                    @if($patient->appointments->count() > 0)
                        <div class="overflow-x-auto">
                            <table class="min-w-full divide-y divide-gray-200">
                                <thead class="bg-gray-50">
                                    <tr>
                                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Heure</th>
                                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Motif</th>
                                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dentiste</th>
                                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-gray-200">
                                    @foreach($patient->appointments->take(5) as $appointment)
                                        <tr class="hover:bg-gray-50">
                                            <td class="px-4 py-3 text-sm text-gray-900">{{ $appointment->appointment_date->format('d/m/Y') }}</td>
                                            <td class="px-4 py-3 text-sm text-gray-900">{{ $appointment->start_time }} - {{ $appointment->end_time }}</td>
                                            <td class="px-4 py-3 text-sm text-gray-900">{{ $appointment->reason ?? 'Non spécifié' }}</td>
                                            <td class="px-4 py-3 text-sm text-gray-900">{{ $appointment->dentist->name ?? 'Non assigné' }}</td>
                                            <td class="px-4 py-3">
                                                <span class="inline-flex px-2 py-1 text-xs font-medium rounded-full 
                                                    @if($appointment->status == 'pending') bg-yellow-100 text-yellow-800
                                                    @elseif($appointment->status == 'confirmed') bg-green-100 text-green-800
                                                    @elseif($appointment->status == 'completed') bg-blue-100 text-blue-800
                                                    @elseif($appointment->status == 'cancelled') bg-red-100 text-red-800
                                                    @else bg-gray-100 text-gray-800 @endif">
                                                    @switch($appointment->status)
                                                        @case('pending') En attente @break
                                                        @case('confirmed') Confirmé @break
                                                        @case('completed') Terminé @break
                                                        @case('cancelled') Annulé @break
                                                        @default {{ $appointment->status }}
                                                    @endswitch
                                                </span>
                                            </td>
                                        </tr>
                                    @endforeach
                                </tbody>
                            </table>
                        </div>
                    @else
                        <p class="text-gray-500 text-center py-4">Aucun rendez-vous enregistré</p>
                    @endif
                </div>

                <!-- Soins Effectués -->
                <div class="bg-white rounded-xl shadow-sm p-6 mb-6">
                    <div class="flex items-center justify-between mb-4">
                        <h2 class="text-lg font-semibold text-gray-900 flex items-center">
                            <svg class="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/>
                            </svg>
                            Soins Effectués
                        </h2>
                    </div>
                    @php
                        $treatments = collect();
                        foreach($patient->appointments as $appointment) {
                            foreach($appointment->treatments as $treatment) {
                                $treatments->push([
                                    'name' => $treatment->name,
                                    'date' => $appointment->appointment_date,
                                    'price' => $treatment->pivot->applied_price ?? $treatment->price,
                                    'dentist' => $appointment->dentist->name ?? 'Non assigné'
                                ]);
                            }
                        }
                        $treatments = $treatments->sortByDesc('date')->take(5);
                    @endphp
                    @if($treatments->count() > 0)
                        <div class="overflow-x-auto">
                            <table class="min-w-full divide-y divide-gray-200">
                                <thead class="bg-gray-50">
                                    <tr>
                                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Soin</th>
                                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dentiste</th>
                                        <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Prix</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-gray-200">
                                    @foreach($treatments as $treatment)
                                        <tr class="hover:bg-gray-50">
                                            <td class="px-4 py-3 text-sm text-gray-900">{{ $treatment['name'] }}</td>
                                            <td class="px-4 py-3 text-sm text-gray-900">{{ $treatment['date']->format('d/m/Y') }}</td>
                                            <td class="px-4 py-3 text-sm text-gray-900">{{ $treatment['dentist'] }}</td>
                                            <td class="px-4 py-3 text-sm text-gray-900 text-right">{{ number_format($treatment['price'], 2, ',', ' ') }} €</td>
                                        </tr>
                                    @endforeach
                                </tbody>
                            </table>
                        </div>
                    @else
                        <p class="text-gray-500 text-center py-4">Aucun soin enregistré</p>
                    @endif
                </div>

                <!-- Factures -->
                <div class="bg-white rounded-xl shadow-sm p-6">
                    <div class="flex items-center justify-between mb-4">
                        <h2 class="text-lg font-semibold text-gray-900 flex items-center">
                            <svg class="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z"/>
                            </svg>
                            Factures
                        </h2>
                        <a href="{{ route('invoices.create', ['patient_id' => $patient->id]) }}" class="text-sky-600 hover:text-sky-700 text-sm font-medium">
                            Nouvelle facture →
                        </a>
                    </div>
                    @if($patient->invoices->count() > 0)
                        <div class="overflow-x-auto">
                            <table class="min-w-full divide-y divide-gray-200">
                                <thead class="bg-gray-50">
                                    <tr>
                                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">N° Facture</th>
                                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                        <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Montant</th>
                                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                                        <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-gray-200">
                                    @foreach($patient->invoices->take(5) as $invoice)
                                        <tr class="hover:bg-gray-50">
                                            <td class="px-4 py-3 text-sm font-medium text-gray-900">#{{ str_pad($invoice->id, 5, '0', STR_PAD_LEFT) }}</td>
                                            <td class="px-4 py-3 text-sm text-gray-900">{{ $invoice->invoice_date->format('d/m/Y') }}</td>
                                            <td class="px-4 py-3 text-sm text-gray-900 text-right">{{ number_format($invoice->total_amount, 2, ',', ' ') }} €</td>
                                            <td class="px-4 py-3">
                                                @php
                                                    $remaining = $invoice->remaining_amount;
                                                    $isPaid = $remaining <= 0;
                                                @endphp
                                                <span class="inline-flex px-2 py-1 text-xs font-medium rounded-full 
                                                    {{ $isPaid ? 'bg-green-100 text-green-800' : ($remaining < $invoice->total_amount ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800') }}">
                                                    {{ $isPaid ? 'Payée' : ($remaining < $invoice->total_amount ? 'Partielle' : 'Impayée') }}
                                                </span>
                                            </td>
                                            <td class="px-4 py-3 text-right">
                                                <a href="{{ route('invoices.show', $invoice) }}" class="text-sky-600 hover:text-sky-700 text-sm font-medium">
                                                    Voir →
                                                </a>
                                            </td>
                                        </tr>
                                    @endforeach
                                </tbody>
                            </table>
                        </div>
                    @else
                        <p class="text-gray-500 text-center py-4">Aucune facture enregistrée</p>
                    @endif
                </div>
            </div>
        </div>
    </div>
</div>
@endsection
