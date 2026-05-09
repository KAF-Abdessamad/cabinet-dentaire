import React, { useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import api from '../api.js';
import logo from '../img/logo-removebg-preview.png';

const normalizeForEmail = (value) =>
    (value || '')
        .toString()
        .trim()
        .toLowerCase()
        .replace(/[\s\-_]+/g, '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]/g, '');

const Register = () => {
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        password_confirmation: '',
        phone: '',
        birth_date: '',
        gender: 'male',
        address: '',
        cin: '',
        blood_group: '',
        allergies: '',
        medical_history: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const expectedEmail = useMemo(() => {
        const local = `${normalizeForEmail(formData.first_name)}${normalizeForEmail(formData.last_name)}`;
        return local ? `${local}@patient.com` : '@patient.com';
    }, [formData.first_name, formData.last_name]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Get CSRF cookie first for stateful request
            await api.get('/sanctum/csrf-cookie');
            
            const payload = { ...formData, email: expectedEmail };
            const response = await api.post('/api/register', payload);

            if (response.status === 201) {
                // Auto-login after registration
                const loginResult = await login(expectedEmail, formData.password);
                if (loginResult.success) {
                    navigate('/patient/dashboard', { replace: true });
                } else {
                    navigate('/login', { replace: true });
                }
            }
        } catch (err) {
            console.error('Registration error:', err);
            if (err.response?.status === 422) {
                const errors = err.response.data.errors;
                setError(Object.values(errors).flat().join(', '));
            } else {
                setError('Une erreur est survenue. Veuillez réessayer.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center p-4">
            <div className="max-w-3xl w-full">
                {/* Back to portal */}
                <Link to="/login" className="inline-flex items-center text-blue-900 hover:underline mb-6">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Retour à l'espace patient
                </Link>

                <div className="bg-white rounded-2xl shadow-xl p-8">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-white border border-slate-100 rounded-full mb-4 shadow-sm overflow-hidden">
                            <img src={logo} alt="Logo" className="w-full h-full object-contain p-2" />
                        </div>
                        <h1 className="text-3xl font-bold text-blue-900 mb-2">
                            Créer un compte patient
                        </h1>
                        <p className="text-blue-700">
                            Rejoignez notre cabinet pour suivre votre santé dentaire
                        </p>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Informations personnelles */}
                        <div className="bg-blue-50 p-4 rounded-lg">
                            <h3 className="text-lg font-semibold text-blue-900 mb-4">Informations personnelles</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Prénom *
                                    </label>
                                    <input
                                        type="text"
                                        name="first_name"
                                        value={formData.first_name}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent"
                                        placeholder="Jean"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Nom *
                                    </label>
                                    <input
                                        type="text"
                                        name="last_name"
                                        value={formData.last_name}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent"
                                        placeholder="Dupont"
                                    />
                                </div>
                            </div>

                            <div className="mt-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email *
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={expectedEmail}
                                    readOnly
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent"
                                    placeholder="jean.dupont@email.com"
                                />
                                <p className="mt-1 text-xs text-gray-500">
                                    Email généré automatiquement: <span className="font-medium">{expectedEmail}</span>
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Mot de passe *
                                    </label>
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                        minLength="8"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent"
                                        placeholder="Au moins 8 caractères"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Confirmer le mot de passe *
                                    </label>
                                    <input
                                        type="password"
                                        name="password_confirmation"
                                        value={formData.password_confirmation}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent"
                                        placeholder="Confirmer"
                                    />
                                </div>
                            </div>

                            <div className="mt-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Téléphone *
                                </label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent"
                                    placeholder="06 12 34 56 78"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Date de naissance *
                                    </label>
                                    <input
                                        type="date"
                                        name="birth_date"
                                        value={formData.birth_date}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Sexe *
                                    </label>
                                    <select
                                        name="gender"
                                        value={formData.gender}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent"
                                    >
                                        <option value="male">Homme</option>
                                        <option value="female">Femme</option>
                                    </select>
                                </div>
                            </div>

                            <div className="mt-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Adresse
                                </label>
                                <textarea
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    rows="2"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent"
                                    placeholder="123 Rue de la République, 75001 Paris"
                                />
                            </div>
                        </div>

                        {/* Informations médicales */}
                        <div className="bg-blue-50 p-4 rounded-lg">
                            <h3 className="text-lg font-semibold text-blue-900 mb-4">Informations médicales</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        CIN
                                    </label>
                                    <input
                                        type="text"
                                        name="cin"
                                        value={formData.cin}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent"
                                        placeholder="AB123456"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Groupe sanguin
                                    </label>
                                    <select
                                        name="blood_group"
                                        value={formData.blood_group}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent"
                                    >
                                        <option value="">Non spécifié</option>
                                        <option value="A+">A+</option>
                                        <option value="A-">A-</option>
                                        <option value="B+">B+</option>
                                        <option value="B-">B-</option>
                                        <option value="AB+">AB+</option>
                                        <option value="AB-">AB-</option>
                                        <option value="O+">O+</option>
                                        <option value="O-">O-</option>
                                    </select>
                                </div>
                            </div>

                            <div className="mt-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Allergies
                                </label>
                                <textarea
                                    name="allergies"
                                    value={formData.allergies}
                                    onChange={handleChange}
                                    rows="2"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent"
                                    placeholder="Pénicilline, latex, etc."
                                />
                            </div>

                            <div className="mt-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Antécédents médicaux
                                </label>
                                <textarea
                                    name="medical_history"
                                    value={formData.medical_history}
                                    onChange={handleChange}
                                    rows="3"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent"
                                    placeholder="Diabète, hypertension, chirurgies antérieures, etc."
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-900 text-white py-3 px-4 rounded-lg hover:bg-blue-800 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Création en cours...' : 'CRÉER MON COMPTE'}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-gray-600">
                            Vous avez déjà un compte ?{' '}
                            <Link to="/login" className="text-blue-900 hover:underline font-medium">
                                Se connecter
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
