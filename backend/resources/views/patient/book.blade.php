@extends('layouts.admin')

@section('title', 'Prendre Rendez-vous - Cabinet Dentaire')

@section('content')
<div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Header -->
        <div class="mb-8">
            <a href="{{ route('patient.dashboard') }}" class="inline-flex items-center text-gray-600 hover:text-sky-500 transition-colors mb-4">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
                </svg>
                Retour à mon espace
            </a>
            <h1 class="text-3xl font-bold text-gray-900">Prendre un Rendez-vous</h1>
            <p class="text-gray-600 mt-2">Réservez votre prochaine consultation</p>
        </div>

        <!-- Form -->
        <div class="bg-white rounded-xl shadow-sm">
            <form action="{{ route('patient.book') }}" method="POST" class="p-8">
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
                        <label for="dentist_id" class="block text-sm font-medium text-gray-700 mb-2">
                            Dentiste <span class="text-red-500">*</span>
                        </label>
                        <select name="dentist_id" id="dentist_id" required
                                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500">
                            <option value="">Choisir un dentiste</option>
                            @foreach($dentists as $dentist)
                                <option value="{{ $dentist->id }}" {{ old('dentist_id') == $dentist->id ? 'selected' : '' }}>
                                    Dr. {{ $dentist->name }}
                                </option>
                            @endforeach
                        </select>
                    </div>

                    <div>
                        <label for="appointment_date" class="block text-sm font-medium text-gray-700 mb-2">
                            Date du rendez-vous <span class="text-red-500">*</span>
                        </label>
                        <input type="date" name="appointment_date" id="appointment_date" 
                               value="{{ old('appointment_date') }}" required min="{{ date('Y-m-d') }}"
                               class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500">
                    </div>

                    <div>
                        <label for="start_time" class="block text-sm font-medium text-gray-700 mb-2">
                            Heure de début <span class="text-red-500">*</span>
                        </label>
                        <input type="time" name="start_time" id="start_time" 
                               value="{{ old('start_time') }}" required
                               class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500">
                    </div>

                    <div>
                        <label for="end_time" class="block text-sm font-medium text-gray-700 mb-2">
                            Heure de fin <span class="text-red-500">*</span>
                        </label>
                        <input type="time" name="end_time" id="end_time" 
                               value="{{ old('end_time') }}" required
                               class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500">
                    </div>

                    <div class="md:col-span-2">
                        <label for="reason" class="block text-sm font-medium text-gray-700 mb-2">
                            Motif de la consultation <span class="text-red-500">*</span>
                        </label>
                        <select name="reason" id="reason" required
                                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 mb-2">
                            <option value="">Sélectionner un motif</option>
                            <option value="Consultation générale" {{ old('reason') == 'Consultation générale' ? 'selected' : '' }}>Consultation générale</option>
                            <option value="Détartrage" {{ old('reason') == 'Détartrage' ? 'selected' : '' }}>Détartrage</option>
                            <option value="Soin des caries" {{ old('reason') == 'Soin des caries' ? 'selected' : '' }}>Soin des caries</option>
                            <option value="Extraction dentaire" {{ old('reason') == 'Extraction dentaire' ? 'selected' : '' }}>Extraction dentaire</option>
                            <option value="Couronne / Bridge" {{ old('reason') == 'Couronne / Bridge' ? 'selected' : '' }}>Couronne / Bridge</option>
                            <option value="Implant dentaire" {{ old('reason') == 'Implant dentaire' ? 'selected' : '' }}>Implant dentaire</option>
                            <option value="Blanchiment" {{ old('reason') == 'Blanchiment' ? 'selected' : '' }}>Blanchiment</option>
                            <option value="Orthodontie" {{ old('reason') == 'Orthodontie' ? 'selected' : '' }}>Orthodontie</option>
                            <option value="Urgence dentaire" {{ old('reason') == 'Urgence dentaire' ? 'selected' : '' }}>Urgence dentaire</option>
                            <option value="Autre">Autre (préciser)</option>
                        </select>
                        <textarea name="reason_details" id="reason_details" rows="2"
                                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                                  placeholder="Précisions sur le motif...">{{ old('reason_details') }}</textarea>
                    </div>
                </div>

                <div class="bg-sky-50 p-4 rounded-lg mb-6">
                    <h3 class="text-sm font-medium text-sky-900 mb-2">ℹ️ Informations</h3>
                    <ul class="text-sm text-sky-700 list-disc list-inside space-y-1">
                        <li>Les rendez-vous sont confirmés sous 24h</li>
                        <li>Vous recevrez un email de confirmation</li>
                        <li>En cas d'urgence, appelez directement le cabinet au 01 23 45 67 89</li>
                    </ul>
                </div>

                <div class="flex items-center justify-end space-x-4">
                    <a href="{{ route('patient.dashboard') }}" 
                       class="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors">
                        Annuler
                    </a>
                    <button type="submit" 
                            class="px-6 py-3 bg-sky-500 text-white font-medium rounded-lg hover:bg-sky-600 transition-colors shadow-md">
                        Demander le rendez-vous
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>
@endsection
