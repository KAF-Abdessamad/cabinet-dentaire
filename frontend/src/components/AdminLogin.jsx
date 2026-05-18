import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api.js';
import { ArrowLeft, ShieldCheck, Mail, Lock, Loader2, ChevronRight, AlertCircle, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';
import logo from '../img/logo-removebg-preview.png';

const AdminLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    // Security & Attempt limiter state
    const [attempts, setAttempts] = useState(0);
    const [lockTimeLeft, setLockTimeLeft] = useState(0);
    
    const navigate = useNavigate();

    // Lock Timer Countdown logic
    useEffect(() => {
        if (lockTimeLeft > 0) {
            const timer = setInterval(() => {
                setLockTimeLeft(prev => {
                    if (prev <= 1) {
                        setAttempts(0);
                        setError('');
                        clearInterval(timer);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [lockTimeLeft]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Block submit if locked
        if (lockTimeLeft > 0) {
            return;
        }

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
                const userData = response.data.user;
                if (userData.role === 'admin' || userData.role === 'dentiste' || userData.role === 'assistant') {
                    // Reset security attempts on success
                    setAttempts(0);
                    // Redirect to React admin dashboard
                    setTimeout(() => {
                        window.location.href = '/app';
                    }, 500);
                } else {
                    handleFailedAttempt('Accès refusé. Vous n\'avez pas les droits administrateur.');
                }
            }
        } catch (err) {
            console.error('Login error:', err);
            let errMsg = 'Une erreur est survenue. Veuillez réessayer.';
            
            if (err.response?.status === 422) {
                errMsg = 'Email ou mot de passe incorrect';
            } else if (err.response?.status === 419) {
                errMsg = 'Erreur CSRF. Veuillez rafraîchir la page.';
            } else if (err.response?.status === 403) {
                errMsg = 'Accès refusé. Vous n\'avez pas les droits administrateur.';
            }
            
            handleFailedAttempt(errMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleFailedAttempt = (message) => {
        setAttempts(prev => {
            const nextAttempts = prev + 1;
            if (nextAttempts >= 5) {
                setLockTimeLeft(60); // Block for 60 seconds
                setError('Trop de tentatives infructueuses. Le portail est temporairement bloqué.');
            } else {
                setError(`${message} (${nextAttempts}/5 tentatives)`);
            }
            return nextAttempts;
        });
    };

    return (
        <div className="min-h-screen bg-[#0A1628] flex items-center justify-center p-6 relative overflow-hidden">
            
            {/* Inline CSS styles for particles and geometric grid pulse */}
            <style dangerouslySetInnerHTML={{__html: `
                @keyframes float-particle-1 {
                    0% { transform: translateY(110vh) translateX(0); opacity: 0; }
                    25% { opacity: 0.5; }
                    50% { opacity: 0.8; }
                    75% { opacity: 0.5; }
                    100% { transform: translateY(-10vh) translateX(40px); opacity: 0; }
                }
                @keyframes float-particle-2 {
                    0% { transform: translateY(110vh) translateX(0); opacity: 0; }
                    30% { opacity: 0.6; }
                    60% { opacity: 0.9; }
                    80% { opacity: 0.4; }
                    100% { transform: translateY(-10vh) translateX(-60px); opacity: 0; }
                }
                @keyframes pulse-grid {
                    0%, 100% { opacity: 0.08; }
                    50% { opacity: 0.18; }
                }
                .admin-grid-bg {
                    background-size: 50px 50px;
                    background-image: 
                        linear-gradient(to right, rgba(59, 130, 246, 0.12) 1px, transparent 1px),
                        linear-gradient(to bottom, rgba(59, 130, 246, 0.12) 1px, transparent 1px);
                    animation: pulse-grid 6s ease-in-out infinite;
                }
            `}} />

            {/* Geometric Grid Background */}
            <div className="absolute inset-0 admin-grid-bg pointer-events-none z-0" />

            {/* Glowing Orbs Background */}
            <div className="absolute inset-0 pointer-events-none z-0 opacity-40">
                <div className="absolute -top-40 -left-40 w-[450px] h-[450px] bg-blue-600/35 rounded-full blur-[140px]" />
                <div className="absolute -bottom-40 -right-40 w-[450px] h-[450px] bg-indigo-600/35 rounded-full blur-[140px]" />
            </div>

            {/* Animated Particles System */}
            <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
                {[...Array(15)].map((_, i) => {
                    const size = Math.floor(Math.random() * 4) + 2; // 2px to 5px
                    const left = Math.floor(Math.random() * 100); // 0% to 100%
                    const duration = Math.floor(Math.random() * 15) + 15; // 15s to 30s
                    const delay = Math.floor(Math.random() * 10); // 0s to 10s
                    const anim = i % 2 === 0 ? 'float-particle-1' : 'float-particle-2';

                    return (
                        <div
                            key={i}
                            className="absolute rounded-full bg-blue-400/60"
                            style={{
                                width: `${size}px`,
                                height: `${size}px`,
                                left: `${left}%`,
                                bottom: '-20px',
                                animationName: anim,
                                animationDuration: `${duration}s`,
                                animationTimingFunction: 'linear',
                                animationIterationCount: 'infinite',
                                animationDelay: `${delay}s`,
                            }}
                        />
                    );
                })}
            </div>

            {/* Login Wrapper Card */}
            <div className="max-w-[450px] w-full relative z-10">
                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className="bg-[#0E1E36]/90 backdrop-blur-xl rounded-[24px] shadow-2xl shadow-black/70 p-8 sm:p-10 border border-blue-900/30"
                >
                    {/* Header Details */}
                    <div className="text-center mb-8 flex flex-col items-center">
                        
                        {/* Logo Container with Rotational Hover Effect */}
                        <motion.div 
                            whileHover={{ rotate: 12, scale: 1.05 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                            className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-[20px] mb-5 shadow-lg shadow-blue-950/40 overflow-hidden border border-blue-900/20 p-2 cursor-pointer"
                        >
                            <img src={logo} alt="DentistPro Logo" className="w-full h-full object-contain" />
                        </motion.div>
                        
                        <h1 className="text-2xl font-black text-white tracking-tight mb-2 uppercase">
                            Espace Cabinet
                        </h1>

                        {/* Pill styled tag badge */}
                        <div className="px-3.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest text-blue-400 bg-blue-500/10 border border-blue-500/25 shadow-sm mt-1">
                            Portail Professionnel
                        </div>

                        {/* Fine decorative gradient line separator */}
                        <div className="w-16 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full mt-4" />
                    </div>

                    {/* Security or input Error alerts */}
                    {error && (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className={`mb-6 p-4 rounded-xl text-xs font-bold flex items-center gap-3 border ${
                                lockTimeLeft > 0 
                                    ? 'bg-red-500/10 border-red-500/20 text-red-400' 
                                    : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                            }`}
                        >
                            {lockTimeLeft > 0 ? (
                                <ShieldAlert className="w-5 h-5 shrink-0 text-red-500" />
                            ) : (
                                <AlertCircle className="w-5 h-5 shrink-0 text-amber-500" />
                            )}
                            <div className="flex-1">
                                {error}
                                {lockTimeLeft > 0 && (
                                    <span className="block mt-1 font-black text-[10px] uppercase text-red-500 animate-pulse">
                                        Déblocage dans : {lockTimeLeft} secondes
                                    </span>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {/* Standard Login Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        
                        {/* Professional Email input field */}
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                Identifiant Professionnel
                            </label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    disabled={lockTimeLeft > 0}
                                    className="w-full pl-12 pr-5 py-4 bg-slate-950/40 border border-slate-800 rounded-xl text-white font-semibold focus:bg-slate-900/60 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none disabled:opacity-30 placeholder:text-slate-600"
                                    placeholder="dentiste@dentistpro.com"
                                />
                            </div>
                        </div>

                        {/* Password input field */}
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                Mot de passe
                            </label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    disabled={lockTimeLeft > 0}
                                    className="w-full pl-12 pr-5 py-4 bg-slate-950/40 border border-slate-800 rounded-xl text-white font-semibold focus:bg-slate-900/60 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none disabled:opacity-30 placeholder:text-slate-600"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        {/* Submit button */}
                        <button
                            type="submit"
                            disabled={loading || lockTimeLeft > 0}
                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white py-4.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 active:scale-[0.98] flex items-center justify-center gap-3 group disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    <span>ACCÉDER AU CABINET</span>
                                    <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Secure badge & Attempt logger */}
                    <div className="mt-5 space-y-2 text-center">
                        <div className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full shadow-sm">
                            <span>🔒</span> Connexion sécurisée
                        </div>
                        
                        {attempts > 0 && lockTimeLeft === 0 && (
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                Tentatives restantes : {5 - attempts} / 5
                            </p>
                        )}
                    </div>

                    {/* Back to public link */}
                    <div className="mt-8 text-center pt-5 border-t border-blue-950/40">
                        <Link to="/" className="inline-flex items-center text-slate-400 hover:text-slate-200 font-bold text-[10px] uppercase tracking-widest transition-colors">
                            <ArrowLeft className="w-3.5 h-3.5 mr-2" />
                            Retour au portail public
                        </Link>
                    </div>
                </motion.div>
                
                {/* Application version footer */}
                <div className="text-center mt-6 space-y-1">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-600">
                        &copy; 2026 DentistPro · SYSTÈME DE GESTION CLINIQUE
                    </p>
                    <p className="text-[8px] font-bold text-slate-700 uppercase tracking-wider">
                        Version 2.4.0-Enterprise
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
