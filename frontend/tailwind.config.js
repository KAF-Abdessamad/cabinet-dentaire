import defaultTheme from 'tailwindcss/defaultTheme';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './src/**/*.{js,jsx,ts,tsx}',
        './index.html',
    ],

    theme: {
        extend: {
            colors: {
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
                }
            },
            fontFamily: {
                sans: ['Figtree', ...defaultTheme.fontFamily.sans],
            },
        },
    },

    plugins: [],
};
