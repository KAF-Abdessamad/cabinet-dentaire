import defaultTheme from 'tailwindcss/defaultTheme';

/** @type {import('tailwindcss').Config} */
export default {
    content: ['./src/**/*.{js,jsx,ts,tsx}', './index.html'],

    theme: {
        extend: {
            colors: {
                dp: {
                    primary: '#1B3A6B',
                    'primary-hover': '#152E56',
                    'primary-active': '#0F2240',
                    secondary: '#2E8B8B',
                    accent: '#E8F4F8',
                    success: '#22C55E',
                    danger: '#EF4444',
                    warning: '#F59E0B',
                    info: '#3B82F6',
                    bg: '#F0F4F8',
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
                },
                medical: {
                    50: '#f0f9ff',
                    100: '#e0f2fe',
                    200: '#bae6fd',
                    300: '#7dd3fc',
                    400: '#38bdf8',
                    500: '#0ea5e9',
                    600: '#0284c7',
                    700: '#0369a1',
                    800: '#075985',
                    900: '#0c4a6e',
                },
                dentist: {
                    primary: '#0ea5e9',
                    secondary: '#6366f1',
                    accent: '#f59e0b',
                    success: '#10b981',
                    danger: '#ef4444',
                    warning: '#f59e0b',
                    info: '#3b82f6',
                    dark: '#0f172a',
                    slate: '#1e293b',
                    muted: '#64748b',
                    soft: '#f8fafc',
                    surface: '#ffffff',
                    border: '#e2e8f0',
                },
            },
            fontFamily: {
                sans: ['"DM Sans"', ...defaultTheme.fontFamily.sans],
                display: ['"Playfair Display"', '"DM Serif Display"', 'Georgia', 'serif'],
                mono: ['"JetBrains Mono"', ...defaultTheme.fontFamily.mono],
            },
            borderRadius: {
                'dp-sm': '0.375rem',
                'dp-md': '0.5rem',
                'dp-lg': '0.75rem',
                'dp-xl': '1rem',
                'dp-2xl': '1.25rem',
                'dp-full': '9999px',
            },
            boxShadow: {
                'dp-sm': '0 1px 2px 0 rgb(27 58 107 / 0.05)',
                'dp-md': '0 4px 6px -1px rgb(27 58 107 / 0.08), 0 2px 4px -2px rgb(27 58 107 / 0.06)',
                'dp-lg': '0 10px 15px -3px rgb(27 58 107 / 0.1), 0 4px 6px -4px rgb(27 58 107 / 0.08)',
                'dp-xl': '0 20px 25px -5px rgb(27 58 107 / 0.12), 0 8px 10px -6px rgb(27 58 107 / 0.08)',
                'dp-card':
                    '0 4px 24px -4px rgb(27 58 107 / 0.12), 0 0 0 1px rgb(27 58 107 / 0.04)',
                'dp-card-hover':
                    '0 12px 32px -8px rgb(27 58 107 / 0.18), 0 0 0 1px rgb(46 139 139 / 0.12)',
            },
            transitionDuration: {
                'dp-fast': '150ms',
                'dp-base': '250ms',
                'dp-slow': '350ms',
            },
            transitionTimingFunction: {
                dp: 'cubic-bezier(0.22, 1, 0.36, 1)',
            },
        },
    },

    plugins: [],
};
