import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CalendarDays, CalendarPlus, Loader2, AlertCircle, CheckCircle2, ChevronRight } from 'lucide-react';
import api from '../../api.js';
import { usePatientPortalContext } from '../../contexts/PatientPortalContext.jsx';
import { BookAppointmentModal } from './BookAppointmentModal.jsx';
import { formatDateFrench, statusAppointmentFr } from './patientShared.js';

const PatientAppointmentsPage = () => {
    const { loading, appointmentsUp, treatments, fetchPatientData, historyAppointments } = usePatientPortalContext();
    const [searchParams] = useSearchParams();
    const [bookOpen, setBookOpen] = useState(searchParams.get('book') === '1');
    const [bookForm, setBookForm] = useState({ treatment_id: '', patient_note: '' });
    const [booking, setBooking] = useState(false);
    const [bookMsg, setBookMsg] = useState({ type: '', text: '' });

    const handleBookSubmit = async (e) => {
        e.preventDefault();
        setBooking(true);
        setBookMsg({ type: '', text: '' });
        try {
            await api.post('/api/patient/appointments', {
                treatment_id: Number(bookForm.treatment_id),
                patient_note: bookForm.patient_note || null,
            });
            setBookMsg({ type: 'ok', text: 'Demande envoyée.' });
            setBookForm({ treatment_id: treatments[0]?.id || '', patient_note: '' });
            fetchPatientData();
        } catch (err) {
            setBookMsg({ type: 'err', text: err.response?.data?.message || 'Erreur.' });
        } finally {
            setBooking(false);
        }
    };

    const handleConfirm = async (id) => {
        try {
            await api.post(`/api/patient/appointments/${id}/confirm`);
            fetchPatientData();
        } catch {
            alert('Erreur lors de la confirmation.');
        }
    };

    const handleReject = async (id) => {
        if (!window.confirm('Refuser cette proposition ?')) return;
        try {
            await api.post(`/api/patient/appointments/${id}/reject`);
            fetchPatientData();
        } catch {
            alert('Erreur.');
        }
    };

    const handleCancel = async (id) => {
        if (!window.confirm('Annuler ce rendez-vous ?')) return;
        try {
            await api.post(`/api/patient/appointments/${id}/cancel`);
            fetchPatientData();
        } catch (e) {
            alert(e.response?.data?.message || 'Impossible d’annuler.');
        }
    };

    if (loading) {
        return (
            <motion.div className="flex justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-dp-secondary" />
            </motion.div>
        );
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="font-display text-2xl text-dp-primary">Mes Rendez-vous</h1>
                <p className="text-sm text-dp-neutral-500 mt-1">À venir, demandes et historique</p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
                <section className="rounded-3xl bg-white border border-dp-neutral-100 shadow-dp-card p-6">
                    <h2 className="font-semibold text-dp-primary flex items-center gap-2 mb-6">
                        <CalendarDays className="h-5 w-5 text-dp-secondary" />
                        Prochains rendez-vous
                    </h2>
                    {appointmentsUp.length === 0 ? (
                        <p className="text-sm text-dp-neutral-500 py-8 text-center">Aucun rendez-vous à venir.</p>
                    ) : (
                        <ul className="space-y-4">
                            {appointmentsUp.map((a) => (
                                <li key={a.id} className="rounded-2xl border border-dp-neutral-100 p-4 hover:border-dp-secondary/30 transition">
                                    <div className="flex gap-4">
                                        <div className="text-center min-w-[70px] rounded-xl bg-dp-accent px-2 py-2">
                                            <p className="text-xs font-bold text-dp-secondary uppercase">
                                                {a.appointment_date ? formatDateFrench(a.appointment_date).slice(0, 5) : '—'}
                                            </p>
                                            <p className="text-lg font-bold text-dp-primary">
                                                {a.start_time?.slice(0, 5) || '--:--'}
                                            </p>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-dp-neutral-800">
                                                {a.treatment?.name || a.reason || 'Consultation'}
                                            </p>
                                            <p className="text-sm text-dp-neutral-500">
                                                {a.dentist?.name ? `Dr. ${a.dentist.name}` : 'Praticien à confirmer'}
                                            </p>
                                            <span className="inline-block mt-2 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-dp-accent text-dp-secondary">
                                                {statusAppointmentFr[a.status] || a.status}
                                            </span>
                                            {a.status === 'proposed' && (
                                                <div className="mt-3 flex gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleConfirm(a.id)}
                                                        className="flex-1 text-xs font-bold py-2 rounded-lg bg-emerald-500 text-white"
                                                    >
                                                        Accepter
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleReject(a.id)}
                                                        className="flex-1 text-xs font-bold py-2 rounded-lg border border-amber-200 text-amber-800"
                                                    >
                                                        Refuser
                                                    </button>
                                                </div>
                                            )}
                                            {['requested', 'confirmed'].includes(a.status) && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleCancel(a.id)}
                                                    className="mt-3 text-xs font-semibold text-dp-danger hover:underline"
                                                >
                                                    Annuler
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>

                <section className="rounded-3xl bg-white border border-dp-neutral-100 shadow-dp-card p-6">
                    <h2 className="font-semibold text-dp-primary flex items-center gap-2 mb-6">
                        <CalendarPlus className="h-5 w-5 text-dp-secondary" />
                        Nouvelle demande
                    </h2>
                    {bookMsg.text && (
                        <p
                            className={`mb-4 text-sm px-4 py-3 rounded-xl flex items-center gap-2 ${
                                bookMsg.type === 'ok' ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'
                            }`}
                        >
                            {bookMsg.type === 'ok' ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                            {bookMsg.text}
                        </p>
                    )}
                    <form onSubmit={handleBookSubmit} className="space-y-4">
                        <select
                            required
                            value={bookForm.treatment_id || treatments[0]?.id || ''}
                            onChange={(e) => setBookForm((f) => ({ ...f, treatment_id: e.target.value }))}
                            className="w-full rounded-xl border-2 border-dp-neutral-200 px-4 py-3 text-sm font-medium focus:border-dp-secondary outline-none"
                        >
                            {treatments.map((t) => (
                                <option key={t.id} value={t.id}>
                                    {t.name} — {t.price} MAD
                                </option>
                            ))}
                        </select>
                        <textarea
                            rows={3}
                            placeholder="Notes ou disponibilités…"
                            value={bookForm.patient_note}
                            onChange={(e) => setBookForm((f) => ({ ...f, patient_note: e.target.value }))}
                            className="w-full rounded-xl border-2 border-dp-neutral-200 px-4 py-3 text-sm resize-y focus:border-dp-secondary outline-none"
                        />
                        <button
                            type="submit"
                            disabled={booking}
                            className="w-full py-3 rounded-xl bg-dp-primary text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {booking ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                                <>Envoyer <ChevronRight className="h-4 w-4" /></>
                            )}
                        </button>
                    </form>
                </section>
            </div>

            {historyAppointments.length > 0 && (
                <section className="rounded-3xl bg-white border border-dp-neutral-100 shadow-dp-card p-6">
                    <h2 className="font-semibold text-dp-primary mb-4">Historique</h2>
                    <ul className="space-y-3 text-sm">
                        {historyAppointments.slice(0, 10).map((a) => (
                            <li key={a.id} className="flex justify-between py-2 border-b border-dp-neutral-50 last:border-0">
                                <span>{formatDateFrench(a.appointment_date)} — {a.treatment?.name || 'Soin'}</span>
                                <span className="text-dp-neutral-500">{statusAppointmentFr[a.status]}</span>
                            </li>
                        ))}
                    </ul>
                </section>
            )}

            <BookAppointmentModal open={bookOpen} onClose={() => setBookOpen(false)} />
        </div>
    );
};

export default PatientAppointmentsPage;
