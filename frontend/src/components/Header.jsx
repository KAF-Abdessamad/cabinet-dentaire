import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Smile, LayoutDashboard, Users, Calendar, LogOut, Search, Bell } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../api.js';
import logo from '../img/logo-removebg-preview.png';

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
        { path: '/app', label: 'Dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
        { path: '/app/patients', label: 'Patients', icon: <Users className="h-4 w-4" /> },
        { path: '/app/appointments', label: 'Agenda', icon: <Calendar className="h-4 w-4" /> },
    ];

    return (
        <header className="bg-white/80 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-20 items-center">
                    <Link
                        to="/app"
                        className="flex items-center gap-4 text-slate-800 group"
                    >
                        <div className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-white shadow-lg shadow-slate-200 overflow-hidden border border-slate-50 transition-transform duration-300 group-hover:scale-105">
                            <img src={logo} alt="SmilePro" className="h-full w-full object-contain p-1" />
                        </div>
                        <div className="hidden sm:block">
                            <span className="block text-xl font-black tracking-tight leading-none">SmilePro</span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Cabinet Dentaire</span>
                        </div>
                    </Link>

                    <div className="hidden lg:flex items-center bg-slate-100/50 border border-slate-100 px-4 py-2.5 rounded-2xl w-96 group focus-within:bg-white focus-within:ring-4 focus-within:ring-medical-500/10 transition-all">
                        <Search className="h-4 w-4 text-slate-400 group-focus-within:text-medical-500 transition-colors" />
                        <input 
                            type="text" 
                            placeholder="Rechercher un patient, un RDV..." 
                            className="bg-transparent border-none focus:ring-0 text-sm font-bold text-slate-600 placeholder:text-slate-400 w-full ml-3"
                        />
                    </div>

                    <nav className="hidden md:flex items-center gap-1">
                        {navItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`relative flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-black transition-all duration-300 ${
                                    location.pathname === item.path
                                        ? 'text-medical-600'
                                        : 'text-slate-500 hover:bg-slate-50'
                                }`}
                            >
                                {location.pathname === item.path && (
                                    <motion.div 
                                        layoutId="navTab"
                                        className="absolute inset-0 bg-medical-50 rounded-xl"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                                <span className="relative z-10">{item.icon}</span>
                                <span className="relative z-10">{item.label}</span>
                            </Link>
                        ))}
                        
                        <div className="w-px h-6 bg-slate-200 mx-4" />

                        <div className="flex items-center gap-4">
                            <button className="relative p-3 rounded-xl hover:bg-slate-50 transition-colors text-slate-500">
                                <Bell className="h-5 w-5" />
                                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full ring-4 ring-white" />
                            </button>
                            
                            {user && (
                                <div className="flex items-center gap-3 pl-2">
                                    <div className="text-right hidden sm:block">
                                        <p className="text-sm font-black text-slate-800 leading-none">{user.name}</p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Administrateur</p>
                                    </div>
                                    <button 
                                        onClick={handleLogout}
                                        className="w-11 h-11 bg-slate-100 rounded-[14px] flex items-center justify-center text-slate-500 hover:bg-red-50 hover:text-red-500 transition-all group shadow-sm"
                                    >
                                        <LogOut className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                                    </button>
                                </div>
                            )}
                        </div>
                    </nav>
                </div>
            </div>
        </header>
    );
};

export default Header;
