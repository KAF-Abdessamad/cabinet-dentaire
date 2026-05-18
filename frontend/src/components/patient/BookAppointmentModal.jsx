import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X,
    Loader2,
    CalendarPlus,
    Check,
    ChevronLeft,
    ChevronRight,
    AlertCircle,
    User,
    Clock,
    Sparkles,
    Stethoscope,
    Activity,
    Layers,
    Sun,
    Calendar as CalendarIcon,
    AlertTriangle,
    CheckCircle2
} from 'lucide-react';
import api from '../../api.js';
import { usePatientPortalContext } from '../../contexts/PatientPortalContext.jsx';
import { formatDateFrench } from './patientShared.js';

// Icons & styles for care types (treatment types)
const treatmentMeta = {
    'détartrage': { icon: Sparkles, duration: '30 min', bg: 'bg-teal-50 border-teal-200 text-teal-600', activeBg: 'bg-teal-600 text-white border-teal-600' },
    'consultation': { icon: Stethoscope, duration: '20 min', bg: 'bg-blue-50 border-blue-200 text-blue-600', activeBg: 'bg-blue-600 text-white border-blue-600' },
    'extraction': { icon: Activity, duration: '45 min', bg: 'bg-rose-50 border-rose-200 text-rose-600', activeBg: 'bg-rose-600 text-white border-rose-600' },
    'plombage': { icon: Layers, duration: '40 min', bg: 'bg-amber-50 border-amber-200 text-amber-600', activeBg: 'bg-amber-600 text-white border-amber-600' },
    'blanchiment': { icon: Sun, duration: '60 min', bg: 'bg-cyan-50 border-cyan-200 text-cyan-600', activeBg: 'bg-cyan-600 text-white border-cyan-600' },
};

function getMeta(name) {
    const norm = String(name).toLowerCase();
    for (const key of Object.keys(treatmentMeta)) {
        if (norm.includes(key)) {
            return treatmentMeta[key];
        }
    }
    return { icon: Stethoscope, duration: '30 min', bg: 'bg-indigo-50 border-indigo-200 text-indigo-600', activeBg: 'bg-indigo-600 text-white border-indigo-600' };
}

