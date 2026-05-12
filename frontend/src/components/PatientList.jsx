import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, UserPlus, MoreVertical, Eye, Edit, Trash2, ChevronLeft, ChevronRight, Phone, Mail, IdCard, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../api.js';

const PatientList = () => {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [pagination, setPagination] = useState({
        currentPage: 1,
        lastPage: 1,
        total: 0
    });

    useEffect(() => {
        fetchPatients();
    }, [search, pagination.currentPage]);

    const fetchPatients = async () => {
        try {
            setLoading(true);
            const response = await api.get('/api/patients', {
                params: {
                    search: search,
                    page: pagination.currentPage
                }
            });
            setPatients(response.data.data);
            setPagination({
                currentPage: response.data.current_page,
                lastPage: response.data.last_page,
                total: response.data.total
            });
        } catch (error) {
            console.error('Error fetching patients:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setPagination({ ...pagination, currentPage: 1 });
        fetchPatients();
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-12 max-w-7xl mx-auto"
        >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-800 tracking-tight">Répertoire Patients</h1>
                    <p className="text-slate-500 font-bold mt-2 italic">Gérez et consultez les dossiers de vos patients.</p>
                </div>
                <button className="flex items-center gap-3 px-8 py-4 bg-medical-600 text-white rounded-2xl hover:bg-medical-700 transition-all shadow-xl shadow-medical-200 font-black group">
                    <UserPlus className="h-5 w-5" />
                    NOUVEAU DOSSIER
                </button>
            </div>

            {/* Search Bar */}
            <div className="bg-white rounded-[32px] p-2 shadow-xl shadow-slate-100/50 border border-slate-100">
                <form onSubmit={handleSearch} className="flex gap-4">
                    <div className="flex-1 relative group">
                        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-medical-600 transition-colors">
                            <Search size={20} strokeWidth={2.5} />
                        </div>
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Rechercher par nom, email, téléphone ou CIN..."
                            className="w-full pl-16 pr-6 py-5 bg-slate-50 border-none rounded-[24px] text-slate-700 font-bold focus:bg-white focus:ring-4 focus:ring-medical-500/10 transition-all outline-none"
                        />
                    </div>
                </form>
            </div>

            {/* Patients Table */}
            <div className="bg-white rounded-[40px] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    Identité Patient
                                </th>
                                <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    Coordonnées
                                </th>
                                <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    Détails Administratifs
                                </th>
                                <th className="px-8 py-6 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr>
                                    <td colSpan="4" className="px-8 py-20 text-center">
                                        <div className="animate-spin rounded-full h-10 w-10 border-4 border-medical-500 border-t-transparent mx-auto" />
                                        <p className="text-slate-400 font-bold mt-4">Chargement de la liste...</p>
                                    </td>
                                </tr>
                            ) : patients.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-8 py-20 text-center text-slate-400 font-bold italic">
                                        Aucun patient trouvé.
                                    </td>
                                </tr>
                            ) : (
                                patients.map((patient) => (
                                    <tr key={patient.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-[14px] bg-medical-50 text-medical-600 flex items-center justify-center font-black text-lg group-hover:bg-medical-600 group-hover:text-white transition-all">
                                                    {patient.first_name?.[0]}{patient.last_name?.[0]}
                                                </div>
                                                <div>
                                                    <p className="text-slate-800 font-black">{patient.first_name} {patient.last_name}</p>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Inscrit le {new Date(patient.created_at).toLocaleDateString('fr-FR')}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 text-slate-500 font-bold text-sm">
                                                    <Phone size={12} className="text-slate-300" /> {patient.phone || '—'}
                                                </div>
                                                <div className="flex items-center gap-2 text-slate-400 font-medium text-xs">
                                                    <Mail size={12} className="text-slate-200" /> {patient.email || '—'}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-lg w-fit">
                                                <IdCard size={14} className="text-slate-400" />
                                                <span className="text-xs font-black text-slate-600 tracking-wider">{patient.cin || 'SANS CIN'}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button className="p-2 rounded-xl text-slate-400 hover:bg-white hover:text-medical-600 hover:shadow-md transition-all">
                                                    <Eye size={18} />
                                                </button>
                                                <button className="p-2 rounded-xl text-slate-400 hover:bg-white hover:text-amber-600 hover:shadow-md transition-all">
                                                    <Edit size={18} />
                                                </button>
                                                <button className="p-2 rounded-xl text-slate-400 hover:bg-white hover:text-red-600 hover:shadow-md transition-all">
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="px-8 py-6 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                    <p className="text-xs font-bold text-slate-400">
                        Affichage de {patients.length} sur {pagination.total} patients
                    </p>
                    <div className="flex gap-2">
                        <button 
                            disabled={pagination.currentPage === 1}
                            onClick={() => setPagination({...pagination, currentPage: pagination.currentPage - 1})}
                            className="p-2 rounded-xl border border-slate-200 text-slate-400 hover:bg-white disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <button 
                            disabled={pagination.currentPage === pagination.lastPage}
                            onClick={() => setPagination({...pagination, currentPage: pagination.currentPage + 1})}
                            className="p-2 rounded-xl border border-slate-200 text-slate-400 hover:bg-white disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default PatientList;
