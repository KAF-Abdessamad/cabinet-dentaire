import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
    User, Phone, Mail, IdCard, Calendar, ShieldAlert, Edit2, Plus, 
    Printer, Heart, Activity, UserMinus, ArrowLeft, Check, X, 
    FileText, DollarSign, Upload, Download, Eye, Clock, Award, CheckSquare, Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api.js';
import { useMediaQuery } from '../hooks/useMediaQuery.js';
import { useSwipeable } from '../hooks/useSwipeable.js';

// Status labels & colors for appointments
const statusLabels = {
    requested: 'Demandé',
    proposed: 'Proposé',
    pending: 'En attente',
    confirmed: 'Confirmé',
    completed: 'Terminé',
    cancelled: 'Annulé',
};

const statusColors = {
    requested: '#6366f1',
    proposed: '#f59e0b',
    pending: '#3b82f6',
    confirmed: '#10b981',
    completed: '#0d9488',
    cancelled: '#ef4444',
};

const PatientDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [patient, setPatient] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('personal');

    // Inline edit section states
    const [editingSection, setEditingSection] = useState(null); // 'civil', 'medical', 'emergency'
    const [editData, setEditData] = useState({});

    // Appointment filters
    const [apptStatusFilter, setApptStatusFilter] = useState('all');
    const [apptTimeFilter, setApptTimeFilter] = useState('all'); // 'all', 'upcoming', 'past'

    // Interactive dental schema state
    const [selectedTooth, setSelectedTooth] = useState(null);
    const [toothHistory, setToothHistory] = useState({});

    // Documents state
    const [documents, setDocuments] = useState([
        { id: 1, name: 'Radiographie Panoramique.jpg', type: 'image', size: '2.4 MB', date: '2026-04-12', url: 'https://images.unsplash.com/photo-1579684389782-64d84b5e901a?q=80&w=600' },
        { id: 2, name: 'Ordonnance Post-Opératoire.pdf', type: 'pdf', size: '340 KB', date: '2026-05-02', url: '#' },
        { id: 3, name: 'Bilan Parodontal.pdf', type: 'pdf', size: '1.2 MB', date: '2026-05-15', url: '#' }
    ]);
    const [lightboxImage, setLightboxImage] = useState(null);

    // Responsive adaptation hooks
    const isMobile = useMediaQuery('(max-width: 640px)');
    const isTablet = useMediaQuery('(max-width: 1024px)');

    // Touch swiping handlers
    const tabsList = ['personal', 'appointments', 'soins', 'facturation', 'documents'];
    const handleSwipeLeft = () => {
        const idx = tabsList.indexOf(activeTab);
        if (idx < tabsList.length - 1) setActiveTab(tabsList[idx + 1]);
    };
    const handleSwipeRight = () => {
        const idx = tabsList.indexOf(activeTab);
        if (idx > 0) setActiveTab(tabsList[idx - 1]);
    };
    const swipeHandlers = useSwipeable({
        onSwipedLeft: handleSwipeLeft,
        onSwipedRight: handleSwipeRight
    });

    useEffect(() => {
        fetchPatientData();
    }, [id]);

    const fetchPatientData = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/api/patients/${id}`);
            setPatient(response.data);
            
            // Seed a simulated tooth history for demonstration
            const history = {};
            const completedAppts = response.data.appointments?.filter(a => a.status === 'completed') || [];
            completedAppts.forEach((appt, index) => {
                const teeth = [14, 16, 26, 36, 46];
                const tooth = teeth[index % teeth.length];
                if (!history[tooth]) history[tooth] = [];
                history[tooth].push({
                    date: appt.appointment_date,
                    treatment: appt.treatment?.name || 'Soin dentaire',
                    dentist: appt.dentist?.name || 'Dr. El Alami'
                });
            });
            setToothHistory(history);
        } catch (err) {
            console.error(err);
            setError('Impossible de charger les données du patient.');
        } finally {
            setLoading(false);
        }
    };

    // Calculate age
    const age = useMemo(() => {
        if (!patient?.birth_date) return '—';
        const birth = new Date(patient.birth_date);
        const today = new Date();
        let ageVal = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            ageVal--;
        }
        return `${ageVal} ans`;
    }, [patient?.birth_date]);

    // Financial totals
    const financialSummary = useMemo(() => {
        if (!patient?.invoices) return { totalBilled: 0, totalPaid: 0, balance: 0 };
        let totalBilled = 0;
        let totalPaid = 0;
        patient.invoices.forEach(inv => {
            // Assume price fields or compute total from custom items if empty
            const total = Number(inv.total_ttc || inv.amount || 0);
            totalBilled += total;
            
            const paid = inv.payments ? inv.payments.reduce((sum, p) => sum + Number(p.amount), 0) : 0;
            totalPaid += paid;
        });
        return {
            totalBilled,
            totalPaid,
            balance: totalBilled - totalPaid
        };
    }, [patient?.invoices]);

    // Filter appointments
    const filteredAppointments = useMemo(() => {
        if (!patient?.appointments) return [];
        return patient.appointments.filter(appt => {
            // Status filter
            if (apptStatusFilter !== 'all' && appt.status !== apptStatusFilter) return false;
            
            // Time filter
            if (apptTimeFilter === 'upcoming') {
                return new Date(`${appt.appointment_date}T${appt.start_time}`) >= new Date();
            }
            if (apptTimeFilter === 'past') {
                return new Date(`${appt.appointment_date}T${appt.start_time}`) < new Date();
            }
            return true;
        }).sort((a, b) => new Date(`${b.appointment_date}T${b.start_time}`) - new Date(`${a.appointment_date}T${a.start_time}`));
    }, [patient?.appointments, apptStatusFilter, apptTimeFilter]);

    // Inline edit triggers
    const startEditing = (section) => {
        setEditingSection(section);
        setEditData({ ...patient });
    };

    const cancelEditing = () => {
        setEditingSection(null);
        setEditData({});
    };

    const saveSection = async (section) => {
        try {
            const response = await api.put(`/api/patients/${id}`, editData);
            setPatient(response.data);
            setEditingSection(null);
        } catch (err) {
            alert(err.response?.data?.error || "Une erreur est survenue lors de la mise à jour.");
        }
    };

    // Simulated document upload
    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const newDoc = {
            id: Date.now(),
            name: file.name,
            type: file.type.includes('image') ? 'image' : 'pdf',
            size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
            date: new Date().toISOString().split('T')[0],
            url: file.type.includes('image') ? URL.createObjectURL(file) : '#'
        };

        setDocuments([newDoc, ...documents]);
    };

    // Print patient record
    const handlePrint = () => {
        window.print();
    };

    if (loading) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-medical-500 border-t-transparent" />
                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Chargement du dossier patient...</p>
            </div>
        );
    }

    if (error || !patient) {
        return (
            <div className="bg-rose-50 border border-rose-100 rounded-3xl p-8 text-center max-w-xl mx-auto my-12">
                <ShieldAlert className="h-16 w-16 text-rose-500 mx-auto mb-4" />
                <h3 className="text-xl font-black text-slate-800 uppercase">Erreur de chargement</h3>
                <p className="text-slate-500 font-semibold mt-2">{error || 'Patient introuvable.'}</p>
                <button onClick={() => navigate('/app/patients')} className="mt-6 px-6 py-3 bg-slate-800 text-white rounded-xl font-bold uppercase tracking-wider hover:bg-slate-900 transition text-xs">
                    Retour à la liste
                </button>
            </div>
        );
    }

    // Interactive tooth representation arrays
    // FDI notation (Morocco standard)
    const upperTeethRight = [18, 17, 16, 15, 14, 13, 12, 11];
    const upperTeethLeft = [21, 22, 23, 24, 25, 26, 27, 28];
    const lowerTeethLeft = [31, 32, 33, 34, 35, 36, 37, 38];
    const lowerTeethRight = [48, 47, 46, 45, 44, 43, 42, 41];

    return (
        <div {...swipeHandlers} className="space-y-8 max-w-7xl mx-auto pb-16">
            
            {/* Action Bar (Top Navigation back) */}
            <div className="flex items-center justify-between shrink-0">
                <button 
                    onClick={() => navigate('/app/patients')}
                    className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-400 hover:text-slate-800 transition"
                >
                    <ArrowLeft size={16} />
                    Retour au répertoire
                </button>
                <div className="flex gap-2">
                    <button 
                        onClick={handlePrint}
                        className="p-3 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition shadow-sm hover:shadow"
                        title="Imprimer le dossier"
                    >
                        <Printer size={18} />
                    </button>
                </div>
            </div>

            {/* 1. PREMIUM FILE HEADER */}
            <div className="bg-gradient-to-br from-[#0A1628] to-[#12284C] rounded-[32px] p-6 lg:p-8 text-white shadow-xl shadow-slate-950/20 relative overflow-hidden">
                {/* Visual patterns */}
                <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial-gradient opacity-10 pointer-events-none" />

                <div className="flex flex-col lg:flex-row items-center gap-6 lg:gap-8 relative z-10">
                    {/* Avatar Initials */}
                    <div className="w-24 h-24 lg:w-28 lg:h-28 rounded-3xl bg-gradient-to-tr from-medical-500 to-teal-400 p-1 shadow-lg shadow-medical-500/20 shrink-0">
                        <div className="w-full h-full rounded-[22px] bg-slate-900 flex items-center justify-center font-black text-3xl tracking-tight text-white uppercase select-none">
                            {patient.first_name?.[0]}{patient.last_name?.[0]}
                        </div>
                    </div>

                    {/* Patient Info Column */}
                    <div className="text-center lg:text-left flex-1 min-w-0">
                        <div className="flex flex-col lg:flex-row items-center lg:items-end gap-3 flex-wrap">
                            <h1 className="text-3xl font-black uppercase tracking-tight truncate leading-none">
                                {patient.first_name} {patient.last_name}
                            </h1>
                            <span className="text-sm font-bold text-slate-400 bg-white/10 px-3 py-1 rounded-full uppercase tracking-widest shrink-0">
                                {age}
                            </span>
                        </div>

                        {/* Badges and CIN */}
                        <div className="flex items-center justify-center lg:justify-start gap-3 mt-4 flex-wrap">
                            <div className="flex items-center gap-1.5 bg-slate-800/80 border border-slate-700/50 px-3 py-1 rounded-xl">
                                <IdCard size={14} className="text-slate-400" />
                                <span className="text-xs font-black tracking-wider uppercase">{patient.cin || 'SANS CIN'}</span>
                            </div>

                            {patient.blood_group && (
                                <span className="bg-medical-500/20 border border-medical-500/30 text-medical-300 text-[10px] font-black px-3 py-1 rounded-xl uppercase tracking-widest">
                                    Groupe : {patient.blood_group}
                                </span>
                            )}

                            {patient.allergies && (
                                <span className="bg-rose-500/20 border border-rose-500/30 text-rose-300 text-[10px] font-black px-3 py-1 rounded-xl uppercase tracking-widest flex items-center gap-1 animate-pulse">
                                    <ShieldAlert size={12} />
                                    Allergies connues
                                </span>
                            )}
                        </div>

                        {/* Fast Contacts */}
                        <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 sm:gap-6 mt-5 text-sm text-slate-300">
                            {patient.phone && (
                                <a href={`tel:${patient.phone}`} className="flex items-center gap-2 hover:text-white transition font-bold shrink-0">
                                    <Phone size={15} className="text-medical-400" />
                                    {patient.phone}
                                </a>
                            )}
                            {patient.email && (
                                <a href={`mailto:${patient.email}`} className="flex items-center gap-2 hover:text-white transition font-bold shrink-0 truncate max-w-[250px]">
                                    <Mail size={15} className="text-medical-400" />
                                    {patient.email}
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Action buttons right side */}
                    <div className="flex flex-wrap justify-center lg:justify-end gap-3 w-full lg:w-auto shrink-0 border-t border-white/5 pt-6 lg:border-none lg:pt-0">
                        <Link 
                            to={`/app/appointments?prefilled_patient=${patient.id}`}
                            className="flex items-center gap-2 px-5 py-3 bg-medical-500 hover:bg-medical-600 text-white rounded-xl font-black text-xs uppercase tracking-wider transition shadow-lg shadow-medical-500/10 shrink-0"
                        >
                            <Plus size={14} />
                            Nouveau RDV
                        </Link>
                        <Link 
                            to={`/app/factures?prefilled_patient=${patient.id}`}
                            className="flex items-center gap-2 px-5 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black text-xs uppercase tracking-wider transition shadow-lg shadow-emerald-500/10 shrink-0"
                        >
                            <DollarSign size={14} />
                            Nouvelle Facture
                        </Link>
                    </div>
                </div>
            </div>

            {/* 2. TABBED DETAIL PANELS SECTION */}
            <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8 items-start">
                
                {/* Left side tabs select list */}
                <div className="bg-white rounded-[24px] p-3 shadow-md border border-slate-100 flex lg:flex-col overflow-x-auto gap-1 lg:gap-1.5 shrink-0 select-none">
                    <button 
                        onClick={() => setActiveTab('personal')}
                        className={`flex items-center gap-3 px-5 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition shrink-0 ${activeTab === 'personal' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
                    >
                        <User size={15} />
                        Infos Personnelles
                    </button>
                    <button 
                        onClick={() => setActiveTab('appointments')}
                        className={`flex items-center gap-3 px-5 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition shrink-0 ${activeTab === 'appointments' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
                    >
                        <Calendar size={15} />
                        Rendez-vous ({patient.appointments?.length || 0})
                    </button>
                    <button 
                        onClick={() => setActiveTab('soins')}
                        className={`flex items-center gap-3 px-5 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition shrink-0 ${activeTab === 'soins' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
                    >
                        <Activity size={15} />
                        Soins & Traitements
                    </button>
                    <button 
                        onClick={() => setActiveTab('facturation')}
                        className={`flex items-center gap-3 px-5 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition shrink-0 ${activeTab === 'facturation' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
                    >
                        <DollarSign size={15} />
                        Facturation ({patient.invoices?.length || 0})
                    </button>
                    <button 
                        onClick={() => setActiveTab('documents')}
                        className={`flex items-center gap-3 px-5 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition shrink-0 ${activeTab === 'documents' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
                    >
                        <FileText size={15} />
                        Documents ({documents.length})
                    </button>
                </div>

                {/* Right side display container */}
                <div className="bg-white rounded-[32px] p-6 lg:p-8 shadow-xl shadow-slate-100/50 border border-slate-100 min-w-0">
                    <AnimatePresence mode="wait">
                        
                        {/* TAB 1: PERSONAL INFO */}
                        {activeTab === 'personal' && (
                            <motion.div 
                                key="personal"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="space-y-8"
                            >
                                {/* Section A: Civil Status */}
                                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100/80 relative">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-sm font-black uppercase tracking-widest text-slate-800 flex items-center gap-2">
                                            <User size={16} className="text-slate-400" />
                                            Données Civiles
                                        </h3>
                                        {editingSection === 'civil' ? (
                                            <div className="flex gap-2">
                                                <button onClick={() => saveSection('civil')} className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition">
                                                    <Check size={16} />
                                                </button>
                                                <button onClick={cancelEditing} className="p-2 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 transition">
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        ) : (
                                            <button onClick={() => startEditing('civil')} className="p-2 hover:bg-white text-slate-400 hover:text-slate-700 rounded-lg transition shadow-sm">
                                                <Edit2 size={14} />
                                            </button>
                                        )}
                                    </div>

                                    {editingSection === 'civil' ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                            <div>
                                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Nom *</label>
                                                <input 
                                                    type="text" 
                                                    value={editData.last_name || ''} 
                                                    onChange={e => setEditData({ ...editData, last_name: e.target.value })}
                                                    className="w-full rounded-xl border-slate-200 text-xs font-bold py-2.5"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Prénom *</label>
                                                <input 
                                                    type="text" 
                                                    value={editData.first_name || ''} 
                                                    onChange={e => setEditData({ ...editData, first_name: e.target.value })}
                                                    className="w-full rounded-xl border-slate-200 text-xs font-bold py-2.5"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Genre</label>
                                                <select 
                                                    value={editData.gender || ''} 
                                                    onChange={e => setEditData({ ...editData, gender: e.target.value })}
                                                    className="w-full rounded-xl border-slate-200 text-xs font-bold py-2.5"
                                                >
                                                    <option value="">Non spécifié</option>
                                                    <option value="H">Homme</option>
                                                    <option value="F">Femme</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Date de Naissance</label>
                                                <input 
                                                    type="date" 
                                                    value={editData.birth_date ? editData.birth_date.substring(0, 10) : ''} 
                                                    onChange={e => setEditData({ ...editData, birth_date: e.target.value })}
                                                    className="w-full rounded-xl border-slate-200 text-xs font-bold py-2.5"
                                                />
                                            </div>
                                            <div className="col-span-1 md:col-span-2">
                                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Adresse</label>
                                                <textarea 
                                                    value={editData.address || ''} 
                                                    onChange={e => setEditData({ ...editData, address: e.target.value })}
                                                    rows={2}
                                                    className="w-full rounded-xl border-slate-200 text-xs font-medium py-2 px-3"
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date de Naissance</p>
                                                <p className="text-slate-700 font-bold mt-1">
                                                    {patient.birth_date ? new Date(patient.birth_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Genre</p>
                                                <p className="text-slate-700 font-bold mt-1">
                                                    {patient.gender === 'H' ? 'Homme' : patient.gender === 'F' ? 'Femme' : 'Non renseigné'}
                                                </p>
                                            </div>
                                            <div className="col-span-1 sm:col-span-2">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Adresse Civile</p>
                                                <p className="text-slate-700 font-semibold mt-1">
                                                    {patient.address || 'Aucune adresse renseignée.'}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Section B: Medical History */}
                                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100/80">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-sm font-black uppercase tracking-widest text-slate-800 flex items-center gap-2">
                                            <Heart size={16} className="text-slate-400" />
                                            Données Médicales
                                        </h3>
                                        {editingSection === 'medical' ? (
                                            <div className="flex gap-2">
                                                <button onClick={() => saveSection('medical')} className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition">
                                                    <Check size={16} />
                                                </button>
                                                <button onClick={cancelEditing} className="p-2 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 transition">
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        ) : (
                                            <button onClick={() => startEditing('medical')} className="p-2 hover:bg-white text-slate-400 hover:text-slate-700 rounded-lg transition shadow-sm">
                                                <Edit2 size={14} />
                                            </button>
                                        )}
                                    </div>

                                    {editingSection === 'medical' ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                            <div>
                                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Groupe Sanguin</label>
                                                <input 
                                                    type="text" 
                                                    placeholder="A+, O-, B+, AB+..."
                                                    value={editData.blood_group || ''} 
                                                    onChange={e => setEditData({ ...editData, blood_group: e.target.value })}
                                                    className="w-full rounded-xl border-slate-200 text-xs font-bold py-2.5"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Allergies connues</label>
                                                <input 
                                                    type="text" 
                                                    placeholder="Pénicilline, Latex, pollen..."
                                                    value={editData.allergies || ''} 
                                                    onChange={e => setEditData({ ...editData, allergies: e.target.value })}
                                                    className="w-full rounded-xl border-slate-200 text-xs font-bold py-2.5"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Maladies chroniques</label>
                                                <input 
                                                    type="text" 
                                                    placeholder="Diabète, Hypertension, Asthme..."
                                                    value={editData.chronic_diseases || ''} 
                                                    onChange={e => setEditData({ ...editData, chronic_diseases: e.target.value })}
                                                    className="w-full rounded-xl border-slate-200 text-xs font-bold py-2.5"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Médicaments en cours</label>
                                                <input 
                                                    type="text" 
                                                    placeholder="Anticoagulants, Insuline..."
                                                    value={editData.current_medications || ''} 
                                                    onChange={e => setEditData({ ...editData, current_medications: e.target.value })}
                                                    className="w-full rounded-xl border-slate-200 text-xs font-bold py-2.5"
                                                />
                                            </div>
                                            <div className="col-span-1 md:col-span-2">
                                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Antécédents médicaux</label>
                                                <textarea 
                                                    value={editData.medical_history || ''} 
                                                    onChange={e => setEditData({ ...editData, medical_history: e.target.value })}
                                                    rows={2}
                                                    className="w-full rounded-xl border-slate-200 text-xs font-medium py-2 px-3"
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Allergies</p>
                                                <p className={`font-bold mt-1 ${patient.allergies ? 'text-rose-500' : 'text-slate-700'}`}>
                                                    {patient.allergies || 'Aucune allergie signalée.'}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Maladies Chroniques</p>
                                                <p className="text-slate-700 font-bold mt-1">
                                                    {patient.chronic_diseases || 'Aucune maladie chronique déclarée.'}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Médicaments</p>
                                                <p className="text-slate-700 font-bold mt-1">
                                                    {patient.current_medications || 'Aucun traitement régulier.'}
                                                </p>
                                            </div>
                                            <div className="col-span-1 sm:col-span-2 md:col-span-3">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Antécédents cliniques</p>
                                                <p className="text-slate-700 font-semibold mt-1">
                                                    {patient.medical_history || 'Aucun antécédent médical ou chirurgical majeur.'}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Section C: Emergency Contact */}
                                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100/80">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-sm font-black uppercase tracking-widest text-slate-800 flex items-center gap-2">
                                            <ShieldAlert size={16} className="text-slate-400" />
                                            Contact d'Urgence
                                        </h3>
                                        {editingSection === 'emergency' ? (
                                            <div className="flex gap-2">
                                                <button onClick={() => saveSection('emergency')} className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition">
                                                    <Check size={16} />
                                                </button>
                                                <button onClick={cancelEditing} className="p-2 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 transition">
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        ) : (
                                            <button onClick={() => startEditing('emergency')} className="p-2 hover:bg-white text-slate-400 hover:text-slate-700 rounded-lg transition shadow-sm">
                                                <Edit2 size={14} />
                                            </button>
                                        )}
                                    </div>

                                    {editingSection === 'emergency' ? (
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                                            <div>
                                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Nom du contact</label>
                                                <input 
                                                    type="text" 
                                                    value={editData.emergency_contact_name || ''} 
                                                    onChange={e => setEditData({ ...editData, emergency_contact_name: e.target.value })}
                                                    className="w-full rounded-xl border-slate-200 text-xs font-bold py-2.5"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Lien de parenté</label>
                                                <input 
                                                    type="text" 
                                                    placeholder="Conjoint, parent, ami..."
                                                    value={editData.emergency_contact_relation || ''} 
                                                    onChange={e => setEditData({ ...editData, emergency_contact_relation: e.target.value })}
                                                    className="w-full rounded-xl border-slate-200 text-xs font-bold py-2.5"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Téléphone d'urgence</label>
                                                <input 
                                                    type="text" 
                                                    value={editData.emergency_contact_phone || ''} 
                                                    onChange={e => setEditData({ ...editData, emergency_contact_phone: e.target.value })}
                                                    className="w-full rounded-xl border-slate-200 text-xs font-bold py-2.5"
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nom Complet</p>
                                                <p className="text-slate-700 font-bold mt-1">
                                                    {patient.emergency_contact_name || 'Non renseigné'}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Lien de parenté</p>
                                                <p className="text-slate-700 font-bold mt-1">
                                                    {patient.emergency_contact_relation || '—'}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Numéro d'urgence</p>
                                                {patient.emergency_contact_phone ? (
                                                    <a href={`tel:${patient.emergency_contact_phone}`} className="text-medical-600 hover:text-medical-700 font-bold mt-1 block w-fit">
                                                        {patient.emergency_contact_phone}
                                                    </a>
                                                ) : (
                                                    <p className="text-slate-700 font-bold mt-1">—</p>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}

                        {/* TAB 2: APPOINTMENTS */}
                        {activeTab === 'appointments' && (
                            <motion.div 
                                key="appointments"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="space-y-6"
                            >
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-5">
                                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-800">
                                        Historique des Rendez-vous
                                    </h3>
                                    
                                    {/* Filters */}
                                    <div className="flex flex-wrap gap-2.5">
                                        <select 
                                            value={apptStatusFilter} 
                                            onChange={e => setApptStatusFilter(e.target.value)}
                                            className="rounded-xl border-slate-200 text-xs font-bold py-1.5 px-3"
                                        >
                                            <option value="all">Tous les statuts</option>
                                            {Object.entries(statusLabels).map(([k, v]) => (
                                                <option key={k} value={k}>{v}</option>
                                            ))}
                                        </select>
                                        <select 
                                            value={apptTimeFilter} 
                                            onChange={e => setApptTimeFilter(e.target.value)}
                                            className="rounded-xl border-slate-200 text-xs font-bold py-1.5 px-3"
                                        >
                                            <option value="all">Toutes périodes</option>
                                            <option value="upcoming">À venir</option>
                                            <option value="past">Passés</option>
                                        </select>
                                    </div>
                                </div>

                                {filteredAppointments.length === 0 ? (
                                    <div className="py-16 text-center text-slate-400 font-bold italic">
                                        Aucun rendez-vous ne correspond à ces critères.
                                    </div>
                                ) : (
                                    /* Timeline */
                                    <div className="relative pl-6 sm:pl-8 border-l-2 border-slate-150 space-y-8 mt-4">
                                        {filteredAppointments.map(appt => {
                                            const apptDate = new Date(appt.appointment_date);
                                            const isPast = new Date(`${appt.appointment_date}T${appt.start_time}`) < new Date();
                                            const statusColor = statusColors[appt.status] || '#94a3b8';
                                            
                                            return (
                                                <div key={appt.id} className="relative group">
                                                    {/* Timeline node dot */}
                                                    <span 
                                                        className="absolute -left-[31px] sm:-left-[39px] top-1.5 w-4 h-4 rounded-full border-4 border-white shadow transition-all duration-300 group-hover:scale-125 z-10" 
                                                        style={{ backgroundColor: statusColor }}
                                                    />

                                                    {/* Card Body */}
                                                    <div className="p-5 bg-slate-50 border border-slate-100 hover:border-slate-200 rounded-2xl hover:bg-white hover:shadow-lg hover:shadow-slate-100/50 transition-all duration-300">
                                                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                                                            <div>
                                                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
                                                                    {apptDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                                                                </p>
                                                                <h4 className="text-base font-black text-slate-800 mt-1 uppercase tracking-tight">
                                                                    {appt.treatment?.name || 'Traitement dentaire standard'}
                                                                </h4>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full text-white" style={{ backgroundColor: statusColor }}>
                                                                    {statusLabels[appt.status]}
                                                                </span>
                                                                <span className="text-[10px] font-black uppercase tracking-widest bg-slate-200/80 text-slate-600 px-3 py-1 rounded-full">
                                                                    {appt.start_time.substring(0, 5)} ({appt.treatment?.duration || 30} min)
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {/* Details */}
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-100 text-xs font-semibold text-slate-500">
                                                            <div className="flex items-center gap-2">
                                                                <User size={14} className="text-slate-400" />
                                                                <span>Praticien : <strong className="text-slate-700 font-bold">Dr. {appt.dentist?.name || 'Cabinet'}</strong></span>
                                                            </div>
                                                            {appt.reason && (
                                                                <div className="col-span-1 sm:col-span-2 bg-white/60 p-3 rounded-xl border border-slate-100 text-slate-600">
                                                                    <strong className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Notes du praticien</strong>
                                                                    {appt.reason}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {/* TAB 3: SOINS & TRAITEMENTS */}
                        {activeTab === 'soins' && (
                            <motion.div 
                                key="soins"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="space-y-8"
                            >
                                {/* Dental Schema */}
                                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                                    <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-1.5">
                                        <Activity size={15} />
                                        Schéma Dentaire Interactif (FDI)
                                    </h4>

                                    {/* UPPER ARCH */}
                                    <div className="space-y-4">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Arcade Supérieure</p>
                                        <div className="flex justify-center items-center gap-1 sm:gap-2 flex-wrap">
                                            {/* Right Upper Arch */}
                                            {upperTeethRight.map(tooth => {
                                                const hasHistory = Boolean(toothHistory[tooth]);
                                                const isSelected = selectedTooth === tooth;
                                                return (
                                                    <button 
                                                        key={tooth}
                                                        onClick={() => setSelectedTooth(isSelected ? null : tooth)}
                                                        className={`w-9 h-11 sm:w-11 sm:h-14 rounded-xl flex flex-col justify-between p-1.5 border text-[10px] font-black transition-all ${isSelected ? 'bg-medical-600 border-medical-600 text-white scale-110 shadow-lg shadow-medical-100' : hasHistory ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                                                    >
                                                        <span>{tooth}</span>
                                                        <div className={`w-2 h-2 rounded-full mx-auto ${hasHistory ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                                                    </button>
                                                );
                                            })}
                                            <div className="w-px h-14 bg-slate-300 mx-2" />
                                            {/* Left Upper Arch */}
                                            {upperTeethLeft.map(tooth => {
                                                const hasHistory = Boolean(toothHistory[tooth]);
                                                const isSelected = selectedTooth === tooth;
                                                return (
                                                    <button 
                                                        key={tooth}
                                                        onClick={() => setSelectedTooth(isSelected ? null : tooth)}
                                                        className={`w-9 h-11 sm:w-11 sm:h-14 rounded-xl flex flex-col justify-between p-1.5 border text-[10px] font-black transition-all ${isSelected ? 'bg-medical-600 border-medical-600 text-white scale-110 shadow-lg shadow-medical-100' : hasHistory ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                                                    >
                                                        <span>{tooth}</span>
                                                        <div className={`w-2 h-2 rounded-full mx-auto ${hasHistory ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* LOWER ARCH */}
                                    <div className="space-y-4 mt-8 pt-8 border-t border-slate-200/60">
                                        <div className="flex justify-center items-center gap-1 sm:gap-2 flex-wrap">
                                            {/* Right Lower Arch */}
                                            {lowerTeethRight.map(tooth => {
                                                const hasHistory = Boolean(toothHistory[tooth]);
                                                const isSelected = selectedTooth === tooth;
                                                return (
                                                    <button 
                                                        key={tooth}
                                                        onClick={() => setSelectedTooth(isSelected ? null : tooth)}
                                                        className={`w-9 h-11 sm:w-11 sm:h-14 rounded-xl flex flex-col justify-between p-1.5 border text-[10px] font-black transition-all ${isSelected ? 'bg-medical-600 border-medical-600 text-white scale-110 shadow-lg shadow-medical-100' : hasHistory ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                                                    >
                                                        <div className={`w-2 h-2 rounded-full mx-auto ${hasHistory ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                                                        <span>{tooth}</span>
                                                    </button>
                                                );
                                            })}
                                            <div className="w-px h-14 bg-slate-300 mx-2" />
                                            {/* Left Lower Arch */}
                                            {lowerTeethLeft.map(tooth => {
                                                const hasHistory = Boolean(toothHistory[tooth]);
                                                const isSelected = selectedTooth === tooth;
                                                return (
                                                    <button 
                                                        key={tooth}
                                                        onClick={() => setSelectedTooth(isSelected ? null : tooth)}
                                                        className={`w-9 h-11 sm:w-11 sm:h-14 rounded-xl flex flex-col justify-between p-1.5 border text-[10px] font-black transition-all ${isSelected ? 'bg-medical-600 border-medical-600 text-white scale-110 shadow-lg shadow-medical-100' : hasHistory ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                                                    >
                                                        <div className={`w-2 h-2 rounded-full mx-auto ${hasHistory ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                                                        <span>{tooth}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Arcade Inférieure</p>
                                    </div>

                                    {/* Click details feedback */}
                                    <AnimatePresence>
                                        {selectedTooth && (
                                            <motion.div 
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 10 }}
                                                className="mt-6 p-5 bg-white rounded-2xl border border-slate-150 shadow-sm"
                                            >
                                                <h5 className="text-xs font-black uppercase tracking-widest text-slate-800 mb-3">
                                                    Historique de la Dent n°{selectedTooth}
                                                </h5>
                                                {!toothHistory[selectedTooth] ? (
                                                    <p className="text-xs text-slate-400 font-bold italic">Aucun traitement répertorié sur cette dent.</p>
                                                ) : (
                                                    <div className="space-y-3">
                                                        {toothHistory[selectedTooth].map((record, index) => (
                                                            <div key={index} className="flex justify-between items-center text-xs border-b border-slate-50 pb-2">
                                                                <div>
                                                                    <span className="font-black text-slate-700 block uppercase tracking-tight">{record.treatment}</span>
                                                                    <span className="text-[10px] text-slate-400 font-bold">Praticien : {record.dentist}</span>
                                                                </div>
                                                                <span className="font-black text-slate-500 tracking-tighter">{new Date(record.date).toLocaleDateString('fr-FR')}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* Completed treatments table */}
                                <div className="space-y-4">
                                    <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest">
                                        Soins Terminés Récemment
                                    </h4>

                                    <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left">
                                                <thead>
                                                    <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                        <th className="px-6 py-4">Date</th>
                                                        <th className="px-6 py-4">Soin</th>
                                                        <th className="px-6 py-4">Praticien</th>
                                                        <th className="px-6 py-4">Prix TTC</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-50 text-xs font-semibold text-slate-600">
                                                    {(patient.appointments?.filter(a => a.status === 'completed') || []).length === 0 ? (
                                                        <tr>
                                                            <td colSpan="4" className="px-6 py-12 text-center text-slate-400 italic">
                                                                Aucun soin n'est actuellement marqué comme terminé.
                                                            </td>
                                                        </tr>
                                                    ) : (
                                                        patient.appointments.filter(a => a.status === 'completed').map(appt => (
                                                            <tr key={appt.id} className="hover:bg-slate-50/50 transition">
                                                                <td className="px-6 py-4 font-black text-slate-700">
                                                                    {new Date(appt.appointment_date).toLocaleDateString('fr-FR')}
                                                                </td>
                                                                <td className="px-6 py-4 font-black uppercase text-slate-800">
                                                                    {appt.treatment?.name || 'Traitement dentaire'}
                                                                </td>
                                                                <td className="px-6 py-4">
                                                                    Dr. {appt.dentist?.name || 'El Alami'}
                                                                </td>
                                                                <td className="px-6 py-4 font-black text-slate-800">
                                                                    {appt.treatment?.price || '—'} MAD
                                                                </td>
                                                            </tr>
                                                        ))
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* TAB 4: BILLING & FINANCIALS */}
                        {activeTab === 'facturation' && (
                            <motion.div 
                                key="facturation"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="space-y-8"
                            >
                                {/* Financial Summary Cards */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                                    <div className="p-5 bg-blue-50/50 border border-blue-100 rounded-2xl">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-blue-500 block mb-1">
                                            Total Facturé
                                        </span>
                                        <span className="text-2xl font-black text-slate-800 tracking-tight">
                                            {financialSummary.totalBilled.toLocaleString('fr-FR')} MAD
                                        </span>
                                    </div>
                                    <div className="p-5 bg-emerald-50/50 border border-emerald-100 rounded-2xl">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500 block mb-1">
                                            Total Encaissé
                                        </span>
                                        <span className="text-2xl font-black text-slate-800 tracking-tight">
                                            {financialSummary.totalPaid.toLocaleString('fr-FR')} MAD
                                        </span>
                                    </div>
                                    <div className="p-5 bg-rose-50/50 border border-rose-100 rounded-2xl">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-rose-500 block mb-1">
                                            Solde Dû
                                        </span>
                                        <span className="text-2xl font-black text-slate-800 tracking-tight">
                                            {financialSummary.balance.toLocaleString('fr-FR')} MAD
                                        </span>
                                    </div>
                                </div>

                                {/* Invoices list */}
                                <div className="space-y-4">
                                    <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest">
                                        Factures Patient
                                    </h4>

                                    <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left">
                                                <thead>
                                                    <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                        <th className="px-6 py-4">Date</th>
                                                        <th className="px-6 py-4">N° Facture</th>
                                                        <th className="px-6 py-4">Total TTC</th>
                                                        <th className="px-6 py-4">Statut</th>
                                                        <th className="px-6 py-4 text-right">Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-50 text-xs font-semibold text-slate-600">
                                                    {!patient.invoices || patient.invoices.length === 0 ? (
                                                        <tr>
                                                            <td colSpan="5" className="px-6 py-12 text-center text-slate-400 italic">
                                                                Aucune facture émise pour ce patient.
                                                            </td>
                                                        </tr>
                                                    ) : (
                                                        patient.invoices.map(inv => {
                                                            const total = Number(inv.total_ttc || inv.amount || 0);
                                                            const paid = inv.payments ? inv.payments.reduce((sum, p) => sum + Number(p.amount), 0) : 0;
                                                            const status = paid >= total ? 'paid' : paid > 0 ? 'partial' : 'unpaid';
                                                            
                                                            return (
                                                                <tr key={inv.id} className="hover:bg-slate-50/50 transition">
                                                                    <td className="px-6 py-4 font-black text-slate-700">
                                                                        {new Date(inv.created_at || inv.invoice_date).toLocaleDateString('fr-FR')}
                                                                    </td>
                                                                    <td className="px-6 py-4 font-black text-slate-800">
                                                                        {inv.invoice_number || `FACT-${inv.id}`}
                                                                    </td>
                                                                    <td className="px-6 py-4 font-black text-slate-900">
                                                                        {total.toLocaleString('fr-FR')} MAD
                                                                    </td>
                                                                    <td className="px-6 py-4">
                                                                        {status === 'paid' ? (
                                                                            <span className="bg-emerald-50 text-emerald-700 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full">Payée</span>
                                                                        ) : status === 'partial' ? (
                                                                            <span className="bg-blue-50 text-blue-700 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full">Partiel</span>
                                                                        ) : (
                                                                            <span className="bg-rose-50 text-rose-700 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full">Impayée</span>
                                                                        )}
                                                                    </td>
                                                                    <td className="px-6 py-4 text-right">
                                                                        <Link 
                                                                            to={`/app/factures?invoice_id=${inv.id}`}
                                                                            className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-medical-600 hover:text-medical-700 transition"
                                                                        >
                                                                            <Eye size={12} />
                                                                            Consulter
                                                                        </Link>
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* TAB 5: DOCUMENTS & UPLOADS */}
                        {activeTab === 'documents' && (
                            <motion.div 
                                key="documents"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="space-y-6"
                            >
                                <div className="flex justify-between items-center border-b border-slate-100 pb-5">
                                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-800">
                                        Documents & Imagerie
                                    </h3>
                                    
                                    {/* Upload Button */}
                                    <label className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 text-white hover:bg-slate-900 rounded-xl font-black text-xs uppercase tracking-wider transition cursor-pointer shadow-sm">
                                        <Upload size={14} />
                                        Ajouter
                                        <input 
                                            type="file" 
                                            accept="image/*,application/pdf"
                                            onChange={handleFileUpload}
                                            className="hidden" 
                                        />
                                    </label>
                                </div>

                                {/* List Grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                                    {documents.map(doc => (
                                        <div 
                                            key={doc.id}
                                            className="p-5 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-white hover:shadow-lg hover:shadow-slate-150/40 transition duration-300 flex flex-col justify-between"
                                        >
                                            <div>
                                                <div className="w-10 h-10 bg-slate-200/60 rounded-xl flex items-center justify-center text-slate-600 mb-4">
                                                    <FileText size={20} />
                                                </div>
                                                <h4 className="text-xs font-black text-slate-800 uppercase tracking-tight truncate mb-1" title={doc.name}>
                                                    {doc.name}
                                                </h4>
                                                <p className="text-[10px] text-slate-400 font-bold">
                                                    {doc.size} • {new Date(doc.date).toLocaleDateString('fr-FR')}
                                                </p>
                                            </div>

                                            <div className="flex justify-end gap-2 mt-5 border-t border-slate-100/60 pt-4">
                                                {doc.type === 'image' && (
                                                    <button 
                                                        onClick={() => setLightboxImage(doc.url)}
                                                        className="p-2 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded-lg transition"
                                                        title="Voir"
                                                    >
                                                        <Eye size={14} />
                                                    </button>
                                                )}
                                                <a 
                                                    href={doc.url} 
                                                    download={doc.name}
                                                    className="p-2 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded-lg transition"
                                                    title="Télécharger"
                                                >
                                                    <Download size={14} />
                                                </a>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Image Lightbox Overlay */}
                                <AnimatePresence>
                                    {lightboxImage && (
                                        <motion.div 
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            onClick={() => setLightboxImage(null)}
                                            className="fixed inset-0 z-50 bg-slate-950/90 flex items-center justify-center p-4 backdrop-blur-sm"
                                        >
                                            <button 
                                                onClick={() => setLightboxImage(null)}
                                                className="absolute top-6 right-6 text-white/70 hover:text-white p-2 hover:bg-white/10 rounded-full transition"
                                            >
                                                <X size={24} />
                                            </button>
                                            <motion.img 
                                                initial={{ scale: 0.95 }}
                                                animate={{ scale: 1 }}
                                                exit={{ scale: 0.95 }}
                                                src={lightboxImage} 
                                                alt="Radiographie Lightbox" 
                                                className="max-w-full max-h-[85vh] rounded-2xl shadow-2xl border border-white/15"
                                            />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        )}

                    </AnimatePresence>
                </div>

            </div>

        </div>
    );
};

export default PatientDetail;
