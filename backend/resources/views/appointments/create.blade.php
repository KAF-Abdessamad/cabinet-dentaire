@extends('layouts.admin')

@section('title', 'Nouveau Rendez-vous - Cabinet Dentaire')

@section('content')
<div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Header -->
        <div class="mb-8">
            <a href="{{ route('appointments.index') }}" class="inline-flex items-center text-gray-600 hover:text-sky-500 transition-colors mb-4">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
                </svg>
                Retour à la liste
            </a>
            <h1 class="text-3xl font-bold text-gray-900">Nouveau Rendez-vous</h1>
            <p class="text-gray-600 mt-2">Planifier une consultation</p>
        </div>

        <!-- Form -->
        <div class="bg-white rounded-xl shadow-sm">
            <form action="{{ route('appointments.store') }}" method="POST" class="p-8">
                @csrf

                @if($errors->any())
                    <div class="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-lg">
                        <div class="flex">
                            <div class="flex-shrink-0">
                                <svg class="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                </svg>
                            </div>
                            <div class="ml-3">
                                <h3 class="text-sm font-medium text-red-800">Veuillez corriger les erreurs :</h3>
                                <ul class="mt-2 text-sm text-red-700 list-disc list-inside">
                                    @foreach($errors->all() as $error)
                                        <li>{{ $error }}</li>
                                    @endforeach
                                </ul>
                            </div>
                        </div>
                    </div>
                @endif

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                        <label for="patient_id" class="block text-sm font-medium text-gray-700 mb-2">
                            Patient <span class="text-red-500">*</span>
                        </label>
                        <select name="patient_id" id="patient_id" required
                                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 @error('patient_id') border-red-500 @enderror">
                            <option value="">Sélectionner un patient</option>
                            @foreach($patients as $patient)
                                <option value="{{ $patient->id }}" {{ old('patient_id') == $patient->id ? 'selected' : '' }}>
                                    {{ $patient->full_name }} - {{ $patient->phone }}
                                </option>
                            @endforeach
                        </select>
                        @error('patient_id')
                            <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                        @enderror
                    </div>

                    <div>
                        <label for="user_id" class="block text-sm font-medium text-gray-700 mb-2">
                            Dentiste <span class="text-red-500">*</span>
                        </label>
                        <select name="user_id" id="user_id" required
                                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 @error('user_id') border-red-500 @enderror">
                            <option value="">Sélectionner un dentiste</option>
                            @foreach($dentists as $dentist)
                                <option value="{{ $dentist->id }}" {{ old('user_id') == $dentist->id ? 'selected' : '' }}>
                                    Dr. {{ $dentist->name }}
                                </option>
                            @endforeach
                        </select>
                        @error('user_id')
                            <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                        @enderror
                    </div>

                    <div>
                        <label for="appointment_date" class="block text-sm font-medium text-gray-700 mb-2">
                            Date du rendez-vous <span class="text-red-500">*</span>
                        </label>
                        <input type="date" name="appointment_date" id="appointment_date" 
                               value="{{ old('appointment_date', date('Y-m-d')) }}" required
                               class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 @error('appointment_date') border-red-500 @enderror">
                        @error('appointment_date')
                            <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                        @enderror
                    </div>

                    <div>
                        <label for="status" class="block text-sm font-medium text-gray-700 mb-2">
                            Statut <span class="text-red-500">*</span>
                        </label>
                        <select name="status" id="status" required
                                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500">
                            <option value="pending" {{ old('status') == 'pending' ? 'selected' : '' }}>En attente</option>
                            <option value="confirmed" {{ old('status') == 'confirmed' ? 'selected' : '' }}>Confirmé</option>
                        </select>
                    </div>

                    <div>
                        <label for="start_time" class="block text-sm font-medium text-gray-700 mb-2">
                            Heure de début <span class="text-red-500">*</span>
                        </label>
                        <input type="time" name="start_time" id="start_time" 
                               value="{{ old('start_time', '09:00') }}" required
                               class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 @error('start_time') border-red-500 @enderror">
                        @error('start_time')
                            <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                        @enderror
                    </div>

                    <div>
                        <label for="end_time" class="block text-sm font-medium text-gray-700 mb-2">
                            Heure de fin <span class="text-red-500">*</span>
                        </label>
                        <input type="time" name="end_time" id="end_time" 
                               value="{{ old('end_time', '10:00') }}" required
                               class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 @error('end_time') border-red-500 @enderror">
                        @error('end_time')
                            <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                        @enderror
                    </div>

                    <div class="md:col-span-2">
                        <label for="treatment_id" class="block text-sm font-medium text-gray-700 mb-2">
                            Type de soin <span class="text-red-500">*</span>
                        </label>
                        <select name="treatment_id" id="treatment_id" required
                                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500">
                            <option value="">Sélectionner un soin</option>
                            @foreach($treatments as $treatment)
                                <option value="{{ $treatment->id }}" {{ old('treatment_id') == $treatment->id ? 'selected' : '' }}>
                                    {{ $treatment->name }} ({{ $treatment->price }} DH)
                                </option>
                            @endforeach
                        </select>
                    </div>

                    <div class="md:col-span-2">
                        <label for="reason" class="block text-sm font-medium text-gray-700 mb-2">
                            Motif / Note additionnelle
                        </label>
                        <textarea name="reason" id="reason" rows="3"
                                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                                  placeholder="Précisions sur le rendez-vous...">{{ old('reason') }}</textarea>
                    </div>
                </div>

                <div class="bg-sky-50 p-4 rounded-lg mb-6">
                    <h3 class="text-sm font-medium text-sky-900 mb-2">ℹ️ Vérification de disponibilité</h3>
                    <p class="text-sm text-sky-700">Le système vérifie automatiquement la disponibilité du dentiste sur le créneau horaire sélectionné.</p>
                </div>

                <div class="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
                    <a href="{{ route('appointments.index') }}" 
                       class="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors">
                        Annuler
                    </a>
                    <button type="submit" 
                            class="px-6 py-3 bg-sky-500 text-white font-medium rounded-lg hover:bg-sky-600 transition-colors shadow-md">
                        Enregistrer le rendez-vous
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>
@endsection
