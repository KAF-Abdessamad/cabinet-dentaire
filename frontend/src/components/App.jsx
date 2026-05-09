import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { AuthProvider } from '../hooks/useAuth.js';
import PatientShell from './PatientShell.jsx';
import PatientDashboard from './PatientDashboard.jsx';
import Login from './Login.jsx';
import Register from './Register.jsx';
import PatientPortal from './PatientPortal.jsx';
import LandingPage from './LandingPage.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';

const PageTransition = ({ children }) => (
    <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
    >
        {children}
    </motion.div>
);

const AnimatedRoutes = () => {
    const location = useLocation();
    return (
        <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
                {/* Landing page */}
                <Route path="/" element={<PageTransition><LandingPage /></PageTransition>} />
                
                {/* Public routes */}
                <Route path="/login" element={<PageTransition><PatientPortal /></PageTransition>} />
                <Route path="/login/auth" element={<PageTransition><Login /></PageTransition>} />
                <Route path="/register" element={<PageTransition><Register /></PageTransition>} />
                
                {/* Patient routes */}
                <Route element={<ProtectedRoute />}>
                    <Route
                        element={
                            <PatientShell>
                                <Outlet />
                            </PatientShell>
                        }
                    >
                        <Route path="/patient/dashboard" element={<PageTransition><PatientDashboard /></PageTransition>} />
                    </Route>
                </Route>
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </AnimatePresence>
    );
};

const App = () => {
    return (
        <AuthProvider>
            <BrowserRouter>
                <AnimatedRoutes />
            </BrowserRouter>
        </AuthProvider>
    );
};

export default App;
