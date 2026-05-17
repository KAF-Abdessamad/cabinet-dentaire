import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, CalendarDays, Stethoscope, FileText, User, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth.jsx';
import { usePatientPortalContext } from '../../contexts/PatientPortalContext.jsx';
import api from '../../api.js';
import logo from '../../img/logo-removebg-preview.png';

const navItems = [
    { to: '/patient/dashboard', label: 'Accueil', Icon: Home, end: true },
    { to: '/patient/appointments', label: 'Mes Rendez-vous', Icon: CalendarDays },
    { to: '/patient/care', label: 'Mes Soins', Icon: Stethoscope },
    { to: '/patient/invoices', label: 'Mes Factures', Icon: FileText },
    { to: '/patient/profile', label: 'Mon Profil', Icon: User },
];

const PatientSidebar = ({ onNavigate }) => {
    const { patient } = usePatientPortalContext();
    const { user } = useAuth();

    const displayName =
        patient?.first_name && patient?.last_name
            ? `${patient.first_name} ${patient.last_name}`
            : user?.name || 'Patient';

    const initials =
        `${patient?.first_name?.[0] || user?.name?.[0] || 'P'}${patient?.last_name?.[0] || ''}`.toUpperCase();

    const handleLogout = async () => {
        try {
            await api.get('/sanctum/csrf-cookie');
            await api.post('/api/logout');
        } catch {
            /* redirect anyway */
        }
        window.location.href = '/login';
    };

    return (
        <aside className="flex flex-col h-full w-full lg:w-72 bg-white border-r border-dp-neutral-200 shadow-dp-sm">
            <div className="p-6 border-b border-dp-neutral-100">
                <NavLink to="/patient/dashboard" className="flex items-center gap-3 group" onClick={onNavigate}>
                    <motion.div className="h-12 w-12 rounded-2xl bg-dp-accent flex items-center justify-center overflow-hidden border border-dp-neutral-100 group-hover:scale-105 transition-transform">
                        <img src={logo} alt="DentistPro" className="h-full w-full object-contain p-1.5" />
                    </motion.div>
                    <div>
                        <p className="font-display text-lg text-dp-primary leading-tight">DentistPro</p>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-dp-secondary">Espace Patient</p>
                    </div>
                </NavLink>
            </div>

            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {navItems.map(({ to, label, Icon, end }) => (
                    <NavLink
                        key={to}
                        to={to}
                        end={end}
                        onClick={onNavigate}
                        className={({ isActive }) =>
                            `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
                                isActive
                                    ? 'bg-dp-primary text-white shadow-md shadow-dp-primary/20'
                                    : 'text-dp-neutral-600 hover:bg-dp-accent hover:text-dp-primary'
                            }`
                        }
                    >
                        {({ isActive }) => (
                            <>
                                <Icon className={`h-5 w-5 shrink-0 ${isActive ? 'text-white' : 'text-dp-secondary'}`} strokeWidth={2} />
                                {label}
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            <div className="p-4 border-t border-dp-neutral-100 space-y-3">
                <div className="flex items-center gap-3 rounded-2xl bg-dp-bg p-3">
                    <div
                        className="h-11 w-11 rounded-xl bg-gradient-to-br from-dp-primary to-dp-secondary text-white flex items-center justify-center font-bold text-sm shrink-0"
                        aria-hidden
                    >
                        {initials}
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="font-semibold text-dp-neutral-800 text-sm truncate">{displayName}</p>
                        <span className="inline-flex mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-dp-accent text-dp-secondary border border-dp-secondary/20">
                            Patient
                        </span>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-dp-danger hover:bg-red-50 border border-transparent hover:border-red-100 transition-all"
                >
                    <LogOut className="h-4 w-4" aria-hidden />
                    Déconnexion
                </button>
            </div>
        </aside>
    );
};

export default PatientSidebar;
