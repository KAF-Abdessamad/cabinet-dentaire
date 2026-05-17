/**
 * Rendez-vous : pas le dimanche ni jours fériés fixes (Maroc, calendrier grégorien).
 * Compléter la liste chaque année (fêtes religieuses mobiles si besoin).
 */
const MOROCCO_FIXED_HOLIDAYS = new Set([
    '2025-01-01',
    '2025-01-11',
    '2025-01-14',
    '2025-05-01',
    '2025-07-30',
    '2025-08-14',
    '2025-08-20',
    '2025-08-21',
    '2025-11-06',
    '2025-11-18',
    '2026-01-01',
    '2026-01-11',
    '2026-01-14',
    '2026-05-01',
    '2026-07-30',
    '2026-08-14',
    '2026-08-20',
    '2026-08-21',
    '2026-11-06',
    '2026-11-18',
    '2027-01-01',
    '2027-01-11',
    '2027-01-14',
    '2027-05-01',
    '2027-07-30',
    '2027-08-14',
    '2027-08-20',
    '2027-08-21',
    '2027-11-06',
    '2027-11-18',
]);

/** @param {string} isoDate YYYY-MM-DD */
export function isAppointmentDateAllowed(isoDate) {
    if (!isoDate || !/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) return false;
    const d = new Date(`${isoDate}T12:00:00`);
    if (Number.isNaN(d.getTime())) return false;
    if (d.getDay() === 0) return false;
    return !MOROCCO_FIXED_HOLIDAYS.has(isoDate);
}

export function appointmentDateClosedMessage() {
    return 'Impossible de planifier un rendez-vous un dimanche ou un jour férié (calendrier marocain, dates fixes).';
}

/** Première date à partir d’aujourd’hui (ou de fromIso) autorisée pour un RDV. */
export function nextAllowedAppointmentDate(fromIso = null) {
    const start = fromIso
        ? new Date(`${fromIso}T12:00:00`)
        : (() => {
              const n = new Date();
              n.setHours(12, 0, 0, 0);
              return n;
          })();
    const d = new Date(start);
    for (let i = 0; i < 400; i++) {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const iso = `${y}-${m}-${day}`;
        if (isAppointmentDateAllowed(iso)) return iso;
        d.setDate(d.getDate() + 1);
    }
    return new Date().toISOString().slice(0, 10);
}
