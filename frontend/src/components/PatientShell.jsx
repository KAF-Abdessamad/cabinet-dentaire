import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Smile, LayoutDashboard, Home, LogOut, Menu, X, Heart, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api.js';
import logo from '../img/logo-removebg-preview.png';

const navLinkClass = (active) =>
    `relative flex items-center gap-3 rounded-2xl px-6 py-3.5 text-sm font-black transition-all duration-300 ${
        active
            ? 'text-medical-600'
            : 'text-slate-500 hover:bg-slate-50'
    }`;

const PatientShell = ({ children }) => {
    const [mobileNav, setMobileNav] = useState(false);
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

    return (
        <div className="min-h-screen flex flex-col bg-slate-50">
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-24 flex items-center justify-between gap-4">
                    <Link
                        to="/patient/dashboard"
                        className="flex items-center gap-4 text-slate-800 group"
                    >
                        <div className="flex h-14 w-14 items-center justify-center rounded-[20px] bg-white shadow-lg shadow-slate-200 overflow-hidden border border-slate-50 transition-transform duration-300 group-hover:scale-105">
                            <img src={logo} alt="SmilePro" className="h-full w-full object-contain p-2" />
                        </div>
                        <div className="hidden sm:block">
                            <span className="block text-xl font-black tracking-tight leading-none">SmilePro</span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Espace Patient</span>
                        </div>
                    </Link>

                    <nav className="hidden md:flex items-center gap-2">
                        <Link
                            to="/patient/dashboard"
                            className={navLinkClass(location.pathname === '/patient/dashboard')}
                        >
                            {location.pathname === '/patient/dashboard' && (
                                <motion.div 
                                    layoutId="patientNav"
                                    className="absolute inset-0 bg-medical-50 rounded-2xl"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                            <LayoutDashboard className="h-5 w-5 relative z-10" strokeWidth={2.5} />
                            <span className="relative z-10">Tableau de bord</span>
                        </Link>
                        
                        <div className="w-px h-6 bg-slate-200 mx-4" />

                        <div className="flex items-center gap-3">
                            <Link to="/" className="p-3 rounded-2xl text-slate-400 hover:bg-slate-50 hover:text-medical-600 transition-all">
                                <Home className="h-5 w-5" strokeWidth={2.5} />
                            </Link>
                            <button
                                type="button"
                                onClick={handleLogout}
                                className="w-12 h-12 bg-slate-100 rounded-[16px] flex items-center justify-center text-slate-500 hover:bg-red-50 hover:text-red-500 transition-all group shadow-sm"
                            >
                                <LogOut className="h-5 w-5 group-hover:-translate-x-1 transition-transform" strokeWidth={2.5} />
                            </button>
                        </div>
                    </nav>

                    <div className="flex md:hidden items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setMobileNav(!mobileNav)}
                            className="p-3 rounded-2xl text-slate-600 bg-slate-100"
                        >
                            {mobileNav ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>

                <AnimatePresence>
                    {mobileNav && (
                        <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="md:hidden px-4 pb-6 border-t border-slate-100 bg-white"
                        >
                            <div className="space-y-2 mt-4">
                                <Link
                                    to="/patient/dashboard"
                                    onClick={() => setMobileNav(false)}
                                    className={navLinkClass(location.pathname === '/patient/dashboard')}
                                >
                                    <LayoutDashboard className="h-5 w-5" />
                                    Tableau de bord
                                </Link>
                                <Link
                                    to="/"
                                    onClick={() => setMobileNav(false)}
                                    className={navLinkClass(false)}
                                >
                                    <Home className="h-5 w-5" />
                                    Site public
                                </Link>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setMobileNav(false);
                                        handleLogout();
                                    }}
                                    className="w-full flex items-center gap-3 rounded-2xl px-6 py-4 text-sm font-black text-red-500 hover:bg-red-50 transition-all"
                                >
                                    <LogOut className="h-5 w-5" />
                                    Déconnexion
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </header>

            <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
                {children}
            </main>

            <footer className="bg-white border-t border-slate-100 py-12 mt-auto">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                                <ShieldCheck size={20} />
                            </div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                SmilePro — Votre santé, notre priorité
                            </p>
                        </div>
                        <div className="flex items-center gap-6">
                            <a href="#" className="text-xs font-black text-slate-400 hover:text-medical-600 transition-colors">AIDE</a>
                            <a href="#" className="text-xs font-black text-slate-400 hover:text-medical-600 transition-colors">CONFIDENTIALITÉ</a>
                            <a href="#" className="text-xs font-black text-slate-400 hover:text-medical-600 transition-colors">CONTACT</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default PatientShell;
