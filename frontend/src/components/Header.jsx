import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Smile, LayoutDashboard, Users, Calendar, LogOut } from 'lucide-react';
import api from '../api.js';

const Header = ({ user }) => {
    const location = useLocation();

    const handleLogout = async () => {
        try {
            await api.get('/sanctum/csrf-cookie');
            await api.post('/api/logout');
        } catch {
            // Force redirection
        }
        window.location.href = '/login';
    };
    
    const navItems = [
        { path: '/app', label: 'Tableau de Bord', icon: <LayoutDashboard className="h-4 w-4" /> },
        { path: '/app/patients', label: 'Patients', icon: <Users className="h-4 w-4" /> },
        { path: '/app/appointments', label: 'Rendez-vous', icon: <Calendar className="h-4 w-4" /> },
    ];

    return (
        <header className="bg-dentist-deeper border-b border-white/10 shadow-lg shadow-dentist-primary/10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-20 items-center">
                    <Link
                        to="/app"
                        className="flex items-center gap-3 text-white group"
                    >
                        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 ring-2 ring-white/25 transition-transform duration-300 group-hover:scale-105">
                            <Smile className="h-6 w-6 text-white" strokeWidth={2} />
                        </span>
                        <div>
                            <span className="block text-lg font-bold tracking-tight">Cabinet Smile</span>
                            <span className="text-xs text-white/70">Espace professionnel</span>
                        </div>
                    </Link>

                    <nav className="hidden md:flex items-center gap-1">
                        {navItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                                    location.pathname === item.path
                                        ? 'bg-white text-dentist-deeper shadow-md shadow-dentist-primary/15'
                                        : 'text-white/85 hover:bg-white/10 hover:text-white'
                                }`}
                            >
                                {item.icon}
                                {item.label}
                            </Link>
                        ))}
                        <button
                            type="button"
                            onClick={handleLogout}
                            className="ml-2 flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-4 py-2.5 text-sm font-medium text-white backdrop-blur transition hover:bg-white/20"
                        >
                            <LogOut className="h-4 w-4" />
                            Déconnexion
                        </button>
                    </nav>

                    <div className="flex items-center space-x-4">
                        {user && (
                            <div className="flex items-center space-x-3 bg-white/10 px-4 py-2 rounded-2xl border border-white/10">
                                <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center text-white font-bold ring-2 ring-white/20">
                                    {user.name?.charAt(0).toUpperCase() || 'U'}
                                </div>
                                <div className="hidden sm:block">
                                    <p className="text-xs text-white/60 font-medium leading-tight">Connecté en tant que</p>
                                    <p className="text-sm font-bold text-white leading-tight">{user.name}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
