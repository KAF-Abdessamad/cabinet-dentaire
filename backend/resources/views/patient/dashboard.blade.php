@extends('layouts.admin')

@section('title', 'Mon Espace Patient - Cabinet Dentaire')

@section('content')
<div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Header -->
        <div class="mb-8">
            <h1 class="text-3xl font-bold text-gray-900">Mon Espace Patient</h1>
            <p class="text-gray-600 mt-2">Bienvenue {{ Auth::user()->name }}</p>
        </div>

        @if(!$patient)
            <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded-r-lg">
                <p class="text-yellow-700">Votre profil patient est en cours de configuration. Contactez le cabinet pour plus d'informations.</p>
            </div>
        @else
            <!-- Quick Actions -->
            <div class="bg-white rounded-xl shadow-sm p-6 mb-8">
                <h2 class="text-lg font-semibold text-gray-900 mb-4">Actions Rapides</h2>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <a href="{{ route('patient.book') }}" class="flex flex-col items-center p-4 bg-sky-50 rounded-lg hover:bg-sky-100 transition-colors group">
                        <div class="p-3 bg-sky-500 rounded-full mb-2 group-hover:bg-sky-600 transition-colors">
                            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                            </svg>
                        </div>
                        <span class="text-sm font-medium text-gray-700">Prendre RDV</span>
                    </a>
                    <a href="#appointments" class="flex flex-col items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors group">
                        <div class="p-3 bg-green-500 rounded-full mb-2 group-hover:bg-green-600 transition-colors">
                            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                        </div>
                        <span class="text-sm font-medium text-gray-700">Mes RDV</span>
                    </a>
                    <a href="#invoices" class="flex flex-col items-center p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors group">
                        <div class="p-3 bg-yellow-500 rounded-full mb-2 group-hover:bg-yellow-600 transition-colors">
                            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z"/>
                            </svg>
                        </div>
                        <span class="text-sm font-medium text-gray-700">Mes Factures</span>
                    </a>
                    <div class="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
                        <div class="p-3 bg-gray-400 rounded-full mb-2">
                            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                            </svg>
                        </div>
                        <span class="text-sm font-medium text-gray-700">Mon Profil</span>
                    </div>
                </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <!-- Upcoming Appointments -->
                <div id="appointments" class="bg-white rounded-xl shadow-sm">
                    <div class="p-6 border-b border-gray-200">
                        <h2 class="text-xl font-bold text-gray-900 flex items-center">
                            <svg class="w-5 h-5 mr-2 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                            </svg>
                            Rendez-vous à venir
                        </h2>
                    </div>
                    <div class="p-6">
                        @if($upcomingAppointments->count() > 0)
                            <div class="space-y-4">
                                @foreach($upcomingAppointments as $appointment)
                                    <div class="flex items-center justify-between p-4 bg-sky-50 rounded-lg border-l-4 border-sky-500">
                                        <div>
                                            <p class="font-semibold text-gray-900">
                                                {{ $appointment->appointment_date->format('d/m/Y') }} à {{ $appointment->start_time }}
                                            </p>
                                            <p class="text-sm text-gray-600">Dr. {{ $appointment->dentist->name ?? 'Non assigné' }}</p>
                                            <p class="text-sm text-gray-500">{{ $appointment->reason }}</p>
                                        </div>
                                        <div class="text-right">
                                            <span class="px-3 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                                                {{ $appointment->status === 'pending' ? 'En attente' : 'Confirmé' }}
                                            </span>
                                            @if($appointment->status !== 'completed' && $appointment->status !== 'cancelled')
                                                <form action="{{ route('patient.appointment.cancel', $appointment) }}" method="POST" class="mt-2">
                                                    @csrf
                                                    @method('PATCH')
                                                    <button type="submit" class="text-red-600 hover:text-red-800 text-sm" onclick="return confirm('Annuler ce rendez-vous ?')">
                                                        Annuler
                                                    </button>
                                                </form>
                                            @endif
                                        </div>
                                    </div>
                                @endforeach
                            </div>
                        @else
                            <p class="text-gray-500 text-center py-8">Aucun rendez-vous à venir</p>
                        @endif
                    </div>
                </div>

                <!-- My Invoices -->
                <div id="invoices" class="bg-white rounded-xl shadow-sm">
                    <div class="p-6 border-b border-gray-200">
                        <h2 class="text-xl font-bold text-gray-900 flex items-center">
                            <svg class="w-5 h-5 mr-2 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z"/>
                            </svg>
                            Mes Factures
                        </h2>
                    </div>
                    <div class="p-6">
                        @if($invoices->count() > 0)
                            <div class="space-y-4">
                                @foreach($invoices as $invoice)
                                    @php
                                        $remaining = $invoice->remaining_amount ?? $invoice->total_amount - ($invoice->payments->sum('amount') ?? 0);
                                        $isPaid = $remaining <= 0;
                                    @endphp
                                    <div class="flex items-center justify-between p-4 rounded-lg border-l-4 {{ $isPaid ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500' }}">
                                        <div>
                                            <p class="font-semibold text-gray-900">
                                                Facture #{{ str_pad($invoice->id, 5, '0', STR_PAD_LEFT) }}
                                            </p>
                                            <p class="text-sm text-gray-600">{{ $invoice->invoice_date->format('d/m/Y') }}</p>
                                            <p class="text-lg font-bold {{ $isPaid ? 'text-green-600' : 'text-red-600' }}">
                                                {{ number_format($invoice->total_amount, 2, ',', ' ') }} €
                                            </p>
                                        </div>
                                        <div class="text-right">
                                            <span class="px-3 py-1 text-xs rounded-full {{ $isPaid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800' }}">
                                                {{ $isPaid ? 'Payée' : 'À payer' }}
                                            </span>
                                            @if($remaining > 0)
                                                <p class="text-sm text-gray-600 mt-1">
                                                    Reste: {{ number_format($remaining, 2, ',', ' ') }} €
                                                </p>
                                            @endif
                                        </div>
                                    </div>
                                @endforeach
                            </div>
                        @else
                            <p class="text-gray-500 text-center py-8">Aucune facture</p>
                        @endif
                    </div>
                </div>
            </div>

            <!-- Past Appointments -->
            <div class="mt-8 bg-white rounded-xl shadow-sm">
                <div class="p-6 border-b border-gray-200">
                    <h2 class="text-xl font-bold text-gray-900 flex items-center">
                        <svg class="w-5 h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        Historique des Rendez-vous
                    </h2>
                </div>
                <div class="p-6">
                    @if($pastAppointments->count() > 0)
                        <div class="overflow-x-auto">
                            <table class="min-w-full divide-y divide-gray-200">
                                <thead class="bg-gray-50">
                                    <tr>
                                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dentiste</th>
                                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Motif</th>
                                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-gray-200">
                                    @foreach($pastAppointments as $appointment)
                                        <tr>
                                            <td class="px-4 py-3">{{ $appointment->appointment_date->format('d/m/Y') }}</td>
                                            <td class="px-4 py-3">Dr. {{ $appointment->dentist->name ?? 'N/A' }}</td>
                                            <td class="px-4 py-3">{{ $appointment->reason }}</td>
                                            <td class="px-4 py-3">
                                                <span class="px-2 py-1 text-xs rounded-full {{ $appointment->status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800' }}">
                                                    {{ $appointment->status === 'completed' ? 'Effectué' : ucfirst($appointment->status) }}
                                                </span>
                                            </td>
                                        </tr>
                                    @endforeach
                                </tbody>
                            </table>
                        </div>
                    @else
                        <p class="text-gray-500 text-center py-8">Aucun historique</p>
                    @endif
                </div>
            </div>
        @endif
    </div>
</div>
@endsection
