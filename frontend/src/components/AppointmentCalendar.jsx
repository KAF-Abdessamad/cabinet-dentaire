import React, { useState, useEffect } from 'react';
import api from '../api.js';

const AppointmentCalendar = () => {
    const [appointments, setAppointments] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAppointments();
    }, [selectedDate]);

    const fetchAppointments = async () => {
        try {
            setLoading(true);
            const response = await api.get('/api/appointments', {
                params: { date: selectedDate }
            });
            setAppointments(response.data);
        } catch (error) {
            console.error('Error fetching appointments:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'confirmed': return 'bg-green-100 text-green-700';
            case 'pending': return 'bg-yellow-100 text-yellow-700';
            case 'completed': return 'bg-blue-100 text-blue-700';
            case 'cancelled': return 'bg-red-100 text-red-700';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'confirmed': return 'Confirmé';
            case 'pending': return 'En attente';
            case 'completed': return 'Terminé';
            case 'cancelled': return 'Annulé';
            default: return status;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-800">Rendez-vous</h1>
                <button className="px-4 py-2 bg-medical-600 text-white rounded-lg hover:bg-medical-700 transition">
                    + Nouveau Rendez-vous
                </button>
            </div>

            {/* Date Selector */}
            <div className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex items-center gap-4">
                    <label className="font-medium text-slate-700">Date:</label>
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-medical-500"
                    />
                    <button
                        onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
                        className="px-4 py-2 text-medical-600 hover:bg-medical-50 rounded-lg transition"
                    >
                        Aujourd'hui
                    </button>
                </div>
            </div>

            {/* Appointments List */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-slate-500">Chargement...</div>
                ) : appointments.length === 0 ? (
                    <div className="p-8 text-center">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-3xl">📅</span>
                        </div>
                        <p className="text-slate-500">Aucun rendez-vous pour cette date</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {appointments.map((appointment) => (
                            <div key={appointment.id} className="p-6 hover:bg-slate-50 transition">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start space-x-4">
                                        <div className="flex flex-col items-center bg-medical-50 rounded-xl p-3 min-w-[80px]">
                                            <span className="text-sm font-medium text-slate-500">
                                                {new Date(appointment.appointment_date).toLocaleDateString('fr-FR', { weekday: 'short' })}
                                            </span>
                                            <span className="text-2xl font-bold text-medical-600">
                                                {new Date(appointment.appointment_date).getDate()}
                                            </span>
                                            <span className="text-sm text-slate-500">
                                                {new Date(appointment.appointment_date).toLocaleDateString('fr-FR', { month: 'short' })}
                                            </span>
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <span className="font-medium text-slate-800">
                                                    {appointment.start_time} - {appointment.end_time}
                                                </span>
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                                                    {getStatusLabel(appointment.status)}
                                                </span>
                                            </div>
                                            <h3 className="font-bold text-slate-800 text-lg">
                                                {appointment.patient?.first_name} {appointment.patient?.last_name}
                                            </h3>
                                            <p className="text-slate-500 text-sm mt-1">
                                                Dr. {appointment.dentist?.name} • {appointment.reason || 'Consultation'}
                                            </p>
                                            {appointment.notes && (
                                                <p className="text-slate-400 text-sm mt-2">
                                                    📝 {appointment.notes}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button className="p-2 text-slate-400 hover:text-medical-600 hover:bg-medical-50 rounded-lg transition">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
                                            </svg>
                                        </button>
                                        <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00', '18:00'].map((time) => {
                    const hasAppointment = appointments.some(a => a.start_time?.startsWith(time.split(':')[0]));
                    return (
                        <div 
                            key={time}
                            className={`p-4 rounded-xl text-center ${hasAppointment ? 'bg-medical-100 text-medical-700' : 'bg-white text-slate-400'}`}
                        >
                            <p className="font-bold">{time}</p>
                            <p className="text-xs">{hasAppointment ? 'Réservé' : 'Disponible'}</p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default AppointmentCalendar;
