import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './components/App.jsx';
import './css/app.css';

const container = document.getElementById('root');

if (container) {
    const root = createRoot(container);
    root.render(<App />);
}
