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
import Contact from './Contact.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';
import NotificationSystem from './NotificationSystem.jsx';
import { useAuth } from '../hooks/useAuth.jsx';
import api from '../api.js';

import PatientShell from './PatientShell.jsx';
import Sidebar from './Sidebar.jsx';

// Layout component that wraps all protected routes
const AppLayout = () => {
    const { user } = useAuth();
    return (
        <div className="min-h-screen bg-slate-50 flex">
            <Sidebar user={user} />
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <div className="px-12 pt-6 flex justify-end">
                    <NotificationSystem />
                </div>
                <main className="flex-1 overflow-y-auto p-12">
                    <Outlet />
                </main>
            </div>
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
                <Route path="/contact" element={<Contact />} />
                
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
                        <Route path="/app/dashboard" element={<Navigate to="/app" replace />} />
                        <Route path="/app/patients" element={<PatientList />} />
                        <Route path="/app/appointments" element={<AppointmentCalendar />} />
                    </Route>
                </Route>
                
                {/* Global redirects */}
                <Route path="/admin/dashboard" element={<Navigate to="/app" replace />} />
                <Route path="/admin" element={<Navigate to="/app" replace />} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
};

export default App;
