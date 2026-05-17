import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    CalendarDays,
    Stethoscope,
    FileText,
    Clock,
    User,
    Loader2,
    CalendarPlus,
    X,
} from 'lucide-react';
import api from '../../api.js';
import { usePatientPortalContext } from '../../contexts/PatientPortalContext.jsx';
import { BookAppointmentModal } from './BookAppointmentModal.jsx';
import {
    formatDateFrench,
    formatDateLongFr,
    statusAppointmentFr,
    statusAppointmentStyle,
} from './patientShared.js';

const fade = {
    hidden: { opacity: 0, y: 16 },
    show: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.4 } }),
};

const PatientHome = () => {
    const {
        loading,
        patient,
        nextAppointment,
        recentAppointments,
        totalAppointments,
        lastCompletedCare,
        pendingInvoicesCount,
        fetchPatientData,
    } = usePatientPortalContext();

    const [bookOpen, setBookOpen] = useState(false);
    const [cancelling, setCancelling] = useState(false);

    const handleCancel = async (id) => {
        if (!window.confirm('Annuler ce rendez-vous ?')) return;
        setCancelling(true);
        try {
            await api.post(`/api/patient/appointments/${id}/cancel`);
            fetchPatientData();
        } catch (e) {
            alert(e.response?.data?.message || 'Impossible d’annuler.');
        } finally {
            setCancelling(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
                <Loader2 className="h-10 w-10 animate-spin text-dp-secondary" />
                <p className="text-sm text-dp-neutral-500">Chargement de votre espace…</p>
            </div>
        );
    }

    const firstName = patient?.first_name || 'Patient';

    return (
        <>
            <motion.div initial="hidden" animate="show" className="space-y-6 pb-24">
                {/* Bienvenue */}
                <motion.div variants={fade} custom={0} className="rounded-3xl bg-white border border-dp-neutral-100 shadow-dp-card p-6 sm:p-8">
                    <p className="text-sm text-dp-neutral-500 capitalize">{formatDateLongFr()}</p>
                    <h1 className="font-display text-2xl sm:text-3xl text-dp-primary mt-2">
                        Bonjour {firstName} 👋
                    </h1>
                    <p className="mt-2 text-dp-neutral-600 text-sm max-w-xl">
                        {nextAppointment
                            ? 'Votre prochain rendez-vous est planifié — retrouvez le détail ci-dessous.'
                            : 'Aucun rendez-vous à venir. Prenez rendez-vous en un clic.'}
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    {/* Prochain RDV */}
                    <motion.div variants={fade} custom={1} className="xl:col-span-2">
                        <div className="rounded-3xl bg-gradient-to-br from-dp-primary via-[#1B3A6B] to-[#2E8B8B] text-white shadow-dp-card-hover p-6 sm:p-8 relative overflow-hidden h-full">
                            <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10 blur-2xl" aria-hidden />
                            <p className="text-xs font-bold uppercase tracking-widest text-white/70">Prochain rendez-vous</p>
                            {nextAppointment ? (
                                <>
                                    <div className="mt-4 flex flex-wrap items-end gap-4">
                                        <p className="font-display text-4xl sm:text-5xl leading-none">
                                            {nextAppointment.appointment_date
                                                ? formatDateFrench(nextAppointment.appointment_date).split('/')[0]
                                                : '—'}
                                        </p>
                                        <div>
                                            <p className="text-lg font-bold opacity-90">
                                                {nextAppointment.appointment_date
                                                    ? formatDateFrench(nextAppointment.appointment_date)
                                                    : 'Date à confirmer'}
                                            </p>
                                            <p className="text-white/80 text-sm flex items-center gap-1.5 mt-1">
                                                <Clock className="h-4 w-4" />
                                                {nextAppointment.start_time?.slice(0, 5) || 'Heure à confirmer'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="mt-6 grid sm:grid-cols-2 gap-4 text-sm">
                                        <div className="rounded-2xl bg-white/10 backdrop-blur px-4 py-3 border border-white/15">
                                            <p className="text-white/60 text-xs uppercase tracking-wider font-bold">Soin</p>
                                            <p className="font-semibold mt-1">
                                                {nextAppointment.treatment?.name || nextAppointment.reason || 'Consultation'}
                                            </p>
                                        </div>
                                        <div className="rounded-2xl bg-white/10 backdrop-blur px-4 py-3 border border-white/15">
                                            <p className="text-white/60 text-xs uppercase tracking-wider font-bold">Praticien</p>
                                            <p className="font-semibold mt-1 flex items-center gap-1.5">
                                                <User className="h-4 w-4 opacity-70" />
                                                {nextAppointment.dentist?.name
                                                    ? `Dr. ${nextAppointment.dentist.name}`
                                                    : 'À assigner'}
                                            </p>
                                        </div>
                                    </div>
                                    {['requested', 'proposed', 'confirmed'].includes(nextAppointment.status) && (
                                        <button
                                            type="button"
                                            disabled={cancelling}
                                            onClick={() => handleCancel(nextAppointment.id)}
                                            className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 border border-white/25 text-sm font-bold transition-colors disabled:opacity-50"
                                        >
                                            <X className="h-4 w-4" />
                                            {cancelling ? 'Annulation…' : 'Annuler'}
                                        </button>
                                    )}
                                </>
                            ) : (
                                <div className="mt-6 py-8 text-center">
                                    <CalendarDays className="h-12 w-12 mx-auto text-white/40 mb-3" />
                                    <p className="text-white/80">Aucun rendez-vous planifié</p>
                                    <button
                                        type="button"
                                        onClick={() => setBookOpen(true)}
                                        className="mt-4 px-6 py-2.5 rounded-xl bg-white text-dp-primary font-bold text-sm hover:bg-dp-accent transition"
                                    >
                                        Prendre rendez-vous
                                    </button>
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* Stats rapides */}
                    <motion.div variants={fade} custom={2} className="space-y-4">
                        {[
                            {
                                label: 'Total rendez-vous',
                                value: totalAppointments,
                                Icon: CalendarDays,
                                href: '/patient/appointments',
                            },
                            {
                                label: 'Dernier soin effectué',
                                value: lastCompletedCare
                                    ? formatDateFrench(lastCompletedCare.appointment_date)
                                    : '—',
                                Icon: Stethoscope,
                                href: '/patient/care',
                            },
                            {
                                label: 'Factures en attente',
                                value: pendingInvoicesCount,
                                Icon: FileText,
                                href: '/patient/invoices',
                            },
                        ].map(({ label, value, Icon, href }) => (
                            <Link
                                key={label}
                                to={href}
                                className="block rounded-2xl bg-white border border-dp-neutral-100 shadow-dp-card p-5 hover:shadow-dp-card-hover hover:border-dp-secondary/30 transition-all group"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-wider text-dp-neutral-400">{label}</p>
                                        <p className="font-display text-2xl text-dp-primary mt-1">{value}</p>
                                    </div>
                                    <div className="h-12 w-12 rounded-xl bg-dp-accent flex items-center justify-center text-dp-secondary group-hover:bg-dp-secondary group-hover:text-white transition-colors">
                                        <Icon className="h-6 w-6" />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </motion.div>
                </div>

                {/* Timeline */}
                <motion.div variants={fade} custom={3} className="rounded-3xl bg-white border border-dp-neutral-100 shadow-dp-card p-6 sm:p-8">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="font-display text-xl text-dp-primary">Historique récent</h2>
                        <Link to="/patient/appointments" className="text-sm font-semibold text-dp-secondary hover:text-dp-primary">
                            Voir tout →
                        </Link>
                    </div>
                    {recentAppointments.length === 0 ? (
                        <p className="text-sm text-dp-neutral-500 py-8 text-center">Aucun rendez-vous enregistré.</p>
                    ) : (
                        <ul className="relative border-l-2 border-dp-neutral-200 ml-3 space-y-8 pl-8">
                            {recentAppointments.map((a) => (
                                <li key={a.id} className="relative">
                                    <span className="absolute -left-[41px] top-1 h-4 w-4 rounded-full bg-dp-secondary border-4 border-white shadow" />
                                    <div className="flex flex-wrap justify-between gap-2">
                                        <div>
                                            <p className="font-semibold text-dp-neutral-800">
                                                {formatDateFrench(a.appointment_date)}
                                                {a.start_time && (
                                                    <span className="text-dp-neutral-400 font-normal"> · {a.start_time.slice(0, 5)}</span>
                                                )}
                                            </p>
                                            <p className="text-sm text-dp-neutral-500 mt-0.5">
                                                {a.treatment?.name || a.reason || 'Consultation'}
                                                {a.dentist?.name ? ` · Dr. ${a.dentist.name}` : ''}
                                            </p>
                                        </div>
                                        <span
                                            className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${
                                                statusAppointmentStyle[a.status] || statusAppointmentStyle.completed
                                            }`}
                                        >
                                            {statusAppointmentFr[a.status] || a.status}
                                        </span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </motion.div>
            </motion.div>

            {/* FAB */}
            <motion.button
                type="button"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.5, type: 'spring', stiffness: 260 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setBookOpen(true)}
                className="fixed bottom-8 right-8 z-50 flex items-center gap-2 px-6 py-4 rounded-full bg-dp-secondary text-white font-bold text-sm shadow-xl shadow-dp-secondary/40 hover:bg-[#267575] focus:outline-none focus-visible:ring-2 focus-visible:ring-dp-secondary focus-visible:ring-offset-2"
            >
                <CalendarPlus className="h-5 w-5" aria-hidden />
                <span className="hidden sm:inline">Prendre un rendez-vous</span>
            </motion.button>

            <BookAppointmentModal open={bookOpen} onClose={() => setBookOpen(false)} />
        </>
    );
};

export default PatientHome;
