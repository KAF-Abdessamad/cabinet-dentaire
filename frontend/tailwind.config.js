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
                    primary: '#38bdf8',
                    dark: '#0284c7',
                    deeper: '#0369a1',
                    secondary: '#22d3ee',
                    muted: '#7dd3fc',
                    soft: '#f0f9ff',
                    surface: '#e0f2fe',
                    blue: '#0891b2',
                    teal: '#0d9488',
                    green: '#059669',
                    light: '#e0f2fe',
                }
            },
            fontFamily: {
                sans: ['Figtree', ...defaultTheme.fontFamily.sans],
            },
        },
    },

    plugins: [],
};
