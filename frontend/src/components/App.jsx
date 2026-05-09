import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Header from './Header.jsx';
import Dashboard from './Dashboard.jsx';
import PatientList from './PatientList.jsx';
import AppointmentCalendar from './AppointmentCalendar.jsx';
import PatientDashboard from './PatientDashboard.jsx';
import Login from './Login.jsx';
import Register from './Register.jsx';
import AdminLogin from './AdminLogin.jsx';
import LandingPage from './LandingPage.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';
import { useAuth } from '../hooks/useAuth.jsx';
import api from '../api.js';

import PatientShell from './PatientShell.jsx';

// Layout component that wraps all protected routes
const AppLayout = () => {
    const { user } = useAuth();
    return (
        <div className="min-h-screen bg-dentist-soft">
            <Header user={user} />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Outlet />
            </main>
        </div>
    );
};

const App = () => {
    return (
        <BrowserRouter>
            <Routes>
                {/* Landing page */}
                <Route path="/" element={<LandingPage />} />
                
                {/* Public routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/admin/login" element={<AdminLogin />} />
                
                {/* Patient routes */}
                <Route element={<ProtectedRoute />}>
                    <Route element={<PatientShell><Outlet /></PatientShell>}>
                        <Route path="/patient/dashboard" element={<PatientDashboard />} />
                    </Route>
                </Route>
                
                {/* Admin/Dentist routes */}
                <Route element={<ProtectedRoute />}>
                    <Route element={<AppLayout />}>
                        <Route path="/app" element={<Dashboard />} />
                        <Route path="/app/patients" element={<PatientList />} />
                        <Route path="/app/appointments" element={<AppointmentCalendar />} />
                    </Route>
                </Route>
                
                {/* Admin dashboard redirect to Laravel */}
                <Route path="/admin/dashboard" element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
};

export default App;
