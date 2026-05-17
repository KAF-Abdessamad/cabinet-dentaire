import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Lock,
    Calendar,
    FileText,
    CreditCard,
    UserPlus,
    CalendarCheck,
    History,
    Sparkles,
    Shield,
    Heart,
} from 'lucide-react';
import Navbar from './Navbar.jsx';
import Footer from './Footer.jsx';
import { FadeInSection } from './landing/FadeInSection.jsx';
import { useInView } from '../hooks/useInView.js';
import { useAnimatedCounter } from '../hooks/useAnimatedCounter.js';
import logo from '../img/logo-removebg-preview.png';
import cabinetImg from '../img/urgences-cab-dentaire_750.jpg';

const heroStagger = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1, delayChildren: 0.15 } },
};

const heroItem = {
    hidden: { opacity: 0, y: 28 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } },
};

const features = [
    {
        emoji: '📅',
        title: 'Rendez-vous en ligne',
        description: 'Réservez 24h/24, recevez des confirmations automatiques.',
        icon: Calendar,
    },
    {
        emoji: '📋',
        title: 'Dossier Médical',
        description: 'Accédez à votre historique de soins complet.',
        icon: FileText,
    },
    {
        emoji: '💳',
        title: 'Facturation Transparente',
        description: 'Consultez et payez vos factures en ligne.',
        icon: CreditCard,
    },
];

const steps = [
    {
        step: 1,
        title: 'Créez votre compte patient',
        description: 'Inscription rapide et sécurisée en quelques minutes.',
        icon: UserPlus,
    },
    {
        step: 2,
        title: 'Prenez rendez-vous en ligne',
        description: 'Choisissez votre créneau selon les disponibilités du cabinet.',
        icon: CalendarCheck,
    },
    {
        step: 3,
        title: 'Consultez votre historique',
        description: 'Soins, factures et notifications centralisés.',
        icon: History,
    },
];

function StatItem({ end, suffix = '', label, decimals = 0 }) {
    const [ref, inView] = useInView({ threshold: 0.3, once: true });
    const count = useAnimatedCounter(end, { active: inView, duration: 2200, decimals });

    return (
        <div ref={ref} className="text-center">
            <p className="font-display text-4xl sm:text-5xl text-white tabular-nums">
                {count}
                {suffix}
            </p>
            <p className="mt-2 text-sm font-medium text-dp-accent/90 uppercase tracking-widest">{label}</p>
        </div>
    );
}

