import React, { useState, useEffect } from 'react';
import axios from 'axios';

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
            const response = await axios.get('/api/patients', {
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
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-800">Liste des Patients</h1>
                <button className="px-4 py-2 bg-medical-600 text-white rounded-lg hover:bg-medical-700 transition">
                    + Nouveau Patient
                </button>
            </div>

            {/* Search Bar */}
            <div className="bg-white rounded-xl p-4 shadow-sm">
                <form onSubmit={handleSearch} className="flex gap-4">
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Rechercher par nom, email, téléphone ou CIN..."
                            className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-medical-500"
                        />
                        <button
                            type="submit"
                            className="absolute right-3 top-2.5 text-slate-400 hover:text-medical-600"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                            </svg>
                        </button>
                    </div>
                </form>
            </div>

            {/* Patients Table */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <table className="w-full">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                Patient
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                Contact
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                CIN
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                Dernière Visite
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading ? (
                            <tr>
                                <td colSpan="5" className="px-6 py-8 text-center text-slate-500">
                                    Chargement...
                                </td>
                            </tr>
                        ) : patients.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="px-6 py-8 text-center text-slate-500">
                                    Aucun patient trouvé
                                </td>
                            </tr>
                        ) : (
                            patients.map((patient) => (
                                <tr key={patient.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            <div className="w-10 h-10 bg-medical-100 rounded-full flex items-center justify-center text-medical-600 font-medium">
                                                {patient.first_name?.charAt(0)}{patient.last_name?.charAt(0)}
                                            </div>
                                            <div className="ml-3">
                                                <p className="font-medium text-slate-800">
                                                    {patient.first_name} {patient.last_name}
                                                </p>
                                                <p className="text-sm text-slate-500">
                                                    ID: #{String(patient.id).padStart(5, '0')}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm text-slate-600">{patient.phone || 'N/A'}</p>
                                        <p className="text-sm text-slate-400">{patient.email}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm text-slate-600">{patient.cin || 'N/A'}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm text-slate-600">
                                            {patient.last_visit || 'Jamais'}
                                        </p>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-medical-600 hover:text-medical-800 font-medium text-sm">
                                            Voir dossier →
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>

                {/* Pagination */}
                {!loading && patients.length > 0 && (
                    <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
                        <p className="text-sm text-slate-500">
                            Total: {pagination.total} patients
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPagination({ ...pagination, currentPage: pagination.currentPage - 1 })}
                                disabled={pagination.currentPage === 1}
                                className="px-3 py-1 border border-slate-200 rounded-lg disabled:opacity-50 hover:bg-slate-50"
                            >
                                ← Précédent
                            </button>
                            <span className="px-3 py-1 text-sm text-slate-600">
                                Page {pagination.currentPage} / {pagination.lastPage}
                            </span>
                            <button
                                onClick={() => setPagination({ ...pagination, currentPage: pagination.currentPage + 1 })}
                                disabled={pagination.currentPage === pagination.lastPage}
                                className="px-3 py-1 border border-slate-200 rounded-lg disabled:opacity-50 hover:bg-slate-50"
                            >
                                Suivant →
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PatientList;
