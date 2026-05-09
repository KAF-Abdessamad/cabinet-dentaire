import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from './Navbar.jsx';
import Footer from './Footer.jsx';

const LandingPage = () => {
    const [scrollY, setScrollY] = useState(0);

    useEffect(() => {
        const handleScroll = () => setScrollY(window.scrollY);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
            <Navbar />
            
            {/* Hero Section */}
            <section className="pt-24 pb-16 px-4">
                <div className="max-w-6xl mx-auto text-center">
                    <div className="animate-fade-in-up">
                        <div className="inline-flex items-center justify-center w-32 h-32 bg-blue-900 rounded-full mb-8 shadow-lg">
                            <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                            </svg>
                        </div>
                        <h1 className="text-5xl md:text-6xl font-bold text-blue-900 mb-4">
                            Cabinet Dentaire
                        </h1>
                        <p className="text-2xl text-blue-700 mb-8">
                            Votre sourire, notre priorité depuis 2026
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                to="/login"
                                className="bg-blue-900 hover:bg-blue-800 text-white px-8 py-4 rounded-lg font-semibold transition-all duration-300 hover:shadow-lg"
                            >
                                Espace Patient
                            </Link>
                            <a
                                href="/admin/login"
                                className="bg-white hover:bg-blue-50 text-blue-900 px-8 py-4 rounded-lg font-semibold transition-all duration-300 hover:shadow-lg border-2 border-blue-900"
                            >
                                Espace Cabinet
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* Services Section */}
            <section id="services" className="py-16 px-4 bg-white">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-4xl font-bold text-blue-900 text-center mb-12">Nos Services</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { icon: '🦷', title: 'Soins Dentaires', desc: 'Traitements complets pour vos dents' },
                            { icon: '😁', title: 'Esthétique', desc: 'Blanchiment et cosmétique dentaire' },
                            { icon: '🔧', title: 'Orthodontie', desc: 'Alignement et correction dentaire' },
                            { icon: '💉', title: 'Implants', desc: 'Solutions pour dents manquantes' },
                            { icon: '🏥', title: 'Urgences', desc: 'Traitement rapide des douleurs' },
                            { icon: '👶', title: 'Pédiatrie', desc: 'Soins adaptés aux enfants' },
                        ].map((service, index) => (
                            <div
                                key={index}
                                className="bg-blue-50 p-6 rounded-xl hover:shadow-lg transition-all duration-300 hover:-translate-y-2"
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                <div className="text-4xl mb-4">{service.icon}</div>
                                <h3 className="text-xl font-bold text-blue-900 mb-2">{service.title}</h3>
                                <p className="text-blue-700">{service.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section id="about" className="py-16 px-4 bg-blue-900 text-white">
                <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-4xl font-bold mb-6">À Propos de Notre Cabinet</h2>
                            <p className="text-blue-100 text-lg mb-6">
                                Notre cabinet dentaire vous accueille dans un environnement moderne et chaleureux. 
                                Notre équipe de professionnels qualifiés s'engage à vous offrir les meilleurs soins dentaires 
                                avec les technologies les plus avancées.
                            </p>
                            <ul className="space-y-3 text-blue-100">
                                <li className="flex items-center">
                                    <span className="mr-3">✓</span> Équipement moderne
                                </li>
                                <li className="flex items-center">
                                    <span className="mr-3">✓</span> Personnel qualifié
                                </li>
                                <li className="flex items-center">
                                    <span className="mr-3">✓</span> Horaires flexibles
                                </li>
                                <li className="flex items-center">
                                    <span className="mr-3">✓</span> Accès PMR
                                </li>
                            </ul>
                        </div>
                        <div className="bg-blue-800 p-8 rounded-2xl">
                            <h3 className="text-2xl font-bold mb-4">Nos Chiffres</h3>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="text-center">
                                    <div className="text-4xl font-bold mb-2">10+</div>
                                    <div className="text-blue-200">Années d'expérience</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-4xl font-bold mb-2">5000+</div>
                                    <div className="text-blue-200">Patients satisfaits</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-4xl font-bold mb-2">5</div>
                                    <div className="text-blue-200">Dentistes experts</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-4xl font-bold mb-2">24/7</div>
                                    <div className="text-blue-200">Urgences</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Contact Section */}
            <section id="contact" className="py-16 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-4xl font-bold text-blue-900 mb-8">Contactez-Nous</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="bg-blue-50 p-6 rounded-xl">
                            <div className="text-3xl mb-4">📍</div>
                            <h3 className="font-bold text-blue-900 mb-2">Adresse</h3>
                            <p className="text-blue-700">123 Rue de la Santé, Paris</p>
                        </div>
                        <div className="bg-blue-50 p-6 rounded-xl">
                            <div className="text-3xl mb-4">📞</div>
                            <h3 className="font-bold text-blue-900 mb-2">Téléphone</h3>
                            <p className="text-blue-700">01 23 45 67 89</p>
                        </div>
                        <div className="bg-blue-50 p-6 rounded-xl">
                            <div className="text-3xl mb-4">✉️</div>
                            <h3 className="font-bold text-blue-900 mb-2">Email</h3>
                            <p className="text-blue-700">contact@cabinet.com</p>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default LandingPage;
