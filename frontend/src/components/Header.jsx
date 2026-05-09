import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import logo from '../img/logo-removebg-preview.png';

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
                        <div className="p-1 bg-white border border-slate-100 rounded-xl overflow-hidden w-10 h-10 flex items-center justify-center">
                            <img src={logo} alt="Logo" className="w-full h-full object-contain" />
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
