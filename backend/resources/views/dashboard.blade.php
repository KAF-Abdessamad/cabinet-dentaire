@extends('layouts.admin')

@section('title', 'Tableau de Bord - Cabinet Dentaire')

@section('content')
<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" x-data="{ activeTab: 'stats' }">
    <div class="mb-8 flex justify-between items-end">
        <div>
            <h1 class="text-3xl font-bold text-gray-900">Tableau de Bord</h1>
            <p class="text-gray-600 mt-2">Bienvenue {{ Auth::user()->name }} - {{ Auth::user()->roles->first()->name ?? 'Utilisateur' }}</p>
        </div>
        <div class="flex gap-2 bg-white p-1 rounded-xl shadow-sm border border-gray-100">
            <button @click="activeTab = 'stats'" :class="activeTab === 'stats' ? 'bg-sky-500 text-white' : 'text-gray-600 hover:bg-gray-50'" class="px-4 py-2 rounded-lg text-sm font-medium transition-all">
                Statistiques
            </button>
            <button @click="activeTab = 'calendar'" :class="activeTab === 'calendar' ? 'bg-sky-500 text-white' : 'text-gray-600 hover:bg-gray-50'" class="px-4 py-2 rounded-lg text-sm font-medium transition-all">
                Calendrier Semaine
            </button>
        </div>
    </div>

    <!-- Stats Tab -->
    <div x-show="activeTab === 'stats'" x-transition>
        <!-- Quick Access Menu -->
        <div class="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-100">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">Accès Rapide</h2>
            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <a href="{{ route('patients.index') }}" class="flex flex-col items-center p-4 bg-sky-50 rounded-xl hover:bg-sky-100 transition-all group border border-sky-100/50 hover:scale-105">
                    <div class="p-3 bg-sky-500 rounded-full mb-2 group-hover:bg-sky-600 transition-colors shadow-lg shadow-sky-200">
                        <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                    </div>
                    <span class="text-xs font-bold text-sky-900">Patients</span>
                </a>
                <a href="{{ route('patients.create') }}" class="flex flex-col items-center p-4 bg-emerald-50 rounded-xl hover:bg-emerald-100 transition-all group border border-emerald-100/50 hover:scale-105">
                    <div class="p-3 bg-emerald-500 rounded-full mb-2 group-hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-200">
                        <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/></svg>
                    </div>
                    <span class="text-xs font-bold text-emerald-900">Nouveau Patient</span>
                </a>
                <a href="{{ route('appointments.index') }}" class="flex flex-col items-center p-4 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-all group border border-indigo-100/50 hover:scale-105">
                    <div class="p-3 bg-indigo-500 rounded-full mb-2 group-hover:bg-indigo-600 transition-colors shadow-lg shadow-indigo-200">
                        <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                    </div>
                    <span class="text-xs font-bold text-indigo-900">Rendez-vous</span>
                </a>
                <a href="{{ route('invoices.index') }}" class="flex flex-col items-center p-4 bg-amber-50 rounded-xl hover:bg-amber-100 transition-all group border border-amber-100/50 hover:scale-105">
                    <div class="p-3 bg-amber-500 rounded-full mb-2 group-hover:bg-amber-600 transition-colors shadow-lg shadow-amber-200">
                        <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z"/></svg>
                    </div>
                    <span class="text-xs font-bold text-amber-900">Factures</span>
                </a>
                <a href="{{ route('treatments.index') }}" class="flex flex-col items-center p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-all group border border-purple-100/50 hover:scale-105">
                    <div class="p-3 bg-purple-500 rounded-full mb-2 group-hover:bg-purple-600 transition-colors shadow-lg shadow-purple-200">
                        <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/></svg>
                    </div>
                    <span class="text-xs font-bold text-purple-900">Soins</span>
                </a>
                <a href="{{ route('payments.index') }}" class="flex flex-col items-center p-4 bg-rose-50 rounded-xl hover:bg-rose-100 transition-all group border border-rose-100/50 hover:scale-105">
                    <div class="p-3 bg-rose-500 rounded-full mb-2 group-hover:bg-rose-600 transition-colors shadow-lg shadow-rose-200">
                        <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    </div>
                    <span class="text-xs font-bold text-rose-900">Paiements</span>
                </a>
            </div>
        </div>

        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div class="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                <div class="flex items-center">
                    <div class="p-3 bg-blue-100 rounded-xl"><svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0z"/></svg></div>
                    <div class="ml-4">
                        <p class="text-xs font-bold text-gray-500 uppercase">Total Patients</p>
                        <p class="text-2xl font-bold text-gray-900">{{ $stats['total_patients'] }}</p>
                    </div>
                </div>
            </div>
            <div class="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                <div class="flex items-center">
                    <div class="p-3 bg-emerald-100 rounded-xl"><svg class="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg></div>
                    <div class="ml-4">
                        <p class="text-xs font-bold text-gray-500 uppercase">RDV Aujourd'hui</p>
                        <p class="text-2xl font-bold text-gray-900">{{ $stats['appointments_today'] }}</p>
                    </div>
                </div>
            </div>
            <div class="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                <div class="flex items-center">
                    <div class="p-3 bg-amber-100 rounded-xl"><svg class="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg></div>
                    <div class="ml-4">
                        <p class="text-xs font-bold text-gray-500 uppercase">Revenu du Mois</p>
                        <p class="text-2xl font-bold text-gray-900">{{ number_format($stats['revenue_month'], 0, ',', ' ') }} DH</p>
                    </div>
                </div>
            </div>
            <div class="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                <div class="flex items-center">
                    <div class="p-3 bg-rose-100 rounded-xl"><svg class="w-6 h-6 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg></div>
                    <div class="ml-4">
                        <p class="text-xs font-bold text-gray-500 uppercase">Factures en Attente</p>
                        <p class="text-2xl font-bold text-gray-900">{{ $stats['pending_invoices_count'] }}</p>
                    </div>
                </div>
            </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <!-- Today's Appointments -->
            <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div class="px-6 py-4 bg-gray-50/50 border-b border-gray-100 flex justify-between items-center">
                    <h2 class="text-lg font-bold text-gray-900">Rendez-vous du Jour</h2>
                    <a href="{{ route('appointments.index') }}" class="text-xs font-bold text-sky-600 hover:underline">Voir tout</a>
                </div>
                <div class="p-6">
                    @forelse($todaysAppointments as $appointment)
                        <div class="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl mb-3 hover:shadow-md transition-all">
                            <div class="flex items-center gap-4">
                                <div class="w-10 h-10 bg-sky-100 rounded-full flex items-center justify-center text-sky-600 font-bold">
                                    {{ substr($appointment->patient->first_name, 0, 1) }}{{ substr($appointment->patient->last_name, 0, 1) }}
                                </div>
                                <div>
                                    <p class="font-bold text-gray-900">{{ $appointment->patient->full_name }}</p>
                                    <p class="text-xs text-gray-500">{{ $appointment->start_time }} - {{ $appointment->end_time }} • {{ $appointment->treatment->name ?? 'Soin' }}</p>
                                </div>
                            </div>
                            <span class="px-3 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider
                                @if($appointment->status == 'pending') bg-amber-100 text-amber-800
                                @elseif($appointment->status == 'confirmed') bg-emerald-100 text-emerald-800
                                @elseif($appointment->status == 'requested') bg-blue-100 text-blue-800
                                @else bg-gray-100 text-gray-800 @endif">
                                {{ ucfirst($appointment->status) }}
                            </span>
                        </div>
                    @empty
                        <p class="text-sm text-gray-500 text-center py-8">Aucun rendez-vous aujourd'hui</p>
                    @endforelse
                </div>
            </div>

            <!-- Recent Patients -->
            <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div class="px-6 py-4 bg-gray-50/50 border-b border-gray-100 flex justify-between items-center">
                    <h2 class="text-lg font-bold text-gray-900">Nouveaux Patients</h2>
                    <a href="{{ route('patients.index') }}" class="text-xs font-bold text-sky-600 hover:underline">Voir tout</a>
                </div>
                <div class="p-6">
                    @forelse($recentPatients as $patient)
                        <div class="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl mb-3 hover:shadow-md transition-all">
                            <div class="flex items-center gap-4">
                                <div class="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-bold uppercase">
                                    {{ substr($patient->first_name, 0, 1) }}{{ substr($patient->last_name, 0, 1) }}
                                </div>
                                <div>
                                    <p class="font-bold text-gray-900">{{ $patient->full_name }}</p>
                                    <p class="text-xs text-gray-500">{{ $patient->phone }} • Inscrit {{ $patient->created_at->diffForHumans() }}</p>
                                </div>
                            </div>
                            <a href="{{ route('patients.show', $patient) }}" class="p-2 bg-gray-50 rounded-lg hover:bg-sky-50 text-sky-600 transition-colors">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
                            </a>
                        </div>
                    @empty
                        <p class="text-sm text-gray-500 text-center py-8">Aucun nouveau patient</p>
                    @endforelse
                </div>
            </div>
        </div>
    </div>

    <!-- Calendar Tab -->
    <div x-show="activeTab === 'calendar'" x-transition class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="p-6 border-b border-gray-100 flex justify-between items-center">
            <h2 class="text-xl font-bold text-gray-900">Agenda Hebdomadaire</h2>
            <p class="text-sm text-gray-500">Semaine du {{ \Carbon\Carbon::now()->startOfWeek()->format('d/m') }} au {{ \Carbon\Carbon::now()->endOfWeek()->format('d/m') }}</p>
        </div>
        <div class="p-6 overflow-x-auto">
            <div class="min-w-[800px]">
                <div class="grid grid-cols-7 gap-4 mb-4">
                    @php $weekDays = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']; @endphp
                    @foreach($weekDays as $index => $day)
                        <div class="text-center">
                            <p class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{{ $day }}</p>
                            @php $date = \Carbon\Carbon::now()->startOfWeek()->addDays($index); @endphp
                            <p class="text-lg font-bold {{ $date->isToday() ? 'text-sky-600' : 'text-gray-900' }}">{{ $date->format('d') }}</p>
                        </div>
                    @endforeach
                </div>
                <div class="grid grid-cols-7 gap-4">
                    @foreach(range(0, 6) as $index)
                        @php $dateStr = \Carbon\Carbon::now()->startOfWeek()->addDays($index)->format('Y-m-d'); @endphp
                        <div class="min-h-[400px] bg-gray-50/50 rounded-xl p-3 border border-dashed border-gray-200">
                            @if(isset($weekAppointments[$dateStr]))
                                @foreach($weekAppointments[$dateStr] as $appt)
                                    <div class="bg-white p-2 rounded-lg shadow-sm border-l-4 mb-2 text-[10px]
                                        @if($appt->status == 'confirmed') border-emerald-500 @elseif($appt->status == 'requested') border-blue-500 @else border-amber-500 @endif">
                                        <p class="font-bold text-gray-900 truncate">{{ $appt->patient->full_name }}</p>
                                        <p class="text-gray-500">{{ $appt->start_time }} - {{ $appt->treatment->name ?? 'Soin' }}</p>
                                    </div>
                                @endforeach
                            @endif
                            
                            <button class="w-full py-2 mt-2 rounded-lg border border-dashed border-gray-300 text-[10px] font-bold text-gray-400 hover:bg-white hover:text-sky-600 hover:border-sky-300 transition-all">
                                + Dispo
                            </button>
                        </div>
                    @endforeach
                </div>
            </div>
        </div>
        <div class="bg-sky-50 p-6 border-t border-sky-100">
            <div class="flex items-center gap-3">
                <div class="p-2 bg-sky-500 rounded-lg text-white">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                </div>
                <div>
                    <h4 class="text-sm font-bold text-sky-900">Envoi de disponibilités</h4>
                    <p class="text-xs text-sky-700">Utilisez les demandes de rendez-vous pour proposer un créneau précis aux patients. Ils recevront une notification immédiate.</p>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection
