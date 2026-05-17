import React from 'react';
import { Loader2, Stethoscope } from 'lucide-react';
import { usePatientPortalContext } from '../../contexts/PatientPortalContext.jsx';
import { formatDateFrench } from './patientShared.js';

const PatientCarePage = () => {
    const { loading, patient, patientBundle } = usePatientPortalContext();

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
                <h1 className="font-display text-2xl text-dp-primary">Mes Soins</h1>
                <p className="text-sm text-dp-neutral-500 mt-1">Fiche santé et compte-rendus</p>
            </div>

            {patient && (
                <div className="grid md:grid-cols-2 gap-6">
                    <Card title="Groupe sanguin" value={patient.blood_group} />
                    <Card title="Allergies" value={patient.allergies} multiline />
                    <Card title="Antécédents médicaux" value={patient.medical_history} multiline className="md:col-span-2" />
                </div>
            )}

            {patientBundle?.medical_records?.length > 0 && (
                <section className="rounded-3xl bg-white border border-dp-neutral-100 shadow-dp-card p-6">
                    <h2 className="font-semibold text-dp-primary flex items-center gap-2 mb-6">
                        <Stethoscope className="h-5 w-5 text-dp-secondary" />
                        Compte-rendus du cabinet
                    </h2>
                    <ul className="space-y-4">
                        {patientBundle.medical_records.map((rec) => (
                            <li key={rec.id} className="rounded-2xl border border-dp-neutral-100 p-4">
                                <p className="text-xs text-dp-neutral-500">
                                    {formatDateFrench(rec.record_date)} · {rec.dentist?.name || 'Professionnel'}
                                </p>
                                {rec.diagnosis && <p className="mt-2 font-medium text-dp-neutral-800">{rec.diagnosis}</p>}
                                {rec.notes && <p className="mt-2 text-sm text-dp-neutral-600 whitespace-pre-wrap">{rec.notes}</p>}
                            </li>
                        ))}
                    </ul>
                </section>
            )}
        </div>
    );
};

function Card({ title, value, multiline, className = '' }) {
    return (
        <div className={`rounded-2xl bg-white border border-dp-neutral-100 shadow-dp-card p-5 ${className}`}>
            <h3 className="text-xs font-bold uppercase tracking-wider text-dp-neutral-400">{title}</h3>
            <p className={`mt-2 text-dp-neutral-800 font-medium ${multiline ? 'whitespace-pre-wrap' : ''}`}>{value || '—'}</p>
        </div>
    );
}

export default PatientCarePage;
