import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
    Users, 
    Calendar, 
    Clock, 
    CreditCard, 
    TrendingUp, 
    Plus, 
    ArrowUpRight,
    UserPlus,
    CheckCircle2,
    CalendarCheck,
    CalendarPlus
} from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../api.js';

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalPatients: 0,
        todayAppointments: 0,
        pendingAppointments: 0,
        monthlyRevenue: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const response = await api.get('/api/dashboard/stats');
            setStats(response.data);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const StatCard = ({ title, value, icon: Icon, color, trend }) => (
        <motion.div 
            whileHover={{ y: -5 }}
            className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100 relative overflow-hidden group"
        >
            <div className="relative z-10 flex justify-between items-start">
                <div>
                    <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-4">{title}</p>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-4xl font-black text-slate-800">
                            {loading ? '...' : value}
                        </h3>
                        {trend && (
                            <span className="text-emerald-500 text-xs font-bold flex items-center">
                                <ArrowUpRight className="h-3 w-3" /> {trend}
                            </span>
                        )}
                    </div>
                </div>
                <div className={`p-4 rounded-2xl bg-slate-50 text-slate-400 group-hover:bg-medical-500 group-hover:text-white transition-all duration-300`}>
                    <Icon size={24} strokeWidth={2.5} />
                </div>
            </div>
            <div className="absolute -bottom-6 -right-6 text-slate-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <Icon size={120} strokeWidth={1} />
            </div>
        </motion.div>
    );

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-12 max-w-7xl mx-auto"
        >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-800 tracking-tight">Bonjour, Cabinet 👋</h1>
                    <p className="text-slate-500 font-bold mt-2 italic">Voici l'activité de votre clinique aujourd'hui.</p>
                </div>
                <Link 
                    to="/app/appointments"
                    className="flex items-center gap-3 px-8 py-4 bg-medical-600 text-white rounded-2xl hover:bg-medical-700 transition-all shadow-xl shadow-medical-200 font-black group"
                >
                    <Plus className="h-5 w-5 group-hover:rotate-90 transition-transform" />
                    NOUVEAU RENDEZ-VOUS
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <Link to="/app/patients">
                    <StatCard
                        title="Patients Totaux"
                        value={stats.totalPatients}
                        icon={Users}
                        trend="+12%"
                    />
                </Link>
                <Link to="/app/appointments">
                    <StatCard
                        title="RDV du Jour"
                        value={stats.todayAppointments}
                        icon={Calendar}
                    />
                </Link>
                <Link to="/app/appointments">
                    <StatCard
                        title="En Attente"
                        value={stats.pendingAppointments}
                        icon={Clock}
                    />
                </Link>
                <StatCard
                    title="Chiffre d'Affaires"
                    value={`${stats.monthlyRevenue.toLocaleString()} MAD`}
                    icon={CreditCard}
                    trend="+8%"
                />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">
                {/* Activity Feed */}
                <div className="xl:col-span-2 space-y-8">
                    <div className="flex items-center justify-between">
                        <h3 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                            <TrendingUp className="text-medical-500" /> 
                            Flux d'activité
                        </h3>
                        <button className="text-sm font-bold text-medical-600 hover:underline">Voir tout</button>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-4">
                        {[
                            { icon: CalendarPlus, color: 'bg-emerald-50 text-emerald-600', title: 'Nouveau RDV', desc: 'Jean Dupont - 14:30', time: '5 min' },
                            { icon: UserPlus, color: 'bg-blue-50 text-blue-600', title: 'Nouveau Patient', desc: 'Marie Martin enregistrée', time: '15 min' },
                            { icon: CheckCircle2, color: 'bg-amber-50 text-amber-600', title: 'Paiement reçu', desc: 'Facture #1234 - 1500 MAD', time: '30 min' },
                        ].map((item, i) => (
                            <motion.div 
                                key={i}
                                whileHover={{ x: 10 }}
                                className="flex items-center gap-6 p-6 bg-white rounded-[24px] border border-slate-100 hover:shadow-xl hover:shadow-slate-100/50 transition-all group"
                            >
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${item.color} shrink-0`}>
                                    <item.icon size={24} />
                                </div>
                                <div className="flex-1">
                                    <p className="text-lg font-black text-slate-800">{item.title}</p>
                                    <p className="text-slate-500 font-bold text-sm">{item.desc}</p>
                                </div>
                                <span className="text-xs font-black text-slate-300 uppercase tracking-widest">{item.time}</span>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Agenda du jour */}
                <div className="space-y-8">
                    <h3 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                        <CalendarCheck className="text-medical-500" />
                        Agenda
                    </h3>
                    <div className="bg-white rounded-[32px] border border-slate-100 p-8 shadow-xl shadow-slate-100/50">
                        {loading ? (
                            <div className="flex justify-center py-10">
                                <div className="animate-spin rounded-full h-8 w-8 border-4 border-medical-500 border-t-transparent" />
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {[
                                    { time: '09:00', name: 'Jean Dupont', task: 'Consultation', status: 'Confirmé', color: 'bg-emerald-100 text-emerald-700' },
                                    { time: '10:30', name: 'Marie Martin', task: 'Détartrage', status: 'En attente', color: 'bg-amber-100 text-amber-700' },
                                    { time: '14:00', name: 'Pierre Bernard', task: 'Implant', status: 'Confirmé', color: 'bg-emerald-100 text-emerald-700' },
                                ].map((rdv, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                                        <div className="flex items-center gap-4">
                                            <span className="text-sm font-black text-slate-400 w-12">{rdv.time}</span>
                                            <div>
                                                <p className="font-black text-slate-800">{rdv.name}</p>
                                                <p className="text-xs font-bold text-slate-400">{rdv.task}</p>
                                            </div>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${rdv.color}`}>
                                            {rdv.status}
                                        </span>
                                    </div>
                                ))}
                                <button className="w-full py-4 mt-4 border-2 border-dashed border-slate-100 rounded-2xl text-slate-400 font-black text-xs hover:border-medical-200 hover:text-medical-500 transition-all">
                                    VOIR TOUT LE CALENDRIER
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default Dashboard;
