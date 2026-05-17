import React, { useState, useEffect, useCallback, useMemo } from 'react';
import debounce from 'lodash.debounce';
import api from '../api.js';
import { X, Loader2, Check, AlertCircle } from 'lucide-react';
import moment from 'moment';
import {
    isAppointmentDateAllowed,
    appointmentDateClosedMessage,
    nextAllowedAppointmentDate,
} from '../lib/appointmentDateRestrictions.js';

const emptyForm = () => ({
    patient_id: '',
    user_id: '',
    treatment_id: '',
    appointment_date: nextAllowedAppointmentDate(),
    start_time: '09:00',
    end_time: '09:30',
    reason: '',
    admin_note: '',
    status: 'confirmed',
});

const AppointmentFormModal = ({ appointment, isOpen, onClose, onSave }) => {
    const [formData, setFormData] = useState(emptyForm);
    const [patients, setPatients] = useState([]);
    const [dentists, setDentists] = useState([]);
    const [treatments, setTreatments] = useState([]);
    const [isAvailable, setIsAvailable] = useState(true);
    const [checkingAvailability, setCheckingAvailability] = useState(false);
    const [saving, setSaving] = useState(false);

    const planRequest = useMemo(
        () => Boolean(appointment?.id && appointment.status === 'requested'),
        [appointment]
    );

    const editExisting = useMemo(
        () => Boolean(appointment?.id && !planRequest),
        [appointment, planRequest]
    );

    const manualNew = useMemo(() => !appointment?.id, [appointment]);

    const [patientQuery, setPatientQuery] = useState('');
    const [patientSuggestOpen, setPatientSuggestOpen] = useState(false);

    const filteredPatients = useMemo(() => {
        if (!manualNew) return [];
        const list = patients || [];
        const q = patientQuery.trim().toLowerCase();
        if (!q) return list.slice(0, 10);
        return list
            .filter((p) => {
                const full = `${p.first_name || ''} ${p.last_name || ''}`.toLowerCase();
                const cin = String(p.cin || '').toLowerCase();
                return full.includes(q) || cin.includes(q) || String(p.id) === q;
            })
            .slice(0, 12);
    }, [manualNew, patientQuery, patients]);

    const selectPatientFromSearch = (p) => {
        setFormData((prev) => ({ ...prev, patient_id: String(p.id) }));
        setPatientQuery(`${p.first_name || ''} ${p.last_name || ''}`.trim());
        setPatientSuggestOpen(false);
    };

    useEffect(() => {
        if (!isOpen) return;

        if (manualNew) {
            setPatientQuery('');
            setPatientSuggestOpen(false);
        }

        if (planRequest) {
            setFormData({
                patient_id: String(appointment.patient_id ?? ''),
                user_id: appointment.user_id ? String(appointment.user_id) : '',
                treatment_id: appointment.treatment_id ? String(appointment.treatment_id) : '',
                appointment_date: nextAllowedAppointmentDate(),
                start_time: '09:00',
                end_time: '09:30',
                reason: appointment.reason || '',
                admin_note: appointment.admin_note || '',
                status: 'proposed',
            });
        } else if (editExisting) {
            if (appointment.starts_at && appointment.ends_at) {
                setFormData({
                    patient_id: String(appointment.patient_id ?? ''),
                    user_id: String(appointment.user_id ?? ''),
                    treatment_id: appointment.treatment_id ? String(appointment.treatment_id) : '',
                    appointment_date: (() => {
                        const iso = moment(appointment.starts_at).format('YYYY-MM-DD');
                        return isAppointmentDateAllowed(iso) ? iso : nextAllowedAppointmentDate(iso);
                    })(),
                    start_time: moment(appointment.starts_at).format('HH:mm'),
                    end_time: moment(appointment.ends_at).format('HH:mm'),
                    reason: appointment.reason || '',
                    admin_note: appointment.admin_note || '',
                    status: appointment.status || 'confirmed',
                });
            } else {
                setFormData({
                    patient_id: String(appointment.patient_id ?? ''),
                    user_id: appointment.user_id ? String(appointment.user_id) : '',
                    treatment_id: appointment.treatment_id ? String(appointment.treatment_id) : '',
                    appointment_date: nextAllowedAppointmentDate(),
                    start_time: '09:00',
                    end_time: '09:30',
                    reason: appointment.reason || '',
                    admin_note: appointment.admin_note || '',
                    status: appointment.status || 'confirmed',
                });
            }
        } else {
            setFormData(emptyForm());
        }
    }, [isOpen, appointment, planRequest, editExisting, manualNew]);

    useEffect(() => {
        if (!isOpen) return;
        const load = async () => {
            try {
                const [pRes, dRes, tRes] = await Promise.all([
                    api.get('/api/patients'),
                    api.get('/api/cabinet/dentists'),
                    api.get('/api/cabinet/treatments'),
                ]);
                setPatients(pRes.data);
                setDentists(dRes.data);
                setTreatments(tRes.data);
            } catch (error) {
                console.error('Error fetching data for appointment form:', error);
            }
        };
        load();
    }, [isOpen]);

    const checkAvailability = useCallback(
        debounce(async (data) => {
            if (!data.user_id || !data.appointment_date || !data.start_time || !data.end_time) return;

            setCheckingAvailability(true);
            try {
                const starts_at = `${data.appointment_date} ${data.start_time}`;
                const ends_at = `${data.appointment_date} ${data.end_time}`;
                const response = await api.get('/api/check-availability', {
                    params: {
                        user_id: data.user_id,
                        starts_at,
                        ends_at,
                        exclude_id: appointment?.id,
                    },
                });
                setIsAvailable(response.data.available);
            } catch (error) {
                console.error('Availability check error:', error);
            } finally {
                setCheckingAvailability(false);
            }
        }, 500),
        [appointment]
    );

    useEffect(() => {
        if (!isOpen) return;
        checkAvailability(formData);
    }, [isOpen, formData.user_id, formData.appointment_date, formData.start_time, formData.end_time, checkAvailability]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isAppointmentDateAllowed(formData.appointment_date)) {
            return;
        }
        if (manualNew && !formData.patient_id) {
            alert('Sélectionnez un patient dans la liste de recherche.');
            return;
        }
        if (!isAvailable) return;

        setSaving(true);
        try {
            const payload = {
                patient_id: Number(formData.patient_id),
                user_id: Number(formData.user_id),
                treatment_id: formData.treatment_id ? Number(formData.treatment_id) : null,
                appointment_date: formData.appointment_date,
                start_time: formData.start_time,
                end_time: formData.end_time,
                reason: formData.reason || null,
                admin_note: formData.admin_note || null,
                status: formData.status,
            };

            if (planRequest) {
                await api.put(`/api/appointments/${appointment.id}`, payload);
            } else if (editExisting) {
                await api.put(`/api/appointments/${appointment.id}`, payload);
            } else {
                await api.post('/api/appointments', payload);
            }
            onSave();
            onClose();
        } catch (error) {
            alert(error.response?.data?.error || "Erreur lors de l'enregistrement");
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen) return null;

    const title = planRequest
        ? 'Planifier une demande patient'
        : editExisting
          ? 'Modifier le rendez-vous'
          : 'Nouveau rendez-vous (cabinet)';

    const submitLabel = planRequest
        ? formData.status === 'confirmed'
            ? 'Confirmer et afficher au calendrier'
            : 'Proposer le créneau au patient'
        : editExisting
          ? 'Mettre à jour'
          : 'Créer le rendez-vous';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto">
                <div className="px-6 py-4 bg-medical-600 text-white flex justify-between items-center sticky top-0 z-10">
                    <div>
                        <h2 className="text-xl font-bold">{title}</h2>
                        {manualNew && (
                            <p className="text-xs text-white/80 mt-1 font-medium">
                                Recherchez le patient (saisie), puis dentiste, soin et créneau — listes alimentées par l&apos;API.
                            </p>
                        )}
                        {planRequest && (
                            <p className="text-xs text-white/80 mt-1 font-medium">
                                Demande reçue depuis l&apos;espace patient — le patient et le soin sont pré-remplis.
                            </p>
                        )}
                    </div>
                    <button type="button" onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition shrink-0">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {planRequest && appointment.patient_note && (
                        <div className="rounded-xl border border-amber-100 bg-amber-50/80 p-3 text-sm text-amber-900">
                            <span className="font-bold">Message du patient : </span>
                            <span className="whitespace-pre-wrap">{appointment.patient_note}</span>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Patient</label>
                            {manualNew ? (
                                <div className="relative">
                                    <input
                                        type="text"
                                        autoComplete="off"
                                        value={patientQuery}
                                        onChange={(e) => {
                                            setPatientQuery(e.target.value);
                                            setFormData((prev) => ({ ...prev, patient_id: '' }));
                                            setPatientSuggestOpen(true);
                                        }}
                                        onFocus={() => setPatientSuggestOpen(true)}
                                        onBlur={() => {
                                            setTimeout(() => setPatientSuggestOpen(false), 200);
                                        }}
                                        placeholder="Tapez nom, prénom, CIN ou n° de dossier…"
                                        className="w-full rounded-xl border-slate-200 focus:border-medical-500 focus:ring-medical-500 px-3 py-2.5 text-sm font-medium"
                                    />
                                    {patientSuggestOpen && filteredPatients.length > 0 && (
                                        <ul className="absolute left-0 right-0 z-30 mt-1 max-h-52 overflow-auto rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
                                            {filteredPatients.map((p) => (
                                                <li key={p.id}>
                                                    <button
                                                        type="button"
                                                        className="w-full px-3 py-2 text-left text-sm hover:bg-medical-50"
                                                        onMouseDown={(ev) => {
                                                            ev.preventDefault();
                                                            selectPatientFromSearch(p);
                                                        }}
                                                    >
                                                        <span className="font-bold text-slate-800">
                                                            #{p.id} — {p.first_name} {p.last_name}
                                                        </span>
                                                        {p.cin ? (
                                                            <span className="ml-2 text-xs text-slate-500">CIN {p.cin}</span>
                                                        ) : null}
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                    <p className="mt-1.5 text-xs text-slate-500">
                                        API patients : {patients.length} enregistrement(s). Choisissez une ligne pour fixer le
                                        dossier.
                                    </p>
                                </div>
                            ) : (
                                <select
                                    name="patient_id"
                                    value={formData.patient_id}
                                    onChange={handleChange}
                                    required
                                    disabled={planRequest}
                                    className="w-full rounded-xl border-slate-200 focus:border-medical-500 focus:ring-medical-500 disabled:bg-slate-100 disabled:cursor-not-allowed"
                                >
                                    <option value="">Choisir un patient</option>
                                    {patients.map((p) => (
                                        <option key={p.id} value={p.id}>
                                            #{p.id} — {p.first_name} {p.last_name}
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Dentiste</label>
                            <select
                                name="user_id"
                                value={formData.user_id}
                                onChange={handleChange}
                                required
                                className="w-full rounded-xl border-slate-200"
                            >
                                {dentists.length === 0 ? (
                                    <option value="">Aucun dentiste (API / rôle « dentiste »)</option>
                                ) : (
                                    <>
                                        <option value="">Choisir un dentiste</option>
                                        {dentists.map((d) => (
                                            <option key={d.id} value={d.id}>
                                                #{d.id} — Dr. {d.name}
                                            </option>
                                        ))}
                                    </>
                                )}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Soin</label>
                            <select
                                name="treatment_id"
                                value={formData.treatment_id}
                                onChange={handleChange}
                                className="w-full rounded-xl border-slate-200"
                            >
                                {treatments.length === 0 ? (
                                    <option value="">Aucun soin (API /seed traitements)</option>
                                ) : (
                                    <>
                                        <option value="">Choisir un soin</option>
                                        {treatments.map((t) => (
                                            <option key={t.id} value={t.id}>
                                                #{t.id} — {t.name}
                                                {t.price != null && t.price !== '' ? ` — ${t.price} MAD` : ''}
                                                {t.description
                                                    ? ` — ${String(t.description).slice(0, 40)}${
                                                          String(t.description).length > 40 ? '…' : ''
                                                      }`
                                                    : ''}
                                            </option>
                                        ))}
                                    </>
                                )}
                            </select>
                        </div>

                        {planRequest && (
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-slate-700 mb-1">Après planification</label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    className="w-full rounded-xl border-slate-200"
                                >
                                    <option value="proposed">Proposer au patient (il confirme dans son espace)</option>
                                    <option value="confirmed">Confirmer directement (affiché au calendrier)</option>
                                </select>
                            </div>
                        )}

                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                            <input
                                type="date"
                                name="appointment_date"
                                value={formData.appointment_date}
                                onChange={handleChange}
                                required
                                className={`w-full rounded-xl border-slate-200 ${
                                    !isAppointmentDateAllowed(formData.appointment_date)
                                        ? 'border-rose-400 ring-1 ring-rose-200'
                                        : ''
                                }`}
                            />
                            {!isAppointmentDateAllowed(formData.appointment_date) ? (
                                <p className="mt-2 text-xs font-bold text-rose-600">{appointmentDateClosedMessage()}</p>
                            ) : (
                                <p className="mt-2 text-xs text-slate-500">Dimanches et jours fériés fixes (Maroc) non disponibles.</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Début</label>
                            <input
                                type="time"
                                name="start_time"
                                value={formData.start_time}
                                onChange={handleChange}
                                required
                                className="w-full rounded-xl border-slate-200"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Fin</label>
                            <input
                                type="time"
                                name="end_time"
                                value={formData.end_time}
                                onChange={handleChange}
                                required
                                className="w-full rounded-xl border-slate-200"
                            />
                        </div>

                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Note cabinet (optionnel)</label>
                            <textarea
                                name="admin_note"
                                value={formData.admin_note}
                                onChange={handleChange}
                                rows={2}
                                className="w-full rounded-xl border-slate-200 text-sm"
                                placeholder="Consignes pour le patient ou l'équipe…"
                            />
                        </div>
                    </div>

                    <div
                        className={`p-3 rounded-xl flex items-center gap-2 text-sm ${
                            checkingAvailability
                                ? 'bg-slate-100 text-slate-600'
                                : isAvailable
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : 'bg-rose-50 text-rose-700'
                        }`}
                    >
                        {checkingAvailability ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : isAvailable ? (
                            <Check className="w-4 h-4" />
                        ) : (
                            <AlertCircle className="w-4 h-4" />
                        )}
                        <span>
                            {checkingAvailability
                                ? 'Vérification de disponibilité...'
                                : isAvailable
                                  ? 'Créneau disponible (marge de 5 min incluse)'
                                  : "Créneau déjà occupé ou trop proche d'un autre RDV"}
                        </span>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition font-bold"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={
                                !isAvailable ||
                                checkingAvailability ||
                                saving ||
                                !isAppointmentDateAllowed(formData.appointment_date) ||
                                (manualNew && !formData.patient_id)
                            }
                            className="flex-[2] px-8 py-3 bg-medical-600 text-white rounded-xl hover:bg-medical-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-bold"
                        >
                            {saving ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : submitLabel}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AppointmentFormModal;
