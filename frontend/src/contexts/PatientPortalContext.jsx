import React, { createContext, useContext } from 'react';
import { usePatientPortal } from '../hooks/usePatientPortal.js';

const PatientPortalContext = createContext(null);

export function PatientPortalProvider({ children }) {
    const value = usePatientPortal();
    return <PatientPortalContext.Provider value={value}>{children}</PatientPortalContext.Provider>;
}

export function usePatientPortalContext() {
    const ctx = useContext(PatientPortalContext);
    if (!ctx) throw new Error('usePatientPortalContext must be used within PatientPortalProvider');
    return ctx;
}

export default PatientPortalContext;
