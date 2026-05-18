import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Stethoscope, 
    CreditCard, 
    FileText, 
    Settings, 
    Plus, 
    Search,
    TrendingUp,
    ShieldAlert,
    Check,
    Lock,
    Clock,
    X,
    Loader2,
    AlertCircle
} from 'lucide-react';
import api from '../api.js';

export default function PlaceholderAdminView({ section }) {
    // Treatments State
    const [treatments, setTreatments] = useState([]);
    const [loadingTreatments, setLoadingTreatments] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // New Treatment Form
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [description, setDescription] = useState('');
    const [saving, setSaving] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);

    // Prescriptions State
    const [prescriptions, setPrescriptions] = useState([
        { ref: 'ORD-554', patient: 'Samir Alami', drugs: 'Amoxicilline 1g (2x/j) · Paracétamol 1g (3x/j)', date: '17/05/2026', doctor: 'Dr. Chérif' },
        { ref: 'ORD-553', patient: 'Youssef Taghi', drugs: 'Bain de bouche antiseptique (3x/j) · Ibuprofène 400mg', date: '15/05/2026', doctor: 'Dr. Alaoui' },
        { ref: 'ORD-552', patient: 'Nadia Mansouri', drugs: 'Spiramycine/Métronidazole (2x/j) · Antalgique', date: '14/05/2026', doctor: 'Dr. Chérif' },
        { ref: 'ORD-551', patient: 'Sara El Fassi', drugs: 'Gel gingival apaisant · Paracétamol 500mg', date: '10/05/2026', doctor: 'Dr. Alaoui' },
    ]);
    const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false);
    const [prescriptionPatient, setPrescriptionPatient] = useState('');
    const [prescriptionDrugs, setPrescriptionDrugs] = useState('');
    const [prescriptionDoctor, setPrescriptionDoctor] = useState('Dr. Chérif');
    const [prescriptionDate, setPrescriptionDate] = useState(new Date().toISOString().substring(0, 10));
    const [savingPrescription, setSavingPrescription] = useState(false);
    const [prescriptionSuccess, setPrescriptionSuccess] = useState(false);
    const [prescriptionError, setPrescriptionError] = useState('');

    // Fetch patients list
    const [patients, setPatients] = useState([]);

    useEffect(() => {
        const fetchPatients = async () => {
            try {
                const res = await api.get('/api/patients?all=1');
                const list = Array.isArray(res.data) ? res.data : (res.data?.data || []);
                setPatients(list);
            } catch (err) {
                console.error("Error fetching patients in PlaceholderAdminView", err);
            }
        };
        fetchPatients();
    }, []);

    const handleAddPrescriptionSubmit = (e) => {
        e.preventDefault();
        setPrescriptionError('');
        setSavingPrescription(true);

        if (!prescriptionPatient.trim()) {
            setPrescriptionError('Veuillez renseigner le nom du patient.');
            setSavingPrescription(false);
            return;
        }

        if (!prescriptionDrugs.trim()) {
            setPrescriptionError('Veuillez saisir les médicaments et posologies.');
            setSavingPrescription(false);
            return;
        }

        // Simulate creation with a delay for visual excellence
        setTimeout(() => {
            const nextRef = `ORD-${550 + prescriptions.length + 5}`;
            const newOrd = {
                ref: nextRef,
                patient: prescriptionPatient,
                drugs: prescriptionDrugs,
                date: new Date(prescriptionDate).toLocaleDateString('fr-FR'),
                doctor: prescriptionDoctor
            };

            setPrescriptions([newOrd, ...prescriptions]);
            setPrescriptionSuccess(true);
            setSavingPrescription(false);

            setTimeout(() => {
                setIsPrescriptionModalOpen(false);
                setPrescriptionSuccess(false);
                setPrescriptionPatient('');
                setPrescriptionDrugs('');
                setPrescriptionDoctor('Dr. Chérif');
            }, 1200);
        }, 800);
    };

    // Default premium catalog to show alongside DB items
    const staticCatalog = [
        { id: 'det', code: 'DET-01', name: 'Détartrage & Polissage complet', duration: '30 min', price: '400', status: 'Actif', description: 'Nettoyage professionnel des dents et des gencives.' },
        { id: 'con', code: 'CON-02', name: 'Consultation bucco-dentaire générale', duration: '20 min', price: '250', status: 'Actif', description: 'Bilan complet et examen radiographique si nécessaire.' },
        { id: 'ext', code: 'EXT-03', name: 'Extraction simple de dent', duration: '45 min', price: '500', status: 'Actif', description: 'Avulsion dentaire sous anesthésie locale.' },
        { id: 'plo', code: 'PLO-04', name: 'Restaurations esthétiques composite (Plombage)', duration: '40 min', price: '450', status: 'Actif', description: 'Obturation esthétique après traitement de carie.' },
        { id: 'bla', code: 'BLA-05', name: 'Blanchiment dentaire professionnel au laser', duration: '60 min', price: '2000', status: 'Actif', description: 'Éclaircissement des dents en une séance au fauteuil.' },
        { id: 'imp', code: 'IMP-06', name: 'Pose d\'implant titane haut de gamme', duration: '90 min', price: '7000', status: 'Sous Devis', description: 'Remplacement d\'une racine manquante par un implant en titane.' },
    ];

    const loadTreatments = async () => {
        setLoadingTreatments(true);
        try {
            const res = await api.get('/api/cabinet/treatments');
            setTreatments(res.data || []);
        } catch (err) {
            console.error("Error loading treatments", err);
        } finally {
            setLoadingTreatments(false);
        }
    };

    useEffect(() => {
        if (section === 'soins') {
            loadTreatments();
        }
    }, [section]);

    const getEstimatedDuration = (name) => {
        const n = name.toLowerCase();
        if (n.includes('détartrage') || n.includes('detartrage')) return '30 min';
        if (n.includes('consultation')) return '30 min';
        if (n.includes('extraction')) return '60 min';
        if (n.includes('plombage')) return '45 min';
        if (n.includes('blanchiment')) return '60 min';
        if (n.includes('implant')) return '90 min';
        return '30 min';
    };

    // Combine static catalog and database treatments, avoiding duplicates by name
    const combinedTreatments = (() => {
        const list = [...treatments.map((t, idx) => ({
            id: t.id,
            code: `ACT-${100 + idx}`,
            name: t.name,
            duration: getEstimatedDuration(t.name),
            price: String(t.price),
            status: 'Actif',
            description: t.description || 'Soin personnalisé du cabinet DentistPro.'
        }))];

        // Add static ones that don't have matching names in database list
        staticCatalog.forEach(cat => {
            const exists = list.some(item => item.name.toLowerCase() === cat.name.toLowerCase());
            if (!exists) {
                list.push(cat);
            }
        });

        return list;
    })();

    const handleAddTreatmentSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');
        
        if (!name.trim()) {
            setErrorMessage('Le nom de l\'acte est requis.');
            return;
        }
        if (!price || parseFloat(price) <= 0) {
            setErrorMessage('Veuillez saisir un tarif valide supérieur à 0.');
            return;
        }

        setSaving(true);
        try {
            await api.post('/api/cabinet/treatments', {
                name: name.trim(),
                description: description.trim(),
                price: parseFloat(price)
            });

            setShowSuccess(true);
            setName('');
            setPrice('');
            setDescription('');
            
            setTimeout(() => {
                setIsModalOpen(false);
                setShowSuccess(false);
                loadTreatments();
            }, 1500);
        } catch (err) {
            const msg = err.response?.data?.message || err.response?.data?.error || "Une erreur est survenue lors de la création.";
            setErrorMessage(msg);
        } finally {
            setSaving(false);
        }
    };

    const renderTreatments = () => (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">Soins & Traitements</h1>
                    <p className="text-slate-500 font-bold mt-1 text-sm">Gérez le catalogue des actes médicaux et tarifs de DentistPro.</p>
                </div>
                <button 
                    onClick={() => {
                        setErrorMessage('');
                        setShowSuccess(false);
                        setIsModalOpen(true);
                    }}
                    className="flex items-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-bold text-xs uppercase tracking-wider shadow-md active:scale-95"
                >
                    <Plus size={16} /> Ajouter un soin
                </button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black uppercase tracking-wider text-slate-400">
                            <th className="p-4 pl-6">Code Acte</th>
                            <th className="p-4">Désignation du Soin</th>
                            <th className="p-4">Durée Estimée</th>
                            <th className="p-4">Tarif Indicatif</th>
                            <th className="p-4 text-right pr-6">Statut</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 text-xs font-bold text-slate-700">
                        {loadingTreatments ? (
                            <tr>
                                <td colSpan="5" className="p-8 text-center">
                                    <div className="flex justify-center items-center gap-2 text-slate-400">
                                        <Loader2 className="animate-spin" size={16} />
                                        <span>Chargement du catalogue...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            combinedTreatments.map((t) => (
                                <tr key={t.code} className="hover:bg-slate-50/50 transition">
                                    <td className="p-4 pl-6 text-blue-600">{t.code}</td>
                                    <td className="p-4 text-slate-800">
                                        <div>{t.name}</div>
                                        {t.description && <div className="text-[10px] text-slate-400 font-medium mt-0.5">{t.description}</div>}
                                    </td>
                                    <td className="p-4">
                                        <span className="inline-flex items-center gap-1 text-slate-500 font-medium">
                                            <Clock size={13} /> {t.duration}
                                        </span>
                                    </td>
                                    <td className="p-4 text-emerald-600 font-black">{parseFloat(t.price).toLocaleString('fr-FR')} MAD</td>
                                    <td className="p-4 text-right pr-6">
                                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-50 text-emerald-700">
                                            {t.status}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderBilling = () => (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">Facturation & Règlements</h1>
                    <p className="text-slate-500 font-bold mt-1 text-sm">Consultez l'historique comptable et gérez les encaissements.</p>
                </div>
                <div className="flex items-center gap-2">
                    <button className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition font-bold text-xs uppercase tracking-wider">
                        Exporter (CSV)
                    </button>
                    <button className="flex items-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-bold text-xs uppercase tracking-wider shadow-md">
                        <Plus size={16} /> Émettre une facture
                    </button>
                </div>
            </div>

            {/* Quick Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { title: 'Revenus encaissés', value: '45,800 MAD', sub: '+12.4% ce mois', color: 'text-emerald-600 bg-emerald-50' },
                    { title: 'Facturé non encaissé', value: '12,400 MAD', sub: '6 factures actives', color: 'text-blue-600 bg-blue-50' },
                    { title: 'Taux de recouvrement', value: '98.2%', sub: 'Objectif trimestriel atteint', color: 'text-indigo-600 bg-indigo-50' },
                ].map((s) => (
                    <div key={s.title} className="bg-white p-5 border border-slate-100 rounded-2xl shadow-sm">
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-wider">{s.title}</p>
                        <h4 className="text-2xl font-black text-slate-800 mt-2">{s.value}</h4>
                        <p className="text-xs font-semibold text-slate-500 mt-1">{s.sub}</p>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black uppercase tracking-wider text-slate-400">
                            <th className="p-4 pl-6">N° Facture</th>
                            <th className="p-4">Patient</th>
                            <th className="p-4">Date d'émission</th>
                            <th className="p-4">Montant Total</th>
                            <th className="p-4 text-right pr-6">Statut</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 text-xs font-bold text-slate-700">
                        {[
                            { num: 'FAC-2026-081', patient: 'Samir Alami', date: '17/05/2026', total: '400 MAD', status: 'Payé' },
                            { num: 'FAC-2026-080', patient: 'Lina Bennani', date: '16/05/2026', total: '1,250 MAD', status: 'En Attente' },
                            { num: 'FAC-2026-079', patient: 'Youssef Taghi', date: '15/05/2026', total: '450 MAD', status: 'Payé' },
                            { num: 'FAC-2026-078', patient: 'Nadia Mansouri', date: '14/05/2026', total: '2,000 MAD', status: 'Payé' },
                            { num: 'FAC-2026-077', patient: 'Karim Tazi', date: '12/05/2026', total: '7,000 MAD', status: 'En Attente' },
                        ].map((f) => (
                            <tr key={f.num} className="hover:bg-slate-50/50 transition">
                                <td className="p-4 pl-6 text-blue-600">{f.num}</td>
                                <td className="p-4 text-slate-800">{f.patient}</td>
                                <td className="p-4 text-slate-400 font-medium">{f.date}</td>
                                <td className="p-4 text-slate-800 font-black">{f.total}</td>
                                <td className="p-4 text-right pr-6">
                                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${
                                        f.status === 'Payé' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700 animate-pulse'
                                    }`}>
                                        {f.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderPrescriptions = () => (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">Prescriptions & Ordonnances</h1>
                    <p className="text-slate-500 font-bold mt-1 text-sm">Gérez et archivez les prescriptions médicales de vos patients.</p>
                </div>
                <button 
                    onClick={() => {
                        setPrescriptionError('');
                        setPrescriptionSuccess(false);
                        setIsPrescriptionModalOpen(true);
                    }}
                    className="flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition font-bold text-xs uppercase tracking-wider shadow-md"
                >
                    <Plus size={16} /> Rédiger une ordonnance
                </button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black uppercase tracking-wider text-slate-400">
                            <th className="p-4 pl-6">Réf. Ordonnance</th>
                            <th className="p-4">Patient</th>
                            <th className="p-4">Médicaments / Posologie</th>
                            <th className="p-4">Date de rédaction</th>
                            <th className="p-4 text-right pr-6">Praticien</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 text-xs font-bold text-slate-700">
                        {prescriptions.map((o) => (
                            <tr key={o.ref} className="hover:bg-slate-50/50 transition">
                                <td className="p-4 pl-6 text-blue-600 font-bold">{o.ref}</td>
                                <td className="p-4 text-slate-800 font-black">{o.patient}</td>
                                <td className="p-4 text-slate-600 font-medium truncate max-w-xs">{o.drugs}</td>
                                <td className="p-4 text-slate-400 font-medium">{o.date}</td>
                                <td className="p-4 text-right pr-6 text-slate-500 font-bold">{o.doctor}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderSettings = () => (
        <div className="space-y-6 max-w-4xl">
            <div>
                <h1 className="text-3xl font-black text-slate-800 tracking-tight">Paramètres du Cabinet</h1>
                <p className="text-slate-500 font-bold mt-1 text-sm">Configurez les plages horaires, règles de prise de RDV et préférences cliniques.</p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 p-8 shadow-sm space-y-6">
                <h3 className="text-lg font-black text-slate-800 border-b border-slate-100 pb-3">⚙️ Préférences d'Agenda & Réservations</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-[10px] font-black uppercase text-slate-400 mb-2">Intervalle de réservation par défaut</label>
                        <select defaultValue="30 minutes (Recommandé)" className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-bold text-slate-700 outline-none">
                            <option>15 minutes</option>
                            <option>30 minutes (Recommandé)</option>
                            <option>45 minutes</option>
                            <option>60 minutes</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-[10px] font-black uppercase text-slate-400 mb-2">Délai minimum avant annulation</label>
                        <select defaultValue="24 heures" className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-bold text-slate-700 outline-none">
                            <option>12 heures</option>
                            <option>24 heures</option>
                            <option>48 heures</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-[10px] font-black uppercase text-slate-400 mb-2">Heure d'ouverture du cabinet</label>
                        <input type="time" defaultValue="08:00" className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-bold text-slate-700 outline-none" />
                    </div>
                    <div>
                        <label className="block text-[10px] font-black uppercase text-slate-400 mb-2">Heure de fermeture du cabinet</label>
                        <input type="time" defaultValue="18:00" className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-bold text-slate-700 outline-none" />
                    </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end">
                    <button className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-black text-xs uppercase tracking-wider shadow-md">
                        Enregistrer les modifications
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <motion.div 
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="pb-20"
        >
            {section === 'soins' && renderTreatments()}
            {section === 'factures' && renderBilling()}
            {section === 'ordonnances' && renderPrescriptions()}
            {section === 'parametres' && renderSettings()}

            {/* Premium Interactive Modal for Adding a Treatment */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        {/* Elegant Backdrop */}
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsModalOpen(false)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                        />

                        {/* Modal Dialog */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-[32px] w-full max-w-md overflow-hidden shadow-2xl relative z-10 border border-slate-100 flex flex-col"
                        >
                            {/* Header */}
                            <div className="p-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex justify-between items-center shrink-0">
                                <div>
                                    <h3 className="text-lg font-black uppercase tracking-wider">Ajouter un Soin</h3>
                                    <p className="text-[10px] font-bold text-blue-100 mt-1">Créez un nouvel acte médical dans le catalogue.</p>
                                </div>
                                <button 
                                    onClick={() => setIsModalOpen(false)}
                                    className="p-2 hover:bg-white/10 rounded-xl transition text-white"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            {/* Body */}
                            <form onSubmit={handleAddTreatmentSubmit} className="p-6 space-y-5">
                                {errorMessage && (
                                    <div className="p-4 bg-rose-50 border border-rose-100 text-rose-700 text-xs font-bold rounded-2xl flex items-center gap-2.5">
                                        <AlertCircle size={16} />
                                        <span>{errorMessage}</span>
                                    </div>
                                )}

                                {showSuccess ? (
                                    <div className="py-8 text-center space-y-3">
                                        <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto text-emerald-600 animate-bounce">
                                            <Check size={24} className="stroke-[3]" />
                                        </div>
                                        <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider">Soin Enregistré !</h4>
                                        <p className="text-xs text-slate-400 font-bold">Le catalogue a été mis à jour avec succès.</p>
                                    </div>
                                ) : (
                                    <>
                                        <div>
                                            <label className="block text-[10px] font-black uppercase text-slate-400 mb-1.5 tracking-wider">Désignation du soin *</label>
                                            <input 
                                                type="text" 
                                                required
                                                placeholder="Ex: Pose de couronne céramique"
                                                value={name}
                                                onChange={e => setName(e.target.value)}
                                                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-bold text-slate-700 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all placeholder:text-slate-300"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[10px] font-black uppercase text-slate-400 mb-1.5 tracking-wider">Tarif Indicatif (MAD) *</label>
                                            <input 
                                                type="number" 
                                                required
                                                min="0"
                                                placeholder="Ex: 1200"
                                                value={price}
                                                onChange={e => setPrice(e.target.value)}
                                                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-bold text-slate-700 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all placeholder:text-slate-300"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[10px] font-black uppercase text-slate-400 mb-1.5 tracking-wider">Description de l'acte</label>
                                            <textarea 
                                                rows="3"
                                                placeholder="Ex: Pose d'une couronne en céramique de haute qualité..."
                                                value={description}
                                                onChange={e => setDescription(e.target.value)}
                                                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-medium text-slate-700 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all placeholder:text-slate-300"
                                            />
                                        </div>

                                        {/* Actions */}
                                        <div className="pt-3 border-t border-slate-100 flex justify-end gap-2.5">
                                            <button 
                                                type="button"
                                                onClick={() => setIsModalOpen(false)}
                                                className="px-4 py-2.5 bg-slate-50 text-slate-600 rounded-xl hover:bg-slate-150 transition font-bold text-xs uppercase tracking-wider"
                                            >
                                                Annuler
                                            </button>
                                            <button 
                                                type="submit"
                                                disabled={saving}
                                                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-bold text-xs uppercase tracking-wider shadow-md disabled:opacity-50"
                                            >
                                                {saving ? <Loader2 size={14} className="animate-spin" /> : null}
                                                {saving ? 'Enregistrement...' : 'Confirmer'}
                                            </button>
                                        </div>
                                    </>
                                )}
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
            {/* Premium Interactive Modal for Drafting a Prescription */}
            <AnimatePresence>
                {isPrescriptionModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        {/* Backdrop */}
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsPrescriptionModalOpen(false)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                        />

                        {/* Modal Container */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 15 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 15 }}
                            className="bg-white rounded-[32px] w-full max-w-md overflow-hidden shadow-2xl relative z-10 border border-slate-100"
                        >
                            {/* Header */}
                            <div className="p-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex justify-between items-center shrink-0">
                                <div>
                                    <h3 className="text-lg font-black uppercase tracking-wider">Rédiger une Ordonnance</h3>
                                    <p className="text-[10px] font-bold text-blue-100 mt-1">Générez une prescription médicale sécurisée pour le patient.</p>
                                </div>
                                <button 
                                    onClick={() => setIsPrescriptionModalOpen(false)}
                                    className="p-2 hover:bg-white/10 rounded-xl transition text-white"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            {/* Body */}
                            <form onSubmit={handleAddPrescriptionSubmit} className="p-6 space-y-5">
                                {prescriptionError && (
                                    <div className="p-4 bg-rose-50 border border-rose-100 text-rose-700 text-xs font-bold rounded-2xl flex items-center gap-2.5">
                                        <AlertCircle size={16} />
                                        <span>{prescriptionError}</span>
                                    </div>
                                )}

                                {prescriptionSuccess ? (
                                    <div className="py-8 text-center space-y-3">
                                        <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto text-emerald-600 animate-bounce">
                                            <Check size={24} className="stroke-[3]" />
                                        </div>
                                        <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider">Ordonnance Rédigée !</h4>
                                        <p className="text-xs text-slate-400 font-bold">L'ordonnance a été archivée avec succès.</p>
                                    </div>
                                ) : (
                                    <>
                                        <div>
                                            <label className="block text-[10px] font-black uppercase text-slate-400 mb-1.5 tracking-wider">Patient *</label>
                                            <select
                                                required
                                                value={prescriptionPatient}
                                                onChange={e => setPrescriptionPatient(e.target.value)}
                                                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-bold text-slate-700 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                                            >
                                                <option value="">Sélectionner un patient inscrit...</option>
                                                {(Array.isArray(patients) ? patients : []).map(p => (
                                                    <option key={p.id} value={`${p.first_name} ${p.last_name}`}>
                                                        {p.first_name} {p.last_name} ({p.cin || 'Pas de CIN'})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-[10px] font-black uppercase text-slate-400 mb-1.5 tracking-wider">Médicaments & Posologies *</label>
                                            <textarea 
                                                rows="4"
                                                required
                                                placeholder="Ex: Amoxicilline 1g (2x/j pendant 6 jours) · Paracétamol 1g (3x/j si douleur)"
                                                value={prescriptionDrugs}
                                                onChange={e => setPrescriptionDrugs(e.target.value)}
                                                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-medium text-slate-700 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all placeholder:text-slate-300"
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-[10px] font-black uppercase text-slate-400 mb-1.5 tracking-wider">Date *</label>
                                                <input 
                                                    type="date"
                                                    required
                                                    value={prescriptionDate}
                                                    onChange={e => setPrescriptionDate(e.target.value)}
                                                    className="w-full rounded-xl border-slate-200 bg-white px-4 py-3 text-xs font-bold text-slate-700 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black uppercase text-slate-400 mb-1.5 tracking-wider">Praticien *</label>
                                                <select
                                                    value={prescriptionDoctor}
                                                    onChange={e => setPrescriptionDoctor(e.target.value)}
                                                    className="w-full rounded-xl border-slate-200 bg-white px-4 py-3 text-xs font-bold text-slate-700 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                                                >
                                                    <option value="Dr. Chérif">Dr. Chérif</option>
                                                    <option value="Dr. Alaoui">Dr. Alaoui</option>
                                                </select>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="pt-3 border-t border-slate-100 flex justify-end gap-2.5">
                                            <button 
                                                type="button"
                                                onClick={() => setIsPrescriptionModalOpen(false)}
                                                className="px-4 py-2.5 bg-slate-50 text-slate-600 rounded-xl hover:bg-slate-150 transition font-bold text-xs uppercase tracking-wider"
                                            >
                                                Annuler
                                            </button>
                                            <button 
                                                type="submit"
                                                disabled={savingPrescription}
                                                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-bold text-xs uppercase tracking-wider shadow-md disabled:opacity-50"
                                            >
                                                {savingPrescription ? <Loader2 size={14} className="animate-spin" /> : null}
                                                {savingPrescription ? 'Enregistrement...' : 'Rédiger'}
                                            </button>
                                        </div>
                                    </>
                                )}
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
