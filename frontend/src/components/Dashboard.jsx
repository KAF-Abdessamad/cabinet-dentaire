import React, { useState, useEffect, useMemo } from 'react';
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
    CalendarPlus,
    Bell
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
    const [todayAppointments, setTodayAppointments] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
        const interval = setInterval(fetchDashboardData, 10000);
        return () => clearInterval(interval);
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [statsRes, todayRes, notifRes] = await Promise.all([
                api.get('/api/dashboard/stats'),
                api.get('/api/appointments', { params: { date: new Date().toISOString().slice(0, 10) } }),
                api.get('/api/notifications'),
            ]);
            setStats(statsRes.data);
            setTodayAppointments(todayRes.data || []);
            setNotifications(notifRes.data?.notifications || []);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const recentActivity = useMemo(() => {
        return notifications.slice(0, 5).map((n) => ({
            id: n.id,
            title: n.title || 'Notification',
            desc: n.message,
            time: new Date(n.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
            unread: !n.read_at,
        }));
    }, [notifications]);

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
                        {recentActivity.length === 0 && !loading && (
                            <div className="p-6 rounded-[24px] bg-white border border-slate-100 text-slate-500 font-bold">
                                Aucune activité récente.
                            </div>
                        )}
                        {recentActivity.map((item) => (
                            <motion.div 
                                key={item.id}
                                whileHover={{ x: 10 }}
                                className="flex items-center gap-6 p-6 bg-white rounded-[24px] border border-slate-100 hover:shadow-xl hover:shadow-slate-100/50 transition-all group"
                            >
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${item.unread ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-500'} shrink-0`}>
                                    <Bell size={24} />
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
                                {todayAppointments.length === 0 && (
                                    <div className="text-center text-slate-500 font-bold py-8">Aucun rendez-vous aujourd'hui.</div>
                                )}
                                {todayAppointments.slice(0, 6).map((rdv) => (
                                    <div key={rdv.id} className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                                        <div className="flex items-center gap-4">
                                            <span className="text-sm font-black text-slate-400 w-12">{(rdv.start_time || '').slice(0, 5)}</span>
                                            <div>
                                                <p className="font-black text-slate-800">{rdv.patient?.first_name} {rdv.patient?.last_name}</p>
                                                <p className="text-xs font-bold text-slate-400">{rdv.treatment?.name || rdv.reason || 'Consultation'}</p>
                                            </div>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                                            rdv.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' :
                                            rdv.status === 'proposed' ? 'bg-amber-100 text-amber-700' :
                                            rdv.status === 'requested' ? 'bg-blue-100 text-blue-700' :
                                            'bg-slate-100 text-slate-700'
                                        }`}>
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
