import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
    Search, UserPlus, Eye, Edit, Trash2, ChevronLeft, ChevronRight, 
    Phone, Mail, IdCard, Calendar, Grid, List, Download, Filter, 
    X, RefreshCw, UserCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api.js';
import { useMediaQuery } from '../hooks/useMediaQuery.js';

const PatientList = () => {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Search & Debounce
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    
    // Advanced Filters states
    const [showFilters, setShowFilters] = useState(false);
    const [filterGender, setFilterGender] = useState('all');
    const [filterAge, setFilterAge] = useState('all'); // 'all', 'under30', '30to50', 'over50'
    const [filterBlood, setFilterBlood] = useState('all');

    // Layout view state
    const [viewMode, setViewMode] = useState('list'); // 'list' | 'grid'
    
    const [pagination, setPagination] = useState({
        currentPage: 1,
        lastPage: 1,
        total: 0
    });

    // Responsive design flags
    const isMobile = useMediaQuery('(max-width: 640px)');
    const isTablet = useMediaQuery('(max-width: 1024px)');

    // Apply layout toggle automatically on mobile if desired
    useEffect(() => {
        if (isMobile) {
            setViewMode('grid'); // Grid cards are much better for mobile
        }
    }, [isMobile]);

    // Handle search debounce
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(search);
        }, 300);
        return () => clearTimeout(handler);
    }, [search]);

    // Load data
    useEffect(() => {
        fetchPatients();
    }, [debouncedSearch, pagination.currentPage, filterGender, filterAge, filterBlood]);

    const fetchPatients = async () => {
        try {
            setLoading(true);
            const response = await api.get('/api/patients', {
                params: {
                    search: debouncedSearch,
                    page: pagination.currentPage,
                    gender: filterGender !== 'all' ? filterGender : undefined,
                    age_bracket: filterAge !== 'all' ? filterAge : undefined,
                    blood_group: filterBlood !== 'all' ? filterBlood : undefined,
                }
            });
            setPatients(response.data.data || []);
            setPagination({
                currentPage: response.data.current_page || 1,
                lastPage: response.data.last_page || 1,
                total: response.data.total || 0
            });
        } catch (error) {
            console.error('Error fetching patients:', error);
        } finally {
            setLoading(false);
        }
    };

    // Client-side CSV export
    const handleCSVExport = () => {
        const headers = ['Nom', 'Prénom', 'Email', 'Téléphone', 'CIN', 'Groupe Sanguin', 'Date Inscription'];
        const rows = patients.map(p => [
            p.last_name,
            p.first_name,
            p.email || '',
            p.phone || '',
            p.cin || '',
            p.blood_group || '',
            new Date(p.created_at).toLocaleDateString('fr-FR')
        ]);
        
        let csvContent = "data:text/csv;charset=utf-8,\uFEFF";
        csvContent += [headers.join(','), ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))].join('\n');
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `patients_dentistpro_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Reset advanced filters
    const handleResetFilters = () => {
        setFilterGender('all');
        setFilterAge('all');
        setFilterBlood('all');
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8 max-w-7xl mx-auto pb-16"
        >
            
            {/* Header info bar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight uppercase">
                        Répertoire Patients
                    </h1>
                    <p className="text-slate-500 font-bold mt-1.5 italic">
                        Visualisez et gérez de manière adaptative les dossiers cliniques de DentistPro.
                    </p>
                </div>
                <button className="flex items-center justify-center gap-3 px-6 py-3.5 bg-medical-600 text-white rounded-2xl hover:bg-medical-700 transition shadow-lg shadow-medical-100 font-black text-xs uppercase tracking-widest shrink-0 w-full sm:w-auto h-12">
                    <UserPlus size={16} />
                    Nouveau Dossier
                </button>
            </div>

            {/* Premium Search & Filter Utilities panel */}
            <div className="bg-white rounded-[32px] p-4 shadow-xl shadow-slate-100/50 border border-slate-100 space-y-4">
                <div className="flex flex-col md:flex-row gap-4 items-center">
                    
                    {/* Real-time search */}
                    <div className="flex-1 relative group w-full">
                        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-medical-600 transition">
                            <Search size={18} strokeWidth={2.5} />
                        </div>
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Recherche instantanée par nom, email, téléphone ou CIN..."
                            className="w-full pl-14 pr-5 py-3.5 bg-slate-50 border-none rounded-2xl text-slate-700 font-bold placeholder:text-slate-400 focus:bg-white focus:ring-4 focus:ring-medical-500/10 transition outline-none text-sm h-12"
                        />
                    </div>

                    {/* Action toggles */}
                    <div className="flex items-center gap-3 w-full md:w-auto shrink-0 justify-end">
                        {/* Filters toggle */}
                        <button 
                            onClick={() => setShowFilters(!showFilters)}
                            className={`flex items-center gap-2 px-5 h-12 rounded-2xl border text-xs font-black uppercase tracking-wider transition ${showFilters ? 'bg-slate-800 text-white border-slate-800 shadow-md' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                        >
                            <Filter size={14} />
                            {showFilters ? "Fermer Filtres" : "Filtres Avancés"}
                        </button>

                        {/* CSV Export */}
                        <button 
                            onClick={handleCSVExport}
                            className="p-3 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-2xl transition hover:shadow h-12 w-12 flex items-center justify-center shrink-0"
                            title="Exporter en CSV"
                        >
                            <Download size={16} />
                        </button>

                        {/* View Grid/List toggle (hide on mobile) */}
                        {!isMobile && (
                            <div className="bg-slate-50 p-1 rounded-2xl border border-slate-100 flex gap-0.5 shrink-0 h-12 items-center">
                                <button 
                                    onClick={() => setViewMode('list')}
                                    className={`p-2 rounded-xl transition ${viewMode === 'list' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                    <List size={16} />
                                </button>
                                <button 
                                    onClick={() => setViewMode('grid')}
                                    className={`p-2 rounded-xl transition ${viewMode === 'grid' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                    <Grid size={16} />
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* ADVANCED FILTERS PANEL */}
                <AnimatePresence>
                    {showFilters && (
                        <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden border-t border-slate-50 pt-4"
                        >
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Genre</label>
                                    <select 
                                        value={filterGender}
                                        onChange={e => setFilterGender(e.target.value)}
                                        className="w-full rounded-xl border-slate-200 text-xs font-bold py-2.5"
                                    >
                                        <option value="all">Tous genres</option>
                                        <option value="H">Homme</option>
                                        <option value="F">Femme</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Groupe Sanguin</label>
                                    <select 
                                        value={filterBlood}
                                        onChange={e => setFilterBlood(e.target.value)}
                                        className="w-full rounded-xl border-slate-200 text-xs font-bold py-2.5"
                                    >
                                        <option value="all">Tous groupes</option>
                                        <option value="A+">A+</option>
                                        <option value="A-">A-</option>
                                        <option value="B+">B+</option>
                                        <option value="B-">B-</option>
                                        <option value="O+">O+</option>
                                        <option value="O-">O-</option>
                                        <option value="AB+">AB+</option>
                                        <option value="AB-">AB-</option>
                                    </select>
                                </div>
                                <div className="flex items-end justify-between gap-3">
                                    <div className="flex-1">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Tranche d'âge</label>
                                        <select 
                                            value={filterAge}
                                            onChange={e => setFilterAge(e.target.value)}
                                            className="w-full rounded-xl border-slate-200 text-xs font-bold py-2.5"
                                        >
                                            <option value="all">Tous âges</option>
                                            <option value="under30">Moins de 30 ans</option>
                                            <option value="30to50">Entre 30 et 50 ans</option>
                                            <option value="over50">Plus de 50 ans</option>
                                        </select>
                                    </div>
                                    <button 
                                        onClick={handleResetFilters}
                                        className="px-4 py-2.5 bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 rounded-xl text-xs font-black uppercase transition shrink-0 h-[38px] flex items-center justify-center"
                                    >
                                        Effacer
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* 3. ADAPTIVE DISPLAYS */}
            {loading ? (
                <div className="py-24 text-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-4 border-medical-500 border-t-transparent mx-auto" />
                    <p className="text-slate-400 font-bold mt-4 uppercase tracking-widest text-[10px]">Chargement des fiches patients...</p>
                </div>
            ) : patients.length === 0 ? (
                <div className="py-20 bg-white border border-slate-100 rounded-[32px] text-center text-slate-400 font-bold italic shadow-sm">
                    Aucun patient trouvé correspondant aux critères.
                </div>
            ) : viewMode === 'grid' || isMobile ? (
                /* GRID VIEW (AND MOBILE CARD ADAPTATION) */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {patients.map(patient => (
                        <motion.div
                            key={patient.id}
                            initial={{ scale: 0.97, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="bg-white rounded-3xl p-6 border border-slate-100/80 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                        >
                            <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                    {/* Initials Circle */}
                                    <div className="w-12 h-12 rounded-[14px] bg-slate-800 text-white flex items-center justify-center font-black text-base uppercase shrink-0">
                                        {patient.first_name?.[0]}{patient.last_name?.[0]}
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="text-slate-800 font-black text-base uppercase tracking-tight truncate leading-tight">
                                            {patient.first_name} {patient.last_name}
                                        </h4>
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mt-0.5">
                                            CIN : {patient.cin || '—'}
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-2 border-t border-slate-50 pt-4 text-xs font-semibold text-slate-500">
                                    {patient.phone && (
                                        <div className="flex items-center gap-2.5">
                                            <Phone size={13} className="text-slate-300" />
                                            <a href={`tel:${patient.phone}`} className="hover:text-slate-800 transition font-black">{patient.phone}</a>
                                        </div>
                                    )}
                                    {patient.email && (
                                        <div className="flex items-center gap-2.5 truncate">
                                            <Mail size={13} className="text-slate-300" />
                                            <a href={`mailto:${patient.email}`} className="hover:text-slate-800 transition">{patient.email}</a>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center justify-between border-t border-slate-50 mt-5 pt-4">
                                <div className="flex gap-1">
                                    {patient.blood_group && (
                                        <span className="bg-medical-50 text-medical-600 text-[9px] font-black uppercase px-2 py-0.5 rounded-lg shrink-0">
                                            {patient.blood_group}
                                        </span>
                                    )}
                                </div>
                                <div className="flex gap-1.5">
                                    <Link 
                                        to={`/app/patients/${patient.id}`}
                                        className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded-xl transition"
                                        title="Voir dossier"
                                    >
                                        <Eye size={15} />
                                    </Link>
                                    <button className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-amber-600 rounded-xl transition">
                                        <Edit size={15} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            ) : (
                /* DESKTOP/TABLET TABLE VIEW */
                <div className="bg-white rounded-[40px] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-100">
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        Identité Patient
                                    </th>
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        Coordonnées
                                    </th>
                                    {/* Prioritary columns check for Tablet */}
                                    {!isTablet && (
                                        <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                            Détails Administratifs
                                        </th>
                                    )}
                                    <th className="px-8 py-6 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {patients.map((patient) => (
                                    <tr key={patient.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-[14px] bg-slate-800 text-white flex items-center justify-center font-black text-base uppercase shrink-0 transition">
                                                    {patient.first_name?.[0]}{patient.last_name?.[0]}
                                                </div>
                                                <div>
                                                    <p className="text-slate-800 font-black uppercase text-sm tracking-tight">{patient.first_name} {patient.last_name}</p>
                                                    <p className="text-[10px] font-bold text-slate-400 mt-0.5">Inscrit le {new Date(patient.created_at).toLocaleDateString('fr-FR')}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="space-y-1 text-xs font-semibold text-slate-500">
                                                <div className="flex items-center gap-2">
                                                    <Phone size={12} className="text-slate-350" /> 
                                                    <a href={`tel:${patient.phone}`} className="hover:text-slate-800 font-bold transition">{patient.phone || '—'}</a>
                                                </div>
                                                <div className="flex items-center gap-2 text-slate-400">
                                                    <Mail size={12} className="text-slate-200" /> 
                                                    <a href={`mailto:${patient.email}`} className="hover:text-slate-600 transition">{patient.email || '—'}</a>
                                                </div>
                                            </div>
                                        </td>
                                        {!isTablet && (
                                            <td className="px-8 py-6">
                                                <div className="flex flex-col gap-1.5">
                                                    <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1 rounded-xl w-fit">
                                                        <IdCard size={13} className="text-slate-400" />
                                                        <span className="text-[10px] font-black text-slate-600 tracking-wider uppercase">{patient.cin || 'SANS CIN'}</span>
                                                    </div>
                                                    {patient.blood_group && (
                                                        <span className="bg-medical-50 text-medical-600 text-[9px] font-black uppercase px-2.5 py-0.5 rounded-lg w-fit">
                                                            Groupe : {patient.blood_group}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                        )}
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Link 
                                                    to={`/app/patients/${patient.id}`}
                                                    className="p-2.5 rounded-xl text-slate-400 hover:bg-slate-50 hover:text-medical-600 hover:shadow transition"
                                                    title="Consulter Fiche"
                                                >
                                                    <Eye size={16} />
                                                </Link>
                                                <button className="p-2.5 rounded-xl text-slate-400 hover:bg-slate-50 hover:text-amber-600 hover:shadow transition">
                                                    <Edit size={16} />
                                                </button>
                                                <button className="p-2.5 rounded-xl text-slate-400 hover:bg-slate-50 hover:text-rose-600 hover:shadow transition">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* 4. PREMIUM PAGINATION CONTROLLER */}
            <div className="bg-white rounded-3xl border border-slate-100 p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm select-none">
                <p className="text-xs font-bold text-slate-400">
                    Affichage de {patients.length} sur {pagination.total} fiches patients
                </p>
                <div className="flex gap-2">
                    <button 
                        disabled={pagination.currentPage === 1}
                        onClick={() => setPagination({...pagination, currentPage: pagination.currentPage - 1})}
                        className="p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-transparent transition"
                    >
                        <ChevronLeft size={18} />
                    </button>
                    <button 
                        disabled={pagination.currentPage === pagination.lastPage}
                        onClick={() => setPagination({...pagination, currentPage: pagination.currentPage + 1})}
                        className="p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-transparent transition"
                    >
                        <ChevronRight size={18} />
                    </button>
                </div>
            </div>
            
        </motion.div>
    );
};

export default PatientList;
