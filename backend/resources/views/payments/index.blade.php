@extends('layouts.admin')



@section('title', 'Gestion des Paiements - Cabinet Dentaire')



@section('content')

<div class="min-h-screen bg-gray-50 py-8">

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <!-- Header -->

        <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-8">

            <div>

                <h1 class="text-3xl font-bold text-gray-900">Gestion des Paiements</h1>

                <p class="mt-2 text-gray-600">Historique des transactions</p>

            </div>

            <div class="mt-4 md:mt-0">

                <a href="{{ route('payments.create') }}" 

                   class="inline-flex items-center px-6 py-3 bg-sky-500 text-white font-semibold rounded-lg hover:bg-sky-600 transition-colors shadow-md">

                    <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">

                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>

                    </svg>

                    Nouveau Paiement

                </a>

            </div>

        </div>



        <!-- Stats Cards -->

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

            <div class="bg-white rounded-xl shadow-sm p-6">

                <div class="flex items-center">

                    <div class="p-3 bg-green-100 rounded-lg">

                        <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">

                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>

                        </svg>

                    </div>

                    <div class="ml-4">

                        <p class="text-sm text-gray-500">Total Payé Aujourd'hui</p>

                        <p class="text-2xl font-bold text-green-600">{{ number_format($todayTotal ?? 0, 2, ',', ' ') }} €</p>

                    </div>

                </div>

            </div>

            <div class="bg-white rounded-xl shadow-sm p-6">

                <div class="flex items-center">

                    <div class="p-3 bg-blue-100 rounded-lg">

                        <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">

                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>

                        </svg>

                    </div>

                    <div class="ml-4">

                        <p class="text-sm text-gray-500">Total Payé ce Mois</p>

                        <p class="text-2xl font-bold text-blue-600">{{ number_format($monthTotal ?? 0, 2, ',', ' ') }} €</p>

                    </div>

                </div>

            </div>

            <div class="bg-white rounded-xl shadow-sm p-6">

                <div class="flex items-center">

                    <div class="p-3 bg-sky-100 rounded-lg">

                        <svg class="w-6 h-6 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">

                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/>

                        </svg>

                    </div>

                    <div class="ml-4">

                        <p class="text-sm text-gray-500">Nombre de Paiements</p>

                        <p class="text-2xl font-bold text-sky-600">{{ $payments->count() ?? 0 }}</p>

                    </div>

                </div>

            </div>

        </div>



        <!-- Alert Messages -->

        @if(session('success'))

            <div class="bg-sky-50 border-l-4 border-sky-500 p-4 mb-6 rounded-r-lg">

                <p class="text-sky-700">{{ session('success') }}</p>

            </div>

        @endif



        <!-- Payments Table -->

        <div class="bg-white rounded-xl shadow-sm overflow-hidden">

            <div class="overflow-x-auto">

                <table class="min-w-full divide-y divide-gray-200">

                    <thead class="bg-gray-50">

                        <tr>

                            <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Date</th>

                            <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>

                            <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Facture N°</th>

                            <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Méthode</th>

                            <th class="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase">Montant</th>

                            <th class="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>

                        </tr>

                    </thead>

                    <tbody class="bg-white divide-y divide-gray-200">

                        @forelse($payments ?? [] as $payment)

                            <tr class="hover:bg-gray-50 transition-colors">

                                <td class="px-6 py-4 whitespace-nowrap">

                                    <div class="text-sm font-medium text-gray-900">{{ $payment->payment_date->format('d/m/Y') }}</div>

                                    <div class="text-sm text-gray-500">{{ $payment->created_at->format('H:i') }}</div>

                                </td>

                                <td class="px-6 py-4 whitespace-nowrap">

                                    <div class="text-sm font-medium text-gray-900">{{ $payment->invoice->patient->full_name ?? 'N/A' }}</div>

                                </td>

                                <td class="px-6 py-4 whitespace-nowrap">

                                    <a href="{{ route('invoices.show', $payment->invoice) }}" class="text-sm text-sky-600 hover:text-sky-500">

                                        #{{ str_pad($payment->invoice_id, 5, '0', STR_PAD_LEFT) }}

                                    </a>

                                </td>

                                <td class="px-6 py-4 whitespace-nowrap">

                                    <span class="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">

                                        @switch($payment->payment_method)

                                            @case('cash') Espèces @break

                                            @case('card') Carte @break

                                            @case('check') Chèque @break

                                            @case('transfer') Virement @break

                                            @case('insurance') Assurance @break

                                            @default {{ $payment->payment_method }}

                                        @endswitch

                                    </span>

                                </td>

                                <td class="px-6 py-4 whitespace-nowrap text-right">

                                    <div class="text-sm font-bold text-green-600">{{ number_format($payment->amount, 2, ',', ' ') }} €</div>

                                </td>

                                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">

                                    <form action="{{ route('payments.destroy', $payment) }}" method="POST" class="inline" onsubmit="return confirm('Êtes-vous sûr ?');">

                                        @csrf

                                        @method('DELETE')

                                        <button type="submit" class="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-lg transition-colors">

                                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">

                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>

                                            </svg>

                                        </button>

                                    </form>

                                </td>

                            </tr>

                        @empty

                            <tr>

                                <td colspan="6" class="px-6 py-12 text-center text-gray-500">

                                    <svg class="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">

                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/>

                                    </svg>

                                    <p class="text-lg font-medium">Aucun paiement enregistré</p>

                                </td>

                            </tr>

                        @endforelse

                    </tbody>

                </table>

            </div>

            @if(($payments ?? collect())->hasPages())

                <div class="px-6 py-4 bg-gray-50 border-t border-gray-200">

                    {{ $payments->links() }}

                </div>

            @endif

        </div>

    </div>

</div>

@endsection

