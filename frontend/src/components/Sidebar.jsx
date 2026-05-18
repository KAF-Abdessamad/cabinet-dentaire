import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
    LayoutDashboard, 
    Users, 
    Calendar, 
    Settings, 
    CreditCard,
    FileText,
    Stethoscope,
    LogOut,
    X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api.js';
import logo from '../img/logo-removebg-preview.png';
import { useMediaQuery } from '../hooks/useMediaQuery.js';

const Sidebar = ({ user, isOpen, onClose }) => {
    const location = useLocation();
    
    // Breakpoints
    const isMobile = useMediaQuery('(max-width: 640px)');
    const isTablet = useMediaQuery('(min-width: 641px) and (max-width: 1024px)');

    const menuItems = [
        { path: '/app', label: 'Tableau de bord', icon: LayoutDashboard },
        { path: '/app/patients', label: 'Patients', icon: Users },
        { path: '/app/appointments', label: 'Rendez-vous', icon: Calendar },
        { path: '/app/soins', label: 'Soins & Traitements', icon: Stethoscope },
        { path: '/app/factures', label: 'Facturation', icon: CreditCard },
        { path: '/app/ordonnances', label: 'Ordonnances', icon: FileText },
        { path: '/app/parametres', label: 'Paramètres', icon: Settings },
    ];

    const handleLogout = async () => {
        try {
            await api.get('/sanctum/csrf-cookie');
            await api.post('/api/logout');
        } catch {}
        window.location.href = '/admin/login';
    };

    // Sidebar core content
    const sidebarContent = (
        <div className={`h-full flex flex-col p-4 sm:p-5 text-white ${isTablet ? 'w-[70px]' : 'w-[250px]'}`}>
            
            {/* Branding */}
            <div className={`flex items-center gap-3 mb-10 pt-2 ${isTablet ? 'justify-center px-0' : 'px-1'}`}>
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-md overflow-hidden p-1.5 shrink-0">
                    <img src={logo} alt="DentistPro Logo" className="w-full h-full object-contain" />
                </div>
                {!isTablet && (
                    <div>
                        <h2 className="text-sm font-black tracking-tight leading-none text-white uppercase">DentistPro</h2>
                        <p className="text-[8px] font-black text-blue-200/60 uppercase tracking-widest mt-1">Management</p>
                    </div>
                )}
            </div>

            {/* Navigation links */}
            <nav className="flex-1 space-y-1">
                {menuItems.map((item) => {
                    const active = location.pathname === item.path || (item.path === '/app/patients' && location.pathname.startsWith('/app/patients'));
                    
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => isMobile && onClose && onClose()}
                            className={`group relative flex items-center px-4 py-3 rounded-xl transition-all duration-200 overflow-hidden ${
                                isTablet ? 'justify-center' : 'gap-3.5'
                            } ${
                                active 
                                    ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-700/20' 
                                    : 'text-blue-100/70 hover:bg-white/10 hover:text-white'
                            }`}
                            title={isTablet ? item.label : undefined}
                        >
                            {active && !isTablet && (
                                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-white rounded-r-full" />
                            )}

                            <item.icon className={`h-4.5 w-4.5 shrink-0 transition-colors ${active ? 'text-white' : 'text-blue-200/50 group-hover:text-white'}`} strokeWidth={2} />
                            {!isTablet && <span className="text-xs font-semibold tracking-wide">{item.label}</span>}
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom Footer Area */}
            <div className="mt-auto pt-6 space-y-5 border-t border-white/10">
                
                {/* Credentials */}
                {!isTablet && (
                    <div className="flex items-center gap-3 px-1">
                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center font-black text-xs text-blue-200 shadow-inner">
                            {user?.name?.[0]?.toUpperCase() || 'A'}
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="text-xs font-bold truncate text-white leading-tight">{user?.name || 'Admin'}</p>
                            <p className="text-[9px] font-medium text-blue-200/50 truncate mt-0.5">{user?.email || 'admin@dentistpro.com'}</p>
                        </div>
                    </div>
                )}

                {/* Logout Button */}
                <button 
                    onClick={handleLogout}
                    className={`w-full py-3 rounded-xl bg-red-500/10 hover:bg-red-500 text-red-300 hover:text-white text-[10px] font-black uppercase tracking-wider transition flex items-center justify-center gap-2 group border border-red-500/20 hover:border-red-500 ${isTablet ? 'p-0.5' : ''}`}
                    title={isTablet ? "Déconnexion" : undefined}
                >
                    <LogOut size={13} className="group-hover:-translate-x-0.5 transition-transform" />
                    {!isTablet && <span>Déconnexion</span>}
                </button>
            </div>
        </div>
    );

    // Render drawer on Mobile or standard aside on Tablet/Desktop
    if (isMobile) {
        return (
            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-50 flex">
                        {/* Glassmorphic Backdrop overlay */}
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={onClose}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                        />

                        {/* Sidebar Drawer container */}
                        <motion.aside 
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
                            className="relative w-[250px] bg-[#1B3A6B] h-full flex flex-col z-10 shadow-2xl"
                        >
                            {/* Close button inside mobile drawer */}
                            <button 
                                onClick={onClose} 
                                className="absolute top-5 right-4 p-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg transition"
                            >
                                <X size={16} />
                            </button>

                            {sidebarContent}
                        </motion.aside>
                    </div>
                )}
            </AnimatePresence>
        );
    }

    return (
        <aside className={`${isTablet ? 'w-[70px]' : 'w-[250px]'} bg-[#1B3A6B] min-h-screen sticky top-0 flex flex-col shrink-0 z-40 shadow-xl shadow-[#1B3A6B]/15 transition-all duration-300`}>
            {sidebarContent}
        </aside>
    );
};

export default Sidebar;
