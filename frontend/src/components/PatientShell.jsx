import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Smile, LayoutDashboard, Home, LogOut, Menu, X } from 'lucide-react';
import api from '../api.js';

const navLinkClass = (active) =>
    `flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
        active
            ? 'bg-white text-dentist-deeper shadow-md shadow-dentist-primary/15'
            : 'text-white/85 hover:bg-white/10 hover:text-white'
    }`;

const PatientShell = ({ children }) => {
    const [mobileNav, setMobileNav] = useState(false);
    const location = useLocation();

    const handleLogout = async () => {
        try {
            await api.get('/sanctum/csrf-cookie');
            await api.post('/api/logout');
        } catch {
            // On force la redirection même si le serveur a déjà fermé la session
        }
        window.location.href = '/login';
    };

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-dentist-soft via-white to-dentist-surface animate-fade-in">
            <header className="sticky top-0 z-40 backdrop-blur-md bg-dentist-deeper/95 border-b border-white/10 shadow-lg shadow-dentist-primary/10">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
                    <Link
                        to="/patient/dashboard"
                        className="flex items-center gap-3 text-white group"
                    >
                        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 ring-2 ring-white/25 transition-transform duration-300 group-hover:scale-105">
                            <Smile className="h-6 w-6 text-white" strokeWidth={2} />
                        </span>
                        <div>
                            <span className="block text-lg font-bold tracking-tight">Cabinet Smile</span>
                            <span className="text-xs text-white/70">Espace patient</span>
                        </div>
                    </Link>

                    <nav className="hidden md:flex items-center gap-1">
                        <Link
                            to="/patient/dashboard"
                            className={navLinkClass(location.pathname === '/patient/dashboard')}
                        >
                            <LayoutDashboard className="h-4 w-4" strokeWidth={2} />
                            Tableau de bord
                        </Link>
                        <Link to="/" className={navLinkClass(false)}>
                            <Home className="h-4 w-4" strokeWidth={2} />
                            Site
                        </Link>
                        <button
                            type="button"
                            onClick={handleLogout}
                            className="ml-2 flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-4 py-2.5 text-sm font-medium text-white backdrop-blur transition hover:bg-white/20"
                        >
                            <LogOut className="h-4 w-4" strokeWidth={2} />
                            Déconnexion
                        </button>
                    </nav>

                    <div className="flex md:hidden items-center gap-2">
                        <button
                            type="button"
                            aria-label={mobileNav ? 'Fermer le menu' : 'Ouvrir le menu'}
                            onClick={() => setMobileNav(!mobileNav)}
                            className="p-2 rounded-xl text-white bg-white/10 border border-white/20"
                        >
                            {mobileNav ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>

                {mobileNav && (
                    <div className="md:hidden px-4 pb-4 animate-slide-down space-y-1 border-t border-white/10 mt-2 pt-3 bg-dentist-deeper">
                        <Link
                            to="/patient/dashboard"
                            onClick={() => setMobileNav(false)}
                            className={navLinkClass(location.pathname === '/patient/dashboard')}
                        >
                            <LayoutDashboard className="h-4 w-4" />
                            Tableau de bord
                        </Link>
                        <Link
                            to="/"
                            onClick={() => setMobileNav(false)}
                            className={navLinkClass(false)}
                        >
                            <Home className="h-4 w-4" />
                            Site public
                        </Link>
                        <button
                            type="button"
                            onClick={() => {
                                setMobileNav(false);
                                handleLogout();
                            }}
                            className="w-full flex items-center gap-2 rounded-xl bg-white text-dentist-deeper px-4 py-3 text-sm font-semibold shadow"
                        >
                            <LogOut className="h-4 w-4" />
                            Déconnexion
                        </button>
                    </div>
                )}
            </header>

            <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
            </main>

            <footer className="border-t border-dentist-muted/40 bg-white/70 backdrop-blur mt-auto">
                <div className="max-w-6xl mx-auto px-4 py-10 flex flex-col sm:flex-row items-center justify-between gap-6 text-sm text-slate-600">
                    <div className="flex items-center gap-3">
                        <Smile className="h-8 w-8 text-dentist-primary shrink-0" strokeWidth={1.75} />
                        <div>
                            <span className="font-semibold text-dentist-deeper block">Cabinet Smile</span>
                            <span className="text-slate-500">Soins dentaires • suivi en ligne sécurisé</span>
                        </div>
                    </div>
                    <div className="flex flex-wrap justify-center gap-6">
                        <Link to="/" className="hover:text-dentist-primary transition-colors">
                            Accueil
                        </Link>
                        <Link to="/admin/login" className="hover:text-dentist-primary transition-colors">
                            Espace professionnel
                        </Link>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default PatientShell;
