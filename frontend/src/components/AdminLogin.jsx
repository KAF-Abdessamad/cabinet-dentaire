import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api.js';
import { ArrowLeft, ShieldCheck, Mail, Lock, Loader2, ChevronRight, Smile } from 'lucide-react';
import { motion } from 'framer-motion';
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
                    // Redirect to React admin dashboard
                    setTimeout(() => {
                        window.location.href = '/app';
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
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20 pointer-events-none">
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-medical-600 rounded-full blur-[120px]" />
                <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-600 rounded-full blur-[120px]" />
            </div>

            <div className="max-w-md w-full relative z-10">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-[40px] shadow-2xl p-10 border border-white/10"
                >
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center justify-center w-24 h-24 bg-white rounded-[24px] mb-6 shadow-xl shadow-slate-200 overflow-hidden border border-slate-50">
                            <img src={logo} alt="SmilePro" className="w-full h-full object-contain p-2" />
                        </div>
                        <h1 className="text-3xl font-black text-slate-800 tracking-tight mb-2">
                            Espace Cabinet
                        </h1>
                        <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">
                            Portail Professionnel
                        </p>
                    </div>

                    {error && (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="mb-8 p-4 bg-red-50 border border-red-100 text-red-700 rounded-2xl text-xs font-bold flex items-center gap-3"
                        >
                            <ShieldCheck className="w-5 h-5 shrink-0" />
                            {error}
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                Identifiant Professionnel
                            </label>
                            <div className="relative group">
                                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-blue-600 transition-colors" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full pl-14 pr-6 py-5 bg-slate-50 border border-slate-100 rounded-[20px] text-slate-700 font-bold focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none"
                                    placeholder="admin@smilepro.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                Mot de passe
                            </label>
                            <div className="relative group">
                                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-blue-600 transition-colors" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="w-full pl-14 pr-6 py-5 bg-slate-50 border border-slate-100 rounded-[20px] text-slate-700 font-bold focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-slate-900 text-white py-5 rounded-[20px] font-black text-xs uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-3 group disabled:opacity-50"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    <span>ACCÉDER AU CABINET</span>
                                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-10 text-center">
                        <Link to="/" className="inline-flex items-center text-slate-400 hover:text-slate-600 font-black text-[10px] uppercase tracking-widest transition-colors">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Retour au portail public
                        </Link>
                    </div>
                </motion.div>
                
                <p className="text-center mt-8 text-slate-500 text-[10px] font-bold uppercase tracking-widest opacity-50">
                    &copy; 2026 SMILEPRO — SYSTÈME DE GESTION CLINIQUE
                </p>
            </div>
        </div>
    );
};

export default AdminLogin;
