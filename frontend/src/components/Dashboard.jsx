import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

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
            const response = await axios.get('/api/dashboard/stats');
            setStats(response.data);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const StatCard = ({ title, value, icon, color }) => (
        <div 
            className={`bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer border-l-4 ${color}`}
        >
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-slate-500 text-sm font-medium">{title}</p>
                    <p className="text-3xl font-bold text-slate-800 mt-2">
                        {loading ? '...' : value}
                    </p>
                </div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl bg-opacity-10 ${color.replace('border-', 'bg-')}`}>
                    {icon}
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-800">Tableau de Bord</h1>
                <Link 
                    to="/app/appointments"
                    className="px-4 py-2 bg-medical-600 text-white rounded-lg hover:bg-medical-700 transition"
                >
                    + Nouveau Rendez-vous
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Link to="/app/patients">
                    <StatCard
                        title="Total Patients"
                        value={stats.totalPatients}
                        icon="👥"
                        color="border-medical-500"
                    />
                </Link>
                <Link to="/app/appointments">
                    <StatCard
                        title="Rendez-vous Aujourd'hui"
                        value={stats.todayAppointments}
                        icon="📅"
                        color="border-green-500"
                    />
                </Link>
                <Link to="/app/appointments">
                    <StatCard
                        title="En Attente"
                        value={stats.pendingAppointments}
                        icon="⏳"
                        color="border-yellow-500"
                    />
                </Link>
                <StatCard
                    title="Revenus du Mois"
                    value={`${stats.monthlyRevenue.toLocaleString()} €`}
                    icon="💰"
                    color="border-blue-500"
                />
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white rounded-2xl shadow-sm p-6">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">Activité Récente</h3>
                    <div className="space-y-4">
                        <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-xl">
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                📅
                            </div>
                            <div className="flex-1">
                                <p className="font-medium text-slate-800">Nouveau rendez-vous</p>
                                <p className="text-sm text-slate-500">Patient: Jean Dupont - 14:30</p>
                            </div>
                            <span className="text-xs text-slate-400">Il y a 5 min</span>
                        </div>
                        <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-xl">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                👤
                            </div>
                            <div className="flex-1">
                                <p className="font-medium text-slate-800">Nouveau patient</p>
                                <p className="text-sm text-slate-500">Marie Martin enregistrée</p>
                            </div>
                            <span className="text-xs text-slate-400">Il y a 15 min</span>
                        </div>
                        <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-xl">
                            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                                💳
                            </div>
                            <div className="flex-1">
                                <p className="font-medium text-slate-800">Paiement reçu</p>
                                <p className="text-sm text-slate-500">Facture #1234 - 150€</p>
                            </div>
                            <span className="text-xs text-slate-400">Il y a 30 min</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm p-6">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">Rendez-vous du Jour</h3>
                    <div className="space-y-3">
                        {loading ? (
                            <p className="text-slate-500">Chargement...</p>
                        ) : (
                            <>
                                <div className="flex items-center justify-between p-3 border border-slate-100 rounded-xl">
                                    <div className="flex items-center space-x-3">
                                        <span className="text-sm font-medium text-slate-500 w-16">09:00</span>
                                        <div>
                                            <p className="font-medium text-slate-800">Jean Dupont</p>
                                            <p className="text-sm text-slate-500">Consultation générale</p>
                                        </div>
                                    </div>
                                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                                        Confirmé
                                    </span>
                                </div>
                                <div className="flex items-center justify-between p-3 border border-slate-100 rounded-xl">
                                    <div className="flex items-center space-x-3">
                                        <span className="text-sm font-medium text-slate-500 w-16">10:30</span>
                                        <div>
                                            <p className="font-medium text-slate-800">Marie Martin</p>
                                            <p className="text-sm text-slate-500">Détartrage</p>
                                        </div>
                                    </div>
                                    <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
                                        En attente
                                    </span>
                                </div>
                                <div className="flex items-center justify-between p-3 border border-slate-100 rounded-xl">
                                    <div className="flex items-center space-x-3">
                                        <span className="text-sm font-medium text-slate-500 w-16">14:00</span>
                                        <div>
                                            <p className="font-medium text-slate-800">Pierre Bernard</p>
                                            <p className="text-sm text-slate-500">Implant</p>
                                        </div>
                                    </div>
                                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                                        Confirmé
                                    </span>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
