import React, { useState, useEffect, useRef } from 'react';
import api from '../api.js';
import { 
    Plus, Calendar as CalendarIcon, Clock, Filter, 
    ChevronLeft, ChevronRight, User, Check, RefreshCw 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import AppointmentModal from './AppointmentModal.jsx';

const statusColors = {
    requested: '#3b82f6', // Blue
    proposed: '#f59e0b',  // Amber
    confirmed: '#10b981', // Emerald
    completed: '#64748b', // Slate
    cancelled: '#ef4444', // Red
};

const statusLabels = {
    requested: 'Demande',
    proposed: 'Proposé',
    confirmed: 'Confirmé',
    completed: 'Terminé',
    cancelled: 'Annulé',
};

const AppointmentCalendar = () => {
    const [searchParams] = useSearchParams();
    const prefilledPatientId = searchParams.get('prefilled_patient');

    const [viewMode, setViewMode] = useState('week'); // 'week' | 'month'
    const [currentDate, setCurrentDate] = useState(new Date());
    const [appointments, setAppointments] = useState([]);
    const [dentists, setDentists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [prefilledData, setPrefilledData] = useState(null);

    useEffect(() => {
        if (prefilledPatientId) {
            setSelectedAppointment(null);
            setPrefilledData({
                patient_id: prefilledPatientId,
                date: new Date().toISOString().split('T')[0],
                time: '09:00'
            });
            setIsModalOpen(true);
        }
    }, [prefilledPatientId]);

    // Filters
    const [selectedDentist, setSelectedDentist] = useState('all');
    const [activeStatuses, setActiveStatuses] = useState(['confirmed', 'completed', 'proposed']);

    // Realtime line calculation
    const [nowTime, setNowTime] = useState(new Date());

    useEffect(() => {
        const interval = setInterval(() => {
            setNowTime(new Date());
        }, 60000);
        return () => clearInterval(interval);
    }, []);

    // Load dentists
    useEffect(() => {
        api.get('/api/cabinet/dentists')
            .then(res => setDentists(res.data || []))
            .catch(err => console.error("Error loading dentists", err));
    }, []);

    // Load appointments (with auto-refresh every 2 minutes)
    const fetchAppointments = async () => {
        try {
            const response = await api.get('/api/appointments', { params: { scope: 'all' } });
            setAppointments(response.data || []);
        } catch (error) {
            console.error('Error fetching appointments:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAppointments();
        const autoRefresh = setInterval(fetchAppointments, 120000); // 2 minutes refresh
        return () => clearInterval(autoRefresh);
    }, []);

    // Filter appointments
    const filteredAppointments = appointments.filter(appt => {
        const dentistMatch = selectedDentist === 'all' || Number(appt.user_id) === Number(selectedDentist);
        const statusMatch = activeStatuses.includes(appt.status);
        return dentistMatch && statusMatch;
    });

    // Helper functions for dates
    const startOfWeek = (date) => {
        const diff = date.getDate() - date.getDay() + (date.getDay() === 0 ? -6 : 1); // adjust when day is sunday
        const d = new Date(date.setDate(diff));
        d.setHours(0, 0, 0, 0);
        return d;
    };

    const getWeekDays = (baseDate) => {
        const start = startOfWeek(new Date(baseDate));
        const days = [];
        for (let i = 0; i < 7; i++) {
            const d = new Date(start);
            d.setDate(start.getDate() + i);
            days.push(d);
        }
        return days;
    };

    const formatDayName = (date) => {
        const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
        return days[date.getDay()];
    };

    const isToday = (date) => {
        const today = new Date();
        return date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear();
    };

    const getMonthDays = (baseDate) => {
        const year = baseDate.getFullYear();
        const month = baseDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        
        const days = [];
        // Pad days from previous month
        const startPadding = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
        for (let i = startPadding; i > 0; i--) {
            const d = new Date(year, month, 1 - i);
            days.push({ date: d, isCurrentMonth: false });
        }
        // Current month days
        for (let i = 1; i <= lastDay.getDate(); i++) {
            days.push({ date: new Date(year, month, i), isCurrentMonth: true });
        }
        // Pad days for next month to complete 42-cell grid
        const totalCells = 42;
        const remaining = totalCells - days.length;
        for (let i = 1; i <= remaining; i++) {
            days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
        }
        return days;
    };

    // Week Navigation
    const handlePrev = () => {
        const newDate = new Date(currentDate);
        if (viewMode === 'week') {
            newDate.setDate(currentDate.getDate() - 7);
        } else {
            newDate.setMonth(currentDate.getMonth() - 1);
        }
        setCurrentDate(newDate);
    };

    const handleNext = () => {
        const newDate = new Date(currentDate);
        if (viewMode === 'week') {
            newDate.setDate(currentDate.getDate() + 7);
        } else {
            newDate.setMonth(currentDate.getMonth() + 1);
        }
        setCurrentDate(newDate);
    };

    // Drag and Drop handlers
    const handleDragStart = (e, appointment) => {
        e.dataTransfer.setData('text/plain', appointment.id);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDrop = async (e, dateStr, timeStr) => {
        e.preventDefault();
        const appointmentId = e.dataTransfer.getData('text/plain');
        if (!appointmentId) return;

        // Find current appointment details
        const appt = appointments.find(a => String(a.id) === String(appointmentId));
        if (!appt) return;

        // Show a loading feedback or lock UI during check
        try {
            const payload = {
                user_id: appt.user_id,
                patient_id: appt.patient_id,
                treatment_id: appt.treatment_id,
                appointment_date: dateStr,
                start_time: timeStr,
                status: appt.status || 'confirmed',
            };

            await api.put(`/api/appointments/${appointmentId}`, payload);
            fetchAppointments(); // Reload all appointments
        } catch (err) {
            alert(err.response?.data?.error || "Conflit détecté ! Impossible de déplacer le rendez-vous sur ce créneau.");
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    // Calculate dynamic layout for week view
    const hours = [];
    for (let h = 8; h <= 19; h++) {
        hours.push(`${h < 10 ? '0' : ''}${h}:00`);
        hours.push(`${h < 10 ? '0' : ''}${h}:30`);
    }

    const weekDays = getWeekDays(currentDate);

    // Filter appointments for a given day
    const getDayAppointments = (day) => {
        const dateStr = day.toISOString().split('T')[0];
        return filteredAppointments.filter(appt => appt.appointment_date === dateStr);
    };

    // Render appointments inside Week View column
    const renderWeekAppointments = (day) => {
        const dayAppts = getDayAppointments(day);
        const dayStr = day.toISOString().split('T')[0];

        return dayAppts.map(appt => {
            if (!appt.start_time) return null;
            
            // Calculate pixel position
            const [sh, sm] = appt.start_time.split(':').map(Number);
            const [eh, em] = (appt.end_time || '08:30').split(':').map(Number);

            const startMinutes = (sh - 8) * 60 + sm;
            const duration = (eh - sh) * 60 + (em - sm);

            // Row height is 60px per 30 minutes, meaning 120px per hour
            const top = (startMinutes / 30) * 48; // 48px height per 30-min slot
            const height = (duration / 30) * 48;

            const color = statusColors[appt.status] || '#94a3b8';

            return (
                <motion.div
                    key={appt.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, appt)}
                    onClick={() => {
                        setSelectedAppointment(appt);
                        setPrefilledData(null);
                        setIsModalOpen(true);
                    }}
                    layoutId={`appt-${appt.id}`}
                    className="absolute left-2 right-2 rounded-xl p-2.5 text-white shadow-md cursor-pointer select-none overflow-hidden hover:brightness-105 transition-all z-10 text-xs font-black flex flex-col justify-between"
                    style={{
                        top: `${top + 4}px`,
                        height: `${height - 8}px`,
                        backgroundColor: color,
                        borderLeft: '4px solid rgba(0,0,0,0.15)'
                    }}
                >
                    <div className="leading-tight">
                        <div className="flex items-center justify-between mb-0.5">
                            <span className="bg-black/20 text-[9px] px-1.5 py-0.5 rounded-full tracking-wider uppercase font-black">
                                {statusLabels[appt.status]}
                            </span>
                            <span className="text-[10px] opacity-90">{appt.start_time.substring(0, 5)}</span>
                        </div>
                        <div className="truncate font-black text-xs mt-0.5">
                            {appt.patient?.first_name} {appt.patient?.last_name}
                        </div>
                        <div className="text-[10px] opacity-90 truncate mt-0.5 font-bold">
                            {appt.treatment?.name || 'Soin général'}
                        </div>
                    </div>
                    {height >= 75 && (
                        <div className="text-[9px] opacity-75 truncate flex items-center gap-1 mt-1 border-t border-white/20 pt-1 font-bold">
                            <User size={10} />
                            Dr. {appt.dentist?.name || 'Non assigné'}
                        </div>
                    )}
                </motion.div>
            );
        });
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8 max-w-7xl mx-auto pb-12"
        >
            {/* Header section with glassmorphism */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white/70 backdrop-blur-xl p-6 rounded-[32px] border border-slate-100/80 shadow-xl shadow-slate-100/40">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                        <CalendarIcon className="text-medical-600 h-8 w-8" strokeWidth={2.5} />
                        Gestion des Rendez-vous
                    </h1>
                    <p className="text-slate-500 font-bold mt-1 text-sm italic">
                        Planifiez, réorganisez par Drag & Drop et gérez les créneaux cliniques sans conflits.
                    </p>
                </div>
                <div className="flex flex-wrap gap-3">
                    {/* View Switcher Toggle */}
                    <div className="bg-slate-100/80 p-1.5 rounded-2xl flex items-center gap-1 border border-slate-200/50">
                        <button 
                            onClick={() => setViewMode('week')}
                            className={`px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition ${viewMode === 'week' ? 'bg-white text-medical-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                        >
                            Semaine
                        </button>
                        <button 
                            onClick={() => setViewMode('month')}
                            className={`px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition ${viewMode === 'month' ? 'bg-white text-medical-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                        >
                            Mois
                        </button>
                    </div>

                    <button 
                        onClick={() => {
                            setSelectedAppointment(null);
                            setPrefilledData(null);
                            setIsModalOpen(true);
                        }}
                        className="flex items-center gap-2 px-6 py-3.5 bg-medical-600 text-white rounded-2xl hover:bg-medical-700 transition shadow-lg shadow-medical-200 font-black text-xs uppercase tracking-wider group"
                    >
                        <Plus className="h-4.5 w-4.5 group-hover:rotate-90 transition-transform" />
                        Nouveau Rendez-vous
                    </button>
                </div>
            </div>

            {/* Quick Filters */}
            <div className="bg-white rounded-[24px] border border-slate-100 p-5 shadow-md flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Filter className="text-slate-400 w-4 h-4" />
                    <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Filtres :</span>
                    
                    {/* Dentist Select */}
                    <select 
                        value={selectedDentist}
                        onChange={(e) => setSelectedDentist(e.target.value)}
                        className="rounded-xl border-slate-200 text-xs font-bold text-slate-700 focus:border-medical-500 focus:ring-medical-500 bg-slate-50/50 py-1.5 px-3"
                    >
                        <option value="all">Tous les Dentistes</option>
                        {dentists.map(d => (
                            <option key={d.id} value={d.id}>Dr. {d.name}</option>
                        ))}
                    </select>
                </div>

                {/* Status Toggles */}
                <div className="flex flex-wrap items-center gap-3">
                    {Object.entries(statusColors).map(([status, color]) => {
                        const active = activeStatuses.includes(status);
                        return (
                            <button
                                key={status}
                                onClick={() => {
                                    if (active) {
                                        setActiveStatuses(activeStatuses.filter(s => s !== status));
                                    } else {
                                        setActiveStatuses([...activeStatuses, status]);
                                    }
                                }}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-[11px] font-black uppercase tracking-tight transition ${active ? 'bg-white shadow-sm border-slate-200' : 'bg-slate-50 text-slate-400 border-slate-100'}`}
                            >
                                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                                <span style={{ color: active ? '#334155' : 'inherit' }}>{statusLabels[status]}</span>
                                {active && <Check size={12} className="text-emerald-500" />}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Calendar Container */}
            <div className="bg-white rounded-[32px] shadow-xl shadow-slate-100/40 border border-slate-100 overflow-hidden">
                
                {/* Navigation Bar */}
                <div className="px-8 py-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => setCurrentDate(new Date())}
                            className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-black uppercase tracking-wider transition"
                        >
                            Aujourd'hui
                        </button>
                        <div className="flex items-center gap-1">
                            <button onClick={handlePrev} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition">
                                <ChevronLeft size={18} />
                            </button>
                            <button onClick={handleNext} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition">
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>

                    <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">
                        {viewMode === 'week' ? (
                            `Semaine du ${weekDays[0].toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}`
                        ) : (
                            currentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
                        )}
                    </h2>

                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                        <RefreshCw size={12} className="animate-spin text-medical-500" />
                        Synchronisé
                    </div>
                </div>

                {loading ? (
                    <div className="h-[600px] flex flex-col items-center justify-center gap-3">
                        <div className="animate-spin rounded-full h-10 w-10 border-4 border-medical-500 border-t-transparent" />
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Chargement de l'agenda clinique...</p>
                    </div>
                ) : (
                    <>
                        {/* 1. WEEK VIEW */}
                        {viewMode === 'week' && (
                            <div className="overflow-x-auto">
                                <div className="min-w-[900px] grid grid-cols-[80px_1fr] relative">
                                    {/* Left Time axis scale */}
                                    <div className="border-r border-slate-100 pt-16 bg-slate-50/50">
                                        {hours.map(h => (
                                            <div key={h} className="h-12 flex items-start justify-end pr-3 text-[10px] font-black text-slate-400/80 -mt-2">
                                                {h.endsWith('00') ? h : ''}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Columns grid */}
                                    <div className="grid grid-cols-7 relative">
                                        
                                        {/* Dynamic current hour red line indicator */}
                                        {weekDays.some(isToday) && (
                                            (() => {
                                                const todayIdx = weekDays.findIndex(isToday);
                                                const currentH = nowTime.getHours();
                                                const currentM = nowTime.getMinutes();
                                                
                                                if (currentH >= 8 && currentH < 20) {
                                                    const startMin = (currentH - 8) * 60 + currentM;
                                                    const topPos = (startMin / 30) * 48 + 64; // +64 to offset the header day row
                                                    const colWidthPercentage = 100 / 7;
                                                    
                                                    return (
                                                        <div 
                                                            className="absolute right-0 h-0.5 bg-rose-500 z-20 flex items-center pointer-events-none"
                                                            style={{
                                                                top: `${topPos}px`,
                                                                left: `${todayIdx * colWidthPercentage}%`,
                                                                width: `${colWidthPercentage}%`
                                                            }}
                                                        >
                                                            <div className="w-2 h-2 rounded-full bg-rose-500 -ml-1 shadow-md shadow-rose-300" />
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            })()
                                        )}

                                        {/* Week header row */}
                                        {weekDays.map(day => {
                                            const active = isToday(day);
                                            return (
                                                <div 
                                                    key={day.toString()} 
                                                    className={`h-16 border-b border-slate-100 flex flex-col items-center justify-center gap-0.5 ${active ? 'bg-medical-50/40' : ''}`}
                                                >
                                                    <span className={`text-[10px] font-black uppercase tracking-wider ${active ? 'text-medical-600' : 'text-slate-400'}`}>
                                                        {formatDayName(day)}
                                                    </span>
                                                    <span className={`text-lg font-black w-8 h-8 flex items-center justify-center rounded-full ${active ? 'bg-medical-600 text-white shadow-md shadow-medical-100' : 'text-slate-800'}`}>
                                                        {day.getDate()}
                                                    </span>
                                                </div>
                                            );
                                        })}

                                        {/* Day slots columns */}
                                        {weekDays.map(day => {
                                            const dateStr = day.toISOString().split('T')[0];
                                            const active = isToday(day);
                                            return (
                                                <div 
                                                    key={day.toString() + '-slots'} 
                                                    className={`relative border-r border-slate-100 h-[1152px] ${active ? 'bg-slate-50/20' : ''}`}
                                                >
                                                    {/* Render slots */}
                                                    {hours.map(h => (
                                                        <div
                                                            key={h}
                                                            onDragOver={handleDragOver}
                                                            onDrop={(e) => handleDrop(e, dateStr, h)}
                                                            onClick={() => {
                                                                setSelectedAppointment(null);
                                                                setPrefilledData({
                                                                    date: dateStr,
                                                                    time: h
                                                                });
                                                                setIsModalOpen(true);
                                                            }}
                                                            className="h-12 border-b border-slate-100/50 hover:bg-slate-50/50 transition cursor-crosshair"
                                                        />
                                                    ))}

                                                    {/* Render absolute positioned appointments */}
                                                    {renderWeekAppointments(day)}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 2. MONTH VIEW */}
                        {viewMode === 'month' && (
                            <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/50 text-center font-black text-xs uppercase tracking-widest text-slate-400 py-3">
                                <div>Lun</div>
                                <div>Mar</div>
                                <div>Mer</div>
                                <div>Jeu</div>
                                <div>Ven</div>
                                <div>Sam</div>
                                <div>Dim</div>
                            </div>
                        )}

                        {viewMode === 'month' && (
                            <div className="grid grid-cols-7 grid-rows-6">
                                {getMonthDays(currentDate).map(({ date, isCurrentMonth }, idx) => {
                                    const dateStr = date.toISOString().split('T')[0];
                                    const dayAppts = filteredAppointments.filter(a => a.appointment_date === dateStr);
                                    const active = isToday(date);
                                    
                                    return (
                                        <div 
                                            key={idx}
                                            onClick={() => {
                                                setSelectedAppointment(null);
                                                setPrefilledData({
                                                    date: dateStr,
                                                    time: '09:00'
                                                });
                                                setIsModalOpen(true);
                                            }}
                                            className={`min-h-[100px] p-2 border-b border-r border-slate-100 flex flex-col justify-between hover:bg-slate-50/50 transition cursor-pointer ${isCurrentMonth ? 'text-slate-800' : 'text-slate-300'} ${active ? 'bg-medical-50/20' : ''}`}
                                        >
                                            <div className="flex justify-between items-center">
                                                <span className={`text-xs font-black w-6 h-6 flex items-center justify-center rounded-full ${active ? 'bg-medical-600 text-white shadow-md' : ''}`}>
                                                    {date.getDate()}
                                                </span>
                                                {dayAppts.length > 0 && (
                                                    <span className="bg-medical-100 text-medical-700 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-tight">
                                                        {dayAppts.length} RDV
                                                    </span>
                                                )}
                                            </div>

                                            <div className="mt-2 space-y-1 overflow-hidden max-h-[70px]">
                                                {dayAppts.slice(0, 3).map(appt => (
                                                    <div 
                                                        key={appt.id}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setSelectedAppointment(appt);
                                                            setPrefilledData(null);
                                                            setIsModalOpen(true);
                                                        }}
                                                        className="text-[9px] font-black text-white px-1.5 py-0.5 rounded truncate"
                                                        style={{ backgroundColor: statusColors[appt.status] || '#94a3b8' }}
                                                    >
                                                        {appt.start_time.substring(0, 5)} {appt.patient?.last_name}
                                                    </div>
                                                ))}
                                                {dayAppts.length > 3 && (
                                                    <div className="text-[8px] font-black text-slate-400 text-center uppercase tracking-tight">
                                                        + {dayAppts.length - 3} de plus
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Legend info panel */}
            <div className="flex flex-wrap gap-8 px-8 py-5 bg-slate-50 rounded-[24px] border border-slate-100">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center">
                    Légende Statuts :
                </span>
                {Object.entries(statusColors).map(([status, color]) => (
                    <div key={status} className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                        <span className="text-xs font-black text-slate-600 uppercase tracking-tight">{statusLabels[status]}</span>
                    </div>
                ))}
            </div>

            {/* Premium Appointment Creation & Edition Modal */}
            <AppointmentModal 
                isOpen={isModalOpen}
                appointment={selectedAppointment}
                prefilledData={prefilledData}
                onClose={() => setIsModalOpen(false)}
                onSave={fetchAppointments}
            />
        </motion.div>
    );
};

export default AppointmentCalendar;
