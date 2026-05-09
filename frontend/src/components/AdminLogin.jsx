import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api.js';
import logo from '../img/logo-removebg-preview.png';

const AdminLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Get CSRF cookie first from backend
            console.log('Getting CSRF cookie...');
            await api.get('/sanctum/csrf-cookie');
            
            // Attempt login via API
            console.log('Attempting admin login...');
            const response = await api.post('/api/admin/login', {
                email,
                password
            });

            console.log('Login response:', response.data);
            
            if (response.status === 200) {
                // Check if user has admin role
                const userData = response.data.user;
                if (userData.role === 'admin' || userData.role === 'dentiste' || userData.role === 'assistant') {
                    // Force a small delay to ensure session is written
                    setTimeout(() => {
                        window.location.href = '/admin/dashboard';
                    }, 500);
                } else {
                    setError('Accès refusé. Vous n\'avez pas les droits administrateur.');
                }
            }
        } catch (err) {
            console.error('Login error:', err);
            if (err.response?.status === 422) {
                setError('Email ou mot de passe incorrect');
            } else if (err.response?.status === 419) {
                setError('Erreur CSRF. Veuillez rafraîchir la page.');
            } else if (err.response?.status === 403) {
                setError('Accès refusé. Vous n\'avez pas les droits administrateur.');
            } else {
                setError('Une erreur est survenue. Veuillez réessayer.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                {/* Back to home */}
                <Link to="/" className="inline-flex items-center text-white hover:underline mb-6">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Retour à l'accueil
                </Link>

                <div className="bg-white rounded-3xl shadow-2xl p-8">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-white border border-slate-100 rounded-full mb-4 shadow-sm overflow-hidden">
                            <img src={logo} alt="Logo" className="w-full h-full object-contain p-2" />
                        </div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-700 to-indigo-800 bg-clip-text text-transparent mb-2">
                            Espace Cabinet
                        </h1>
                        <p className="text-gray-600 font-medium">
                            Connexion réservée au personnel
                        </p>
                    </div>

                    {error && (
                        <div className="bg-red-50 border-2 border-red-300 text-red-700 px-4 py-3 rounded-xl mb-6 animate-pulse">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Email
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                placeholder="admin@cabinet.com"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Mot de passe
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-4 px-4 rounded-xl hover:from-blue-700 hover:to-indigo-800 transition-all font-bold disabled:opacity-50 disabled:cursor-not-allowed text-lg shadow-lg hover:shadow-xl"
                        >
                            {loading ? 'Connexion en cours...' : 'SE CONNECTER'}
                        </button>
                    </form>

                    <div className="mt-8 text-center pt-6 border-t border-gray-200">
                        <p className="text-gray-600 text-sm">
                            Vous êtes patient ?{' '}
                            <Link to="/login" className="text-blue-600 hover:text-blue-700 font-semibold hover:underline">
                                Accès patient
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
