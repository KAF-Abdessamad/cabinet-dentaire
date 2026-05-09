import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Header from './Header.jsx';
import PatientDashboard from './PatientDashboard.jsx';
import Login from './Login.jsx';
import Register from './Register.jsx';
import PatientPortal from './PatientPortal.jsx';
import LandingPage from './LandingPage.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';
import api from '../api.js';

// Layout component that wraps all protected routes
const AppLayout = ({ user }) => {
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
    const [user, setUser] = useState(null);
    const [userRole, setUserRole] = useState(null);

    // Don't fetch user info automatically - let ProtectedRoute handle auth
    // This prevents 401 errors on public pages

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
                    <Route element={<AppLayout user={user} />}>
                        <Route path="/patient/dashboard" element={<PatientDashboard />} />
                    </Route>
                </Route>
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
};

export default App;
