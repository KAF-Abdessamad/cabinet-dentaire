import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import logo from '../img/logo-removebg-preview.png';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    const scrollToSection = (id) => {
        const el = document.getElementById(id);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
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

    return (
        <nav className="fixed w-full top-0 z-[100] bg-white/90 backdrop-blur-xl border-b border-slate-100/80 h-24 flex items-center shadow-sm shadow-slate-900/5">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                <div className="flex items-center justify-between h-full">
                    <Link to="/" className="flex items-center gap-4 text-slate-800 group" onClick={() => setIsOpen(false)}>
                        <div className="flex h-14 w-14 items-center justify-center rounded-[20px] bg-white shadow-lg shadow-slate-200 overflow-hidden transition-transform duration-300 group-hover:scale-105 border border-slate-50">
                            <img src={logo} alt="SmilePro Logo" className="h-full w-full object-contain p-2" />
                        </div>
                        <div>
                            <span className="block text-xl font-black tracking-tight leading-none">SmilePro</span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Cabinet Dentaire</span>
                        </div>
                    </Link>

                    <div className="hidden lg:flex items-center space-x-2">
                        <button
                            type="button"
                            onClick={goSection('home')}
                            className="px-5 py-3 text-sm font-black text-slate-600 hover:text-medical-600 hover:bg-slate-50 rounded-xl transition-all"
                        >
                            Accueil
                        </button>
                        <button
                            type="button"
                            onClick={goSection('services')}
                            className="px-5 py-3 text-sm font-black text-slate-600 hover:text-medical-600 hover:bg-slate-50 rounded-xl transition-all"
                        >
                            Services
                        </button>
                        <button
                            type="button"
                            onClick={goSection('contact')}
                            className="px-5 py-3 text-sm font-black text-slate-600 hover:text-medical-600 hover:bg-slate-50 rounded-xl transition-all"
                        >
                            Contact
                        </button>

                        <div className="w-px h-6 bg-slate-200 mx-4" />

                        <Link to="/login" className="px-6 py-3 text-sm font-black text-slate-600 hover:text-medical-600 transition-all flex items-center gap-2 group">
                            ESPACE PATIENT
                        </Link>
                        <Link
                            to="/admin/login"
                            className="ml-4 px-8 py-3.5 bg-slate-900 text-white text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-medical-600 transition-all shadow-xl shadow-slate-200 flex items-center gap-2 group"
                        >
                            ESPACE CABINET
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>

                    <button
                        type="button"
                        onClick={() => setIsOpen(!isOpen)}
                        className="lg:hidden p-3 rounded-2xl bg-slate-100 text-slate-600 transition-all"
                        aria-expanded={isOpen}
                        aria-label="Menu"
                    >
                        {isOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="lg:hidden absolute top-24 left-0 w-full bg-white border-b border-slate-100 overflow-hidden shadow-2xl z-[100]"
                    >
                        <div className="px-4 py-8 space-y-2">
                            <Link
                                to="/"
                                onClick={() => setIsOpen(false)}
                                className="block p-4 text-sm font-black text-slate-600 hover:bg-slate-50 rounded-2xl transition-all"
                            >
                                Accueil
                            </Link>
                            <button type="button" onClick={goSection('services')} className="block w-full text-left p-4 text-sm font-black text-slate-600 hover:bg-slate-50 rounded-2xl transition-all">
                                Services
                            </button>
                            <button type="button" onClick={goSection('contact')} className="block w-full text-left p-4 text-sm font-black text-slate-600 hover:bg-slate-50 rounded-2xl transition-all">
                                Contact
                            </button>
                            <div className="h-px bg-slate-100 mx-2 my-2" />
                            <Link to="/login" onClick={() => setIsOpen(false)} className="block p-4 text-sm font-black text-slate-600 hover:bg-slate-50 rounded-2xl transition-all uppercase tracking-widest">
                                Espace Patient
                            </Link>
                            <Link to="/admin/login" onClick={() => setIsOpen(false)} className="block p-6 bg-slate-900 text-white text-center text-xs font-black uppercase tracking-widest rounded-[24px] shadow-xl shadow-slate-200">
                                Espace Cabinet
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;
