export const statusAppointmentFr = {
    requested: 'En attente',
    proposed: 'Proposé',
    confirmed: 'Confirmé',
    completed: 'Terminé',
    cancelled: 'Annulé',
};

export const statusAppointmentStyle = {
    requested: 'bg-amber-50 text-amber-800 border-amber-200',
    proposed: 'bg-blue-50 text-blue-800 border-blue-200',
    confirmed: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    completed: 'bg-dp-neutral-100 text-dp-neutral-700 border-dp-neutral-200',
    cancelled: 'bg-red-50 text-red-800 border-red-200',
};

export const statusInvoiceFr = {
    pending: 'En attente',
    unpaid: 'Impayée',
    partially_paid: 'Partielle',
    paid: 'Payée',
};

export function todayStr() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function formatDateFrench(iso) {
    if (!iso) return '—';
    const [y, m, dd] = String(iso).split(/\D/).filter(Boolean);
    if (!y || !m || !dd) return iso;
    return `${dd}/${m}/${y}`;
}

export function formatDateLongFr() {
    return new Date().toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
}
