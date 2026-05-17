import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, CalendarPlus } from 'lucide-react';
import api from '../../api.js';
import { usePatientPortalContext } from '../../contexts/PatientPortalContext.jsx';

export function BookAppointmentModal({ open, onClose }) {
    const { treatments, fetchPatientData } = usePatientPortalContext();
    const [treatmentId, setTreatmentId] = useState(treatments[0]?.id ? String(treatments[0].id) : '');
    const [note, setNote] = useState('');
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState({ type: '', text: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMsg({ type: '', text: '' });
        try {
            await api.post('/api/patient/appointments', {
                treatment_id: Number(treatmentId),
                patient_note: note || null,
            });
            setMsg({ type: 'ok', text: 'Demande envoyée. Le cabinet vous proposera un créneau.' });
            setNote('');
            fetchPatientData();
            setTimeout(onClose, 1500);
        } catch (err) {
            setMsg({
                type: 'err',
                text: err.response?.data?.message || 'Impossible d’envoyer la demande.',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    className="fixed inset-0 z-[200] flex items-center justify-center p-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <button type="button" className="absolute inset-0 bg-dp-neutral-900/50 backdrop-blur-sm" onClick={onClose} aria-label="Fermer" />
                    <motion.div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="book-title"
                        initial={{ opacity: 0, scale: 0.95, y: 16 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 16 }}
                        className="relative w-full max-w-md rounded-3xl bg-white shadow-dp-xl border border-dp-neutral-100 p-6"
                    >
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center gap-3">
                                <div className="h-11 w-11 rounded-xl bg-dp-accent flex items-center justify-center text-dp-secondary">
                                    <CalendarPlus className="h-5 w-5" />
                                </div>
                                <div>
                                    <h2 id="book-title" className="font-display text-xl text-dp-primary">
                                        Prendre un rendez-vous
                                    </h2>
                                    <p className="text-xs text-dp-neutral-500 mt-0.5">Demande en ligne au cabinet</p>
                                </div>
                            </div>
                            <button type="button" onClick={onClose} className="p-2 rounded-lg hover:bg-dp-neutral-100 text-dp-neutral-500">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {msg.text && (
                            <p
                                className={`mb-4 text-sm font-medium px-4 py-3 rounded-xl ${
                                    msg.type === 'ok' ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'
                                }`}
                            >
                                {msg.text}
                            </p>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-dp-neutral-500 mb-2">
                                    Type de soin
                                </label>
                                <select
                                    required
                                    value={treatmentId}
                                    onChange={(e) => setTreatmentId(e.target.value)}
                                    className="w-full rounded-xl border-2 border-dp-neutral-200 px-4 py-3 text-sm font-medium focus:border-dp-secondary focus:ring-4 focus:ring-dp-secondary/15 outline-none"
                                >
                                    <option value="">Sélectionner</option>
                                    {treatments.map((t) => (
                                        <option key={t.id} value={t.id}>
                                            {t.name} — {t.price} MAD
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-dp-neutral-500 mb-2">
                                    Notes (optionnel)
                                </label>
                                <textarea
                                    rows={3}
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    className="w-full rounded-xl border-2 border-dp-neutral-200 px-4 py-3 text-sm resize-y focus:border-dp-secondary focus:ring-4 focus:ring-dp-secondary/15 outline-none"
                                    placeholder="Disponibilités préférées…"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3.5 rounded-xl bg-dp-primary text-white font-bold text-sm hover:bg-dp-primary-hover disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Envoyer la demande'}
                            </button>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

export default BookAppointmentModal;
