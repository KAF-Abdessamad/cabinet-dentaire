import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="bg-blue-900 text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Logo et description */}
                    <div>
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="bg-white p-2 rounded-full">
                                <svg className="w-8 h-8 text-blue-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                </svg>
                            </div>
                            <span className="text-xl font-bold">Cabinet Dentaire</span>
                        </div>
                        <p className="text-blue-200 text-sm">
                            Votre sourire, notre priorité depuis 2026.
                        </p>
                    </div>

                    {/* Services */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Services</h3>
                        <ul className="space-y-2 text-blue-200 text-sm">
                            <li>Consultations</li>
                            <li>Soins dentaires</li>
                            <li>Orthodontie</li>
                            <li>Implants</li>
                            <li>Blanchiment</li>
                        </ul>
                    </div>

                    {/* Horaires */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Horaires</h3>
                        <ul className="space-y-2 text-blue-200 text-sm">
                            <li>Lundi - Vendredi: 9h - 18h</li>
                            <li>Samedi: 9h - 13h</li>
                            <li>Dimanche: Fermé</li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Contact</h3>
                        <ul className="space-y-2 text-blue-200 text-sm">
                            <li>📍 123 Rue de la Santé, Paris</li>
                            <li>📞 01 23 45 67 89</li>
                            <li>✉️ contact@cabinet.com</li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-blue-800 mt-8 pt-8 text-center text-blue-200 text-sm">
                    <p>© 2026 Cabinet Dentaire - Tous droits réservés</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
