import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
} from 'lucide-react';
import api from '../api.js';

const tabs = [
    { id: 'infos', label: 'Mes informations', Icon: User },
    { id: 'sante', label: 'Santé', Icon: Stethoscope },
    { id: 'rdv', label: 'Rendez-vous', Icon: CalendarDays },
    { id: 'historique', label: 'Historique', Icon: History },
    { id: 'paiements', label: 'Paiements', Icon: Wallet },
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
    const [loading, setLoading] = useState(true);

    const [bookForm, setBookForm] = useState({
        treatment_id: '',
        patient_note: '',
    });
    const [booking, setBooking] = useState(false);
    const [bookMsg, setBookMsg] = useState({ type: '', text: '' });

    const fetchPatientData = useCallback(async () => {
        try {
            const [statsRes, apptRes, medRes, denRes, invRes, treatRes] = await Promise.all([
                api.get('/api/patient/stats'),
                api.get('/api/patient/appointments'),
                api.get('/api/patient/medical-records'),
                api.get('/api/patient/dentists'),
                api.get('/api/patient/invoices'),
                api.get('/api/patient/treatments'),
            ]);
            setStats(statsRes.data);
            setAppointmentsUp(apptRes.data || []);
            setPatientBundle(medRes.data || null);
            setDentists(denRes.data || []);
            setInvoices(invRes.data || []);
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

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4 text-dentist-deeper">
                <Loader2 className="h-10 w-10 animate-spin text-dentist-primary" strokeWidth={2} />
                <p className="text-sm text-slate-600">Chargement de votre espace…</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Hero */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-dentist-primary via-dentist-secondary to-dentist-dark text-white shadow-xl shadow-dentist-primary/25 px-8 py-10 transition-transform hover:scale-[1.005] duration-500">
                <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-white/10 blur-2xl pointer-events-none" />
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight relative">
                    Bienvenue{patient?.first_name ? `, ${patient.first_name}` : ''}
                </h1>
                <p className="mt-3 text-white/90 max-w-xl relative">
                    Retrouvez vos informations, vos rendez-vous et vos paiements en un seul endroit.
                </p>
                {stats && (
                    <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 relative">
                        <div className="rounded-2xl bg-white/15 backdrop-blur-sm px-5 py-4 border border-white/20">
                            <p className="text-sm text-white/80">Rendez-vous à venir</p>
                            <p className="text-3xl font-bold mt-1">{stats.upcoming_appointments}</p>
                        </div>
                        <div className="rounded-2xl bg-white/15 backdrop-blur-sm px-5 py-4 border border-white/20">
                            <p className="text-sm text-white/80">Actes prévus liés aux RDV</p>
                            <p className="text-3xl font-bold mt-1">{stats.active_treatments}</p>
                        </div>
                        <div className="rounded-2xl bg-white/15 backdrop-blur-sm px-5 py-4 border border-white/20">
                            <p className="text-sm text-white/80">Fiche santé complète</p>
                            <p className="text-xl font-bold mt-1 flex items-center gap-2">
                                {stats.profile_complete ? (
                                    <>
                                        <CheckCircle2 className="h-6 w-6" strokeWidth={2} />
                                        Oui
                                    </>
                                ) : (
                                    <>
                                        <AlertCircle className="h-6 w-6" strokeWidth={2} />
                                        À compléter
                                    </>
                                )}
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap gap-2 p-1.5 rounded-2xl bg-dentist-surface/90 border border-dentist-muted/50 shadow-inner">
                {tabs.map(({ id, label, Icon }) => {
                    const active = activeTab === id;
                    return (
                        <button
                            key={id}
                            type="button"
                            onClick={() => setActiveTab(id)}
                            className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300 ${
                                active
                                    ? 'bg-white text-dentist-deeper shadow-md scale-[1.02]'
                                    : 'text-slate-600 hover:bg-white/60 hover:text-dentist-deeper'
                            }`}
                        >
                            <Icon className="h-4 w-4 shrink-0" strokeWidth={2} />
                            {label}
                        </button>
                    );
                })}
            </div>

            {/* Panels */}
            <div className="animate-tab rounded-3xl bg-white shadow-lg shadow-dentist-primary/10 border border-dentist-soft p-8 min-h-[280px]">
                {activeTab === 'infos' && patient && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                        <h2 className="md:col-span-2 text-xl font-bold text-dentist-deeper flex items-center gap-2 mb-2">
                            <User className="h-6 w-6 text-dentist-primary" strokeWidth={2} />
                            Identité & contact
                        </h2>
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
                    </div>
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
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                        <div>
                            <h2 className="text-xl font-bold text-dentist-deeper flex items-center gap-2 mb-4">
                                <CalendarDays className="h-6 w-6 text-dentist-primary" strokeWidth={2} />
                                Prochains rendez-vous
                            </h2>
                            {appointmentsUp.length > 0 ? (
                                <ul className="space-y-3">
                                    {appointmentsUp.map((appointment) => (
                                        <li
                                            key={appointment.id}
                                            className={`rounded-2xl border p-4 flex flex-col gap-4 hover:shadow-md transition-all duration-300 ${
                                                appointment.status === 'proposed' ? 'border-amber-300 bg-amber-50/50' : 'border-dentist-muted/60 bg-dentist-soft/50'
                                            }`}
                                        >
                                            <div className="flex gap-4 items-start">
                                                <span className={`flex flex-col items-center justify-center rounded-xl text-white px-4 py-2 text-center min-w-[4.5rem] ${
                                                    appointment.status === 'requested' ? 'bg-slate-400' : 'bg-gradient-to-br from-dentist-primary to-dentist-dark'
                                                }`}>
                                                    <span className="text-xs uppercase font-semibold opacity-90">
                                                        {appointment.appointment_date ? formatDateFrench(appointment.appointment_date) : '??/??'}
                                                    </span>
                                                    <span className="text-sm font-bold">
                                                        {appointment.start_time ? appointment.start_time.slice(0, 5) : '--:--'}
                                                    </span>
                                                </span>
                                                <div className="flex-1">
                                                    <p className="font-semibold text-slate-800">
                                                        {appointment.status === 'requested' ? 'En attente de planification' : (appointment.dentist?.name ? `Dr. ${appointment.dentist.name}` : 'Dentiste')}
                                                    </p>
                                                    <p className="text-slate-600 text-xs mt-1">
                                                        {appointment.treatment?.name || appointment.reason || 'Consultation'}
                                                    </p>
                                                    <div className="flex flex-wrap items-center gap-2 mt-2">
                                                        <span
                                                            className={`inline-block text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full border ${
                                                                appointment.status === 'confirmed'
                                                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                                                    : appointment.status === 'proposed'
                                                                      ? 'bg-amber-50 text-amber-700 border-amber-100'
                                                                      : appointment.status === 'requested'
                                                                        ? 'bg-sky-50 text-sky-700 border-sky-100'
                                                                        : 'bg-slate-50 text-slate-700 border-slate-100'
                                                            }`}
                                                        >
                                                            {statusAppointmentFr[appointment.status] || appointment.status}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {appointment.status === 'proposed' && (
                                                <div className="pt-3 border-t border-amber-200 flex flex-col gap-3">
                                                    <p className="text-xs text-amber-800 font-medium italic bg-amber-100/50 p-2 rounded-lg">
                                                        " {appointment.admin_note || "Le cabinet vous propose ce créneau."} "
                                                    </p>
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleConfirmProposal(appointment.id)}
                                                            className="flex-1 bg-emerald-600 text-white text-xs font-bold py-2 rounded-lg hover:bg-emerald-700 transition"
                                                        >
                                                            Confirmer
                                                        </button>
                                                        <button
                                                            onClick={() => handleRejectProposal(appointment.id)}
                                                            className="flex-1 bg-white text-amber-700 border border-amber-200 text-xs font-bold py-2 rounded-lg hover:bg-amber-50 transition"
                                                        >
                                                            Refuser
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-slate-500 py-8">Aucun rendez-vous à venir.</p>
                            )}
                        </div>

                        <div>
                            <h2 className="text-xl font-bold text-dentist-deeper flex items-center gap-2 mb-4">
                                <CalendarPlus className="h-6 w-6 text-dentist-primary" strokeWidth={2} />
                                Nouveau rendez-vous
                            </h2>
                            {bookMsg.text && (
                                <div
                                    className={`mb-4 px-4 py-3 rounded-xl text-sm font-medium border ${
                                        bookMsg.type === 'ok'
                                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                            : 'bg-red-50 text-red-700 border-red-200'
                                    }`}
                                >
                                    {bookMsg.text}
                                </div>
                            )}
                            <form onSubmit={handleBookSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-2">
                                        Type de soin
                                    </label>
                                    <select
                                        required
                                        className="w-full rounded-xl border border-dentist-muted bg-dentist-soft/50 px-4 py-3 text-sm focus:ring-2 focus:ring-dentist-primary focus:border-dentist-primary transition"
                                        value={bookForm.treatment_id}
                                        onChange={(e) =>
                                            setBookForm((f) => ({ ...f, treatment_id: e.target.value }))
                                        }
                                    >
                                        <option value="">Sélectionner un soin</option>
                                        {treatments.map((t) => (
                                            <option key={t.id} value={t.id}>
                                                {t.name} ({t.price} DH)
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-2">
                                        Note ou préférence (optionnel)
                                    </label>
                                    <textarea
                                        rows={3}
                                        className="w-full rounded-xl border border-dentist-muted px-4 py-3 text-sm"
                                        placeholder="Précisez vos disponibilités générales ou toute information utile..."
                                        value={bookForm.patient_note}
                                        onChange={(e) =>
                                            setBookForm((f) => ({ ...f, patient_note: e.target.value }))
                                        }
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={booking}
                                    className="w-full rounded-xl bg-gradient-to-r from-dentist-primary to-dentist-dark text-white py-3.5 font-semibold shadow-lg shadow-dentist-primary/30 hover:opacity-95 active:scale-[0.98] transition flex items-center justify-center gap-2 disabled:opacity-60"
                                >
                                    {booking ? (
                                        <Loader2 className="h-5 w-5 animate-spin" strokeWidth={2} />
                                    ) : null}
                                    Envoyer ma demande
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {activeTab === 'historique' && (
                    <div>
                        <h2 className="text-xl font-bold text-dentist-deeper flex items-center gap-2 mb-6">
                            <History className="h-6 w-6 text-dentist-primary" strokeWidth={2} />
                            Historique des consultations
                        </h2>
                        {historyAppointments.length === 0 ? (
                            <p className="text-slate-500">Aucun historique disponible pour le moment.</p>
                        ) : (
                            <ul className="space-y-3">
                                {historyAppointments.map((a) => (
                                    <li
                                        key={`h-${a.id}`}
                                        className="rounded-2xl border border-slate-100 p-5 bg-slate-50/80 hover:bg-white hover:border-dentist-muted transition-all duration-300"
                                    >
                                        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                                            <span className="font-semibold text-dentist-deeper">
                                                {formatDateFrench(a.appointment_date)} •{' '}
                                                {a.start_time?.slice(0, 5)}
                                            </span>
                                            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-white border border-dentist-muted">
                                                {statusAppointmentFr[a.status] || a.status}
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-700">{a.dentist?.name}</p>
                                        {a.reason && (
                                            <p className="text-xs text-slate-500 mt-2">{a.reason}</p>
                                        )}
                                        {a.treatments?.length > 0 && (
                                            <p className="text-xs text-slate-600 mt-3">
                                                Actes associés :{' '}
                                                {a.treatments.map((t) => t.name).join(', ') || '—'}
                                            </p>
                                        )}
                                    </li>
                                ))}
                            </ul>
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
            </div>
        </div>
    );
};

function Field({ label, value, className = '' }) {
    return (
        <div className={className}>
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</span>
            <p className="mt-1 text-slate-900 font-medium">{value || '—'}</p>
        </div>
    );
}

function CardSoft({ title, value, multiline, className = '' }) {
    return (
        <div
            className={`rounded-2xl border border-dentist-muted/60 bg-dentist-soft/40 p-5 ${className}`}
        >
            <h3 className="text-sm font-bold text-dentist-deeper mb-2">{title}</h3>
            <p className={`text-slate-700 ${multiline ? 'whitespace-pre-wrap' : ''}`}>{value || '—'}</p>
        </div>
    );
}

export default PatientDashboard;
