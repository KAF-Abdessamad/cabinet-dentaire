import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api.js';
import logo from '../img/logo-removebg-preview.png';

const Login = () => {
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
            console.log('CSRF cookie set:', document.cookie.includes('XSRF-TOKEN'));
            
            // Attempt login via API
            console.log('Attempting login...');
            const response = await api.post('/api/login', {
                email,
                password
            });

            console.log('Login response:', response.data);
            
            if (response.status === 200) {
                // Redirect to patient dashboard on success
                window.location.href = '/patient/dashboard';
            }
        } catch (err) {
            console.error('Login error:', err);
            if (err.response?.status === 422) {
                setError('Email ou mot de passe incorrect');
            } else if (err.response?.status === 419) {
                setError('Erreur CSRF. Veuillez rafraîchir la page.');
            } else {
                setError('Une erreur est survenue. Veuillez réessayer.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Back to portal */}
                <Link to="/login" className="inline-flex items-center text-blue-900 hover:underline mb-6">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Retour à l'espace patient
                </Link>

                <div className="p-8 bg-white rounded-2xl shadow-xl">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-white border border-slate-100 rounded-full mb-4 shadow-sm overflow-hidden">
                            <img src={logo} alt="Logo" className="w-full h-full object-contain p-2" />
                        </div>
                        <h2 className="text-3xl font-bold text-blue-900 mb-2">Connexion Patient</h2>
                        <p className="text-blue-700">Accédez à votre espace personnel</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent"
                                placeholder="votre@email.com"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Mot de passe
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent"
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-900 text-white py-3 px-4 rounded-lg hover:bg-blue-800 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Connexion en cours...' : 'SE CONNECTER'}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-gray-600 text-sm">
                            Pas encore de compte ?{' '}
                            <Link to="/register" className="text-blue-900 hover:underline font-medium">
                                Créer un compte
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
