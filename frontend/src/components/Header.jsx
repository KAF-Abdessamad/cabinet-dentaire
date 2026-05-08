import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Header = ({ user }) => {
    const location = useLocation();
    
    const navItems = [
        { path: '/app', label: 'Tableau de Bord', icon: '📊' },
        { path: '/app/patients', label: 'Patients', icon: '👥' },
        { path: '/app/appointments', label: 'Rendez-vous', icon: '📅' },
    ];

    return (
        <header className="bg-white shadow-sm border-b border-slate-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    <div className="flex items-center space-x-2">
                        <div className="p-2 bg-medical-600 rounded-xl">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"/>
                            </svg>
                        </div>
                        <span className="text-xl font-bold text-slate-800">
                            Dentist<span className="text-medical-600">Pro</span>
                        </span>
                    </div>

                    <nav className="hidden md:flex space-x-1">
                        {navItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                    location.pathname === item.path
                                        ? 'bg-medical-100 text-medical-700'
                                        : 'text-slate-600 hover:bg-slate-100'
                                }`}
                            >
                                <span className="mr-2">{item.icon}</span>
                                {item.label}
                            </Link>
                        ))}
                    </nav>

                    <div className="flex items-center space-x-4">
                        {user && (
                            <div className="flex items-center space-x-2">
                                <div className="w-8 h-8 bg-medical-600 rounded-full flex items-center justify-center text-white font-medium">
                                    {user.name?.charAt(0).toUpperCase() || 'U'}
                                </div>
                                <span className="text-sm font-medium text-slate-700 hidden sm:block">
                                    {user.name}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
