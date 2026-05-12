import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User,
    Stethoscope,
    CalendarDays,
    History,
    Wallet,
    CalendarPlus,
    CheckCircle2,
    AlertCircle,
    Loader2,
    Bell,
    X,
} from 'lucide-react';
import debounce from 'lodash.debounce';
import api from '../api.js';

const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
        opacity: 1, 
        y: 0,
        transition: { duration: 0.5, staggerChildren: 0.1 }
    }
};

const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
};

const tabs = [
    { id: 'infos', label: 'Mes informations', Icon: User },
    { id: 'sante', label: 'Santé', Icon: Stethoscope },
    { id: 'rdv', label: 'Rendez-vous', Icon: CalendarDays },
    { id: 'historique', label: 'Historique', Icon: History },
    { id: 'paiements', label: 'Paiements', Icon: Wallet },
    { id: 'notifs', label: 'Notifications', Icon: Bell },
];

const statusAppointmentFr = {
    requested: 'Demande envoyée',
    proposed: 'Proposition reçue',
    confirmed: 'Confirmé',
    completed: 'Terminé',
    cancelled: 'Annulé',
};

const statusInvoiceFr = {
    pending: 'En attente',
    unpaid: 'Impayée',
    partially_paid: 'Partiellement payée',
    paid: 'Payée',
};

const todayStr = () => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
};

function formatDateFrench(iso) {
    if (!iso) return '—';
    const [y, m, dd] = String(iso).split(/\D/).filter(Boolean);
    if (!y || !m || !dd) return iso;
    return `${dd}/${m}/${y}`;
}

