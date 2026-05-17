import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Phone,
    Mail,
    MapPin,
    ChevronRight,
    Calendar,
    Shield,
    Clock,
    Stethoscope,
} from 'lucide-react';
import Navbar from './Navbar.jsx';
import Footer from './Footer.jsx';
import heroImg from '../img/Fotolia_61997183_Subscription_XXL-.jpg';
import cabinetImg from '../img/urgences-cab-dentaire_750.jpg';

const fadeInUp = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const LandingPage = () => {
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        setIsLoaded(true);
    }, []);

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 font-sans overflow-x-hidden">
            <Navbar />

            {/* Hero — seule grande photo #1 */}
            <section id="home" className="relative min-h-screen flex items-center pt-24 pb-16 scroll-mt-28">
                <div className="absolute inset-0 z-0">
                    <img src={heroImg} alt="" className="h-full w-full object-cover opacity-100" />
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-950/45 via-slate-900/35 to-medical-950/30" />
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                    <motion.div
                        initial="hidden"
                        animate={isLoaded ? 'visible' : 'hidden'}
                        variants={{
                            visible: { transition: { staggerChildren: 0.12 } },
                            hidden: {},
                        }}
                        className="max-w-3xl"
                    >
                        <motion.p
                            variants={fadeInUp}
                            className="text-xs font-black uppercase tracking-[0.25em] text-medical-400 mb-4"
                        >
                            Cabinet dentaire multidisciplinaire
                        </motion.p>
                        <motion.h1
                            variants={fadeInUp}
                            className="text-4xl sm:text-5xl md:text-6xl font-black leading-[1.08] tracking-tight text-white"
                        >
                            Soins dentaires modernes,{' '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-300 to-medical-400">
                                accueil humain
                            </span>
                        </motion.h1>
                        <motion.p
                            variants={fadeInUp}
                            className="mt-6 text-lg text-slate-300 leading-relaxed max-w-xl"
                        >
                            Prenez rendez-vous en ligne, suivez vos soins et échangez avec le cabinet depuis un espace
                            patient clair et sécurisé.
                        </motion.p>
                        <motion.div variants={fadeInUp} className="mt-10 flex flex-wrap gap-4">
                            <Link
                                to="/login"
                                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-white text-slate-900 font-black text-sm uppercase tracking-widest shadow-xl shadow-black/30 hover:bg-slate-100 transition"
                            >
                                <Calendar className="w-5 h-5" />
                                Espace patient
                            </Link>
                            <Link
                                to="/contact"
                                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl border border-white/20 text-white font-black text-sm uppercase tracking-widest hover:bg-white/10 transition"
                            >
                                Contact
                                <ChevronRight className="w-5 h-5" />
                            </Link>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* Bandeau infos — sans image externe */}
            <section className="relative z-20 border-y border-white/5 bg-slate-900/90 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-4 py-10 grid sm:grid-cols-3 gap-8 text-center sm:text-left">
                    {[
                        { icon: Shield, t: 'Hygiène & stérilisation', d: 'Protocoles stricts, matériel à jour.' },
                        { icon: Clock, t: 'Créneaux structurés', d: 'Agenda partagé cabinet / patient.' },
                        { icon: Stethoscope, t: 'Parcours de soin', d: 'Du détartrage à la réhabilitation.' },
                    ].map(({ icon: Icon, t, d }) => (
                        <div key={t} className="flex flex-col sm:flex-row items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-medical-500/20 flex items-center justify-center text-medical-300">
                                <Icon className="w-6 h-6" strokeWidth={2} />
                            </div>
                            <div>
                                <p className="font-black text-white text-sm">{t}</p>
                                <p className="text-slate-400 text-sm mt-1">{d}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Bloc cabinet — seule grande photo #2 */}
            <section id="services" className="py-20 lg:py-28 bg-slate-900 scroll-mt-28">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-14 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -24 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="relative rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl shadow-black/40"
                    >
                        <img src={cabinetImg} alt="" className="w-full h-[420px] lg:h-[520px] object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent" />
                        <p className="absolute bottom-6 left-6 right-6 text-sm font-bold text-white/90">
                            Équipements modernes et prise en charge coordonnée au sein du cabinet.
                        </p>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, x: 24 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight">
                            Un cabinet tourné vers la qualité
                        </h2>
                        <p className="mt-4 text-slate-400 leading-relaxed">
                            Nos praticiens utilisent un outil numérique commun : demandes de rendez-vous, propositions de
                            créneaux, confirmations patient et agenda cabinet synchronisés.
                        </p>
                        <ul className="mt-8 space-y-4">
                            {[
                                'Demandes en ligne traitées depuis l’espace cabinet',
                                'Rendez-vous « direct cabinet » pour les patients sans demande web',
                                'Planification : pas de RDV le dimanche ni les jours fériés (règle cabinet)',
                                'Notifications pour suivre l’activité au quotidien',
                            ].map((line) => (
                                <li key={line} className="flex gap-3 text-slate-300 text-sm font-medium">
                                    <span className="mt-1.5 h-2 w-2 rounded-full bg-medical-400 shrink-0" />
                                    {line}
                                </li>
                            ))}
                        </ul>
                        <Link
                            to="/admin/login"
                            className="inline-flex mt-10 items-center gap-2 text-medical-400 font-black text-sm uppercase tracking-widest hover:text-medical-300"
                        >
                            Accès espace cabinet
                            <ChevronRight className="w-4 h-4" />
                        </Link>
                    </motion.div>
                </div>
            </section>

            {/* Contact court */}
            <section id="contact" className="py-20 bg-slate-900 border-t border-white/5 scroll-mt-28">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-3 gap-10">
                    {[
                        { icon: MapPin, title: 'Adresse', val: '123 Bd Mohammed V', sub: 'Casablanca' },
                        { icon: Phone, title: 'Téléphone', val: '+212 5 22 00 00 00', sub: 'Lun–Ven, 9h–18h' },
                        { icon: Mail, title: 'Email', val: 'contact@smilepro.ma', sub: 'Réponse sous 24h' },
                    ].map(({ icon: Icon, title, val, sub }) => (
                        <div
                            key={title}
                            className="rounded-2xl border border-white/10 bg-slate-950/50 p-8 text-center md:text-left"
                        >
                            <Icon className="w-8 h-8 text-medical-400 mx-auto md:mx-0 mb-4" strokeWidth={2} />
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{title}</p>
                            <p className="mt-2 font-black text-white">{val}</p>
                            <p className="text-sm text-slate-500 mt-1">{sub}</p>
                        </div>
                    ))}
                </div>
                <div className="max-w-xl mx-auto text-center mt-12">
                    <Link
                        to="/contact"
                        className="inline-flex items-center gap-2 text-medical-400 font-black text-sm uppercase tracking-widest hover:text-medical-300"
                    >
                        Formulaire de contact complet
                        <ChevronRight className="w-4 h-4" />
                    </Link>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default LandingPage;
