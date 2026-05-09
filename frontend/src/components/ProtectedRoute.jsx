import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';

const ProtectedRoute = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-dentist-soft">
                <div className="text-center">
                    <div className="w-14 h-14 border-4 border-dentist-primary border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="mt-4 text-slate-600 font-medium">Chargement...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login/auth" replace />;
    }

    if (user.role && user.role !== 'patient') {
        window.location.href = '/admin/dashboard';
        return null;
    }

    return <Outlet />;
};

export default ProtectedRoute;
