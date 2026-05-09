import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Phone, 
    Mail, 
    MapPin, 
    ChevronRight, 
    Star, 
    Shield, 
    Clock, 
    Award,
    Stethoscope,
    HeartPulse,
    UserCheck,
    Calendar
} from 'lucide-react';
import Navbar from './Navbar.jsx';
import Footer from './Footer.jsx';
import heroImg from '../img/Fotolia_61997183_Subscription_XXL-.jpg';
import urgencesImg from '../img/urgences-cab-dentaire_750.jpg';

const LandingPage = () => {
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        setIsLoaded(true);
    }, []);

    const fadeInUp = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
    };

    const staggerContainer = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2
            }
        }
    };

    return (
        <div className="min-h-screen bg-white font-sans text-slate-900 overflow-x-hidden">
            <Navbar />
            
            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
                {/* Background Decoration */}
                <div className="absolute top-0 right-0 w-1/2 h-full bg-blue-50/50 -z-10 rounded-l-[100px] hidden lg:block" />
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-100/30 rounded-full blur-3xl -z-10" />
                
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12 items-center">
                    <motion.div 
                        initial="hidden"
                        animate={isLoaded ? "visible" : "hidden"}
                        variants={staggerContainer}
                        className="text-left"
                    >
                        <motion.span 
                            variants={fadeInUp}
                            className="inline-block py-1 px-4 rounded-full bg-blue-100 text-blue-700 text-sm font-bold mb-6 tracking-wide uppercase"
                        >
                            Expertise & Bienveillance
                        </motion.span>
                        <motion.h1 
                            variants={fadeInUp}
                            className="text-5xl md:text-7xl font-extrabold text-slate-900 leading-tight mb-6"
                        >
                            Votre Sourire, <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Notre Chef-d'œuvre</span>
                        </motion.h1>
                        <motion.p 
                            variants={fadeInUp}
                            className="text-lg md:text-xl text-slate-600 mb-10 max-w-lg leading-relaxed"
                        >
                            Découvrez une expérience dentaire d'exception alliant technologies de pointe et confort absolu pour toute la famille.
                        </motion.p>
                        
                        <motion.div 
                            variants={fadeInUp}
                            className="flex flex-wrap gap-4"
                        >
                            <Link
                                to="/login"
                                className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold shadow-xl shadow-blue-200 transition-all hover:-translate-y-1 flex items-center gap-2"
                            >
                                <Calendar className="w-5 h-5" />
                                Prendre Rendez-vous
                            </Link>
                            <a
                                href="#services"
                                className="px-8 py-4 bg-white border-2 border-slate-200 hover:border-blue-600 text-slate-700 hover:text-blue-600 rounded-2xl font-bold transition-all flex items-center gap-2"
                            >
                                Nos Services
                                <ChevronRight className="w-5 h-5" />
                            </a>
                        </motion.div>

                        <motion.div 
                            variants={fadeInUp}
                            className="mt-12 flex items-center gap-6"
                        >
                            <div className="flex -space-x-3">
                                {[1,2,3,4].map(i => (
                                    <img 
                                        key={i}
                                        className="w-12 h-12 rounded-full border-4 border-white object-cover" 
                                        src={`https://i.pravatar.cc/150?u=${i+10}`} 
                                        alt="Patient" 
                                    />
                                ))}
                            </div>
                            <div>
                                <div className="flex text-yellow-400 mb-1">
                                    {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 fill-current" />)}
                                </div>
                                <p className="text-sm text-slate-500 font-medium">5000+ patients satisfaits</p>
                            </div>
                        </motion.div>
                    </motion.div>

                    <motion.div 
                        initial={{ opacity: 0, scale: 0.8, x: 50 }}
                        animate={isLoaded ? { opacity: 1, scale: 1, x: 0 } : {}}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="relative hidden lg:block"
                    >
                        <div className="relative z-10 rounded-[40px] overflow-hidden shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-700">
                            <img 
                                src={heroImg} 
                                alt="Modern Dental Cabinet"
                                className="w-full h-[600px] object-cover"
                            />
                        </div>
                        {/* Decorative floating elements */}
                        <motion.div 
                            animate={{ y: [0, -20, 0] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute -top-10 -right-10 bg-white p-6 rounded-3xl shadow-xl z-20 flex items-center gap-4"
                        >
                            <div className="bg-green-100 p-3 rounded-2xl">
                                <Shield className="w-8 h-8 text-green-600" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Certifié</p>
                                <p className="text-slate-900 font-bold">Haute Sécurité</p>
                            </div>
                        </motion.div>
                        
                        <motion.div 
                            animate={{ y: [0, 20, 0] }}
                            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                            className="absolute -bottom-10 -left-10 bg-white p-6 rounded-3xl shadow-xl z-20 flex items-center gap-4"
                        >
                            <div className="bg-blue-100 p-3 rounded-2xl">
                                <Clock className="w-8 h-8 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Disponibilité</p>
                                <p className="text-slate-900 font-bold">Urgences 24/7</p>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* Stats Bar */}
            <section className="py-12 bg-slate-900 text-white relative z-30">
                <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                    {[
                        { label: "Années d'Expérience", value: "10+" },
                        { label: "Patients Heureux", value: "5000+" },
                        { label: "Spécialistes", value: "8" },
                        { label: "Taux de Réussite", value: "99%" },
                    ].map((stat, i) => (
                        <div key={i}>
                            <p className="text-4xl font-bold mb-1 text-blue-400">{stat.value}</p>
                            <p className="text-slate-400 text-sm font-medium">{stat.label}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Services Section */}
            <section id="services" className="py-24 bg-slate-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-20">
                        <motion.h2 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-4xl font-bold text-slate-900 mb-6"
                        >
                            Nos Spécialités au Service de Votre Santé
                        </motion.h2>
                        <motion.p 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className="text-lg text-slate-600"
                        >
                            Nous proposons une gamme complète de soins dentaires modernes pour répondre à tous vos besoins, du simple contrôle à la réhabilitation complète.
                        </motion.p>
                    </div>

                    <motion.div 
                        variants={staggerContainer}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                    >
                        {[
                            { 
                                icon: <Stethoscope className="w-8 h-8" />, 
                                title: 'Soins Généraux', 
                                desc: 'Prévention, détartrage et traitements conservateurs de haute précision.',
                                img: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&q=80&w=400'
                            },
                            { 
                                icon: <HeartPulse className="w-8 h-8" />, 
                                title: 'Esthétique Dentaire', 
                                desc: 'Blanchiment, facettes et transformations pour un sourire éclatant.',
                                img: 'https://images.unsplash.com/photo-1598256989800-fe5f95da9787?auto=format&fit=crop&q=80&w=400'
                            },
                            { 
                                icon: <Award className="w-8 h-8" />, 
                                title: 'Orthodontie', 
                                desc: 'Alignement parfait pour enfants et adultes avec les dernières technologies.',
                                img: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&q=80&w=400'
                            },
                            { 
                                icon: <Shield className="w-8 h-8" />, 
                                title: 'Implantologie', 
                                desc: 'Solutions durables et esthétiques pour le remplacement de vos dents.',
                                img: 'https://images.unsplash.com/photo-1460676746856-e656ad0a736a?auto=format&fit=crop&q=80&w=400'
                            },
                            { 
                                icon: <Clock className="w-8 h-8" />, 
                                title: 'Urgences Dentaires', 
                                desc: 'Une douleur vive ? Nous vous recevons en priorité pour vous soulager.',
                                img: urgencesImg
                            },
                            { 
                                icon: <UserCheck className="w-8 h-8" />, 
                                title: 'Pédodontie', 
                                desc: 'Des soins doux et ludiques pour faire aimer le dentiste aux enfants.',
                                img: 'https://images.unsplash.com/photo-1551601651-2a8555f1a136?auto=format&fit=crop&q=80&w=400'
                            },
                        ].map((service, index) => (
                            <motion.div
                                key={index}
                                variants={fadeInUp}
                                whileHover={{ y: -10 }}
                                className="group bg-white rounded-[32px] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-slate-100"
                            >
                                <div className="h-48 overflow-hidden relative">
                                    <img 
                                        src={service.img} 
                                        alt={service.title} 
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent" />
                                    <div className="absolute bottom-4 left-6 bg-blue-600 p-3 rounded-2xl text-white">
                                        {service.icon}
                                    </div>
                                </div>
                                <div className="p-8">
                                    <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors">
                                        {service.title}
                                    </h3>
                                    <p className="text-slate-600 leading-relaxed mb-6">
                                        {service.desc}
                                    </p>
                                    <Link to="/login" className="inline-flex items-center text-blue-600 font-bold gap-2 group/btn">
                                        En savoir plus 
                                        <ChevronRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                                    </Link>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* About Section */}
            <section id="about" className="py-24 overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <motion.div 
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                            className="relative"
                        >
                            <div className="relative z-10 rounded-[40px] overflow-hidden shadow-2xl">
                                <img 
                                    src="https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?auto=format&fit=crop&q=80&w=800" 
                                    alt="Professional Dentist Team"
                                    className="w-full h-[500px] object-cover"
                                />
                            </div>
                            <div className="absolute -bottom-8 -right-8 bg-blue-600 text-white p-10 rounded-[40px] shadow-2xl hidden md:block">
                                <p className="text-5xl font-bold mb-2">15+</p>
                                <p className="text-sm font-bold uppercase tracking-widest opacity-80">Experts Dédiés</p>
                            </div>
                        </motion.div>

                        <motion.div 
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                        >
                            <h2 className="text-4xl font-bold text-slate-900 mb-8 leading-tight">
                                Une Approche Humaine <br /> 
                                <span className="text-blue-600">et Technologique</span>
                            </h2>
                            <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                                Notre cabinet n'est pas seulement un lieu de soins, c'est un espace dédié à votre bien-être. Nous utilisons les technologies les plus avancées pour des diagnostics précis et des traitements indolores.
                            </p>
                            <div className="space-y-6">
                                {[
                                    { title: "Équipement Digital 3D", desc: "Pour des diagnostics ultra-précis." },
                                    { title: "Stérilisation de Pointe", desc: "Respect rigoureux des normes d'hygiène." },
                                    { title: "Équipe Pluridisciplinaire", desc: "Tous vos soins au même endroit." }
                                ].map((item, i) => (
                                    <div key={i} className="flex gap-4">
                                        <div className="mt-1 flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                                            <div className="w-2 h-2 rounded-full bg-blue-600" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900">{item.title}</h4>
                                            <p className="text-slate-500">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Contact Section */}
            <section id="contact" className="py-24 bg-slate-900 text-white rounded-t-[100px]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold mb-6">Prêt à Transformer Votre Sourire ?</h2>
                        <p className="text-slate-400 text-lg">Nous sommes impatients de vous accueillir au sein de notre cabinet.</p>
                    </div>
                    
                    <div className="grid md:grid-cols-3 gap-12">
                        <div className="flex flex-col items-center text-center p-8 bg-white/5 rounded-[40px] hover:bg-white/10 transition-colors">
                            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-6">
                                <MapPin className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Notre Adresse</h3>
                            <p className="text-slate-400">123 Rue de la Santé, <br /> 75001 Paris, France</p>
                        </div>
                        
                        <div className="flex flex-col items-center text-center p-8 bg-white/5 rounded-[40px] hover:bg-white/10 transition-colors">
                            <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mb-6">
                                <Phone className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Téléphone</h3>
                            <p className="text-slate-400">Standard : 01 23 45 67 89 <br /> Urgences : 01 23 45 67 90</p>
                        </div>
                        
                        <div className="flex flex-col items-center text-center p-8 bg-white/5 rounded-[40px] hover:bg-white/10 transition-colors">
                            <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center mb-6">
                                <Mail className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Email</h3>
                            <p className="text-slate-400">contact@cabinet.com <br /> support@cabinet.com</p>
                        </div>
                    </div>

                    <div className="mt-20 p-12 bg-blue-600 rounded-[50px] flex flex-col lg:flex-row items-center justify-between gap-8">
                        <div>
                            <h3 className="text-3xl font-bold mb-2">Inscrivez-vous dès aujourd'hui</h3>
                            <p className="text-blue-100">Rejoignez nos patients et gérez vos rendez-vous en ligne.</p>
                        </div>
                        <div className="flex gap-4">
                            <Link to="/register" className="px-8 py-4 bg-white text-blue-600 font-bold rounded-2xl hover:bg-blue-50 transition-colors">
                                Créer un Compte
                            </Link>
                            <Link to="/login" className="px-8 py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-colors">
                                Se Connecter
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default LandingPage;
