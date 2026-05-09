import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import PatientShell from './PatientShell.jsx';
import PatientDashboard from './PatientDashboard.jsx';
import Login from './Login.jsx';
import Register from './Register.jsx';
import PatientPortal from './PatientPortal.jsx';
import LandingPage from './LandingPage.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';

const App = () => {
    return (
        <BrowserRouter>
            <Routes>
                {/* Landing page */}
                <Route path="/" element={<LandingPage />} />
                
                {/* Public routes */}
                <Route path="/login" element={<PatientPortal />} />
                <Route path="/login/auth" element={<Login />} />
                <Route path="/register" element={<Register />} />
                
                {/* Patient routes */}
                <Route element={<ProtectedRoute />}>
                    <Route
                        element={
                            <PatientShell>
                                <Outlet />
                            </PatientShell>
                        }
                    >
                        <Route path="/patient/dashboard" element={<PatientDashboard />} />
                    </Route>
                </Route>
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
};

export default App;
