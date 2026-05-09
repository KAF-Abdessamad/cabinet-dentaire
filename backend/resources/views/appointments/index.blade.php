@extends('layouts.admin')

@section('title', 'Gestion des Rendez-vous - Cabinet Dentaire')

@section('content')
<div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Header -->
        <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
                <h1 class="text-3xl font-bold text-gray-900">Gestion des Rendez-vous</h1>
                <p class="mt-2 text-gray-600">{{ $appointments instanceof \Illuminate\Pagination\LengthAwarePaginator ? $appointments->total() : $appointments->count() }} rendez-vous enregistrés</p>
            </div>
            <div class="mt-4 md:mt-0">
                <a href="{{ route('appointments.create') }}" 
                   class="inline-flex items-center px-6 py-3 bg-sky-500 text-white font-semibold rounded-lg hover:bg-sky-600 transition-colors shadow-md">
                    <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                    </svg>
                    Nouveau Rendez-vous
                </a>
            </div>
        </div>

        <!-- Filters -->
        <div class="bg-white rounded-xl shadow-sm p-6 mb-6">
            <form action="{{ route('appointments.index') }}" method="GET" class="space-y-4">
                <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Date</label>
                        <input type="date" name="date" value="{{ request('date') }}" 
                               class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Patient</label>
                        <input type="text" name="patient" value="{{ request('patient') }}" 
                               class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                               placeholder="Nom du patient">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Dentiste</label>
                        <select name="dentist" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500">
                            <option value="">Tous</option>
                            @foreach($dentists ?? [] as $dentist)
                                <option value="{{ $dentist->id }}" {{ request('dentist') == $dentist->id ? 'selected' : '' }}>
                                    {{ $dentist->name }}
                                </option>
                            @endforeach
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Statut</label>
                        <select name="status" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500">
                            <option value="">Tous</option>
                            <option value="requested" {{ request('status') == 'requested' ? 'selected' : '' }}>Nouvelle Demande</option>
                            <option value="proposed" {{ request('status') == 'proposed' ? 'selected' : '' }}>Proposition Envoyée</option>
                            <option value="confirmed" {{ request('status') == 'confirmed' ? 'selected' : '' }}>Confirmé</option>
                            <option value="completed" {{ request('status') == 'completed' ? 'selected' : '' }}>Terminé</option>
                            <option value="cancelled" {{ request('status') == 'cancelled' ? 'selected' : '' }}>Annulé</option>
                        </select>
                    </div>
                </div>
                <div class="flex justify-end space-x-3">
                    <a href="{{ route('appointments.index') }}" class="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors">
                        Réinitialiser
                    </a>
                    <button type="submit" class="px-6 py-2 bg-sky-500 text-white font-medium rounded-lg hover:bg-sky-600 transition-colors">
                        Filtrer
                    </button>
                </div>
            </form>
        </div>

        <!-- Alert Messages -->
        @if(session('success'))
            <div class="bg-sky-50 border-l-4 border-sky-500 p-4 mb-6 rounded-r-lg">
                <p class="text-sky-700">{{ session('success') }}</p>
            </div>
        @endif

        <!-- Appointments Table -->
        <div class="bg-white rounded-xl shadow-sm overflow-hidden">
            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Date & Heure</th>
                            <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
                            <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Dentiste</th>
                            <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Motif</th>
                            <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                            <th class="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                        @forelse($appointments as $appointment)
                            <tr class="hover:bg-gray-50 transition-colors {{ $appointment->status == 'requested' ? 'bg-sky-50/30' : '' }}">
                                <td class="px-6 py-4 whitespace-nowrap">
                                    @if($appointment->appointment_date)
                                        <div class="text-sm font-medium text-gray-900">{{ $appointment->appointment_date->format('d/m/Y') }}</div>
                                        <div class="text-sm text-gray-500">{{ $appointment->start_time }} - {{ $appointment->end_time }}</div>
                                    @else
                                        <span class="text-xs font-bold text-sky-600 bg-sky-100 px-2 py-1 rounded-full uppercase">À planifier</span>
                                    @endif
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <div class="text-sm font-medium text-gray-900">{{ $appointment->patient->full_name ?? 'N/A' }}</div>
                                    <div class="text-sm text-gray-500">{{ $appointment->patient->phone ?? '' }}</div>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    @if($appointment->dentist)
                                        <div class="text-sm text-gray-900">Dr. {{ $appointment->dentist->name }}</div>
                                    @else
                                        <span class="text-gray-400 italic text-sm">Non assigné</span>
                                    @endif
                                </td>
                                <td class="px-6 py-4">
                                    <div class="text-sm text-gray-900">{{ $appointment->treatment->name ?? $appointment->reason ?? 'Consultation' }}</div>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    @php
                                        $statusClasses = [
                                            'requested' => 'bg-sky-100 text-sky-800 border-sky-200',
                                            'proposed' => 'bg-yellow-100 text-yellow-800 border-yellow-200',
                                            'confirmed' => 'bg-green-100 text-green-800 border-green-200',
                                            'completed' => 'bg-gray-100 text-gray-800 border-gray-200',
                                            'cancelled' => 'bg-red-100 text-red-800 border-red-200',
                                        ];
                                        $statusLabels = [
                                            'requested' => 'Nouvelle Demande',
                                            'proposed' => 'Proposition envoyée',
                                            'confirmed' => 'Confirmé',
                                            'completed' => 'Terminé',
                                            'cancelled' => 'Annulé',
                                        ];
                                    @endphp
                                    <span class="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border {{ $statusClasses[$appointment->status] ?? 'bg-gray-100 text-gray-800' }}">
                                        {{ $statusLabels[$appointment->status] ?? $appointment->status }}
                                    </span>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div class="flex justify-end space-x-2">
                                        @if($appointment->status == 'requested')
                                            <a href="{{ route('appointments.propose', $appointment) }}" class="text-sky-600 hover:text-sky-900 bg-sky-50 px-3 py-1 rounded-lg border border-sky-100">
                                                Planifier
                                            </a>
                                        @endif
                                        <a href="{{ route('appointments.show', $appointment) }}" 
                                           class="text-sky-600 hover:text-sky-500 bg-sky-50 hover:bg-sky-100 px-3 py-1 rounded-lg transition-colors"
                                           title="Voir">
                                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                                            </svg>
                                        </a>
                                        <a href="{{ route('appointments.edit', $appointment) }}" 
                                           class="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-lg transition-colors"
                                           title="Modifier">
                                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                                            </svg>
                                        </a>
                                        <form action="{{ route('appointments.destroy', $appointment) }}" method="POST" class="inline" onsubmit="return confirm('Êtes-vous sûr ?');">
                                            @csrf
                                            @method('DELETE')
                                            <button type="submit" class="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-lg transition-colors">
                                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                                                </svg>
                                            </button>
                                        </form>
                                    </div>
                                </td>
                            </tr>
                        @empty
                            <tr>
                                <td colspan="6" class="px-6 py-12 text-center text-gray-500">
                                    <svg class="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                                    </svg>
                                    <p class="text-lg font-medium">Aucun rendez-vous trouvé</p>
                                </td>
                            </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>
            @if($appointments instanceof \Illuminate\Pagination\LengthAwarePaginator && $appointments->hasPages())
                <div class="px-6 py-4 bg-gray-50 border-t border-gray-200">
                    {{ $appointments->links() }}
                </div>
            @endif
        </div>
    </div>
</div>
@endsection
