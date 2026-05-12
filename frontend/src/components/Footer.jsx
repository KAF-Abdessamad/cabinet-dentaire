import React from 'react';
import { Link } from 'react-router-dom';
import { Smile, Mail, Phone, MapPin, ShieldCheck, Globe, MessageCircle, ExternalLink } from 'lucide-react';
import logo from '../img/logo-removebg-preview.png';

const Footer = () => {
    return (
        <footer className="bg-slate-900 text-white pt-24 pb-12 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-medical-500 to-indigo-600" />
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-16 mb-20">
                    {/* Brand */}
                    <div className="lg:col-span-1 space-y-8">
                        <Link to="/" className="flex items-center gap-4 group">
                            <div className="flex h-14 w-14 items-center justify-center rounded-[20px] bg-white shadow-lg overflow-hidden border border-white/10 transition-transform duration-300 group-hover:scale-105">
                                <img src={logo} alt="SmilePro Logo" className="h-full w-full object-contain p-2" />
                            </div>
                            <div>
                                <span className="block text-2xl font-black tracking-tight leading-none">SmilePro</span>
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Clinique Dentaire</span>
                            </div>
                        </Link>
                        <p className="text-slate-400 font-medium leading-relaxed">
                            Offrir des soins dentaires d'exception avec une approche personnalisée et technologique. Votre sourire est notre engagement quotidien.
                        </p>
                        <div className="flex gap-4">
                            {[Globe, MessageCircle, ExternalLink].map((Icon, i) => (
                                <a key={i} href="#" className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 hover:bg-medical-600 hover:text-white transition-all">
                                    <Icon size={18} />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-medical-500 mb-8">Navigation</h3>
                        <ul className="space-y-4">
                            {['Accueil', 'Nos Services', 'L\'Équipe', 'Contact'].map((item) => (
                                <li key={item}>
                                    <a href="#" className="text-slate-400 hover:text-white font-bold transition-colors">{item}</a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Services */}
                    <div>
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-medical-500 mb-8">Spécialités</h3>
                        <ul className="space-y-4">
                            {['Implantologie', 'Esthétique', 'Orthodontie', 'Parodontie'].map((item) => (
                                <li key={item}>
                                    <a href="#" className="text-slate-400 hover:text-white font-bold transition-colors">{item}</a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-8">
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-medical-500 mb-8">Nous Trouver</h3>
                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-medical-500 shrink-0">
                                    <MapPin size={18} />
                                </div>
                                <p className="text-slate-400 font-bold text-sm">123 Boulevard Mohammed V, Casablanca, Maroc</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-medical-500 shrink-0">
                                    <Phone size={18} />
                                </div>
                                <p className="text-slate-400 font-bold text-sm">+212 5 22 00 00 00</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-medical-500 shrink-0">
                                    <Mail size={18} />
                                </div>
                                <p className="text-slate-400 font-bold text-sm">contact@smilepro.ma</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-3">
                        <ShieldCheck className="text-medical-500" size={20} />
                        <p className="text-xs font-black text-slate-500 uppercase tracking-widest">
                            SmilePro — Établissement de Santé Agréé
                        </p>
                    </div>
                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">
                        © 2026 SMILEPRO CLINIC. TOUS DROITS RÉSERVÉS.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
