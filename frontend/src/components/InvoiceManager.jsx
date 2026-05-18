import React, { useState, useEffect } from 'react';
import api from '../api.js';
import { 
    FileText, Search, Filter, Calendar, ArrowUpRight, DollarSign, 
    CreditCard, Calendar as CalendarIcon, ChevronLeft, Download, 
    Mail, Plus, User, AlertCircle, Check, Loader2, Play 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const InvoiceManager = () => {
    const [invoices, setInvoices] = useState([]);
    const [stats, setStats] = useState({ total_billed: 0, total_encashed: 0, remaining_balance: 0 });
    const [loading, setLoading] = useState(true);
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);

    // Filters
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // Payment Form
    const [paymentAmount, setPaymentAmount] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [paymentDate, setPaymentDate] = useState(new Date().toISOString().substring(0, 10));
    const [paymentReference, setPaymentReference] = useState('');
    const [paymentNotes, setPaymentNotes] = useState('');
    const [submittingPayment, setSubmittingPayment] = useState(false);
    const [paymentSuccess, setPaymentSuccess] = useState(false);
    const [paymentError, setPaymentError] = useState('');

    // Create Invoice Form State
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [patients, setPatients] = useState([]);
    const [selectedPatientId, setSelectedPatientId] = useState('');
    const [createAmount, setCreateAmount] = useState('');
    const [createDate, setCreateDate] = useState(new Date().toISOString().substring(0, 10));
    const [createNotes, setCreateNotes] = useState('');
    const [submittingCreate, setSubmittingCreate] = useState(false);
    const [createSuccess, setCreateSuccess] = useState(false);
    const [createError, setCreateError] = useState('');

    useEffect(() => {
        const fetchPatients = async () => {
            try {
                const res = await api.get('/api/patients?all=1');
                const list = Array.isArray(res.data) ? res.data : (res.data?.data || []);
                setPatients(list);
            } catch (err) {
                console.error("Error loading patients", err);
            }
        };
        fetchPatients();
    }, []);

    const handleCreateInvoice = async (e) => {
        e.preventDefault();
        setCreateError('');
        setSubmittingCreate(true);

        if (!selectedPatientId) {
            setCreateError('Veuillez sélectionner un patient.');
            setSubmittingCreate(false);
            return;
        }

        if (!createAmount || parseFloat(createAmount) < 0) {
            setCreateError('Veuillez saisir un montant total valide.');
            setSubmittingCreate(false);
            return;
        }

        try {
            await api.post('/api/invoices', {
                patient_id: Number(selectedPatientId),
                total_amount: Number(createAmount),
                invoice_date: createDate,
                notes: createNotes
            });

            setCreateSuccess(true);
            setTimeout(() => {
                setShowCreateModal(false);
                setCreateSuccess(false);
                setSelectedPatientId('');
                setCreateAmount('');
                setCreateNotes('');
                // Refresh invoices list
                fetchInvoices();
            }, 1500);
        } catch (err) {
            const msg = err.response?.data?.error || err.response?.data?.message || "Une erreur est survenue lors de la création de la facture.";
            setCreateError(msg);
        } finally {
            setSubmittingCreate(false);
        }
    };

    // Load list
    const fetchInvoices = async () => {
        setLoading(true);
        try {
            const res = await api.get('/api/invoices', {
                params: {
                    search,
                    status: statusFilter,
                    start_date: startDate,
                    end_date: endDate
                }
            });
            setInvoices(res.data.invoices || []);
            setStats(res.data.stats || { total_billed: 0, total_encashed: 0, remaining_balance: 0 });
        } catch (err) {
            console.error("Error loading invoices", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInvoices();
    }, [search, statusFilter, startDate, endDate]);

    // Handle view invoice detail
    const handleViewInvoice = async (invoiceId) => {
        try {
            const res = await api.get(`/api/invoices/${invoiceId}`);
            setSelectedInvoice(res.data.invoice);
        } catch (err) {
            console.error("Error viewing invoice details", err);
        }
    };

    // CSV Export
    const exportCSV = () => {
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "N Facture,Patient,Date,Montant TTC (MAD),Paye (MAD),Reste du (MAD),Statut\n";

        invoices.forEach(inv => {
            const totalPaid = inv.payments ? inv.payments.reduce((sum, p) => sum + Number(p.amount), 0) : 0;
            const remaining = inv.total_amount - totalPaid;
            const statusLabel = inv.status === 'paid' ? 'Payée' : inv.status === 'partially_paid' ? 'Partielle' : 'Impayée';
            csvContent += `${inv.id},${inv.patient?.first_name} ${inv.patient?.last_name},${inv.invoice_date.substring(0, 10)},${inv.total_amount},${totalPaid},${remaining},${statusLabel}\n`;
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `factures_dentistpro_${new Date().toISOString().substring(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // PDF Download
    const downloadPdf = async (invoiceId) => {
        try {
            const response = await api.get(`/api/invoices/${invoiceId}/pdf`, { responseType: 'blob' });
            const blob = new Blob([response.data], { type: "application/pdf" });
            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.download = `facture-${invoiceId}.pdf`;
            link.click();
        } catch (err) {
            alert("Erreur lors du téléchargement du PDF.");
        }
    };

    // Send Email
    const sendEmail = async (invoiceId) => {
        try {
            await api.post(`/api/invoices/${invoiceId}/email`);
            alert("La facture a été envoyée par e-mail au patient avec succès !");
        } catch (err) {
            alert("Erreur lors de l'envoi de la facture par e-mail.");
        }
    };

    // Submit Payment
    const handleRegisterPayment = async (e) => {
        e.preventDefault();
        setPaymentError('');
        setSubmittingPayment(true);

        try {
            const payload = {
                amount: Number(paymentAmount),
                payment_method: paymentMethod,
                payment_date: paymentDate,
                reference: paymentReference,
                notes: paymentNotes
            };

            await api.post(`/api/invoices/${selectedInvoice.id}/payments`, payload);
            setPaymentSuccess(true);
            setTimeout(() => {
                setShowPaymentModal(false);
                setPaymentSuccess(false);
                setPaymentAmount('');
                setPaymentReference('');
                setPaymentNotes('');
                // Refresh data
                fetchInvoices();
                handleViewInvoice(selectedInvoice.id);
            }, 1500);
        } catch (err) {
            const msg = err.response?.data?.error || "Une erreur est survenue lors de l'enregistrement.";
            setPaymentError(msg);
        } finally {
            setSubmittingPayment(false);
        }
    };

    const totalPaidOnSelected = selectedInvoice?.payments ? selectedInvoice.payments.reduce((sum, p) => sum + Number(p.amount), 0) : 0;
    const remainingOnSelected = selectedInvoice ? selectedInvoice.total_amount - totalPaidOnSelected : 0;

    const statusClasses = {
        paid: 'bg-emerald-50 text-emerald-700 border-emerald-100',
        partially_paid: 'bg-amber-50 text-amber-700 border-amber-100',
        pending: 'bg-rose-50 text-rose-700 border-rose-100',
        cancelled: 'bg-slate-100 text-slate-600 border-slate-200'
    };

    const statusLabels = {
        paid: 'Payée',
        partially_paid: 'Partielle',
        pending: 'Impayée',
        cancelled: 'Annulée'
    };

    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-12">
            
            <AnimatePresence mode="wait">
                {!selectedInvoice ? (
                    // LIST VIEW
                    <motion.div
                        key="list"
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -15 }}
                        className="space-y-8"
                    >
                        {/* Header */}
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white/70 backdrop-blur-xl p-6 rounded-[32px] border border-slate-100/80 shadow-xl shadow-slate-100/40">
                            <div>
                                <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                                    <FileText className="text-medical-600 h-8 w-8" />
                                    Module Facturation
                                </h1>
                                <p className="text-slate-500 font-bold mt-1 text-sm italic">
                                    Suivi comptable, historique des versements, paiements partiels et exports.
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <button 
                                    onClick={exportCSV}
                                    className="flex items-center gap-2 px-6 py-3.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-2xl transition-all shadow-sm font-black text-xs uppercase tracking-wider"
                                >
                                    <Download size={14} />
                                    Export CSV
                                </button>
                                <button 
                                    onClick={() => {
                                        setCreateError('');
                                        setCreateSuccess(false);
                                        setShowCreateModal(true);
                                    }}
                                    className="flex items-center gap-2 px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl transition-all shadow-md font-black text-xs uppercase tracking-wider shadow-blue-100"
                                >
                                    <Plus size={14} />
                                    Émettre une facture
                                </button>
                            </div>
                        </div>

                        {/* KPI Dashboard Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            
                            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-md flex items-center justify-between">
                                <div className="space-y-1.5">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Facturé</span>
                                    <h3 className="text-2xl font-black text-slate-800">{stats.total_billed?.toLocaleString('fr-FR')} MAD</h3>
                                </div>
                                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-inner">
                                    <DollarSign size={20} />
                                </div>
                            </div>

                            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-md flex items-center justify-between">
                                <div className="space-y-1.5">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Encaissé</span>
                                    <h3 className="text-2xl font-black text-emerald-600">{stats.total_encashed?.toLocaleString('fr-FR')} MAD</h3>
                                </div>
                                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shadow-inner">
                                    <Check size={20} />
                                </div>
                            </div>

                            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-md flex items-center justify-between">
                                <div className="space-y-1.5">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Solde en Attente</span>
                                    <h3 className="text-2xl font-black text-rose-500">{stats.remaining_balance?.toLocaleString('fr-FR')} MAD</h3>
                                </div>
                                <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center shadow-inner">
                                    <AlertCircle size={20} />
                                </div>
                            </div>
                        </div>

                        {/* Filters Container */}
                        <div className="bg-white rounded-[24px] border border-slate-100 p-5 shadow-md grid grid-cols-1 md:grid-cols-4 gap-4">
                            
                            {/* Search */}
                            <div className="relative">
                                <Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                                <input 
                                    type="text"
                                    placeholder="Rechercher patient, CIN..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full pl-10 rounded-2xl border-slate-200 text-xs font-bold text-slate-700 bg-slate-50/50 py-3"
                                />
                            </div>

                            {/* Status filter */}
                            <select 
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full rounded-2xl border-slate-200 text-xs font-bold text-slate-700 bg-slate-50/50 py-3"
                            >
                                <option value="">Tous les statuts</option>
                                <option value="paid">Payée</option>
                                <option value="partially_paid">Partielle</option>
                                <option value="pending">Impayée</option>
                                <option value="cancelled">Annulée</option>
                            </select>

                            {/* Date debut */}
                            <input 
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full rounded-2xl border-slate-200 text-xs font-bold text-slate-700 bg-slate-50/50 py-3"
                                placeholder="Date début"
                            />

                            {/* Date fin */}
                            <input 
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full rounded-2xl border-slate-200 text-xs font-bold text-slate-700 bg-slate-50/50 py-3"
                                placeholder="Date fin"
                            />
                        </div>

                        {/* Invoices List Table */}
                        <div className="bg-white rounded-[32px] shadow-xl shadow-slate-100/40 border border-slate-100 overflow-hidden">
                            {loading ? (
                                <div className="h-[400px] flex flex-col items-center justify-center gap-3">
                                    <Loader2 size={32} className="animate-spin text-medical-600" />
                                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Chargement du grand livre...</span>
                                </div>
                            ) : invoices.length === 0 ? (
                                <div className="h-[400px] flex flex-col items-center justify-center text-center p-8">
                                    <FileText size={48} className="text-slate-200 mb-2" />
                                    <h3 className="text-lg font-black text-slate-700">Aucune facture enregistrée</h3>
                                    <p className="text-xs font-bold text-slate-400 mt-1 max-w-sm">Aucune pièce comptable ne correspond à vos critères de recherche.</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-black uppercase tracking-wider text-slate-400">
                                                <th className="py-4.5 px-6">N° Facture</th>
                                                <th className="py-4.5 px-6">Patient</th>
                                                <th className="py-4.5 px-6">Date d'émission</th>
                                                <th className="py-4.5 px-6 text-right">Montant TTC</th>
                                                <th className="py-4.5 px-6 text-right">Déjà Payé</th>
                                                <th className="py-4.5 px-6">Statut</th>
                                                <th className="py-4.5 px-6 text-center">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {invoices.map(inv => {
                                                const totalPaid = inv.payments ? inv.payments.reduce((sum, p) => sum + Number(p.amount), 0) : 0;
                                                return (
                                                    <motion.tr 
                                                        key={inv.id}
                                                        layoutId={`inv-row-${inv.id}`}
                                                        className="border-b border-slate-100/50 hover:bg-slate-50/40 transition-colors"
                                                    >
                                                        <td className="py-4 px-6 text-xs font-black text-slate-800">
                                                            #{String(inv.id).padStart(5, '0')}
                                                        </td>
                                                        <td className="py-4 px-6 text-xs font-black text-slate-700">
                                                            {inv.patient?.first_name} {inv.patient?.last_name}
                                                        </td>
                                                        <td className="py-4 px-6 text-xs font-bold text-slate-500">
                                                            {new Date(inv.invoice_date).toLocaleDateString('fr-FR')}
                                                        </td>
                                                        <td className="py-4 px-6 text-xs font-black text-slate-800 text-right">
                                                            {Number(inv.total_amount).toLocaleString('fr-FR')} MAD
                                                        </td>
                                                        <td className="py-4 px-6 text-xs font-bold text-emerald-600 text-right">
                                                            {totalPaid.toLocaleString('fr-FR')} MAD
                                                        </td>
                                                        <td className="py-4 px-6">
                                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black border uppercase tracking-tight ${statusClasses[inv.status]}`}>
                                                                {statusLabels[inv.status]}
                                                            </span>
                                                        </td>
                                                        <td className="py-4 px-6">
                                                            <div className="flex items-center justify-center gap-1.5">
                                                                <button 
                                                                    onClick={() => handleViewInvoice(inv.id)}
                                                                    className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl transition text-[10px] font-black uppercase tracking-tight border border-slate-200/50"
                                                                >
                                                                    Détail
                                                                </button>
                                                                <button 
                                                                    onClick={() => downloadPdf(inv.id)}
                                                                    title="Télécharger PDF"
                                                                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition"
                                                                >
                                                                    <Download size={14} />
                                                                </button>
                                                                <button 
                                                                    onClick={() => sendEmail(inv.id)}
                                                                    title="Envoyer par email"
                                                                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition"
                                                                >
                                                                    <Mail size={14} />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </motion.tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </motion.div>
                ) : (
                    // DETAIL VIEW
                    <motion.div
                        key="detail"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        className="space-y-6"
                    >
                        {/* Detail Header navigation */}
                        <div className="flex items-center justify-between bg-white/70 backdrop-blur-xl p-5 rounded-[24px] border border-slate-100/80 shadow-md">
                            <button 
                                onClick={() => setSelectedInvoice(null)}
                                className="flex items-center gap-2 text-xs font-black text-slate-500 hover:text-slate-800 uppercase tracking-widest transition"
                            >
                                <ChevronLeft size={16} />
                                Retour à la liste
                            </button>

                            <div className="flex gap-2">
                                <button 
                                    onClick={() => downloadPdf(selectedInvoice.id)}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl transition text-[10px] font-black uppercase tracking-widest shadow-sm"
                                >
                                    <Download size={13} />
                                    Télécharger PDF
                                </button>
                                <button 
                                    onClick={() => sendEmail(selectedInvoice.id)}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl transition text-[10px] font-black uppercase tracking-widest shadow-sm"
                                >
                                    <Mail size={13} />
                                    Envoyer par email
                                </button>
                                {remainingOnSelected > 0 && (
                                    <button 
                                        onClick={() => {
                                            setPaymentAmount(String(remainingOnSelected));
                                            setShowPaymentModal(true);
                                        }}
                                        className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition text-[10px] font-black uppercase tracking-widest shadow-md shadow-emerald-100"
                                    >
                                        <Plus size={13} />
                                        Enregistrer un paiement
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Invoice card detail sheet */}
                        <div className="bg-white rounded-[32px] border border-slate-100 shadow-xl p-8 space-y-8 relative overflow-hidden">
                            
                            {/* Watermark backdrop inside card */}
                            <div className="absolute right-10 top-1/2 -translate-y-1/2 select-none pointer-events-none opacity-[0.03] text-slate-800 text-[180px] font-black rotate-[-25deg]">
                                {selectedInvoice.status.toUpperCase()}
                            </div>

                            {/* Header row */}
                            <div className="flex justify-between items-start border-b border-slate-100 pb-6 relative z-10">
                                <div>
                                    <div className="text-2xl font-black text-slate-800">🦷 DentistPro</div>
                                    <p className="text-xs font-bold text-slate-400 mt-1">Cabinet Dentaire Spécialisé</p>
                                </div>
                                <div className="text-right">
                                    <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Facture</h2>
                                    <p className="text-xs font-black text-slate-500 mt-1">N° {String(selectedInvoice.id).padStart(5, '0')}</p>
                                    <span className={`inline-block mt-3 px-3 py-1 rounded-full text-[10px] font-black border uppercase tracking-tight ${statusClasses[selectedInvoice.status]}`}>
                                        {statusLabels[selectedInvoice.status]}
                                    </span>
                                </div>
                            </div>

                            {/* Info grid */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2 relative z-10">
                                
                                <div className="bg-slate-50/50 rounded-2xl p-5 border border-slate-100">
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Patient</h4>
                                    <div className="space-y-1">
                                        <p className="text-xs font-black text-slate-800">{selectedInvoice.patient?.first_name} {selectedInvoice.patient?.last_name}</p>
                                        <p className="text-[11px] font-bold text-slate-500">CIN : {selectedInvoice.patient?.cin || 'Non renseigné'}</p>
                                        <p className="text-[11px] font-bold text-slate-500">Tél : {selectedInvoice.patient?.phone}</p>
                                        <p className="text-[11px] font-bold text-slate-500">Email : {selectedInvoice.patient?.email}</p>
                                    </div>
                                </div>

                                <div className="bg-slate-50/50 rounded-2xl p-5 border border-slate-100">
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Dates de Facturation</h4>
                                    <div className="space-y-1">
                                        <p className="text-[11px] font-bold text-slate-500">Émise le : <span className="font-black text-slate-700">{new Date(selectedInvoice.invoice_date).toLocaleDateString('fr-FR')}</span></p>
                                        <p className="text-[11px] font-bold text-slate-500">Échéance le : <span className="font-black text-slate-700">{new Date(new Date(selectedInvoice.invoice_date).getTime() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR')}</span></p>
                                        {selectedInvoice.appointment && (
                                            <p className="text-[11px] font-bold text-slate-500">Soin effectué le : {new Date(selectedInvoice.appointment.appointment_date).toLocaleDateString('fr-FR')}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="bg-slate-50/50 rounded-2xl p-5 border border-slate-100">
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Résumé des Comptes</h4>
                                    <div className="space-y-1">
                                        <p className="text-[11px] font-bold text-slate-500">Montant total : <span className="font-black text-slate-700">{Number(selectedInvoice.total_amount).toLocaleString('fr-FR')} MAD</span></p>
                                        <p className="text-[11px] font-bold text-slate-500">Déjà réglé : <span className="font-black text-emerald-600">{totalPaidOnSelected.toLocaleString('fr-FR')} MAD</span></p>
                                        <p className="text-[11px] font-bold text-slate-500">Reste dû : <span className="font-black text-rose-500">{remainingOnSelected.toLocaleString('fr-FR')} MAD</span></p>
                                    </div>
                                </div>
                            </div>

                            {/* Prestations Table */}
                            <div className="border border-slate-100 rounded-2xl overflow-hidden relative z-10">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50/80 border-b border-slate-100 text-[10px] font-black uppercase tracking-wider text-slate-400">
                                            <th className="py-3 px-5">Prestation / Soin</th>
                                            <th className="py-3 px-5 text-center">Quantité</th>
                                            <th className="py-3 px-5 text-right">Prix Unitaire</th>
                                            <th className="py-3 px-5 text-right">Total TTC</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedInvoice.appointment?.treatment ? (
                                            <tr className="text-xs font-bold text-slate-700">
                                                <td className="py-4 px-5">
                                                    <div className="font-black text-slate-800">{selectedInvoice.appointment.treatment.name}</div>
                                                    <div className="text-[10px] text-slate-400 font-medium mt-0.5">{selectedInvoice.appointment.treatment.description || 'Prestation clinique'}</div>
                                                </td>
                                                <td className="py-4 px-5 text-center">1</td>
                                                <td className="py-4 px-5 text-right">{Number(selectedInvoice.appointment.treatment.price).toLocaleString('fr-FR')} MAD</td>
                                                <td className="py-4 px-5 text-right font-black text-slate-800">{Number(selectedInvoice.appointment.treatment.price).toLocaleString('fr-FR')} MAD</td>
                                            </tr>
                                        ) : (
                                            <tr className="text-xs font-bold text-slate-700">
                                                <td className="py-4 px-5">
                                                    <div className="font-black text-slate-800">Consultation et soins dentaires</div>
                                                    <div className="text-[10px] text-slate-400 font-medium mt-0.5">Soins cliniques généraux</div>
                                                </td>
                                                <td className="py-4 px-5 text-center">1</td>
                                                <td className="py-4 px-5 text-right">{Number(selectedInvoice.total_amount).toLocaleString('fr-FR')} MAD</td>
                                                <td className="py-4 px-5 text-right font-black text-slate-800">{Number(selectedInvoice.total_amount).toLocaleString('fr-FR')} MAD</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Automatic calculations layout */}
                            <div className="flex justify-end pt-2 relative z-10">
                                <div className="w-72 bg-slate-50 rounded-2xl p-5 border border-slate-100 space-y-3">
                                    <div className="flex justify-between text-xs font-bold text-slate-500">
                                        <span>Total HT (TVA 20% exclue)</span>
                                        <span>{Number(selectedInvoice.total_amount / 1.2).toLocaleString('fr-FR', { maximumFractionDigits: 2 })} MAD</span>
                                    </div>
                                    <div className="flex justify-between text-xs font-bold text-slate-500 border-b border-slate-200/50 pb-2">
                                        <span>TVA (20%)</span>
                                        <span>{Number(selectedInvoice.total_amount - (selectedInvoice.total_amount / 1.2)).toLocaleString('fr-FR', { maximumFractionDigits: 2 })} MAD</span>
                                    </div>
                                    <div className="flex justify-between text-sm font-black text-slate-800 pt-1">
                                        <span>Montant TTC</span>
                                        <span className="text-medical-600">{Number(selectedInvoice.total_amount).toLocaleString('fr-FR')} MAD</span>
                                    </div>
                                </div>
                            </div>

                            {/* Payments section & progress bar */}
                            <div className="border-t border-slate-100 pt-8 relative z-10 space-y-6">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div>
                                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide">Timeline des Règlements</h3>
                                        <p className="text-xs font-bold text-slate-400 mt-0.5">Suivi des paiements partiels effectués.</p>
                                    </div>
                                    
                                    {/* Progress badge percentage */}
                                    <span className="bg-medical-50 border border-medical-100 text-medical-700 text-[11px] font-black px-3.5 py-1 rounded-full uppercase tracking-tight shrink-0">
                                        {Number(selectedInvoice.total_amount) > 0 ? Math.round((totalPaidOnSelected / Number(selectedInvoice.total_amount)) * 100) : 0}% Réglé
                                    </span>
                                </div>

                                {/* Custom premium progress bar */}
                                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden shadow-inner border border-slate-200/40 relative">
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${Number(selectedInvoice.total_amount) > 0 ? (totalPaidOnSelected / Number(selectedInvoice.total_amount)) * 100 : 0}%` }}
                                        className="h-full bg-gradient-to-r from-medical-500 to-teal-500 rounded-full"
                                        transition={{ duration: 0.8, ease: 'easeOut' }}
                                    />
                                </div>

                                {/* Payments List log */}
                                {selectedInvoice.payments && selectedInvoice.payments.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {selectedInvoice.payments.map((p, idx) => (
                                            <div key={p.id} className="bg-slate-50/60 border border-slate-100/80 rounded-2xl p-4 flex items-center justify-between">
                                                <div className="space-y-1">
                                                    <div className="text-xs font-black text-slate-700">Versement #{idx + 1}</div>
                                                    <div className="text-[10px] text-slate-400 font-bold">
                                                        Reçu le {new Date(p.payment_date).toLocaleDateString('fr-FR')} via {p.payment_method.toUpperCase()}
                                                    </div>
                                                    {p.reference && (
                                                        <div className="text-[10px] text-slate-500 italic">Réf : {p.reference}</div>
                                                    )}
                                                </div>
                                                <div className="text-xs font-black text-emerald-600 bg-emerald-50 border border-emerald-100/50 px-3 py-1 rounded-xl">
                                                    + {Number(p.amount).toLocaleString('fr-FR')} MAD
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-xs font-bold text-slate-400 italic">Aucun versement n'a encore été enregistré pour cette facture.</p>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Modal for Registering a Payment */}
            <AnimatePresence>
                {showPaymentModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        {/* Backdrop */}
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowPaymentModal(false)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                        />

                        {/* Modal container */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 15 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 15 }}
                            className="bg-white rounded-[32px] w-full max-w-md overflow-hidden shadow-2xl relative z-10 border border-slate-100"
                        >
                            {/* Header */}
                            <div className="px-6 py-5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white flex justify-between items-center shrink-0">
                                <div>
                                    <h2 className="text-md font-black uppercase tracking-wide">
                                        Enregistrer un Paiement
                                    </h2>
                                    <p className="text-[10px] text-white/80 font-bold mt-0.5">
                                        Mise à jour automatique du statut de la facture.
                                    </p>
                                </div>
                                <button onClick={() => setShowPaymentModal(false)} className="p-1 hover:bg-white/10 rounded-full transition">
                                    <X size={18} />
                                </button>
                            </div>

                            {/* Form */}
                            <div className="p-6">
                                {paymentSuccess ? (
                                    <div className="py-8 flex flex-col items-center justify-center text-center space-y-3">
                                        <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 shadow-md">
                                            <Check size={28} strokeWidth={3} />
                                        </div>
                                        <h3 className="text-lg font-black text-slate-800">Versement Enregistré !</h3>
                                        <p className="text-xs font-bold text-slate-400">Le solde restant dû a été mis à jour.</p>
                                    </div>
                                ) : (
                                    <form onSubmit={handleRegisterPayment} className="space-y-4">
                                        
                                        {paymentError && (
                                            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-100 text-rose-700 text-xs font-black flex items-center gap-2">
                                                <AlertCircle size={14} className="shrink-0" />
                                                <span>{paymentError}</span>
                                            </div>
                                        )}

                                        {/* Montant */}
                                        <div>
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                                                Montant à régler (MAD) *
                                            </label>
                                            <input 
                                                type="number"
                                                step="0.01"
                                                required
                                                max={remainingOnSelected}
                                                value={paymentAmount}
                                                onChange={(e) => setPaymentAmount(e.target.value)}
                                                className="w-full rounded-xl border-slate-200 text-xs font-bold py-2.5"
                                            />
                                            <p className="mt-1 text-[10px] text-slate-400 font-bold">Reste dû maximum : {remainingOnSelected?.toLocaleString('fr-FR')} MAD</p>
                                        </div>

                                        {/* Mode de paiement */}
                                        <div>
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                                                Mode de règlement *
                                            </label>
                                            <select 
                                                value={paymentMethod}
                                                onChange={(e) => setPaymentMethod(e.target.value)}
                                                className="w-full rounded-xl border-slate-200 text-xs font-bold py-2.5"
                                            >
                                                <option value="cash">Espèces</option>
                                                <option value="card">Carte bancaire</option>
                                                <option value="transfer">Virement</option>
                                                <option value="check">Chèque</option>
                                            </select>
                                        </div>

                                        {/* Date du paiement */}
                                        <div>
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                                                Date du paiement *
                                            </label>
                                            <input 
                                                type="date"
                                                required
                                                value={paymentDate}
                                                onChange={(e) => setPaymentDate(e.target.value)}
                                                className="w-full rounded-xl border-slate-200 text-xs font-bold py-2.5"
                                            />
                                        </div>

                                        {/* Reference */}
                                        <div>
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                                                Référence / Note
                                            </label>
                                            <input 
                                                type="text"
                                                placeholder="N° de chèque, transaction, etc."
                                                value={paymentReference}
                                                onChange={(e) => setPaymentReference(e.target.value)}
                                                className="w-full rounded-xl border-slate-200 text-xs font-bold py-2.5"
                                            />
                                        </div>

                                        {/* Buttons */}
                                        <div className="pt-3 border-t border-slate-100 flex justify-end gap-2.5">
                                            <button
                                                type="button"
                                                onClick={() => setShowPaymentModal(false)}
                                                className="px-5 py-2.5 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition text-xs font-black uppercase tracking-wider"
                                            >
                                                Annuler
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={submittingPayment}
                                                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-emerald-100"
                                            >
                                                {submittingPayment && <Loader2 size={13} className="animate-spin" />}
                                                Enregistrer
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Modal for Issuing a Invoice */}
            <AnimatePresence>
                {showCreateModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        {/* Backdrop */}
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowCreateModal(false)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                        />

                        {/* Modal container */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 15 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 15 }}
                            className="bg-white rounded-[32px] w-full max-w-md overflow-hidden shadow-2xl relative z-10 border border-slate-100"
                        >
                            {/* Header */}
                            <div className="px-6 py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex justify-between items-center shrink-0">
                                <div>
                                    <h2 className="text-md font-black uppercase tracking-wide">
                                        Émettre une Facture Manuelle
                                    </h2>
                                    <p className="text-[10px] text-white/80 font-bold mt-0.5">
                                        Enregistrer une pièce comptable hors calendrier.
                                    </p>
                                </div>
                                <button onClick={() => setShowCreateModal(false)} className="p-1 hover:bg-white/10 rounded-full transition">
                                    <X size={18} />
                                </button>
                            </div>

                            {/* Form */}
                            <div className="p-6">
                                {createSuccess ? (
                                    <div className="py-8 flex flex-col items-center justify-center text-center space-y-3">
                                        <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center shadow-md">
                                            <Check size={28} strokeWidth={3} />
                                        </div>
                                        <h3 className="text-lg font-black text-slate-800">Facture Émise !</h3>
                                        <p className="text-xs font-bold text-slate-400">La facture a été ajoutée avec succès au grand livre.</p>
                                    </div>
                                ) : (
                                    <form onSubmit={handleCreateInvoice} className="space-y-4">
                                        
                                        {createError && (
                                            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-100 text-rose-700 text-xs font-black flex items-center gap-2">
                                                <AlertCircle size={14} className="shrink-0" />
                                                <span>{createError}</span>
                                            </div>
                                        )}

                                        {/* Patient Select */}
                                        <div>
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                                                Patient destinataire *
                                            </label>
                                            <select 
                                                required
                                                value={selectedPatientId}
                                                onChange={(e) => setSelectedPatientId(e.target.value)}
                                                className="w-full rounded-xl border-slate-200 text-xs font-bold py-2.5 bg-slate-50/50"
                                            >
                                                <option value="">Sélectionner un patient...</option>
                                                {(Array.isArray(patients) ? patients : []).map(p => (
                                                    <option key={p.id} value={p.id}>
                                                        {p.first_name} {p.last_name} ({p.cin || 'Pas de CIN'})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Montant */}
                                        <div>
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                                                Montant Total (MAD) *
                                            </label>
                                            <input 
                                                type="number"
                                                step="0.01"
                                                required
                                                min="0"
                                                placeholder="0.00"
                                                value={createAmount}
                                                onChange={(e) => setCreateAmount(e.target.value)}
                                                className="w-full rounded-xl border-slate-200 text-xs font-bold py-2.5"
                                            />
                                        </div>

                                        {/* Date de facturation */}
                                        <div>
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                                                Date d'émission *
                                            </label>
                                            <input 
                                                type="date"
                                                required
                                                value={createDate}
                                                onChange={(e) => setCreateDate(e.target.value)}
                                                className="w-full rounded-xl border-slate-200 text-xs font-bold py-2.5"
                                            />
                                        </div>

                                        {/* Notes */}
                                        <div>
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                                                Description / Notes
                                            </label>
                                            <textarea 
                                                placeholder="Détail des soins ou remarque..."
                                                value={createNotes}
                                                onChange={(e) => setCreateNotes(e.target.value)}
                                                className="w-full rounded-xl border-slate-200 text-xs font-bold py-2 bg-slate-50/50"
                                                rows="3"
                                            />
                                        </div>

                                        {/* Buttons */}
                                        <div className="pt-3 border-t border-slate-100 flex justify-end gap-2.5">
                                            <button
                                                type="button"
                                                onClick={() => setShowCreateModal(false)}
                                                className="px-5 py-2.5 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition text-xs font-black uppercase tracking-wider"
                                            >
                                                Annuler
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={submittingCreate}
                                                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-blue-100"
                                            >
                                                {submittingCreate && <Loader2 size={13} className="animate-spin" />}
                                                Créer la facture
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

const X = ({ size }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
);

export default InvoiceManager;
