import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav className="bg-blue-900 text-white shadow-lg fixed w-full top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center space-x-3">
                        <div className="bg-white p-2 rounded-full">
                            <svg className="w-8 h-8 text-blue-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                            </svg>
                        </div>
                        <span className="text-xl font-bold">Cabinet Dentaire</span>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-8">
                        <Link to="/" className="hover:text-blue-200 transition-colors">Accueil</Link>
                        <Link to="/#services" className="hover:text-blue-200 transition-colors">Services</Link>
                        <Link to="/#about" className="hover:text-blue-200 transition-colors">À propos</Link>
                        <Link to="/#contact" className="hover:text-blue-200 transition-colors">Contact</Link>
                        <Link to="/login" className="bg-blue-700 hover:bg-blue-600 px-4 py-2 rounded-lg transition-colors">
                            Espace Patient
                        </Link>
                        <a href="/admin/login" className="bg-white text-blue-900 hover:bg-blue-100 px-4 py-2 rounded-lg transition-colors">
                            Espace Cabinet
                        </a>
                    </div>

                    {/* Mobile menu button */}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="md:hidden inline-flex items-center justify-center p-2 rounded-md hover:bg-blue-800"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {isOpen ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            )}
                        </svg>
                    </button>
                </div>

                {/* Mobile Menu */}
                {isOpen && (
                    <div className="md:hidden pb-4">
                        <Link to="/" className="block py-2 hover:bg-blue-800 px-3 rounded">Accueil</Link>
                        <Link to="/#services" className="block py-2 hover:bg-blue-800 px-3 rounded">Services</Link>
                        <Link to="/#about" className="block py-2 hover:bg-blue-800 px-3 rounded">À propos</Link>
                        <Link to="/#contact" className="block py-2 hover:bg-blue-800 px-3 rounded">Contact</Link>
                        <Link to="/login" className="block py-2 hover:bg-blue-800 px-3 rounded mt-4 bg-blue-700 text-center">Espace Patient</Link>
                        <a href="/admin/login" className="block py-2 hover:bg-blue-800 px-3 rounded mt-2 bg-white text-blue-900 text-center">Espace Cabinet</a>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