const PatientDashboard = () => {
    const [activeTab, setActiveTab] = useState('infos');
    const [stats, setStats] = useState(null);
    const [appointmentsUp, setAppointmentsUp] = useState([]);
    const [patientBundle, setPatientBundle] = useState(null);
    const [dentists, setDentists] = useState([]);
    const [treatments, setTreatments] = useState([]);
    const [invoices, setInvoices] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    const [bookForm, setBookForm] = useState({
        treatment_id: '',
        patient_note: '',
    });
    const [booking, setBooking] = useState(false);
    const [bookMsg, setBookMsg] = useState({ type: '', text: '' });

    const fetchPatientData = useCallback(async () => {
        try {
            const [statsRes, apptRes, medRes, denRes, invRes, treatRes, notifRes] = await Promise.all([
                api.get('/api/patient/stats'),
                api.get('/api/patient/appointments'),
                api.get('/api/patient/medical-records'),
                api.get('/api/patient/dentists'),
                api.get('/api/patient/invoices'),
                api.get('/api/patient/treatments'),
                api.get('/api/notifications'),
            ]);
            setStats(statsRes.data);
            setAppointmentsUp(apptRes.data || []);
            setPatientBundle(medRes.data || null);
            setDentists(denRes.data || []);
            setInvoices(invRes.data || []);
            setNotifications(notifRes.data?.notifications || []);
            const treats = treatRes.data || [];
            setTreatments(treats);
            if (treats.length > 0 && !bookForm.treatment_id) {
                setBookForm(f => ({ ...f, treatment_id: String(treats[0].id) }));
            }
        } catch (e) {
            console.error('Patient dashboard:', e);
        } finally {
            setLoading(false);
        }
    }, [bookForm.treatment_id]);

    useEffect(() => {
        fetchPatientData();
    }, [fetchPatientData]);

    const patient = patientBundle?.patient;
    const historyAppointments = useMemo(() => {
        const all = patientBundle?.appointments || [];
        const today = todayStr();
        return all.filter((a) => {
            if (!a?.appointment_date) return false;
            const d = String(a.appointment_date).slice(0, 10);
            return d < today || ['completed', 'cancelled'].includes(a.status);
        });
    }, [patientBundle]);

    const handleBookSubmit = async (e) => {
        e.preventDefault();
        setBookMsg({ type: '', text: '' });
        setBooking(true);
        try {
            await api.post('/api/patient/appointments', {
                treatment_id: Number(bookForm.treatment_id),
                patient_note: bookForm.patient_note || null,
            });
            setBookMsg({ type: 'ok', text: 'Demande de rendez-vous envoyée. Le cabinet vous proposera un créneau prochainement.' });
            setBookForm({ treatment_id: treatments[0]?.id || '', patient_note: '' });
            fetchPatientData();
        } catch (err) {
            const msg =
                err.response?.data?.message ||
                err.response?.data?.error ||
                'Impossible d’envoyer la demande.';
            setBookMsg({ type: 'err', text: msg });
        } finally {
            setBooking(false);
        }
    };

    const handleConfirmProposal = async (id) => {
        try {
            await api.post(`/api/patient/appointments/${id}/confirm`);
            fetchPatientData();
        } catch (e) {
            console.error(e);
            alert('Erreur lors de la confirmation.');
        }
    };

    const handleRejectProposal = async (id) => {
        if (!window.confirm('Voulez-vous vraiment refuser cette proposition ? Votre demande restera en attente.')) return;
        try {
            await api.post(`/api/patient/appointments/${id}/reject`);
            fetchPatientData();
        } catch (e) {
            console.error(e);
            alert('Erreur lors du refus.');
        }
    };

    const handleMarkAsRead = async (id) => {
        try {
            await api.post(`/api/notifications/${id}/read`);
            fetchPatientData();
        } catch (e) {
            console.error(e);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await api.post('/api/notifications/read-all');
            fetchPatientData();
        } catch (e) {
            console.error(e);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4 text-dentist-deeper">
                <Loader2 className="h-10 w-10 animate-spin text-dentist-primary" strokeWidth={2} />
                <p className="text-sm text-slate-600">Chargement de votre espace…</p>
            </div>
        );
    }

    return (
        <motion.div 
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="space-y-8"
        >
            {/* Hero */}
            <motion.div 
                variants={itemVariants}
                className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-dentist-primary via-dentist-secondary to-dentist-dark text-white shadow-xl shadow-dentist-primary/25 px-8 py-10 transition-transform hover:scale-[1.005] duration-500"
            >
                <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-white/10 blur-2xl pointer-events-none" />
                <div className="flex justify-between items-start">
                    <div>
                        <motion.h1 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="text-3xl md:text-4xl font-bold tracking-tight relative"
                        >
                            Bienvenue{patient?.first_name ? `, ${patient.first_name}` : ''}
                        </motion.h1>
                        <motion.p 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="mt-3 text-white/90 max-w-xl relative"
                        >
                            Retrouvez vos informations, vos rendez-vous et vos paiements en un seul endroit.
                        </motion.p>
                    </div>
                    {stats?.unread_notifications > 0 && (
                        <motion.button 
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setActiveTab('notifs')}
                            className="relative p-3 bg-white/20 hover:bg-white/30 rounded-full transition-all duration-300 group"
                        >
                            <Bell className="h-6 w-6 text-white group-hover:scale-110" strokeWidth={2.5} />
                            <span className="absolute top-0 right-0 h-5 w-5 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-dentist-primary animate-bounce">
                                {stats.unread_notifications}
                            </span>
                        </motion.button>
                    )}
                </div>
                {stats && (
                    <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 relative">
                        {[
                            { label: 'Rendez-vous à venir', value: stats.upcoming_appointments },
                            { label: 'Actes prévus liés aux RDV', value: stats.active_treatments },
                            { 
                                label: 'Fiche santé complète', 
                                value: stats.profile_complete ? (
                                    <span className="flex items-center gap-2"><CheckCircle2 className="h-6 w-6" /> Oui</span>
                                ) : (
                                    <span className="flex items-center gap-2 text-yellow-300"><AlertCircle className="h-6 w-6" /> À compléter</span>
                                )
                            }
                        ].map((s, i) => (
                            <motion.div 
                                key={i}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 + i * 0.1 }}
                                className="rounded-2xl bg-white/15 backdrop-blur-sm px-5 py-4 border border-white/20"
                            >
                                <p className="text-sm text-white/80">{s.label}</p>
                                <p className="text-3xl font-bold mt-1">{s.value}</p>
                            </motion.div>
                        ))}
                    </div>
                )}
            </motion.div>

            {/* Tabs */}
            <motion.div 
                variants={itemVariants}
                className="flex flex-wrap gap-2 p-2 rounded-2xl bg-white shadow-sm border border-dentist-border"
            >
                {tabs.map(({ id, label, Icon }) => {
                    const active = activeTab === id;
                    return (
                        <button
                            key={id}
                            type="button"
                            onClick={() => setActiveTab(id)}
                            className={`relative flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold transition-all duration-300 ${
                                active
                                    ? 'text-white'
                                    : 'text-slate-600 hover:bg-slate-50'
                            }`}
                        >
                            {active && (
                                <motion.div 
                                    layoutId="activeTab"
                                    className="absolute inset-0 bg-gradient-to-r from-dentist-primary to-dentist-secondary rounded-xl shadow-lg shadow-dentist-primary/30"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                            <Icon className={`h-4 w-4 shrink-0 relative z-10 ${active ? 'text-white' : ''}`} strokeWidth={2.5} />
                            <span className="relative z-10">{label}</span>
                        </button>
                    );
                })}
            </motion.div>

            {/* Panels */}
            <motion.div 
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="rounded-[32px] bg-white shadow-2xl shadow-slate-200/50 border border-slate-100 p-10 min-h-[400px]"
            >
                <AnimatePresence mode="wait">
                {activeTab === 'infos' && patient && (
                    <motion.div 
                        key="infos"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm"
                    >
                        <Field label="Prénom" value={patient.first_name} />
                        <Field label="Nom" value={patient.last_name} />
                        <Field label="Email" value={patient.email} />
                        <Field label="Téléphone" value={patient.phone} />
                        <Field
                            label="Date de naissance"
                            value={
                                patient.birth_date
                                    ? formatDateFrench(String(patient.birth_date).slice(0, 10))
                                    : null
                            }
                        />
                        <Field label="Sexe" value={patient.gender} />
                        <Field label="CIN" value={patient.cin} />
                        <Field label="Adresse" value={patient.address} className="md:col-span-2" />
                    </motion.div>
                )}

                {activeTab === 'sante' && patient && (
                    <div className="space-y-6 text-sm">
                        <h2 className="text-xl font-bold text-dentist-deeper flex items-center gap-2">
                            <Stethoscope className="h-6 w-6 text-dentist-primary" strokeWidth={2} />
                            Informations de santé
                        </h2>
                        <div className="grid md:grid-cols-2 gap-6">
                            <CardSoft title="Groupe sanguin" value={patient.blood_group} />
                            <CardSoft title="Allergies" value={patient.allergies} multiline />
                        </div>
                        <CardSoft
                            title="Antécédents médicaux"
                            value={patient.medical_history}
                            multiline
                            className="md:col-span-2"
                        />
                        {patientBundle?.medical_records?.length > 0 && (
                            <div>
                                <h3 className="text-sm font-bold text-dentist-deeper mb-3">
                                    Compte-rendus enregistrés au cabinet
                                </h3>
                                <ul className="space-y-3">
                                    {patientBundle.medical_records.map((rec) => (
                                        <li
                                            key={rec.id}
                                            className="rounded-2xl border border-dentist-muted/60 bg-white p-4"
                                        >
                                            <p className="text-xs text-slate-500">
                                                {formatDateFrench(rec.record_date)} •{' '}
                                                {rec.dentist?.name || 'Professionnel'}
                                            </p>
                                            {rec.diagnosis && (
                                                <p className="mt-2 text-slate-800 font-medium">{rec.diagnosis}</p>
                                            )}
                                            {rec.notes && (
                                                <p className="mt-2 text-slate-600 whitespace-pre-wrap text-xs">
                                                    {rec.notes}
                                                </p>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'rdv' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        <div>
                            <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3 mb-8">
                                <CalendarDays className="h-8 w-8 text-dentist-primary" strokeWidth={2.5} />
                                Vos prochains rendez-vous
                            </h2>
                            {appointmentsUp.length > 0 ? (
                                <ul className="space-y-6">
                                    {appointmentsUp.map((appointment) => (
                                        <motion.li
                                            key={appointment.id}
                                            whileHover={{ x: 10 }}
                                            className={`group relative overflow-hidden rounded-[24px] border p-6 flex flex-col gap-5 transition-all duration-300 ${
                                                appointment.status === 'proposed' 
                                                    ? 'border-amber-200 bg-amber-50/30' 
                                                    : 'border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-xl hover:shadow-slate-200/50'
                                            }`}
                                        >
                                            <div className="flex gap-6 items-start">
                                                <div className={`flex flex-col items-center justify-center rounded-[20px] text-white p-4 text-center min-w-[90px] shadow-lg ${
                                                    appointment.status === 'requested' 
                                                        ? 'bg-slate-400' 
                                                        : 'bg-gradient-to-br from-dentist-primary to-dentist-secondary shadow-dentist-primary/30'
                                                }`}>
                                                    <span className="text-[10px] uppercase font-black tracking-tighter opacity-80 mb-1">
                                                        {appointment.appointment_date ? formatDateFrench(appointment.appointment_date).split('/')[0] : '??'}
                                                    </span>
                                                    <span className="text-2xl font-black leading-none">
                                                        {appointment.appointment_date ? formatDateFrench(appointment.appointment_date).split('/')[1] : '??'}
                                                    </span>
                                                    <span className="text-[10px] font-bold mt-1">
                                                        {appointment.start_time ? appointment.start_time.slice(0, 5) : '--:--'}
                                                    </span>
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-lg font-black text-slate-800 mb-1">
                                                        {appointment.status === 'requested' ? 'En attente de planification' : (appointment.dentist?.name ? `Dr. ${appointment.dentist.name}` : 'Dentiste')}
                                                    </p>
                                                    <p className="text-slate-500 font-bold text-sm">
                                                        {appointment.treatment?.name || appointment.reason || 'Consultation de routine'}
                                                    </p>
                                                    <div className="mt-4 flex items-center gap-3">
                                                        <span
                                                            className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                                                                appointment.status === 'confirmed'
                                                                    ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                                                                    : appointment.status === 'proposed'
                                                                      ? 'bg-amber-100 text-amber-700 border-amber-200'
                                                                      : appointment.status === 'requested'
                                                                        ? 'bg-blue-100 text-blue-700 border-blue-200'
                                                                        : 'bg-slate-100 text-slate-700 border-slate-200'
                                                            }`}
                                                        >
                                                            {statusAppointmentFr[appointment.status] || appointment.status}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {appointment.status === 'proposed' && (
                                                <motion.div 
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="pt-5 border-t border-amber-100 flex flex-col gap-4"
                                                >
                                                    <div className="bg-amber-100/50 p-4 rounded-2xl border border-amber-200/50">
                                                        <p className="text-xs text-amber-800 font-bold italic flex items-start gap-2">
                                                            <AlertCircle className="h-4 w-4 shrink-0" />
                                                            "{appointment.admin_note || "Nous vous proposons ce créneau horaire."}"
                                                        </p>
                                                    </div>
                                                    <div className="flex gap-3">
                                                        <button
                                                            onClick={() => handleConfirmProposal(appointment.id)}
                                                            className="flex-1 bg-emerald-500 text-white text-xs font-black py-3 rounded-xl hover:bg-emerald-600 transition shadow-lg shadow-emerald-200"
                                                        >
                                                            ACCEPTER LE CRÉNEAU
                                                        </button>
                                                        <button
                                                            onClick={() => handleRejectProposal(appointment.id)}
                                                            className="flex-1 bg-white text-amber-700 border-2 border-amber-100 text-xs font-black py-3 rounded-xl hover:bg-amber-50 transition"
                                                        >
                                                            REFUSER
                                                        </button>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </motion.li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="text-center py-20 bg-slate-50 rounded-[32px] border-2 border-dashed border-slate-200">
                                    <CalendarDays className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                                    <p className="text-slate-500 font-bold">Aucun rendez-vous à venir.</p>
                                </div>
                            )}
                        </div>

                        <div>
                            <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3 mb-8">
                                <CalendarPlus className="h-8 w-8 text-dentist-secondary" strokeWidth={2.5} />
                                Nouvelle demande
                            </h2>
                            <div className="bg-white rounded-[32px] border border-slate-100 p-8 shadow-xl shadow-slate-100/50">
                                {bookMsg.text && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className={`mb-6 px-6 py-4 rounded-2xl text-sm font-bold border flex items-center gap-3 ${
                                            bookMsg.type === 'ok'
                                                ? 'bg-emerald-50 text-emerald-800 border-emerald-100'
                                                : 'bg-red-50 text-red-800 border-red-100'
                                        }`}
                                    >
                                        {bookMsg.type === 'ok' ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
                                        {bookMsg.text}
                                    </motion.div>
                                )}
                                <form onSubmit={handleBookSubmit} className="space-y-6">
                                    <div>
                                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">
                                            Quel type de soin souhaitez-vous ?
                                        </label>
                                        <select
                                            required
                                            className="w-full rounded-2xl border-slate-100 bg-slate-50 px-5 py-4 text-sm font-bold focus:ring-4 focus:ring-dentist-primary/10 focus:border-dentist-primary transition-all"
                                            value={bookForm.treatment_id}
                                            onChange={(e) =>
                                                setBookForm((f) => ({ ...f, treatment_id: e.target.value }))
                                            }
                                        >
                                            <option value="">Sélectionner un acte</option>
                                            {treatments.map((t) => (
                                                <option key={t.id} value={t.id}>
                                                    {t.name} — {t.price} MAD
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">
                                            Notes ou disponibilités préférées
                                        </label>
                                        <textarea
                                            rows={4}
                                            className="w-full rounded-2xl border-slate-100 bg-slate-50 px-5 py-4 text-sm font-bold focus:ring-4 focus:ring-dentist-primary/10 focus:border-dentist-primary transition-all"
                                            placeholder="Ex: Disponible les lundis après-midi..."
                                            value={bookForm.patient_note}
                                            onChange={(e) =>
                                                setBookForm((f) => ({ ...f, patient_note: e.target.value }))
                                            }
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={booking}
                                        className="w-full rounded-2xl bg-gradient-to-r from-dentist-primary to-dentist-secondary text-white py-5 font-black shadow-xl shadow-dentist-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                                    >
                                        {booking ? (
                                            <Loader2 className="h-6 w-6 animate-spin" strokeWidth={3} />
                                        ) : (
                                            <>
                                                <span>ENVOYER LA DEMANDE</span>
                                                <ChevronRight className="h-5 w-5" />
                                            </>
                                        )}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'historique' && (
                    <div className="max-w-4xl mx-auto">
                        <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3 mb-8">
                            <History className="h-8 w-8 text-dentist-primary" strokeWidth={2.5} />
                            Historique des consultations
                        </h2>
                        {historyAppointments.length === 0 ? (
                            <div className="text-center py-20 bg-slate-50 rounded-[32px] border-2 border-dashed border-slate-200">
                                <History className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                                <p className="text-slate-500 font-bold">Aucun historique disponible pour le moment.</p>
                            </div>
                        ) : (
                            <div className="relative border-l-2 border-slate-100 ml-4 pl-10 space-y-12">
                                {historyAppointments.map((a) => (
                                    <motion.div
                                        key={`h-${a.id}`}
                                        initial={{ opacity: 0, x: -20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        className="relative"
                                    >
                                        <div className="absolute -left-[51px] top-0 h-10 w-10 rounded-full bg-white border-4 border-dentist-primary shadow-lg z-10 flex items-center justify-center">
                                            <div className="h-2 w-2 rounded-full bg-dentist-primary" />
                                        </div>
                                        <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-xl shadow-slate-100/50 hover:border-dentist-primary/20 transition-all group">
                                            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-lg font-black text-slate-800">
                                                        {formatDateFrench(a.appointment_date)}
                                                    </span>
                                                    <span className="h-1 w-1 rounded-full bg-slate-300" />
                                                    <span className="text-sm font-bold text-slate-400">
                                                        {a.start_time?.slice(0, 5)}
                                                    </span>
                                                </div>
                                                <span className="px-4 py-1.5 rounded-full bg-slate-50 border border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:bg-dentist-primary group-hover:text-white group-hover:border-dentist-primary transition-all">
                                                    {statusAppointmentFr[a.status] || a.status}
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                <div>
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Praticien</label>
                                                    <p className="text-slate-800 font-black">Dr. {a.dentist?.name || 'Inconnu'}</p>
                                                </div>
                                                <div>
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Motif / Soin</label>
                                                    <p className="text-slate-800 font-black">{a.treatment?.name || a.reason || 'Consultation'}</p>
                                                </div>
                                            </div>
                                            {a.admin_note && (
                                                <div className="mt-6 pt-6 border-t border-slate-50">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Compte-rendu</label>
                                                    <p className="text-slate-600 text-sm italic font-medium">"{a.admin_note}"</p>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'paiements' && (
                    <div>
                        <h2 className="text-xl font-bold text-dentist-deeper flex items-center gap-2 mb-6">
                            <Wallet className="h-6 w-6 text-dentist-primary" strokeWidth={2} />
                            Factures et paiements
                        </h2>
                        {invoices.length === 0 ? (
                            <p className="text-slate-500">Aucune facture pour l’instant.</p>
                        ) : (
                            <div className="space-y-4">
                                {invoices.map((inv) => (
                                    <div
                                        key={inv.id}
                                        className="rounded-2xl border border-dentist-muted/70 p-6 bg-gradient-to-br from-white to-dentist-soft/40 hover:shadow-md transition-shadow duration-300"
                                    >
                                        <div className="flex flex-wrap justify-between gap-4">
                                            <div>
                                                <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold">
                                                    Facture du {formatDateFrench(inv.invoice_date)}
                                                </p>
                                                <p className="text-2xl font-bold text-dentist-deeper mt-1">
                                                    {Number(inv.total_amount).toFixed(2)} MAD
                                                </p>
                                                <span className="inline-block mt-2 text-xs font-medium px-3 py-1 rounded-full bg-dentist-surface border border-dentist-muted">
                                                    {statusInvoiceFr[inv.status] || inv.status}
                                                </span>
                                            </div>
                                        </div>
                                        {inv.payments?.length > 0 && (
                                            <ul className="mt-4 pt-4 border-t border-dentist-muted/50 space-y-2 text-sm">
                                                {inv.payments.map((p) => (
                                                    <li
                                                        key={p.id}
                                                        className="flex justify-between text-slate-700"
                                                    >
                                                        <span>
                                                            Paiement du {formatDateFrench(p.payment_date)}
                                                        </span>
                                                        <span className="font-medium">
                                                            {Number(p.amount).toFixed(2)} MAD
                                                        </span>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'notifs' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-dentist-deeper flex items-center gap-2">
                                <Bell className="h-6 w-6 text-dentist-primary" strokeWidth={2} />
                                Vos notifications
                            </h2>
                            {notifications.some(n => !n.read_at) && (
                                <button 
                                    onClick={handleMarkAllAsRead}
                                    className="text-xs font-semibold text-dentist-primary hover:underline"
                                >
                                    Tout marquer comme lu
                                </button>
                            )}
                        </div>
                        
                        {notifications.length === 0 ? (
                            <div className="text-center py-12">
                                <Bell className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                                <p className="text-slate-500">Aucune notification pour le moment.</p>
                            </div>
                        ) : (
                            <ul className="space-y-4">
                                {notifications.map((n) => (
                                    <li 
                                        key={n.id}
                                        className={`relative group rounded-2xl border p-5 transition-all duration-300 ${
                                            !n.read_at 
                                                ? 'bg-blue-50/50 border-blue-100 shadow-sm' 
                                                : 'bg-white border-slate-100 opacity-75'
                                        }`}
                                    >
                                        <div className="flex justify-between items-start gap-4">
                                            <div className="flex-1">
                                                <h4 className={`font-bold ${!n.read_at ? 'text-blue-900' : 'text-slate-700'}`}>
                                                    {n.title}
                                                </h4>
                                                <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                                                    {n.message}
                                                </p>
                                                <p className="text-[10px] text-slate-400 mt-3 font-medium uppercase tracking-wider">
                                                    {new Date(n.created_at).toLocaleString('fr-FR', {
                                                        day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit'
                                                    })}
                                                </p>
                                            </div>
                                            {!n.read_at && (
                                                <button 
                                                    onClick={() => handleMarkAsRead(n.id)}
                                                    className="p-1.5 rounded-lg hover:bg-blue-100 text-blue-400 transition-colors"
                                                    title="Marquer comme lu"
                                                >
                                                    <CheckCircle2 className="h-5 w-5" />
                                                </button>
                                            )}
                                        </div>
                                        {n.link && (
                                            <button 
                                                onClick={() => window.location.href = n.link}
                                                className="mt-4 text-xs font-bold text-dentist-primary flex items-center gap-1 hover:underline"
                                            >
                                                Consulter <CalendarDays className="h-3 w-3" />
                                            </button>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                )}
                </AnimatePresence>
            </motion.div>
        </motion.div>
    );
};

function Field({ label, value, className = '' }) {
    return (
        <div className={`p-5 rounded-2xl bg-slate-50 border border-slate-100 transition-all hover:bg-white hover:shadow-md hover:border-dentist-primary/20 ${className}`}>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-1 block">{label}</span>
            <p className="text-slate-900 font-bold text-base">{value || '—'}</p>
        </div>
    );
}

function CardSoft({ title, value, multiline, className = '' }) {
    return (
        <div
            className={`rounded-2xl border border-slate-100 bg-slate-50 p-6 transition-all hover:bg-white hover:shadow-md hover:border-dentist-primary/20 ${className}`}
        >
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 mb-3">{title}</h3>
            <p className={`text-slate-700 font-bold leading-relaxed ${multiline ? 'whitespace-pre-wrap' : ''}`}>{value || '—'}</p>
        </div>
    );
}

export default PatientDashboard;
