import React, { useState, useEffect, useMemo, useCallback } from 'react';
import api from '../api.js';
import { X, Loader2, Check, AlertCircle, Calendar, User, Clock, CheckSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const emptyForm = () => ({
    patient_id: '',
    user_id: '',
    treatment_id: '',
    appointment_date: '',
    start_time: '',
    end_time: '',
    reason: '',
    notes: '',
    status: 'confirmed',
});

const AppointmentModal = ({ isOpen, appointment, prefilledData, onClose, onSave }) => {
    const [formData, setFormData] = useState(emptyForm);
    const [patients, setPatients] = useState([]);
    const [dentists, setDentists] = useState([]);
    const [treatments, setTreatments] = useState([]);

    // Slots & Availability
    const [availableSlots, setAvailableSlots] = useState([]);
    const [loadingSlots, setLoadingSlots] = useState(false);

    // Patients search autocomplete
    const [patientQuery, setPatientQuery] = useState('');
    const [suggestOpen, setSuggestOpen] = useState(false);

    // Form state
    const [saving, setSaving] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);
    const [sendEmail, setSendEmail] = useState(true);

    const editMode = Boolean(appointment?.id);

    // Parse treatment durations
    const getDuration = (treatmentId) => {
        const treat = treatments.find(t => String(t.id) === String(treatmentId));
        if (!treat) return 30;
        const name = treat.name.toLowerCase();
        if (name.includes('détartrage') || name.includes('detartrage')) return 30;
        if (name.includes('consultation')) return 30;
        if (name.includes('extraction')) return 60;
        if (name.includes('plombage')) return 45;
        if (name.includes('blanchiment')) return 60;
        if (name.includes('implant')) return 90;
        return 30;
    };

    // Load initial data
    useEffect(() => {
        if (!isOpen) return;

        api.get('/api/patients?all=1').then(res => {
            const list = Array.isArray(res.data) ? res.data : (res.data?.data || []);
            setPatients(list);
        });
        api.get('/api/cabinet/dentists').then(res => setDentists(res.data || []));
        api.get('/api/cabinet/treatments').then(res => setTreatments(res.data || []));
    }, [isOpen]);

    // Bind form data
    useEffect(() => {
        if (!isOpen) return;

        if (appointment) {
            setFormData({
                patient_id: appointment.patient_id ? String(appointment.patient_id) : '',
                user_id: appointment.user_id ? String(appointment.user_id) : '',
                treatment_id: appointment.treatment_id ? String(appointment.treatment_id) : '',
                appointment_date: appointment.appointment_date ? appointment.appointment_date.substring(0, 10) : '',
                start_time: appointment.start_time ? appointment.start_time.substring(0, 5) : '',
                end_time: appointment.end_time ? appointment.end_time.substring(0, 5) : '',
                reason: appointment.reason || '',
                notes: appointment.notes || '',
                status: appointment.status || 'confirmed',
            });
            if (appointment.patient) {
                setPatientQuery(`${appointment.patient.first_name} ${appointment.patient.last_name}`);
            }
            setShowSuccess(false);
            setErrorMessage('');
        } else if (prefilledData) {
            setFormData({
                ...emptyForm(),
                patient_id: prefilledData.patient_id ? String(prefilledData.patient_id) : '',
                appointment_date: prefilledData.date || '',
                start_time: prefilledData.time || '',
                status: 'confirmed',
            });
            if (prefilledData.patient_id && patients.length > 0) {
                const foundPatient = patients.find(p => String(p.id) === String(prefilledData.patient_id));
                if (foundPatient) {
                    setPatientQuery(`${foundPatient.first_name} ${foundPatient.last_name}`);
                } else {
                    setPatientQuery('');
                }
            } else {
                setPatientQuery('');
            }
            setShowSuccess(false);
            setErrorMessage('');
        } else {
            setFormData(emptyForm());
            setPatientQuery('');
            setShowSuccess(false);
            setErrorMessage('');
        }
    }, [isOpen, appointment, prefilledData, patients]);

    // Calculate slots on date/dentist/duration change
    const fetchSlots = useCallback(async () => {
        if (!formData.appointment_date || !formData.user_id) {
            setAvailableSlots([]);
            return;
        }

        setLoadingSlots(true);
        try {
            const duration = getDuration(formData.treatment_id);
            const res = await api.get('/api/appointments/available-slots', {
                params: {
                    date: formData.appointment_date,
                    user_id: formData.user_id,
                    duration: duration
                }
            });
            setAvailableSlots(res.data || []);
        } catch (err) {
            console.error("Error loading slots", err);
            setAvailableSlots([]);
        } finally {
            setLoadingSlots(false);
        }
    }, [formData.appointment_date, formData.user_id, formData.treatment_id, treatments]);

    useEffect(() => {
        if (isOpen) {
            fetchSlots();
        }
    }, [formData.appointment_date, formData.user_id, formData.treatment_id, fetchSlots, isOpen]);

    // Handle treatment change (recompute end time)
    const handleTreatmentChange = (treatmentId) => {
        const duration = getDuration(treatmentId);
        setFormData(prev => {
            const updated = { ...prev, treatment_id: treatmentId };
            if (prev.start_time) {
                const [h, m] = prev.start_time.split(':').map(Number);
                const endMins = h * 60 + m + duration;
                const endH = Math.floor(endMins / 60);
                const endM = endMins % 60;
                updated.end_time = `${endH < 10 ? '0' : ''}${endH}:${endM < 10 ? '0' : ''}${endM}`;
            }
            return updated;
        });
    };

    // Handle Slot click
    const handleSlotClick = (slot) => {
        const duration = getDuration(formData.treatment_id);
        const [h, m] = slot.split(':').map(Number);
        const endMins = h * 60 + m + duration;
        const endH = Math.floor(endMins / 60);
        const endM = endMins % 60;
        const endTimeStr = `${endH < 10 ? '0' : ''}${endH}:${endM < 10 ? '0' : ''}${endM}`;

        setFormData(prev => ({
            ...prev,
            start_time: slot,
            end_time: endTimeStr
        }));
    };

    // Filtered patients autocomplete
    const filteredPatients = useMemo(() => {
        const q = patientQuery.trim().toLowerCase();
        if (!q) return patients.slice(0, 8);
        return patients.filter(p => {
            const name = `${p.first_name || ''} ${p.last_name || ''}`.toLowerCase();
            const cin = (p.cin || '').toLowerCase();
            return name.includes(q) || cin.includes(q);
        }).slice(0, 10);
    }, [patientQuery, patients]);

    // Handle form submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');

        // Form validations
        if (!formData.patient_id) {
            setErrorMessage("Veuillez sélectionner un patient.");
            return;
        }
        if (!formData.user_id) {
            setErrorMessage("Veuillez sélectionner un dentiste.");
            return;
        }
        if (!formData.appointment_date) {
            setErrorMessage("Veuillez choisir une date.");
            return;
        }
        if (!formData.start_time) {
            setErrorMessage("Veuillez choisir un créneau horaire.");
            return;
        }

        setSaving(true);
        try {
            const payload = {
                ...formData,
                patient_id: Number(formData.patient_id),
                user_id: Number(formData.user_id),
                treatment_id: formData.treatment_id ? Number(formData.treatment_id) : null,
                send_email: sendEmail,
            };

            if (editMode) {
                await api.put(`/api/appointments/${appointment.id}`, payload);
            } else {
                await api.post('/api/appointments', payload);
            }

            setShowSuccess(true);
            setTimeout(() => {
                onSave();
                onClose();
            }, 1800);
        } catch (err) {
            const msg = err.response?.data?.error || "Une erreur est survenue lors de l'enregistrement.";
            setErrorMessage(msg);
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop with elegant scale blur */}
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />

            {/* Modal Body */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                className="bg-white rounded-[32px] w-full max-w-2xl overflow-hidden shadow-2xl relative z-10 border border-slate-100 max-h-[90vh] flex flex-col"
            >
                {/* Header */}
                <div className="px-8 py-5 bg-gradient-to-r from-medical-600 to-teal-600 text-white flex justify-between items-center shrink-0">
                    <div>
                        <h2 className="text-xl font-black uppercase tracking-wide">
                            {editMode ? "Modifier le Rendez-vous" : "Nouveau Rendez-vous"}
                        </h2>
                        <p className="text-[11px] text-white/80 font-bold mt-0.5">
                            Double vérification anti-conflit en temps réel.
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition">
                        <X size={20} />
                    </button>
                </div>

                {/* Body Content */}
                <div className="p-8 overflow-y-auto flex-1 space-y-6">
                    
                    {showSuccess ? (
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="py-12 flex flex-col items-center justify-center text-center space-y-4"
                        >
                            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 shadow-lg shadow-emerald-100/50">
                                <Check size={40} strokeWidth={3} />
                            </div>
                            <h3 className="text-2xl font-black text-slate-800">Enregistré avec succès !</h3>
                            <p className="text-slate-500 font-bold text-sm">
                                {sendEmail ? "Un e-mail de confirmation a été envoyé au patient." : "Le planning a été synchronisé."}
                            </p>
                        </motion.div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            
                            {errorMessage && (
                                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 text-rose-700 text-xs font-black flex items-center gap-3">
                                    <AlertCircle size={16} className="shrink-0" />
                                    <span>{errorMessage}</span>
                                </div>
                            )}

                            {/* Grid fields */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                
                                {/* Patient Autocomplete */}
                                <div className="relative">
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5">
                                        Patient *
                                    </label>
                                    <input 
                                        type="text"
                                        value={patientQuery}
                                        onChange={(e) => {
                                            setPatientQuery(e.target.value);
                                            setFormData(prev => ({ ...prev, patient_id: '' }));
                                            setSuggestOpen(true);
                                        }}
                                        onFocus={() => setSuggestOpen(true)}
                                        onBlur={() => setTimeout(() => setSuggestOpen(false), 200)}
                                        placeholder="Saisissez nom, prénom ou CIN..."
                                        className="w-full rounded-2xl border-slate-200 focus:border-medical-500 focus:ring-medical-500 text-sm font-bold py-3"
                                    />
                                    
                                    {suggestOpen && filteredPatients.length > 0 && (
                                        <ul className="absolute left-0 right-0 z-30 mt-1.5 max-h-52 overflow-y-auto rounded-2xl border border-slate-100 bg-white py-2 shadow-2xl">
                                            {filteredPatients.map(p => (
                                                <li key={p.id}>
                                                    <button
                                                        type="button"
                                                        onMouseDown={() => {
                                                            setFormData(prev => ({ ...prev, patient_id: String(p.id) }));
                                                            setPatientQuery(`${p.first_name} ${p.last_name}`);
                                                            setSuggestOpen(false);
                                                        }}
                                                        className="w-full text-left px-4 py-2 hover:bg-slate-50 transition text-xs font-black text-slate-700 flex justify-between"
                                                    >
                                                        <span>{p.first_name} {p.last_name}</span>
                                                        <span className="text-slate-400 font-bold">CIN: {p.cin || 'N/A'}</span>
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>

                                {/* Dentist Selector */}
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5">
                                        Dentiste *
                                    </label>
                                    <select 
                                        value={formData.user_id}
                                        onChange={(e) => setFormData(prev => ({ ...prev, user_id: e.target.value }))}
                                        required
                                        className="w-full rounded-2xl border-slate-200 text-sm font-bold py-3"
                                    >
                                        <option value="">Sélectionner un praticien</option>
                                        {dentists.map(d => (
                                            <option key={d.id} value={d.id}>Dr. {d.name}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Care Type (Treatment) */}
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5">
                                        Soin / Traitement
                                    </label>
                                    <select 
                                        value={formData.treatment_id}
                                        onChange={(e) => handleTreatmentChange(e.target.value)}
                                        className="w-full rounded-2xl border-slate-200 text-sm font-bold py-3"
                                    >
                                        <option value="">Soin de base (30 min)</option>
                                        {treatments.map(t => (
                                            <option key={t.id} value={t.id}>
                                                {t.name} ({getDuration(t.id)} min) - {t.price} MAD
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Date Picker */}
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5">
                                        Date du rendez-vous *
                                    </label>
                                    <input 
                                        type="date"
                                        value={formData.appointment_date}
                                        onChange={(e) => setFormData(prev => ({ ...prev, appointment_date: e.target.value }))}
                                        required
                                        className="w-full rounded-2xl border-slate-200 text-sm font-bold py-3"
                                    />
                                </div>

                                {/* Note and Reason */}
                                <div className="col-span-1 md:col-span-2">
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5">
                                        Note administrative ou motif
                                    </label>
                                    <textarea 
                                        value={formData.reason}
                                        onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                                        rows={2}
                                        placeholder="Notes de consultation, précisions patient..."
                                        className="w-full rounded-2xl border-slate-200 text-sm font-medium py-3 px-4"
                                    />
                                </div>

                                {/* Status Selector (if editing) */}
                                {editMode && (
                                    <div className="col-span-1 md:col-span-2">
                                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5">
                                            Statut
                                        </label>
                                        <select 
                                            value={formData.status}
                                            onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                                            className="w-full rounded-2xl border-slate-200 text-sm font-bold py-3"
                                        >
                                            <option value="requested">En attente / Demandé</option>
                                            <option value="proposed">Créneau proposé</option>
                                            <option value="confirmed">Confirmé</option>
                                            <option value="completed">Terminé</option>
                                            <option value="cancelled">Annulé</option>
                                        </select>
                                    </div>
                                )}
                            </div>

                            {/* Slots Section */}
                            {formData.appointment_date && formData.user_id && (
                                <div className="space-y-3 bg-slate-50 p-6 rounded-[24px] border border-slate-100/80">
                                    <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                                        <Clock size={14} className="text-slate-400" />
                                        Créneaux Libres ({getDuration(formData.treatment_id)} min)
                                    </h4>

                                    {loadingSlots ? (
                                        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 py-3">
                                            <Loader2 size={14} className="animate-spin text-medical-500" />
                                            Recherche des disponibilités en cours...
                                        </div>
                                    ) : availableSlots.length === 0 ? (
                                        <p className="text-xs font-bold text-slate-400 py-3">
                                            Aucun créneau disponible ce jour. Le cabinet est fermé (dimanche, jour férié) ou complet.
                                        </p>
                                    ) : (
                                        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                                            {availableSlots.map(slot => {
                                                const selected = formData.start_time === slot;
                                                return (
                                                    <button
                                                        key={slot}
                                                        type="button"
                                                        onClick={() => handleSlotClick(slot)}
                                                        className={`py-2 px-3 rounded-xl text-xs font-black transition ${selected ? 'bg-medical-600 text-white shadow-md shadow-medical-100' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'}`}
                                                    >
                                                        {slot}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {formData.start_time && formData.end_time && (
                                        <div className="text-[11px] font-black text-medical-600 flex items-center gap-1 mt-2">
                                            <CheckSquare size={13} />
                                            Créneau sélectionné : {formData.start_time} - {formData.end_time}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Email Checkbox and Buttons */}
                            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <label className="flex items-center gap-2.5 cursor-pointer">
                                    <input 
                                        type="checkbox"
                                        checked={sendEmail}
                                        onChange={(e) => setSendEmail(e.target.checked)}
                                        className="rounded border-slate-300 text-medical-600 focus:ring-medical-500 w-4.5 h-4.5"
                                    />
                                    <span className="text-xs font-black text-slate-500 uppercase tracking-tight">
                                        Envoyer un email de confirmation
                                    </span>
                                </label>

                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="px-6 py-3 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition text-xs font-black uppercase tracking-widest shrink-0"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="px-8 py-3 bg-medical-600 text-white rounded-xl hover:bg-medical-700 transition font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-medical-100 shrink-0"
                                    >
                                        {saving && <Loader2 size={14} className="animate-spin" />}
                                        {editMode ? "Mettre à Jour" : "Enregistrer"}
                                    </button>
                                </div>
                            </div>
                        </form>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default AppointmentModal;