const LandingPage = () => {
    const [heroReady, setHeroReady] = useState(false);

    useEffect(() => {
        setHeroReady(true);
    }, []);

    return (
        <div className="min-h-screen bg-dp-bg text-dp-neutral-800 font-sans overflow-x-hidden">
            <Navbar variant="landing" />

            {/* ——— Hero ——— */}
            <section
                id="home"
                className="relative min-h-screen flex flex-col pt-28 pb-16 lg:pb-24 scroll-mt-0 overflow-hidden"
            >
                {/* Fond dégradé + motif */}
                <div
                    className="absolute inset-0 z-0"
                    style={{
                        background: 'linear-gradient(135deg, #0F2347 0%, #1B3A6B 55%, #1a4570 100%)',
                    }}
                />
                <motion.div
                    className="absolute inset-0 z-0 opacity-[0.35]"
                    style={{
                        backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.12) 1px, transparent 0)`,
                        backgroundSize: '32px 32px',
                    }}
                    aria-hidden
                />
                <div
                    className="absolute inset-0 z-0 bg-gradient-to-tr from-[#2E8B8B]/20 via-transparent to-transparent"
                    aria-hidden
                />

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-1 flex flex-col">
                    {/* Logo cabinet — haut gauche */}
                    <motion.div
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                        className="flex items-center gap-3 mb-10 lg:mb-14"
                    >
                        <div className="h-14 w-14 rounded-2xl bg-white shadow-lg shadow-black/20 flex items-center justify-center overflow-hidden border border-white/20">
                            <img src={logo} alt="" className="h-full w-full object-contain p-2" />
                        </div>
                        <div>
                            <p className="font-display text-xl sm:text-2xl text-white leading-tight">Cabinet Dentaire</p>
                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#7ec8c8]">DentistPro</p>
                        </div>
                    </motion.div>

                    <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center flex-1">
                        {/* Texte + CTA */}
                        <motion.div
                            initial="hidden"
                            animate={heroReady ? 'visible' : 'hidden'}
                            variants={heroStagger}
                        >
                            <motion.p
                                variants={heroItem}
                                className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-[#7ec8c8] mb-5"
                            >
                                <Sparkles className="h-4 w-4" aria-hidden />
                                Soins dentaires numériques
                            </motion.p>

                            <motion.h1
                                variants={heroItem}
                                className="font-display text-4xl sm:text-5xl lg:text-6xl xl:text-[3.5rem] text-white leading-[1.08] tracking-tight"
                            >
                                Votre Sourire,
                                <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#a8e6e6] to-white">
                                    Notre Priorité
                                </span>
                            </motion.h1>

                            <motion.p
                                variants={heroItem}
                                className="mt-6 text-lg text-white/80 leading-relaxed max-w-xl font-sans"
                            >
                                Prenez rendez-vous en ligne, suivez vos soins, restez connecté avec votre cabinet.
                            </motion.p>

                            <motion.div variants={heroItem} className="mt-10 flex flex-wrap gap-4">
                                <Link
                                    to="/login"
                                    className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-white text-[#1B3A6B] font-bold text-sm shadow-xl shadow-black/20 hover:bg-dp-accent hover:scale-[1.02] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#1B3A6B]"
                                >
                                    Espace Patient
                                </Link>
                                <Link
                                    to="/admin/login"
                                    className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-[#2E8B8B] text-white font-bold text-sm border border-white/20 shadow-lg hover:bg-[#267575] hover:scale-[1.02] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7ec8c8] focus-visible:ring-offset-2 focus-visible:ring-offset-[#1B3A6B]"
                                >
                                    <Lock className="h-4 w-4" aria-hidden />
                                    Connexion Staff
                                </Link>
                            </motion.div>

                            <motion.div
                                variants={heroItem}
                                className="mt-12 flex flex-wrap gap-6 text-sm text-white/60"
                            >
                                <span className="flex items-center gap-2">
                                    <Shield className="h-4 w-4 text-[#7ec8c8]" /> Données sécurisées
                                </span>
                                <span className="flex items-center gap-2">
                                    <Heart className="h-4 w-4 text-[#7ec8c8]" /> Accueil personnalisé
                                </span>
                            </motion.div>
                        </motion.div>

                        {/* Visuel droite */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.94, x: 24 }}
                            animate={{ opacity: 1, scale: 1, x: 0 }}
                            transition={{ duration: 0.8, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
                            className="relative hidden lg:block"
                        >
                            <div className="relative rounded-[2rem] overflow-hidden border border-white/15 shadow-2xl shadow-black/40">
                                <img
                                    src={cabinetImg}
                                    alt="Cabinet dentaire moderne DentistPro"
                                    className="w-full h-[480px] object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#0F2347]/80 via-transparent to-transparent" />
                            </div>

                            {[
                                { Icon: Calendar, label: 'RDV en ligne', pos: '-top-4 -left-4', delay: 0 },
                                { Icon: FileText, label: 'Dossier patient', pos: 'top-1/3 -right-6', delay: 0.15 },
                                { Icon: CreditCard, label: 'Factures', pos: '-bottom-4 right-8', delay: 0.3 },
                            ].map(({ Icon, label, pos, delay }) => (
                                <motion.div
                                    key={label}
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.6 + delay, duration: 0.5 }}
                                    className={`absolute ${pos} flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/95 backdrop-blur text-[#1B3A6B] shadow-xl border border-white/50`}
                                >
                                    <div className="h-10 w-10 rounded-xl bg-dp-accent flex items-center justify-center text-dp-secondary">
                                        <Icon className="h-5 w-5" strokeWidth={2} />
                                    </div>
                                    <span className="text-sm font-bold whitespace-nowrap">{label}</span>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.45, duration: 0.55 }}
                        className="lg:hidden mt-10 relative rounded-2xl overflow-hidden border border-white/15 shadow-xl max-w-lg"
                    >
                        <img src={cabinetImg} alt="Cabinet dentaire DentistPro" className="w-full h-52 object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0F2347]/70 to-transparent" />
                    </motion.div>
                </div>

                {/* Vague de transition */}
                <div className="absolute bottom-0 left-0 right-0 z-10 h-16 bg-dp-bg" style={{ clipPath: 'ellipse(75% 100% at 50% 100%)' }} aria-hidden />
            </section>

            {/* ——— Statistiques animées ——— */}
            <FadeInSection className="py-16 bg-dp-primary relative overflow-hidden">
                <div
                    className="absolute inset-0 opacity-20"
                    style={{
                        backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)`,
                        backgroundSize: '24px 24px',
                    }}
                    aria-hidden
                />
                <div className="relative max-w-5xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-3 gap-12">
                    <StatItem end={500} suffix="+" label="Patients suivis" />
                    <StatItem end={98} suffix="%" label="Satisfaction" />
                    <StatItem end={15} suffix="+" label="Années d'expérience" />
                </div>
            </FadeInSection>

            {/* ——— Features (3 colonnes) ——— */}
            <FadeInSection id="services" className="py-20 lg:py-28 scroll-mt-28">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-dp-secondary mb-3">Nos services</p>
                        <h2 className="font-display text-3xl sm:text-4xl text-dp-primary">
                            Tout votre parcours dentaire, simplifié
                        </h2>
                        <p className="mt-4 text-dp-neutral-600 leading-relaxed">
                            Une plateforme pensée pour les patients et le cabinet : claire, rapide et fiable.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {features.map((f, i) => (
                            <FadeInSection
                                key={f.title}
                                as="div"
                                delay={i * 100}
                                className="group rounded-3xl border border-dp-neutral-200 bg-white p-8 shadow-dp-card hover:shadow-dp-card-hover hover:border-dp-secondary/30 transition-shadow"
                            >
                                <span className="text-4xl" role="img" aria-hidden>
                                    {f.emoji}
                                </span>
                                <div className="mt-6 h-12 w-12 rounded-2xl bg-dp-accent flex items-center justify-center text-dp-secondary group-hover:bg-dp-secondary group-hover:text-white transition-colors">
                                    <f.icon className="h-6 w-6" strokeWidth={2} />
                                </div>
                                <h3 className="mt-5 font-display text-xl text-dp-primary">{f.title}</h3>
                                <p className="mt-3 text-dp-neutral-600 text-sm leading-relaxed">{f.description}</p>
                            </FadeInSection>
                        ))}
                    </div>
                    </div>
            </FadeInSection>

            {/* ——— Comment ça marche ——— */}
            <FadeInSection className="py-20 lg:py-28 bg-white border-y border-dp-neutral-100 scroll-mt-28" id="steps">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-dp-secondary mb-3">Comment ça marche</p>
                        <h2 className="font-display text-3xl sm:text-4xl text-dp-primary">Trois étapes pour commencer</h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-10 relative">
                        <div
                            className="hidden md:block absolute top-16 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-dp-secondary/20 via-dp-secondary to-dp-secondary/20"
                            aria-hidden
                        />
                        {steps.map((s, i) => (
                            <FadeInSection key={s.step} as="div" delay={i * 120} className="relative text-center">
                                <motion.div className="mx-auto h-16 w-16 rounded-2xl bg-dp-primary text-white flex items-center justify-center font-display text-2xl shadow-lg shadow-dp-primary/30 relative z-10">
                                    {s.step}
                                </motion.div>
                                <div className="mt-6 mx-auto h-14 w-14 rounded-2xl bg-dp-accent flex items-center justify-center text-dp-secondary">
                                    <s.icon className="h-7 w-7" strokeWidth={1.75} />
                                </div>
                                <h3 className="mt-5 font-display text-lg text-dp-primary">{s.title}</h3>
                                <p className="mt-2 text-sm text-dp-neutral-600 leading-relaxed max-w-xs mx-auto">{s.description}</p>
                            </FadeInSection>
                        ))}
                    </div>

                    <FadeInSection as="div" delay={200} className="mt-14 text-center">
                        <Link
                            to="/register"
                            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-dp-primary text-white font-bold text-sm shadow-dp-lg hover:bg-dp-primary-hover transition-all"
                        >
                            Créer mon compte patient
                        </Link>
                    </FadeInSection>
                </div>
            </FadeInSection>

            {/* ——— CTA final ——— */}
            <FadeInSection className="py-20">
                <div className="max-w-4xl mx-auto px-4 text-center rounded-3xl bg-gradient-to-br from-[#0F2347] to-[#1B3A6B] py-16 px-8 shadow-dp-xl">
                    <h2 className="font-display text-3xl text-white">Prêt à prendre soin de votre sourire ?</h2>
                    <p className="mt-4 text-white/75 max-w-lg mx-auto">
                        Rejoignez DentistPro et gérez vos rendez-vous où que vous soyez.
                    </p>
                    <div className="mt-8 flex flex-wrap justify-center gap-4">
                        <Link
                            to="/login"
                            className="px-8 py-3.5 rounded-2xl bg-white text-dp-primary font-bold text-sm hover:bg-dp-accent transition"
                        >
                            Espace Patient
                        </Link>
                        <Link
                            to="/contact"
                            className="px-8 py-3.5 rounded-2xl border border-white/30 text-white font-bold text-sm hover:bg-white/10 transition"
                        >
                            Nous contacter
                        </Link>
                    </div>
                </div>
            </FadeInSection>

            <Footer />
        </div>
    );
};

export default LandingPage;
