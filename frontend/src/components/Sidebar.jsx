import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
    LayoutDashboard, 
    Users, 
    Calendar, 
    Settings, 
    ChevronRight,
    Smile,
    ShieldCheck,
    LogOut
} from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../api.js';
import logo from '../img/logo-removebg-preview.png';

const Sidebar = ({ user }) => {
    const location = useLocation();

    const menuItems = [
        { path: '/app', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/app/patients', label: 'Patients', icon: Users },
        { path: '/app/appointments', label: 'Agenda', icon: Calendar },
    ];

    const handleLogout = async () => {
        try {
            await api.get('/sanctum/csrf-cookie');
            await api.post('/api/logout');
        } catch {}
        window.location.href = '/admin/login';
    };

    return (
        <aside className="w-80 bg-slate-900 min-h-screen sticky top-0 flex flex-col p-8 text-white">
            {/* Logo */}
            <div className="flex items-center gap-4 mb-16 px-2">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-lg shadow-white/10 overflow-hidden border border-white/5">
                    <img src={logo} alt="SmilePro" className="w-full h-full object-contain p-2" />
                </div>
                <div>
                    <h2 className="text-xl font-black tracking-tighter">SmilePro</h2>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Management</p>
                </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 space-y-2">
                {menuItems.map((item) => {
                    const active = location.pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`group flex items-center justify-between p-4 rounded-2xl transition-all duration-300 ${
                                active 
                                    ? 'bg-medical-600 text-white shadow-xl shadow-medical-600/20' 
                                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                            }`}
                        >
                            <div className="flex items-center gap-4">
                                <item.icon size={20} strokeWidth={active ? 2.5 : 2} />
                                <span className="text-sm font-bold">{item.label}</span>
                            </div>
                            {active && (
                                <motion.div layoutId="sidebar-active" className="w-1.5 h-1.5 rounded-full bg-white" />
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom Card */}
            <div className="mt-auto space-y-6">
                <div className="bg-white/5 rounded-3xl p-6 border border-white/5">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400">
                            <ShieldCheck size={20} />
                        </div>
                        <div>
                            <p className="text-xs font-black uppercase tracking-widest text-slate-500">Mode</p>
                            <p className="text-sm font-bold">Administrateur</p>
                        </div>
                    </div>
                    <button 
                        onClick={handleLogout}
                        className="w-full py-3 rounded-xl bg-red-500/10 text-red-500 text-xs font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2 group"
                    >
                        <LogOut size={14} className="group-hover:-translate-x-1 transition-transform" />
                        Déconnexion
                    </button>
                </div>

                <div className="flex items-center gap-4 px-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-medical-400 to-indigo-500 p-0.5">
                        <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center font-black text-xs">
                            {user?.name?.[0] || 'A'}
                        </div>
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <p className="text-sm font-bold truncate">{user?.name || 'Admin'}</p>
                        <p className="text-[10px] font-bold text-slate-500 truncate">{user?.email}</p>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
