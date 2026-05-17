import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, ArrowRight, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import logo from '../img/logo-removebg-preview.png';

const Navbar = ({ variant = 'default' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const isLanding = variant === 'landing';

    const scrollToSection = (id) => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const goSection = (id) => (e) => {
        e.preventDefault();
        setIsOpen(false);
        if (location.pathname === '/') {
            scrollToSection(id);
            return;
        }
        navigate('/');
        setTimeout(() => scrollToSection(id), 180);
    };

    const linkClass = isLanding
        ? 'px-5 py-3 text-sm font-semibold text-white/85 hover:text-white hover:bg-white/10 rounded-xl transition-all'
        : 'px-5 py-3 text-sm font-bold text-slate-600 hover:text-dp-secondary hover:bg-slate-50 rounded-xl transition-all';

    return (
        <nav
            className={`fixed w-full top-0 z-[100] h-20 flex items-center transition-colors ${
                isLanding
                    ? 'bg-transparent border-b border-white/10'
                    : 'bg-white/90 backdrop-blur-xl border-b border-slate-100/80 shadow-sm shadow-slate-900/5'
            }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                <motion.div className="flex items-center justify-between h-full">
                    {!isLanding && (
                        <Link
                            to="/"
                            className="flex items-center gap-3 text-slate-800 group"
                            onClick={() => setIsOpen(false)}
                        >
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-md overflow-hidden border border-slate-50 group-hover:scale-105 transition-transform">
                                <img src={logo} alt="DentistPro" className="h-full w-full object-contain p-2" />
                            </div>
                            <div>
                                <span className="block text-lg font-display text-dp-primary leading-none">DentistPro</span>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                    Cabinet Dentaire
                                </span>
                            </div>
                        </Link>
                    )}
                    {isLanding && <motion.div className="w-32" aria-hidden />}

                    <div className="hidden lg:flex items-center space-x-1">
                        <button type="button" onClick={goSection('home')} className={linkClass}>
                            Accueil
                        </button>
                        <button type="button" onClick={goSection('services')} className={linkClass}>
                            Services
                        </button>
                        <button type="button" onClick={goSection('steps')} className={linkClass}>
                            Comment ça marche
                        </button>
                        <button type="button" onClick={goSection('contact')} className={linkClass}>
                            Contact
                        </button>

                        <div className={`w-px h-6 mx-3 ${isLanding ? 'bg-white/20' : 'bg-slate-200'}`} />

                        <Link
                            to="/login"
                            className={
                                isLanding
                                    ? 'px-5 py-2.5 text-sm font-bold text-white hover:bg-white/10 rounded-xl transition'
                                    : 'px-5 py-2.5 text-sm font-bold text-dp-primary hover:text-dp-secondary transition'
                            }
                        >
                            Espace Patient
                        </Link>
                        <Link
                            to="/admin/login"
                            className={`ml-2 inline-flex items-center gap-2 px-6 py-2.5 text-sm font-bold rounded-xl transition-all ${
                                isLanding
                                    ? 'bg-[#2E8B8B] text-white hover:bg-[#267575] shadow-lg'
                                    : 'bg-dp-primary text-white hover:bg-dp-primary-hover shadow-md'
                            }`}
                        >
                            {isLanding && <Lock className="h-4 w-4" aria-hidden />}
                            Connexion Staff
                            {!isLanding && <ArrowRight className="h-4 w-4" aria-hidden />}
                        </Link>
                    </div>

                    <button
                        type="button"
                        onClick={() => setIsOpen(!isOpen)}
                        className={`lg:hidden p-3 rounded-xl transition-all ${
                            isLanding ? 'bg-white/10 text-white' : 'bg-slate-100 text-slate-600'
                        }`}
                        aria-expanded={isOpen}
                        aria-label="Menu"
                    >
                        {isOpen ? <X size={22} /> : <Menu size={22} />}
                    </button>
                </motion.div>
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="lg:hidden absolute top-20 left-0 w-full bg-white border-b border-slate-100 overflow-hidden shadow-2xl z-[100]"
                    >
                        <div className="px-4 py-6 space-y-1">
                            <button
                                type="button"
                                onClick={goSection('home')}
                                className="block w-full text-left p-4 text-sm font-bold text-slate-700 hover:bg-slate-50 rounded-xl"
                            >
                                Accueil
                            </button>
                            <button
                                type="button"
                                onClick={goSection('services')}
                                className="block w-full text-left p-4 text-sm font-bold text-slate-700 hover:bg-slate-50 rounded-xl"
                            >
                                Services
                            </button>
                            <button
                                type="button"
                                onClick={goSection('steps')}
                                className="block w-full text-left p-4 text-sm font-bold text-slate-700 hover:bg-slate-50 rounded-xl"
                            >
                                Comment ça marche
                            </button>
                            <button
                                type="button"
                                onClick={goSection('contact')}
                                className="block w-full text-left p-4 text-sm font-bold text-slate-700 hover:bg-slate-50 rounded-xl"
                            >
                                Contact
                            </button>
                            <motion.div className="h-px bg-slate-100 my-2" />
                            <Link
                                to="/login"
                                onClick={() => setIsOpen(false)}
                                className="block p-4 text-sm font-bold text-dp-primary rounded-xl hover:bg-slate-50"
                            >
                                Espace Patient
                            </Link>
                            <Link
                                to="/admin/login"
                                onClick={() => setIsOpen(false)}
                                className="flex items-center justify-center gap-2 p-4 bg-dp-primary text-white text-sm font-bold rounded-xl"
                            >
                                <Lock className="h-4 w-4" />
                                Connexion Staff
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;
