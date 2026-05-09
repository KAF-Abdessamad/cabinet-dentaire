<nav class="bg-sky-600">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
            <!-- Logo & Brand -->
            <div class="flex items-center">
                <a href="{{ route('admin.dashboard') }}" class="flex items-center">
                    <div class="flex-shrink-0">
                        <svg class="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/>
                        </svg>
                    </div>
                    <span class="ml-3 text-white font-bold text-lg">Cabinet Dentaire</span>
                </a>
            </div>

            <!-- Navigation Links -->
            <div class="hidden md:block">
                <div class="flex items-baseline space-x-4">
                    <a href="{{ route('admin.dashboard') }}" 
                       class="{{ request()->routeIs('admin.dashboard') ? 'bg-sky-700 text-white' : 'text-sky-100 hover:bg-sky-500 hover:text-white' }} px-3 py-2 rounded-md text-sm font-medium transition-colors">
                        Dashboard
                    </a>
                    
                    <a href="{{ route('patients.index') }}" 
                       class="{{ request()->routeIs('patients.*') ? 'bg-sky-700 text-white' : 'text-sky-100 hover:bg-sky-500 hover:text-white' }} px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center">
                        <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                        </svg>
                        Patients
                    </a>
                    
                    <a href="{{ route('appointments.index') }}" 
                       class="{{ request()->routeIs('appointments.*') ? 'bg-sky-700 text-white' : 'text-sky-100 hover:bg-sky-500 hover:text-white' }} px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center">
                        <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                        </svg>
                        Rendez-vous
                    </a>
                    
                    <a href="{{ route('invoices.index') }}" 
                       class="{{ request()->routeIs('invoices.*') ? 'bg-sky-700 text-white' : 'text-sky-100 hover:bg-sky-500 hover:text-white' }} px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center">
                        <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z"/>
                        </svg>
                        Factures
                    </a>
                    
                    <a href="{{ route('treatments.index') }}" 
                       class="{{ request()->routeIs('treatments.*') ? 'bg-sky-700 text-white' : 'text-sky-100 hover:bg-sky-500 hover:text-white' }} px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center">
                        <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/>
                        </svg>
                        Soins
                    </a>
                    
                    <a href="{{ route('payments.index') }}" 
                       class="{{ request()->routeIs('payments.*') ? 'bg-sky-700 text-white' : 'text-sky-100 hover:bg-sky-500 hover:text-white' }} px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center">
                        <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        Paiements
                    </a>
                </div>
            </div>

            <!-- User Menu -->
            <div class="hidden md:block">
                <div class="flex items-center space-x-4">
                    <!-- Notifications Dropdown -->
                    <div class="relative" x-data="{ open: false }">
                        <button @click="open = !open" class="relative p-1 text-sky-100 hover:text-white focus:outline-none transition-colors">
                            <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
                            </svg>
                            @php $unreadCount = Auth::user()->unreadNotifications()->count(); @endphp
                            @if($unreadCount > 0)
                                <span class="absolute top-0 right-0 block h-4 w-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-sky-600">
                                    {{ $unreadCount }}
                                </span>
                            @endif
                        </button>

                        <div x-show="open" @click.away="open = false" 
                             class="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg py-2 z-50 border border-gray-100"
                             x-transition:enter="transition ease-out duration-100"
                             x-transition:enter-start="transform opacity-0 scale-95"
                             x-transition:enter-end="transform opacity-100 scale-100">
                            <div class="px-4 py-2 border-b border-gray-50 flex justify-between items-center">
                                <span class="text-xs font-bold text-gray-900 uppercase">Notifications</span>
                                @if($unreadCount > 0)
                                    <form action="{{ url('/api/notifications/read-all') }}" method="POST" class="inline">
                                        @csrf
                                        <button type="submit" class="text-[10px] text-sky-600 hover:underline font-semibold">Tout marquer lu</button>
                                    </form>
                                @endif
                            </div>
                            <div class="max-h-96 overflow-y-auto">
                                @forelse(Auth::user()->notifications()->latest()->limit(5)->get() as $notification)
                                    <a href="{{ $notification->link ?? '#' }}" 
                                       class="block px-4 py-3 hover:bg-gray-50 transition-colors {{ !$notification->read_at ? 'bg-sky-50/30' : '' }}">
                                        <p class="text-sm font-semibold text-gray-800">{{ $notification->title }}</p>
                                        <p class="text-xs text-gray-600 mt-0.5">{{ $notification->message }}</p>
                                        <p class="text-[10px] text-gray-400 mt-2">{{ $notification->created_at->diffForHumans() }}</p>
                                    </a>
                                @empty
                                    <div class="px-4 py-8 text-center">
                                        <p class="text-xs text-gray-500">Aucune notification</p>
                                    </div>
                                @endforelse
                            </div>
                        </div>
                    </div>

                    <span class="text-sky-100 text-sm">{{ Auth::user()->name }}</span>
                    <span class="bg-sky-700 text-sky-100 text-xs px-2 py-1 rounded-full">
                        {{ Auth::user()->roles->first()->name ?? 'User' }}
                    </span>
                    <form method="POST" action="{{ route('logout') }}" class="inline">
                        @csrf
                        <button type="submit" class="text-sky-100 hover:text-white text-sm">
                            Déconnexion
                        </button>
                    </form>
                </div>
            </div>

            <!-- Mobile menu button -->
            <div class="-mr-2 flex md:hidden">
                <button type="button" onclick="document.getElementById('mobile-menu').classList.toggle('hidden')" 
                        class="bg-sky-700 inline-flex items-center justify-center p-2 rounded-md text-sky-200 hover:text-white hover:bg-sky-600 focus:outline-none">
                    <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
                    </svg>
                </button>
            </div>
        </div>
    </div>

    <!-- Mobile Menu -->
    <div id="mobile-menu" class="hidden md:hidden bg-sky-700">
        <div class="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <a href="{{ route('admin.dashboard') }}" class="text-sky-100 hover:bg-sky-500 hover:text-white block px-3 py-2 rounded-md text-base font-medium">
                Dashboard
            </a>
            <a href="{{ route('patients.index') }}" class="text-sky-100 hover:bg-sky-500 hover:text-white block px-3 py-2 rounded-md text-base font-medium">
                Patients
            </a>
            <a href="{{ route('appointments.index') }}" class="text-sky-100 hover:bg-sky-500 hover:text-white block px-3 py-2 rounded-md text-base font-medium">
                Rendez-vous
            </a>
            <a href="{{ route('invoices.index') }}" class="text-sky-100 hover:bg-sky-500 hover:text-white block px-3 py-2 rounded-md text-base font-medium">
                Factures
            </a>
            <a href="{{ route('treatments.index') }}" class="text-sky-100 hover:bg-sky-500 hover:text-white block px-3 py-2 rounded-md text-base font-medium">
                Soins
            </a>
            <a href="{{ route('payments.index') }}" class="text-sky-100 hover:bg-sky-500 hover:text-white block px-3 py-2 rounded-md text-base font-medium">
                Paiements
            </a>
        </div>
    </div>
</nav>
