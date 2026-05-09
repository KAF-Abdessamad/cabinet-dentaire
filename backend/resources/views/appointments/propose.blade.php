@extends('layouts.admin')

@section('title', 'Proposer un créneau - Cabinet Dentaire')

@section('content')
<div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="mb-8">
            <a href="{{ route('appointments.index') }}" class="text-sky-600 hover:text-sky-700 font-medium flex items-center">
                <svg class="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
                </svg>
                Retour à la liste
            </a>
            <h1 class="text-3xl font-bold text-gray-900 mt-4">Proposer un créneau</h1>
            <p class="text-gray-600">Réponse à la demande de {{ $appointment->patient->full_name }}</p>
        </div>

        @if($errors->any())
            <div class="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-lg">
                <div class="flex">
                    <div class="flex-shrink-0">
                        <svg class="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div class="ml-3">
                        <h3 class="text-sm font-medium text-red-800">Des erreurs sont survenues :</h3>
                        <ul class="mt-1 text-sm text-red-700 list-disc list-inside">
                            @foreach($errors->all() as $error)
                                <li>{{ $error }}</li>
                            @endforeach
                        </ul>
                    </div>
                </div>
            </div>
        @endif

        <div class="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div class="p-8">
                <!-- Demande initiale -->
                <div class="mb-8 p-4 bg-sky-50 rounded-xl border border-sky-100">
                    <h3 class="text-sm font-bold text-sky-800 uppercase tracking-wider mb-2">Détails de la demande</h3>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <span class="text-xs text-sky-600 font-medium block">Type de soin</span>
                            <span class="text-gray-900 font-bold">{{ $appointment->treatment->name ?? 'Non spécifié' }}</span>
                        </div>
                        <div>
                            <span class="text-xs text-sky-600 font-medium block">Date de demande</span>
                            <span class="text-gray-900 font-bold">{{ $appointment->created_at->format('d/m/Y à H:i') }}</span>
                        </div>
                    </div>
                    @if($appointment->patient_note)
                        <div class="mt-3">
                            <span class="text-xs text-sky-600 font-medium block">Note du patient</span>
                            <p class="text-gray-700 italic">"{{ $appointment->patient_note }}"</p>
                        </div>
                    @endif
                </div>

                <form action="{{ route('appointments.store-proposal', $appointment) }}" method="POST" class="space-y-6">
                    @csrf
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label class="block text-sm font-bold text-gray-700 mb-2">Choisir un Dentiste</label>
                            <select name="user_id" required class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent">
                                <option value="">Sélectionner un dentiste</option>
                                @foreach($dentists as $dentist)
                                    <option value="{{ $dentist->id }}" {{ old('user_id') == $dentist->id ? 'selected' : '' }}>
                                        {{ $dentist->name }}
                                    </option>
                                @endforeach
                            </select>
                        </div>

                        <div>
                            <label class="block text-sm font-bold text-gray-700 mb-2">Date Proposée</label>
                            <input type="date" name="appointment_date" value="{{ old('appointment_date') }}" required
                                   class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent">
                        </div>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label class="block text-sm font-bold text-gray-700 mb-2">Heure de début</label>
                            <input type="time" name="start_time" value="{{ old('start_time') }}" required
                                   class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent">
                        </div>

                        <div>
                            <label class="block text-sm font-bold text-gray-700 mb-2">Durée estimée (minutes)</label>
                            <select name="duration" required class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent">
                                <option value="15" {{ old('duration') == '15' ? 'selected' : '' }}>15 min</option>
                                <option value="30" {{ old('duration', '30') == '30' ? 'selected' : '' }}>30 min</option>
                                <option value="45" {{ old('duration') == '45' ? 'selected' : '' }}>45 min</option>
                                <option value="60" {{ old('duration') == '60' ? 'selected' : '' }}>1 heure</option>
                                <option value="90" {{ old('duration') == '90' ? 'selected' : '' }}>1h 30min</option>
                                <option value="120" {{ old('duration') == '120' ? 'selected' : '' }}>2 heures</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label class="block text-sm font-bold text-gray-700 mb-2">Note pour le patient (optionnel)</label>
                        <textarea name="admin_note" rows="3" 
                                  class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                                  placeholder="Précisions sur le rendez-vous ou consignes particulières...">{{ old('admin_note') }}</textarea>
                    </div>

                    <div class="flex items-center justify-between pt-6 border-t border-gray-100">
                        <p class="text-sm text-gray-500 max-w-xs">
                            Le patient recevra une notification pour confirmer ou refuser ce créneau.
                        </p>
                        <button type="submit" class="px-8 py-3 bg-sky-500 text-white font-bold rounded-xl hover:bg-sky-600 transition-colors shadow-lg shadow-sky-100">
                            Envoyer la proposition
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</div>
@endsection