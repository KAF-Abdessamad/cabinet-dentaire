import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import api from '../api.js';
import AppointmentFormModal from './AppointmentFormModal.jsx';
import { Plus, Calendar as CalendarIcon, Clock, Filter } from 'lucide-react';
import { motion } from 'framer-motion';

const localizer = momentLocalizer(moment);

const statusColors = {
    requested: '#3b82f6', // blue-500
    proposed: '#f59e0b',  // amber-500
    confirmed: '#10b981', // emerald-500
    completed: '#64748b', // slate-500
    cancelled: '#ef4444', // red-500
};

const AppointmentCalendar = () => {
    const [events, setEvents] = useState([]);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState(null);

    const fetchAppointments = async () => {
        setLoading(true);
        try {
            const response = await api.get('/api/appointments', { params: { scope: 'all' } });
            const allAppointments = response.data || [];
            const formattedEvents = allAppointments
                .filter((appt) => appt.starts_at && appt.ends_at)
                .map(appt => ({
                id: appt.id,
                title: `${appt.patient?.first_name} ${appt.patient?.last_name} - ${appt.treatment?.name || 'Soin'}`,
                start: new Date(appt.starts_at),
                end: new Date(appt.ends_at),
                status: appt.status,
                resource: appt
            }));
            setEvents(formattedEvents);
            setRequests(
                allAppointments
                    .filter((appt) => appt.status === 'requested')
                    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            );
        } catch (error) {
            console.error('Error fetching appointments for calendar:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAppointments();
    }, []);

    const handleSelectEvent = (resource) => {
        setSelectedAppointment(resource);
        setIsModalOpen(true);
    };

    const handleAddNew = () => {
        setSelectedAppointment(null);
        setIsModalOpen(true);
    };

    const eventPropGetter = (event) => {
        const backgroundColor = statusColors[event.status] || '#94a3b8';
        return {
            style: {
                backgroundColor,
                borderRadius: '12px',
                opacity: 0.9,
                color: 'white',
                border: 'none',
                display: 'block',
                padding: '4px 8px',
                fontSize: '11px',
                fontWeight: '800',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
            }
        };
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-12 max-w-7xl mx-auto"
        >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-800 tracking-tight flex items-center gap-4">
                        <CalendarIcon className="text-medical-600 h-10 w-10" strokeWidth={2.5} />
                        Agenda Clinique
                    </h1>
                    <p className="text-slate-500 font-bold mt-2 italic">Visualisez et organisez les rendez-vous du cabinet.</p>
                </div>
                <div className="flex gap-4">
                    <button className="flex items-center gap-2 px-6 py-4 bg-white border border-slate-100 text-slate-600 rounded-2xl hover:bg-slate-50 transition-all font-black text-xs uppercase tracking-widest shadow-sm">
                        <Filter size={16} />
                        Filtres
                    </button>
                    <button 
                        onClick={handleAddNew}
                        title="Créneau pour un patient qui n'a pas demandé de RDV en ligne"
                        className="flex items-center gap-3 px-8 py-4 bg-medical-600 text-white rounded-2xl hover:bg-medical-700 transition-all shadow-xl shadow-medical-200 font-black group"
                    >
                        <Plus className="h-5 w-5 group-hover:rotate-90 transition-transform" />
                        NOUVEAU RDV (CABINET)
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-[40px] shadow-2xl shadow-slate-200/50 border border-slate-100 p-8 h-[850px]">
                {loading ? (
                    <div className="h-full flex flex-col items-center justify-center gap-4">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-medical-500 border-t-transparent" />
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Chargement de l'agenda...</p>
                    </div>
                ) : (
                    <Calendar
                        localizer={localizer}
                        events={events}
                        startAccessor="start"
                        endAccessor="end"
                        style={{ height: '100%' }}
                        eventPropGetter={eventPropGetter}
                        onSelectEvent={(event) => handleSelectEvent(event.resource)}
                        className="modern-calendar"
                        messages={{
                            next: "Suivant",
                            previous: "Précédent",
                            today: "Aujourd'hui",
                            month: "Mois",
                            week: "Semaine",
                            day: "Jour",
                            agenda: "Agenda"
                        }}
                    />
                )}
            </div>

            <div className="bg-white rounded-[32px] border border-slate-100 p-8 shadow-xl shadow-slate-100/50">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-black text-slate-800">Demandes patient à traiter</h2>
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{requests.length} en attente</span>
                </div>
                {requests.length === 0 ? (
                    <p className="text-slate-500 font-bold">Aucune demande en attente.</p>
                ) : (
                    <div className="space-y-4">
                        {requests.map((rdv) => (
                            <div key={rdv.id} className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 bg-slate-50/60">
                                <div>
                                    <p className="font-black text-slate-800">{rdv.patient?.first_name} {rdv.patient?.last_name}</p>
                                    <p className="text-xs font-bold text-slate-500 mt-1">
                                        {rdv.treatment?.name || rdv.reason || 'Soin non precise'} • {rdv.dentist?.name ? `Dr. ${rdv.dentist.name}` : 'Dentiste non assigne'}
                                    </p>
                                </div>
                                <button
                                    onClick={() => handleSelectEvent(rdv)}
                                    className="px-5 py-2 rounded-xl bg-medical-600 text-white text-xs font-black uppercase tracking-widest hover:bg-medical-700 transition"
                                >
                                    Planifier
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-8 px-8 py-6 bg-slate-50 rounded-[24px] border border-slate-100">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Légende :</span>
                {Object.entries(statusColors).map(([status, color]) => (
                    <div key={status} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                        <span className="text-xs font-black text-slate-600 uppercase tracking-tighter">{status}</span>
                    </div>
                ))}
            </div>

            <AppointmentFormModal 
                isOpen={isModalOpen}
                appointment={selectedAppointment}
                onClose={() => setIsModalOpen(false)}
                onSave={fetchAppointments}
            />
        </motion.div>
    );
};

export default AppointmentCalendar;
