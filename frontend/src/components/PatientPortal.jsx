import React from 'react';
import { Link } from 'react-router-dom';

const PatientPortal = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center p-4">
            <div className="max-w-4xl w-full">
                {/* Back to home */}
                <Link to="/" className="inline-flex items-center text-blue-900 hover:underline mb-6">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Retour à l'accueil
                </Link>

                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-24 h-24 bg-blue-900 rounded-full mb-6 shadow-lg">
                        <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    </div>
                    <h1 className="text-4xl font-bold text-blue-900 mb-4">
                        Espace Patient
                    </h1>
                    <p className="text-lg text-blue-700">
                        Bienvenue sur votre espace personnel
                    </p>
                </div>

                {/* Choice Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Login Card */}
                    <Link
                        to="/login"
                        className="group bg-white rounded-2xl shadow-lg p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 border-transparent hover:border-blue-900"
                    >
                        <div className="flex flex-col items-center text-center">
                            <div className="bg-blue-50 p-6 rounded-full mb-6 group-hover:bg-blue-900 transition-colors duration-300">
                                <svg className="w-12 h-12 text-blue-900 group-hover:text-white transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold text-blue-900 mb-3">
                                Se Connecter
                            </h2>
                            <p className="text-blue-700 mb-6">
                                Vous avez déjà un compte ? Connectez-vous pour accéder à votre espace
                            </p>
                            <div className="flex items-center text-blue-900 font-medium group-hover:underline">
                                Connexion
                                <svg className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                            </div>
                        </div>
                    </Link>

                    {/* Register Card */}
                    <Link
                        to="/register"
                        className="group bg-white rounded-2xl shadow-lg p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 border-transparent hover:border-blue-700"
                    >
                        <div className="flex flex-col items-center text-center">
                            <div className="bg-blue-50 p-6 rounded-full mb-6 group-hover:bg-blue-700 transition-colors duration-300">
                                <svg className="w-12 h-12 text-blue-700 group-hover:text-white transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold text-blue-900 mb-3">
                                Créer un Compte
                            </h2>
                            <p className="text-blue-700 mb-6">
                                Nouveau patient ? Créez votre compte pour commencer
                            </p>
                            <div className="flex items-center text-blue-700 font-medium group-hover:underline">
                                Inscription
                                <svg className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                            </div>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default PatientPortal;
