import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../img/logo-removebg-preview.png';

const Footer = () => {
    return (
        <footer className="bg-blue-900 text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Logo et description */}
                    <div>
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="bg-white p-1 rounded-full overflow-hidden w-12 h-12 flex items-center justify-center">
                                <img src={logo} alt="Cabinet Dentaire Logo" className="w-full h-full object-contain" />
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
