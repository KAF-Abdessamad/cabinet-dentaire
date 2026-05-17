import React from 'react';
import { Loader2, User } from 'lucide-react';
import { usePatientPortalContext } from '../../contexts/PatientPortalContext.jsx';
import { formatDateFrench } from './patientShared.js';

const PatientProfilePage = () => {
    const { loading, patient } = usePatientPortalContext();

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-dp-secondary" />
            </div>
        );
    }

    if (!patient) {
        return <p className="text-dp-neutral-500">Profil introuvable.</p>;
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="font-display text-2xl text-dp-primary flex items-center gap-2">
                    <User className="h-7 w-7 text-dp-secondary" />
                    Mon Profil
                </h1>
                <p className="text-sm text-dp-neutral-500 mt-1">Vos informations personnelles</p>
            </div>

            <div className="rounded-3xl bg-white border border-dp-neutral-100 shadow-dp-card p-6 sm:p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <Field label="Prénom" value={patient.first_name} />
                    <Field label="Nom" value={patient.last_name} />
                    <Field label="Email" value={patient.email} />
                    <Field label="Téléphone" value={patient.phone} />
                    <Field
                        label="Date de naissance"
                        value={patient.birth_date ? formatDateFrench(String(patient.birth_date).slice(0, 10)) : null}
                    />
                    <Field label="Sexe" value={patient.gender} />
                    <Field label="CIN" value={patient.cin} />
                    <Field label="Adresse" value={patient.address} className="md:col-span-2" />
                </div>
            </div>
        </div>
    );
};

function Field({ label, value, className = '' }) {
    return (
        <div className={`rounded-2xl bg-dp-bg border border-dp-neutral-100 p-4 ${className}`}>
            <span className="text-[10px] font-bold uppercase tracking-wider text-dp-neutral-400">{label}</span>
            <p className="mt-1 font-semibold text-dp-neutral-800">{value || '—'}</p>
        </div>
    );
}

export default PatientProfilePage;
