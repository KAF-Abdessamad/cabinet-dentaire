import React from 'react';
import { Loader2, FileText } from 'lucide-react';
import { usePatientPortalContext } from '../../contexts/PatientPortalContext.jsx';
import { formatDateFrench, statusInvoiceFr } from './patientShared.js';

const PatientInvoicesPage = () => {
    const { loading, invoices } = usePatientPortalContext();

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-dp-secondary" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="font-display text-2xl text-dp-primary">Mes Factures</h1>
                <p className="text-sm text-dp-neutral-500 mt-1">Consultez vos factures et paiements</p>
            </div>

            {invoices.length === 0 ? (
                <div className="rounded-3xl bg-white border border-dp-neutral-100 shadow-dp-card p-12 text-center">
                    <FileText className="h-12 w-12 text-dp-neutral-300 mx-auto mb-3" />
                    <p className="text-dp-neutral-500">Aucune facture pour l’instant.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {invoices.map((inv) => (
                        <article
                            key={inv.id}
                            className="rounded-3xl bg-white border border-dp-neutral-100 shadow-dp-card p-6 hover:shadow-dp-card-hover transition"
                        >
                            <div className="flex flex-wrap justify-between gap-4">
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-wider text-dp-neutral-400">
                                        Facture du {formatDateFrench(inv.invoice_date)}
                                    </p>
                                    <p className="font-display text-2xl text-dp-primary mt-1">
                                        {Number(inv.total_amount).toFixed(2)} MAD
                                    </p>
                                </div>
                                <span
                                    className={`self-start px-3 py-1 rounded-full text-xs font-bold uppercase ${
                                        inv.status === 'paid'
                                            ? 'bg-emerald-50 text-emerald-700'
                                            : 'bg-amber-50 text-amber-800'
                                    }`}
                                >
                                    {statusInvoiceFr[inv.status] || inv.status}
                                </span>
                            </div>
                            {inv.payments?.length > 0 && (
                                <ul className="mt-4 pt-4 border-t border-dp-neutral-100 space-y-2 text-sm">
                                    {inv.payments.map((p) => (
                                        <li key={p.id} className="flex justify-between text-dp-neutral-600">
                                            <span>Paiement du {formatDateFrench(p.payment_date)}</span>
                                            <span className="font-semibold">{Number(p.amount).toFixed(2)} MAD</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </article>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PatientInvoicesPage;