export function BookAppointmentModal({ open, onClose }) {
    const { treatments, fetchPatientData } = usePatientPortalContext();

    // Configuration / Stepper state
    const [step, setStep] = useState(1);
    const [selectedTreatmentId, setSelectedTreatmentId] = useState('');
    const [dentists, setDentists] = useState([]);
    const [selectedDentistId, setSelectedDentistId] = useState('');
    
    // Calendar & Slot selection states
    const [currentMonthOffset, setCurrentMonthOffset] = useState(0); // 0 = current month, 1 = next month
    const [selectedDate, setSelectedDate] = useState(''); // YYYY-MM-DD
    const [selectedSlot, setSelectedSlot] = useState(''); // HH:MM
    
    // API Data
    const [holidays, setHolidays] = useState([]);
    const [availableSlots, setAvailableSlots] = useState([]);
    
    // UI Helpers
    const [loadingHolidays, setLoadingHolidays] = useState(false);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [loadingSubmit, setLoadingSubmit] = useState(false);
    
    // Errors / Alerts / Messages
    const [inlineError, setInlineError] = useState('');
    const [toastMessage, setToastMessage] = useState({ type: '', text: '' });
    const [successMessage, setSuccessMessage] = useState('');

    // Optional patient fields
    const [note, setNote] = useState('');
    const [acceptConditions, setAcceptConditions] = useState(false);

    // Fetch holidays and dentists on mount/open
    useEffect(() => {
        if (open) {
            // Reset to defaults
            setStep(1);
            setSelectedTreatmentId(treatments[0]?.id ? String(treatments[0].id) : '');
            setSelectedDate('');
            setSelectedSlot('');
            setInlineError('');
            setToastMessage({ type: '', text: '' });
            setSuccessMessage('');
            setNote('');
            setAcceptConditions(false);
            setCurrentMonthOffset(0);

            // Fetch Holidays
            setLoadingHolidays(true);
            api.get('/api/holidays')
                .then(res => {
                    setHolidays(res.data || []);
                })
                .catch(err => {
                    console.error('Failed to load holidays:', err);
                })
                .finally(() => {
                    setLoadingHolidays(false);
                });

            // Fetch Dentists
            api.get('/api/patient/dentists')
                .then(res => {
                    setDentists(res.data || []);
                    if (res.data?.length > 0) {
                        setSelectedDentistId(String(res.data[0].id));
                    }
                })
                .catch(err => {
                    console.error('Failed to load dentists:', err);
                });
        }
    }, [open, treatments]);

    // Handle Month Navigation
    const handlePrevMonth = () => {
        if (currentMonthOffset > 0) {
            setCurrentMonthOffset(prev => prev - 1);
        }
    };

    const handleNextMonth = () => {
        if (currentMonthOffset < 1) {
            setCurrentMonthOffset(prev => prev + 1);
        }
    };

    // Date generation for the mini-calendar
    const today = new Date();
    const activeDate = new Date(today.getFullYear(), today.getMonth() + currentMonthOffset, 1);
    const year = activeDate.getFullYear();
    const month = activeDate.getMonth();

    const getDaysArray = () => {
        const date = new Date(year, month, 1);
        const days = [];
        // Day of week for the first day (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
        let startDayOfWeek = date.getDay();
        // Convert so Monday is index 0
        startDayOfWeek = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;

        // Fill previous month days
        for (let i = 0; i < startDayOfWeek; i++) {
            days.push(null);
        }

        // Fill current month days
        while (date.getMonth() === month) {
            days.push(new Date(date));
            date.setDate(date.getDate() + 1);
        }
        return days;
    };

    const days = getDaysArray();

    // Format utility
    const toYmd = (d) => {
        if (!d) return '';
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    };

    const todayYmd = toYmd(today);

    // Call API for available slots whenever a day, dentist, or treatment changes
    const fetchSlots = async (dateYmd, dentistId, careId) => {
        if (!dateYmd || !dentistId || !careId) return;
        setLoadingSlots(true);
        setInlineError('');
        try {
            const res = await api.get('/api/patient/appointments/available-slots', {
                params: {
                    date: dateYmd,
                    dentist_id: dentistId,
                    care_type_id: careId
                }
            });
            setAvailableSlots(res.data || []);
            if (!res.data || res.data.length === 0) {
                setInlineError('Aucun créneau disponible ce jour. Essayez une autre date.');
            }
        } catch (err) {
            setInlineError('Erreur de chargement des créneaux. Veuillez réessayer.');
            console.error(err);
        } finally {
            setLoadingSlots(false);
        }
    };

    // Click on calendar day
    const handleDayClick = (day) => {
        if (!day) return;
        const formatted = toYmd(day);

        // Sunday check
        if (day.getDay() === 0) {
            setInlineError('❌ Le cabinet est fermé le dimanche.');
            setSelectedDate('');
            setSelectedSlot('');
            return;
        }

        // Holiday check
        if (holidays.includes(formatted)) {
            setInlineError('❌ Ce jour est un jour férié — le cabinet est fermé.');
            setSelectedDate('');
            setSelectedSlot('');
            return;
        }

        // Past day check
        if (formatted < todayYmd) {
            setInlineError('❌ Vous ne pouvez pas choisir un jour passé.');
            setSelectedDate('');
            setSelectedSlot('');
            return;
        }

        setInlineError('');
        setSelectedDate(formatted);
        setSelectedSlot('');
        fetchSlots(formatted, selectedDentistId, selectedTreatmentId);
    };

    // Dentist selection change
    const handleDentistChange = (e) => {
        const dId = e.target.value;
        setSelectedDentistId(dId);
        setSelectedSlot('');
        if (selectedDate) {
            fetchSlots(selectedDate, dId, selectedTreatmentId);
        }
    };

    // Validation final checks before Step 3 submission
    const isValidDay = (dateStr) => {
        const d = new Date(dateStr);
        const isSunday = d.getDay() === 0;
        const isHoliday = holidays.includes(dateStr);
        return !isSunday && !isHoliday;
    };

    // Submitting appointment
    const handleConfirmBooking = async () => {
        // Final frontend check
        if (!isValidDay(selectedDate)) {
            setToastMessage({
                type: 'error',
                text: "⚠️ Erreur de validation de date. Les dimanches et jours fériés sont fermés."
            });
            // Force user to Step 2
            setTimeout(() => {
                setStep(2);
                setSelectedDate('');
                setSelectedSlot('');
                setToastMessage({ type: '', text: '' });
            }, 2500);
            return;
        }

        setLoadingSubmit(true);
        setToastMessage({ type: '', text: '' });

        try {
            await api.post('/api/patient/appointments', {
                treatment_id: Number(selectedTreatmentId),
                dentist_id: Number(selectedDentistId),
                appointment_date: selectedDate,
                start_time: selectedSlot,
                patient_note: note || null,
            });

            // Success!
            setSuccessMessage("Vous recevrez un email de confirmation");
            fetchPatientData();
            
            // Auto close modal after successful animation
            setTimeout(() => {
                onClose();
            }, 3500);

        } catch (err) {
            // Race condition: check if status is 409 Conflict
            if (err.response?.status === 409) {
                setToastMessage({
                    type: 'error',
                    text: "⚠️ Ce créneau vient d'être pris par un autre patient. Veuillez choisir un autre horaire."
                });
                
                // Refresh available slots for this day
                fetchSlots(selectedDate, selectedDentistId, selectedTreatmentId);
                
                // Force user back to step 2 after a small toast visibility duration
                setTimeout(() => {
                    setStep(2);
                    setSelectedSlot('');
                    setToastMessage({ type: '', text: '' });
                }, 4000);
            } else {
                setToastMessage({
                    type: 'error',
                    text: err.response?.data?.message || 'Une erreur est survenue lors de la confirmation.'
                });
            }
        } finally {
            setLoadingSubmit(false);
        }
    };

    // Render Steps navigation indicator
    const renderStepHeader = () => {
        const stepTitles = ["Choisir le soin", "Date & Créneau", "Confirmation"];
        return (
            <div className="mb-8">
                <div className="flex justify-between items-center relative">
                    {/* Background Progress Bar */}
                    <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-100 -translate-y-1/2 rounded-full z-0" />
                    
                    {/* Animated Progress Bar */}
                    <motion.div 
                        className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-teal-500 to-teal-600 -translate-y-1/2 rounded-full z-0"
                        initial={{ width: '0%' }}
                        animate={{ width: `${((step - 1) / (stepTitles.length - 1)) * 100}%` }}
                        transition={{ duration: 0.35, ease: 'easeInOut' }}
                    />

                    {stepTitles.map((title, index) => {
                        const sNum = index + 1;
                        const isActive = step === sNum;
                        const isCompleted = step > sNum;
                        
                        return (
                            <div key={title} className="flex flex-col items-center relative z-10">
                                <motion.div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all duration-300 ${
                                        isCompleted 
                                            ? 'bg-teal-500 border-teal-500 text-white shadow-lg shadow-teal-500/20' 
                                            : isActive 
                                                ? 'bg-white border-teal-600 text-teal-600 shadow-md ring-4 ring-teal-600/10' 
                                                : 'bg-white border-slate-200 text-slate-400'
                                    }`}
                                    whileHover={{ scale: 1.05 }}
                                >
                                    {isCompleted ? <Check className="h-5 w-5 stroke-[3px]" /> : sNum}
                                </motion.div>
                                <span className={`text-[11px] font-bold mt-2 uppercase tracking-wide transition-colors duration-200 ${
                                    isActive ? 'text-teal-600' : isCompleted ? 'text-teal-500' : 'text-slate-400'
                                }`}>
                                    {title}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    // All possible daily slots (30 min increment)
    const allDailySlots = [
        '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30',
        '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
    ];

    const currentTreatment = treatments.find(t => String(t.id) === selectedTreatmentId);
    const currentDentist = dentists.find(d => String(d.id) === selectedDentistId);

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md overflow-y-auto"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <button 
                        type="button" 
                        className="absolute inset-0 cursor-default" 
                        onClick={step === 3 && successMessage ? undefined : onClose} 
                        aria-label="Fermer" 
                    />
                    
                    <motion.div
                        role="dialog"
                        aria-modal="true"
                        initial={{ opacity: 0, scale: 0.95, y: 24 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 24 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                        className="relative w-full max-w-4xl rounded-3xl bg-white shadow-2xl border border-slate-100 overflow-hidden"
                    >
                        {/* Top Accent Gradient Bar */}
                        <div className="h-2 w-full bg-gradient-to-r from-dp-primary via-teal-600 to-teal-400" />
                        
                        {/* Header Panel */}
                        <div className="flex justify-between items-start p-6 sm:p-8 pb-4">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-2xl bg-teal-50 flex items-center justify-center text-teal-600">
                                    <CalendarPlus className="h-6 w-6" />
                                </div>
                                <div>
                                    <h2 className="font-display text-2xl text-dp-primary tracking-tight">
                                        Rendez-vous en ligne
                                    </h2>
                                    <p className="text-xs text-slate-500 mt-0.5">Planifiez instantanément votre soin chez DentistPro</p>
                                </div>
                            </div>
                            
                            {/* Close button (disabled during final successful submission) */}
                            {!(step === 3 && successMessage) && (
                                <button 
                                    type="button" 
                                    onClick={onClose} 
                                    className="p-2.5 rounded-xl hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            )}
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 sm:p-8 pt-0">
                            
                            {/* Step indicators */}
                            {!successMessage && renderStepHeader()}

                            {/* Toast Notifications */}
                            {toastMessage.text && (
                                <motion.div 
                                    initial={{ opacity: 0, y: -8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`mb-6 p-4 rounded-2xl flex items-center gap-3 text-sm font-semibold border ${
                                        toastMessage.type === 'error' 
                                            ? 'bg-red-50 border-red-200 text-red-700' 
                                            : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                                    }`}
                                >
                                    <AlertTriangle className="h-5 w-5 shrink-0" />
                                    <span>{toastMessage.text}</span>
                                </motion.div>
                            )}

                            {/* SUCCESS ANIMATION SCREEN */}
                            {successMessage ? (
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="py-12 flex flex-col items-center text-center max-w-md mx-auto"
                                >
                                    <div className="relative mb-6">
                                        {/* Outer glowing rings */}
                                        <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping" />
                                        <div className="relative w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-xl shadow-emerald-500/30">
                                            <Check className="h-10 w-10 stroke-[3px]" />
                                        </div>
                                    </div>
                                    
                                    <h3 className="font-display text-2xl text-slate-800">
                                        Rendez-vous Confirmé !
                                    </h3>
                                    
                                    <p className="text-slate-500 mt-2 text-sm leading-relaxed">
                                        Votre réservation a été validée en temps réel.
                                        <br />
                                        <span className="font-bold text-teal-600">{successMessage}</span>
                                    </p>

                                    {/* Small Recap Card */}
                                    <div className="w-full mt-8 bg-slate-50 rounded-2xl border border-slate-100 p-5 text-left text-xs space-y-3">
                                        <div className="flex justify-between">
                                            <span className="text-slate-400 font-bold uppercase tracking-wider">Soin</span>
                                            <span className="font-semibold text-slate-800">{currentTreatment?.name}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-400 font-bold uppercase tracking-wider">Praticien</span>
                                            <span className="font-semibold text-slate-800">Dr. {currentDentist?.name}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-400 font-bold uppercase tracking-wider">Date & Heure</span>
                                            <span className="font-semibold text-slate-800">{formatDateFrench(selectedDate)} à {selectedSlot}</span>
                                        </div>
                                    </div>
                                </motion.div>
                            ) : (
                                <div>
                                    {/* STEP 1: SELECT CARE TYPE */}
                                    {step === 1 && (
                                        <motion.div 
                                            initial={{ opacity: 0, x: -16 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 16 }}
                                            className="space-y-6"
                                        >
                                            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex items-center gap-3">
                                                <AlertCircle className="h-5 w-5 text-teal-600 shrink-0" />
                                                <p className="text-xs text-slate-600 leading-normal">
                                                    Veuillez sélectionner le type de soin requis. DentistPro propose une réservation directe en ligne avec confirmation immédiate sur notre calendrier dynamique.
                                                </p>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                {treatments.map((t) => {
                                                    const isSelected = selectedTreatmentId === String(t.id);
                                                    const meta = getMeta(t.name);
                                                    const MetaIcon = meta.icon;

                                                    return (
                                                        <motion.button
                                                            key={t.id}
                                                            type="button"
                                                            whileHover={{ scale: 1.02 }}
                                                            whileTap={{ scale: 0.98 }}
                                                            onClick={() => setSelectedTreatmentId(String(t.id))}
                                                            className={`text-left p-5 rounded-2xl border-2 transition-all relative flex flex-col justify-between h-40 ${
                                                                isSelected 
                                                                    ? 'border-teal-600 bg-teal-50/30 shadow-md shadow-teal-600/5 ring-1 ring-teal-600/10' 
                                                                    : 'border-slate-150 bg-white hover:border-slate-300 hover:shadow-sm'
                                                            }`}
                                                        >
                                                            {/* Selected Check Indicator */}
                                                            {isSelected && (
                                                                <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-teal-600 flex items-center justify-center text-white shadow shadow-teal-600/30">
                                                                    <Check className="h-4 w-4 stroke-[3px]" />
                                                                </div>
                                                            )}

                                                            <div>
                                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 border ${meta.bg}`}>
                                                                    <MetaIcon className="h-5 w-5" />
                                                                </div>
                                                                <h4 className="font-bold text-slate-800 text-sm">{t.name}</h4>
                                                                <p className="text-slate-400 text-xs mt-1 font-medium line-clamp-1">
                                                                    {t.description || 'Soin dentaire professionnel'}
                                                                </p>
                                                            </div>

                                                            <div className="flex justify-between items-center mt-3 pt-2 border-t border-slate-100 w-full text-xs">
                                                                <span className="text-slate-400 flex items-center gap-1">
                                                                    <Clock className="h-3.5 w-3.5" />
                                                                    {meta.duration}
                                                                </span>
                                                                <span className="font-bold text-teal-600">{t.price} MAD</span>
                                                            </div>
                                                        </motion.button>
                                                    );
                                                })}
                                            </div>

                                            {/* Step 1 Footer */}
                                            <div className="flex justify-end pt-4 border-t border-slate-100">
                                                <button
                                                    type="button"
                                                    disabled={!selectedTreatmentId}
                                                    onClick={() => setStep(2)}
                                                    className="px-6 py-3.5 rounded-xl bg-dp-primary text-white font-bold text-sm hover:bg-dp-primary-hover shadow-lg shadow-dp-primary/15 transition flex items-center gap-2 disabled:opacity-50"
                                                >
                                                    Continuer <ChevronRight className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* STEP 2: SELECT DATE AND TIME */}
                                    {step === 2 && (
                                        <motion.div 
                                            initial={{ opacity: 0, x: 16 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -16 }}
                                            className="space-y-6"
                                        >
                                            {/* Dentist Selection and Info bar */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                                                        Sélectionner le Praticien
                                                    </label>
                                                    <div className="relative">
                                                        <select
                                                            value={selectedDentistId}
                                                            onChange={handleDentistChange}
                                                            className="w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10 outline-none transition appearance-none"
                                                        >
                                                            {dentists.map((d) => (
                                                                <option key={d.id} value={d.id}>
                                                                    Dr. {d.name}
                                                                </option>
                                                            ))}
                                                        </select>
                                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                                            <ChevronRight className="h-4 w-4 rotate-90" />
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600 shrink-0">
                                                        <CalendarIcon className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-semibold text-slate-800">Soins : {currentTreatment?.name}</p>
                                                        <p className="text-[11px] text-slate-500 mt-0.5">Durée estimée : {getMeta(currentTreatment?.name).duration} | Tarif : {currentTreatment?.price} MAD</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Interactive Mini-Calendar and Slots Side-by-Side */}
                                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                                                
                                                {/* Left Grid: Custom Interactive Calendar */}
                                                <div className="lg:col-span-7 space-y-4">
                                                    <div className="flex justify-between items-center">
                                                        <h4 className="font-bold text-slate-700 text-sm flex items-center gap-2">
                                                            <CalendarIcon className="h-4 w-4 text-teal-600" />
                                                            Choisir une date
                                                        </h4>
                                                        
                                                        {/* Month Toggle buttons */}
                                                        <div className="flex items-center gap-1">
                                                            <button
                                                                type="button"
                                                                onClick={handlePrevMonth}
                                                                disabled={currentMonthOffset === 0}
                                                                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition"
                                                            >
                                                                <ChevronLeft className="h-4 w-4" />
                                                            </button>
                                                            <span className="text-xs font-bold text-slate-700 min-w-[120px] text-center capitalize">
                                                                {activeDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                                                            </span>
                                                            <button
                                                                type="button"
                                                                onClick={handleNextMonth}
                                                                disabled={currentMonthOffset === 1}
                                                                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition"
                                                            >
                                                                <ChevronRight className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* Calendar Grid */}
                                                    <div className="border border-slate-150 rounded-2xl p-4 bg-white shadow-sm overflow-hidden relative">
                                                        
                                                        {/* Week Days Header */}
                                                        <div className="grid grid-cols-7 gap-2 mb-2 text-center text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                                            <span>Lu</span>
                                                            <span>Ma</span>
                                                            <span>Me</span>
                                                            <span>Je</span>
                                                            <span>Ve</span>
                                                            <span>Sa</span>
                                                            <span className="text-red-400">Di</span>
                                                        </div>

                                                        {/* Days Loop */}
                                                        <div className="grid grid-cols-7 gap-2">
                                                            {days.map((day, idx) => {
                                                                if (!day) return <div key={`empty-${idx}`} className="h-9" />;

                                                                const dateYmd = toYmd(day);
                                                                const isSunday = day.getDay() === 0;
                                                                const isHoliday = holidays.includes(dateYmd);
                                                                const isPast = dateYmd < todayYmd;
                                                                const isToday = dateYmd === todayYmd;
                                                                const isSelected = dateYmd === selectedDate;

                                                                // Apply conditional classnames
                                                                let cellStyle = "h-9 w-full rounded-lg flex flex-col items-center justify-center text-xs font-semibold relative transition-all ";
                                                                let textStyle = "text-slate-800";
                                                                
                                                                if (isSunday) {
                                                                    // Sundays are barred visually, greyed, opacity 40%, cursor banned
                                                                    cellStyle += "bg-slate-100 opacity-40 line-through cursor-not-allowed border border-slate-200/50";
                                                                    textStyle = "text-slate-400";
                                                                } else if (isHoliday) {
                                                                    // Holidays are light orange with beach icon
                                                                    cellStyle += "bg-[#FEF3C7] border border-amber-200/70 hover:bg-amber-100 cursor-not-allowed";
                                                                    textStyle = "text-amber-800 font-bold";
                                                                } else if (isPast) {
                                                                    cellStyle += "opacity-30 cursor-not-allowed bg-slate-50";
                                                                    textStyle = "text-slate-400";
                                                                } else if (isSelected) {
                                                                    cellStyle += "bg-teal-600 text-white shadow-md shadow-teal-600/20 scale-105 border border-teal-600";
                                                                    textStyle = "text-white";
                                                                } else {
                                                                    // Standard available day (Blue palette accent)
                                                                    cellStyle += "bg-blue-50/50 border border-blue-100 hover:border-teal-500 hover:bg-white text-blue-700 cursor-pointer";
                                                                    textStyle = "text-blue-700 font-bold";
                                                                }

                                                                // Highlight Today
                                                                if (isToday && !isSelected) {
                                                                    cellStyle += " ring-2 ring-teal-500/50 ring-offset-1";
                                                                }

                                                                return (
                                                                    <button
                                                                        key={dateYmd}
                                                                        type="button"
                                                                        onClick={() => handleDayClick(day)}
                                                                        className={cellStyle}
                                                                        title={isHoliday ? '🏖️ Jour férié' : isSunday ? 'Cabinet fermé' : ''}
                                                                    >
                                                                        <span className={textStyle}>{day.getDate()}</span>
                                                                        {isHoliday && (
                                                                            <span className="absolute bottom-0 text-[8px]" role="img" aria-label="vacation">🏖️</span>
                                                                        )}
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Right Grid: Available Slots display */}
                                                <div className="lg:col-span-5 space-y-4">
                                                    <h4 className="font-bold text-slate-700 text-sm flex items-center gap-2">
                                                        <Clock className="h-4 w-4 text-teal-600" />
                                                        Créneaux horaires
                                                    </h4>

                                                    {/* Inline calendar clicks feedback or general error */}
                                                    {inlineError ? (
                                                        <div className="p-4 bg-red-50/50 border border-red-100 rounded-2xl text-xs text-red-700 flex items-start gap-2.5">
                                                            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-600" />
                                                            <span>{inlineError}</span>
                                                        </div>
                                                    ) : !selectedDate ? (
                                                        <div className="h-[220px] rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 flex flex-col items-center justify-center p-6 text-center text-xs text-slate-400">
                                                            <CalendarIcon className="h-8 w-8 text-slate-300 mb-2 stroke-[1.5px]" />
                                                            <p className="font-medium">Veuillez sélectionner un jour sur le calendrier pour charger les créneaux disponibles.</p>
                                                        </div>
                                                    ) : loadingSlots ? (
                                                        <div className="h-[220px] rounded-2xl border border-slate-100 bg-white flex flex-col items-center justify-center p-6">
                                                            <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
                                                            <p className="text-xs text-slate-500 mt-2 font-medium">Vérification de la disponibilité en temps réel…</p>
                                                        </div>
                                                    ) : (
                                                        <div className="grid grid-cols-3 gap-2 overflow-y-auto max-h-[220px] pr-1">
                                                            {allDailySlots.map((slot) => {
                                                                const isFree = availableSlots.includes(slot);
                                                                const isSlotSelected = selectedSlot === slot;
                                                                
                                                                let slotStyle = "py-2.5 rounded-xl text-xs font-semibold text-center transition-all border ";
                                                                
                                                                if (isSlotSelected) {
                                                                    slotStyle += "bg-teal-600 border-teal-600 text-white shadow-md shadow-teal-600/25 scale-105";
                                                                } else if (isFree) {
                                                                    // White/Blue for free slots
                                                                    slotStyle += "bg-white border-blue-200 text-blue-700 hover:border-teal-500 hover:bg-teal-50/20 cursor-pointer";
                                                                } else {
                                                                    // Taken slots in grey/struck through
                                                                    slotStyle += "bg-slate-50 border-slate-150 text-slate-350 opacity-55 line-through cursor-not-allowed";
                                                                }

                                                                return (
                                                                    <button
                                                                        key={slot}
                                                                        type="button"
                                                                        disabled={!isFree}
                                                                        onClick={() => setSelectedSlot(slot)}
                                                                        className={slotStyle}
                                                                    >
                                                                        {slot}
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Step 2 Footer */}
                                            <div className="flex justify-between pt-6 border-t border-slate-100">
                                                <button
                                                    type="button"
                                                    onClick={() => setStep(1)}
                                                    className="px-5 py-3.5 rounded-xl border-2 border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-sm transition flex items-center gap-2"
                                                >
                                                    <ChevronLeft className="h-4 w-4" /> Retour
                                                </button>
                                                
                                                <button
                                                    type="button"
                                                    disabled={!selectedDate || !selectedSlot}
                                                    onClick={() => setStep(3)}
                                                    className="px-6 py-3.5 rounded-xl bg-dp-primary text-white font-bold text-sm hover:bg-dp-primary-hover shadow-lg shadow-dp-primary/15 transition flex items-center gap-2 disabled:opacity-50"
                                                >
                                                    Continuer <ChevronRight className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* STEP 3: RECAP & CONFIRM */}
                                    {step === 3 && (
                                        <motion.div 
                                            initial={{ opacity: 0, scale: 0.98 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.98 }}
                                            className="space-y-6"
                                        >
                                            <h4 className="font-bold text-slate-800 text-base mb-4">Récapitulatif de votre réservation</h4>
                                            
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                
                                                {/* Care Card */}
                                                <div className="p-5 rounded-2xl bg-teal-50/50 border border-teal-100 space-y-2">
                                                    <div className="h-9 w-9 rounded-xl bg-teal-100 flex items-center justify-center text-teal-700">
                                                        <Sparkles className="h-4 w-4" />
                                                    </div>
                                                    <h5 className="text-[10px] font-bold uppercase tracking-wider text-teal-600">Type de soin</h5>
                                                    <p className="text-sm font-bold text-slate-800">{currentTreatment?.name}</p>
                                                    <p className="text-xs font-semibold text-teal-600">{currentTreatment?.price} MAD</p>
                                                </div>

                                                {/* Practitioner Card */}
                                                <div className="p-5 rounded-2xl bg-blue-50/50 border border-blue-100 space-y-2">
                                                    <div className="h-9 w-9 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700">
                                                        <User className="h-4 w-4" />
                                                    </div>
                                                    <h5 className="text-[10px] font-bold uppercase tracking-wider text-blue-600">Praticien</h5>
                                                    <p className="text-sm font-bold text-slate-800">Dr. {currentDentist?.name}</p>
                                                    <p className="text-xs text-slate-400 font-medium">Spécialiste qualifié</p>
                                                </div>

                                                {/* Slot Card */}
                                                <div className="p-5 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-2">
                                                    <div className="h-9 w-9 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-700">
                                                        <Clock className="h-4 w-4" />
                                                    </div>
                                                    <h5 className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">Date & Heure</h5>
                                                    <p className="text-sm font-bold text-slate-800">{formatDateFrench(selectedDate)}</p>
                                                    <p className="text-xs font-bold text-indigo-600">à {selectedSlot}</p>
                                                </div>
                                            </div>

                                            {/* Patient Custom Note */}
                                            <div>
                                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                                                    Notes additionnelles pour le cabinet (optionnel)
                                                </label>
                                                <textarea
                                                    rows={3}
                                                    value={note}
                                                    onChange={(e) => setNote(e.target.value)}
                                                    className="w-full rounded-2xl border-2 border-slate-200 px-4 py-3 text-sm focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10 outline-none transition resize-none"
                                                    placeholder="Spécifiez ici des indications ou antécédents utiles pour le médecin…"
                                                />
                                            </div>

                                            {/* Terms and Conditions Checkbox */}
                                            <label className="flex items-start gap-3 p-4 bg-slate-50 border border-slate-150 rounded-2xl cursor-pointer hover:bg-slate-100/50 transition">
                                                <input
                                                    type="checkbox"
                                                    checked={acceptConditions}
                                                    onChange={(e) => setAcceptConditions(e.target.checked)}
                                                    className="w-5 h-5 rounded border-slate-300 text-teal-600 focus:ring-teal-500 focus:ring-offset-0 mt-0.5 shrink-0"
                                                />
                                                <span className="text-xs text-slate-600 leading-normal select-none">
                                                    J'accepte les conditions de réservation du cabinet DentistPro. Je m'engage à me présenter à l'heure convenue ou à prévenir le secrétariat au moins 24 heures à l'avance en cas d'annulation.
                                                </span>
                                            </label>

                                            {/* Step 3 Footer */}
                                            <div className="flex justify-between pt-6 border-t border-slate-100">
                                                <button
                                                    type="button"
                                                    disabled={loadingSubmit}
                                                    onClick={() => setStep(2)}
                                                    className="px-5 py-3.5 rounded-xl border-2 border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-sm transition flex items-center gap-2"
                                                >
                                                    <ChevronLeft className="h-4 w-4" /> Retour
                                                </button>
                                                
                                                <button
                                                    type="button"
                                                    disabled={!acceptConditions || loadingSubmit}
                                                    onClick={handleConfirmBooking}
                                                    className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 text-white font-bold text-sm shadow-xl shadow-teal-600/20 transition flex items-center gap-2 disabled:opacity-50"
                                                >
                                                    {loadingSubmit ? (
                                                        <>
                                                            <Loader2 className="h-4 w-4 animate-spin" /> Confirmation…
                                                        </>
                                                    ) : (
                                                        <>
                                                            Confirmer le rendez-vous <CheckCircle2 className="h-4 w-4" />
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </div>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

export default BookAppointmentModal;
