import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import { ArrowLeft, Smile, Mail, Lock, Loader2, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = await login(email, password);
            
            if (result.success) {
                navigate('/patient/dashboard', { replace: true });
            } else {
                setError(result.error || 'Email ou mot de passe incorrect');
            }
        } catch (err) {
            console.error('Login error:', err);
            setError('Une erreur est survenue. Veuillez réessayer.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
            {/* Left Side - Visual */}
            <div className="hidden lg:flex lg:w-1/2 bg-medical-600 relative overflow-hidden items-center justify-center p-12">
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10">
                    <Smile className="absolute -top-20 -left-20 w-[600px] h-[600px] text-white rotate-12" />
                </div>
                <div className="relative z-10 max-w-lg text-center">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white/10 backdrop-blur-lg border border-white/20 p-12 rounded-[40px] shadow-2xl"
                    >
                        <Smile className="w-20 h-20 text-white mx-auto mb-8" strokeWidth={2.5} />
                        <h2 className="text-4xl font-black text-white mb-6 leading-tight">Bienvenue dans votre Espace Santé</h2>
                        <p className="text-white/80 font-bold leading-relaxed">
                            Gérez vos rendez-vous, consultez votre historique et communiquez avec votre cabinet en toute simplicité.
                        </p>
                    </motion.div>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-white">
                <div className="w-full max-w-md">
                    <Link to="/" className="inline-flex items-center text-slate-400 hover:text-medical-600 font-black text-xs uppercase tracking-widest mb-12 transition-colors group">
                        <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                        Retour au site
                    </Link>

                    <div className="mb-12">
                        <h1 className="text-4xl font-black text-slate-800 tracking-tight mb-3">Connexion</h1>
                        <p className="text-slate-400 font-bold italic">Accédez à votre espace patient sécurisé.</p>
                    </div>

                    {error && (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="mb-8 p-5 bg-red-50 border border-red-100 text-red-700 rounded-2xl text-sm font-bold flex items-center gap-3"
                        >
                            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                                !
                            </div>
                            {error}
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                Adresse Email
                            </label>
                            <div className="relative group">
                                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-medical-600 transition-colors" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full pl-14 pr-6 py-5 bg-slate-50 border border-slate-100 rounded-[20px] text-slate-700 font-bold focus:bg-white focus:ring-4 focus:ring-medical-500/10 focus:border-medical-500 transition-all outline-none"
                                    placeholder="patient@exemple.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center ml-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    Mot de passe
                                </label>
                                <a href="#" className="text-[10px] font-black text-medical-600 uppercase tracking-widest hover:underline">Oublié ?</a>
                            </div>
                            <div className="relative group">
                                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-medical-600 transition-colors" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="w-full pl-14 pr-6 py-5 bg-slate-50 border border-slate-100 rounded-[20px] text-slate-700 font-bold focus:bg-white focus:ring-4 focus:ring-medical-500/10 focus:border-medical-500 transition-all outline-none"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-slate-900 text-white py-5 rounded-[20px] font-black text-xs uppercase tracking-widest hover:bg-medical-600 transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-3 group disabled:opacity-50"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    <span>SE CONNECTER</span>
                                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-12 pt-8 border-t border-slate-50 text-center">
                        <p className="text-slate-400 text-sm font-bold">
                            Pas encore de compte ?{' '}
                            <Link to="/register" className="text-medical-600 hover:underline">
                                Créer un profil patient
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );};

export default Login;
