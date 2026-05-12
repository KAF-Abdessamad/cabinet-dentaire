import React, { useState, useEffect, useCallback } from 'react';
import debounce from 'lodash.debounce';
import api from '../api.js';
import { X, Loader2, Check, AlertCircle } from 'lucide-react';
import moment from 'moment';

const AppointmentFormModal = ({ appointment, isOpen, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        patient_id: '',
        user_id: '',
        treatment_id: '',
        appointment_date: moment().format('YYYY-MM-DD'),
        start_time: '09:00',
        end_time: '09:30',
        reason: '',
        status: 'confirmed'
    });

    const [patients, setPatients] = useState([]);
    const [dentists, setDentists] = useState([]);
    const [treatments, setTreatments] = useState([]);
    const [isAvailable, setIsAvailable] = useState(true);
    const [checkingAvailability, setCheckingAvailability] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (appointment) {
            setFormData({
                ...appointment,
                appointment_date: moment(appointment.starts_at).format('YYYY-MM-DD'),
                start_time: moment(appointment.starts_at).format('HH:mm'),
                end_time: moment(appointment.ends_at).format('HH:mm'),
            });
        }
        fetchInitialData();
    }, [appointment]);

    const fetchInitialData = async () => {
        try {
            const [pRes, dRes, tRes] = await Promise.all([
                api.get('/api/patients'),
                api.get('/api/patient/dentists'),
                api.get('/api/patient/treatments')
            ]);
            setPatients(pRes.data);
            setDentists(dRes.data);
            setTreatments(tRes.data);
        } catch (error) {
            console.error('Error fetching data for appointment form:', error);
        }
    };

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
                        exclude_id: appointment?.id
                    }
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
        checkAvailability(formData);
    }, [formData.user_id, formData.appointment_date, formData.start_time, formData.end_time, checkAvailability]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isAvailable) return;

        setSaving(true);
        try {
            if (appointment) {
                await api.put(`/api/appointments/${appointment.id}`, formData);
            } else {
                await api.post('/api/appointments', formData);
            }
            onSave();
            onClose();
        } catch (error) {
            alert(error.response?.data?.error || 'Erreur lors de l\'enregistrement');
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl">
                <div className="px-6 py-4 bg-medical-600 text-white flex justify-between items-center">
                    <h2 className="text-xl font-bold">
                        {appointment ? 'Modifier Rendez-vous' : 'Nouveau Rendez-vous'}
                    </h2>
                    <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Patient</label>
                            <select 
                                name="patient_id" 
                                value={formData.patient_id} 
                                onChange={handleChange}
                                required
                                className="w-full rounded-xl border-slate-200 focus:border-medical-500 focus:ring-medical-500"
                            >
                                <option value="">Choisir un patient</option>
                                {patients.map(p => (
                                    <option key={p.id} value={p.id}>{p.first_name} {p.last_name}</option>
                                ))}
                            </select>
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
                                <option value="">Choisir un dentiste</option>
                                {dentists.map(d => (
                                    <option key={d.id} value={d.id}>Dr. {d.name}</option>
                                ))}
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
                                <option value="">Choisir un soin</option>
                                {treatments.map(t => (
                                    <option key={t.id} value={t.id}>{t.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                            <input 
                                type="date" 
                                name="appointment_date" 
                                value={formData.appointment_date} 
                                onChange={handleChange}
                                required
                                className="w-full rounded-xl border-slate-200"
                            />
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
                    </div>

                    {/* Availability Check Indicator */}
                    <div className={`p-3 rounded-xl flex items-center gap-2 text-sm ${
                        checkingAvailability ? 'bg-slate-100 text-slate-600' :
                        isAvailable ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                    }`}>
                        {checkingAvailability ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : isAvailable ? (
                            <Check className="w-4 h-4" />
                        ) : (
                            <AlertCircle className="w-4 h-4" />
                        )}
                        <span>
                            {checkingAvailability ? 'Vérification de disponibilité...' :
                             isAvailable ? 'Créneau disponible (marge de 5 min incluse)' : 'Créneau déjà occupé ou trop proche d\'un autre RDV'}
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
                            disabled={!isAvailable || checkingAvailability || saving}
                            className="flex-2 px-8 py-3 bg-medical-600 text-white rounded-xl hover:bg-medical-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-bold"
                        >
                            {saving ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : (appointment ? 'Mettre à jour' : 'Confirmer')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AppointmentFormModal;
