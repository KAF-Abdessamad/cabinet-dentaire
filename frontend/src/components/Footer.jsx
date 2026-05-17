import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Clock, ShieldCheck } from 'lucide-react';
import logo from '../img/logo-removebg-preview.png';

const Footer = () => {
    const scrollTo = (id) => (e) => {
        e.preventDefault();
        if (window.location.pathname === '/') {
            document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <footer id="contact" className="relative bg-[#0F2347] text-white pt-20 pb-10 scroll-mt-28">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-dp-secondary to-[#2E8B8B]" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                    {/* Marque */}
                    <div className="space-y-6">
                        <Link to="/" className="flex items-center gap-3 group">
                            <div className="h-14 w-14 rounded-2xl bg-white flex items-center justify-center overflow-hidden shadow-lg group-hover:scale-105 transition-transform">
                                <img src={logo} alt="DentistPro" className="h-full w-full object-contain p-2" />
                            </div>
                            <div>
                                <span className="block font-display text-xl text-white">DentistPro</span>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-[#7ec8c8]">
                                    Cabinet Dentaire
                                </span>
                            </div>
                        </Link>
                        <p className="text-white/65 text-sm leading-relaxed">
                            Cabinet dentaire multidisciplinaire à Casablanca. Soins de qualité, parcours patient
                            numérique et accompagnement personnalisé.
                        </p>
                    </div>

                    {/* Liens utiles */}
                    <div>
                        <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#7ec8c8] mb-6">Liens utiles</h3>
                        <ul className="space-y-3 text-sm">
                            <li>
                                <Link to="/login" className="text-white/70 hover:text-white font-medium transition">
                                    Espace Patient
                                </Link>
                            </li>
                            <li>
                                <Link to="/register" className="text-white/70 hover:text-white font-medium transition">
                                    Créer un compte
                                </Link>
                            </li>
                            <li>
                                <Link to="/admin/login" className="text-white/70 hover:text-white font-medium transition">
                                    Connexion Staff
                                </Link>
                            </li>
                            <li>
                                <Link to="/contact" className="text-white/70 hover:text-white font-medium transition">
                                    Formulaire de contact
                                </Link>
                            </li>
                            <li>
                                <a href="#services" onClick={scrollTo('services')} className="text-white/70 hover:text-white font-medium transition">
                                    Nos services
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Horaires */}
                    <div>
                        <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#7ec8c8] mb-6 flex items-center gap-2">
                            <Clock className="h-4 w-4" aria-hidden />
                            Horaires d&apos;ouverture
                        </h3>
                        <ul className="space-y-3 text-sm text-white/75">
                            <li className="flex justify-between gap-4">
                                <span>Lundi – Vendredi</span>
                                <span className="font-semibold text-white">9h00 – 18h00</span>
                            </li>
                            <li className="flex justify-between gap-4">
                                <span>Samedi</span>
                                <span className="font-semibold text-white">9h00 – 13h00</span>
                            </li>
                            <li className="flex justify-between gap-4">
                                <span>Dimanche</span>
                                <span className="font-semibold text-dp-danger/90">Fermé</span>
                            </li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#7ec8c8] mb-6">Nous contacter</h3>
                        <ul className="space-y-4 text-sm">
                            <li className="flex items-start gap-3 text-white/75">
                                <MapPin className="h-5 w-5 text-dp-secondary shrink-0 mt-0.5" aria-hidden />
                                <span>
                                    123 Boulevard Mohammed V
                                    <br />
                                    Casablanca, Maroc
                                </span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Phone className="h-5 w-5 text-dp-secondary shrink-0" aria-hidden />
                                <a href="tel:+212522000000" className="text-white/75 hover:text-white font-medium">
                                    +212 5 22 00 00 00
                                </a>
                            </li>
                            <li className="flex items-center gap-3">
                                <Mail className="h-5 w-5 text-dp-secondary shrink-0" aria-hidden />
                                <a href="mailto:contact@dentistpro.ma" className="text-white/75 hover:text-white font-medium">
                                    contact@dentistpro.ma
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-2 text-white/50 text-xs">
                        <ShieldCheck className="h-4 w-4 text-dp-secondary" aria-hidden />
                        <span>Établissement de santé agréé — données patients protégées</span>
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">
                        © {new Date().getFullYear()} DentistPro. Tous droits réservés.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
