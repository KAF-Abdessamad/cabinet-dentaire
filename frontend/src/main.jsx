import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './components/App.jsx';
import { AuthProvider } from './hooks/useAuth.jsx';
import './css/app.css';
import { injectDesignSystemStyles } from './design-system.js';

injectDesignSystemStyles();

const container = document.getElementById('root');

if (container) {
    const root = createRoot(container);
    root.render(
        <AuthProvider>
            <App />
        </AuthProvider>
    );
}
