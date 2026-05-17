/**
 * DentistPro Design System — tokens (couleurs, typo, ombres, rayons, espacements)
 */

export const colors = {
    primary: '#1B3A6B',
    primaryHover: '#152E56',
    primaryActive: '#0F2240',
    secondary: '#2E8B8B',
    secondaryHover: '#267575',
    accent: '#E8F4F8',
    success: '#22C55E',
    successMuted: '#DCFCE7',
    danger: '#EF4444',
    dangerMuted: '#FEE2E2',
    warning: '#F59E0B',
    warningMuted: '#FEF3C7',
    info: '#3B82F6',
    infoMuted: '#DBEAFE',
    background: '#F0F4F8',
    white: '#FFFFFF',
    neutral: {
        50: '#F8FAFC',
        100: '#F1F5F9',
        200: '#E2E8F0',
        300: '#CBD5E1',
        400: '#94A3B8',
        500: '#64748B',
        600: '#475569',
        700: '#334155',
        800: '#1E293B',
        900: '#0F172A',
    },
};

export const typography = {
    fontDisplay: '"DM Serif Display", "Playfair Display", Georgia, serif',
    fontSans: '"DM Sans", system-ui, sans-serif',
    fontMono: '"JetBrains Mono", ui-monospace, monospace',
    sizes: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
    },
    lineHeight: {
        tight: 1.2,
        snug: 1.375,
        normal: 1.5,
        relaxed: 1.625,
    },
};

export const shadows = {
    sm: '0 1px 2px 0 rgb(27 58 107 / 0.05)',
    md: '0 4px 6px -1px rgb(27 58 107 / 0.08), 0 2px 4px -2px rgb(27 58 107 / 0.06)',
    lg: '0 10px 15px -3px rgb(27 58 107 / 0.1), 0 4px 6px -4px rgb(27 58 107 / 0.08)',
    xl: '0 20px 25px -5px rgb(27 58 107 / 0.12), 0 8px 10px -6px rgb(27 58 107 / 0.08)',
    card: '0 4px 24px -4px rgb(27 58 107 / 0.12), 0 0 0 1px rgb(27 58 107 / 0.04)',
    cardHover: '0 12px 32px -8px rgb(27 58 107 / 0.18), 0 0 0 1px rgb(46 139 139 / 0.12)',
};

export const radius = {
    sm: '0.375rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
    '2xl': '1.25rem',
    full: '9999px',
};

export const spacing = {
    0: '0',
    1: '0.25rem',
    2: '0.5rem',
    3: '0.75rem',
    4: '1rem',
    5: '1.25rem',
    6: '1.5rem',
    8: '2rem',
    10: '2.5rem',
    12: '3rem',
    16: '4rem',
};

export const motion = {
    fast: '150ms',
    base: '250ms',
    slow: '350ms',
    easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
};

/** Statuts métier RDV / factures */
export const statusTokens = {
    requested: { label: 'En attente', variant: 'warning' },
    proposed: { label: 'Proposé', variant: 'info' },
    confirmed: { label: 'Confirmé', variant: 'success' },
    completed: { label: 'Terminé', variant: 'neutral' },
    cancelled: { label: 'Annulé', variant: 'danger' },
    paid: { label: 'Payé', variant: 'success' },
    unpaid: { label: 'Impayé', variant: 'danger' },
    partially_paid: { label: 'Partiel', variant: 'warning' },
    pending: { label: 'En attente', variant: 'warning' },
};

export const tokens = {
    colors,
    typography,
    shadows,
    radius,
    spacing,
    motion,
    statusTokens,
};

/** Variables CSS injectables dans :root */
export const cssVariables = `
:root {
  --dp-primary: ${colors.primary};
  --dp-primary-hover: ${colors.primaryHover};
  --dp-secondary: ${colors.secondary};
  --dp-accent: ${colors.accent};
  --dp-success: ${colors.success};
  --dp-danger: ${colors.danger};
  --dp-warning: ${colors.warning};
  --dp-info: ${colors.info};
  --dp-bg: ${colors.background};
  --dp-white: ${colors.white};
  --dp-neutral-50: ${colors.neutral[50]};
  --dp-neutral-100: ${colors.neutral[100]};
  --dp-neutral-200: ${colors.neutral[200]};
  --dp-neutral-300: ${colors.neutral[300]};
  --dp-neutral-400: ${colors.neutral[400]};
  --dp-neutral-500: ${colors.neutral[500]};
  --dp-neutral-600: ${colors.neutral[600]};
  --dp-neutral-700: ${colors.neutral[700]};
  --dp-neutral-800: ${colors.neutral[800]};
  --dp-neutral-900: ${colors.neutral[900]};
  --dp-font-display: ${typography.fontDisplay};
  --dp-font-sans: ${typography.fontSans};
  --dp-font-mono: ${typography.fontMono};
  --dp-shadow-card: ${shadows.card};
  --dp-shadow-card-hover: ${shadows.cardHover};
  --dp-radius-lg: ${radius.lg};
  --dp-motion-base: ${motion.base};
  --dp-motion-easing: ${motion.easing};
}
`;

export default tokens;
