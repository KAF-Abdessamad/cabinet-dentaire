import React, { useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import api from '../api.js';
import { ArrowLeft, User, Phone, Calendar, Mail, Lock, MapPin, IdCard, Loader2, ChevronRight, Smile } from 'lucide-react';
import { motion } from 'framer-motion';
import patientImg from '../img/patient.jpg';
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

    const inputClass = "w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-700 font-bold focus:bg-white focus:ring-4 focus:ring-medical-500/10 focus:border-medical-500 transition-all outline-none text-sm";
    const labelClass = "text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block";

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 py-20">
            <div className="max-w-4xl w-full">
                <Link to="/login" className="inline-flex items-center text-slate-400 hover:text-medical-600 font-black text-xs uppercase tracking-widest mb-12 transition-colors group">
                    <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                    Retour à la connexion
                </Link>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-[40px] shadow-2xl overflow-hidden border border-slate-100"
                >
                    <div className="bg-medical-600 p-12 text-center relative overflow-hidden">
                        <img src={patientImg} alt="Patient" className="absolute inset-0 h-full w-full object-cover opacity-20" />
                        <div className="absolute inset-0 bg-gradient-to-r from-medical-700/85 to-indigo-700/75" />
                        <div className="relative z-10">
                            <div className="inline-flex items-center justify-center w-24 h-24 bg-white/80 rounded-3xl mb-6">
                                <img src={logo} alt="Cabinet Dentaire" className="w-20 h-20 object-contain" />
                            </div>
                            <h1 className="text-4xl font-black text-white tracking-tight mb-3">Nouveau Patient</h1>
                            <p className="text-white/80 font-bold italic">Créez votre dossier de santé en quelques secondes.</p>
                        </div>
                    </div>

                    <div className="p-12">
                        {error && (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="mb-10 p-5 bg-red-50 border border-red-100 text-red-700 rounded-2xl text-sm font-bold flex items-center gap-3"
                            >
                                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0">!</div>
                                {error}
                            </motion.div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-12">
                            {/* Section 1 */}
                            <div className="space-y-8">
                                <div className="flex items-center gap-3 pb-2 border-b border-slate-50">
                                    <div className="w-8 h-8 rounded-lg bg-medical-50 flex items-center justify-center text-medical-600">
                                        <Smile size={18} strokeWidth={2.5} />
                                    </div>
                                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Identité</h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className={labelClass}>Prénom</label>
                                        <div className="relative group">
                                            <User className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-medical-600" />
                                            <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} required className={inputClass} placeholder="Ex: Jean" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className={labelClass}>Nom</label>
                                        <div className="relative group">
                                            <User className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-medical-600" />
                                            <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} required className={inputClass} placeholder="Ex: Dupont" />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className={labelClass}>Email (Généré)</label>
                                        <div className="relative">
                                            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                                            <input type="email" value={expectedEmail} readOnly className={`${inputClass} bg-slate-100 cursor-not-allowed`} />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className={labelClass}>Téléphone</label>
                                        <div className="relative group">
                                            <Phone className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-medical-600" />
                                            <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required className={inputClass} placeholder="06..." />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Section 2 */}
                            <div className="space-y-8">
                                <div className="flex items-center gap-3 pb-2 border-b border-slate-50">
                                    <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                                        <Lock size={18} strokeWidth={2.5} />
                                    </div>
                                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Sécurité</h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className={labelClass}>Mot de passe</label>
                                        <div className="relative group">
                                            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-medical-600" />
                                            <input type="password" name="password" value={formData.password} onChange={handleChange} required minLength="8" className={inputClass} placeholder="••••••••" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className={labelClass}>Confirmation</label>
                                        <div className="relative group">
                                            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-medical-600" />
                                            <input type="password" name="password_confirmation" value={formData.password_confirmation} onChange={handleChange} required className={inputClass} placeholder="••••••••" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Section 3 */}
                            <div className="space-y-8">
                                <div className="flex items-center gap-3 pb-2 border-b border-slate-50">
                                    <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
                                        <Calendar size={18} strokeWidth={2.5} />
                                    </div>
                                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Informations Complémentaires</h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="space-y-2">
                                        <label className={labelClass}>Naissance</label>
                                        <input type="date" name="birth_date" value={formData.birth_date} onChange={handleChange} required className={inputClass} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className={labelClass}>Sexe</label>
                                        <select name="gender" value={formData.gender} onChange={handleChange} required className={inputClass}>
                                            <option value="male">Homme</option>
                                            <option value="female">Femme</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className={labelClass}>CIN</label>
                                        <div className="relative group">
                                            <IdCard className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-medical-600" />
                                            <input type="text" name="cin" value={formData.cin} onChange={handleChange} required className={inputClass} placeholder="N° Carte" />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className={labelClass}>Adresse de résidence</label>
                                    <div className="relative group">
                                        <MapPin className="absolute left-5 top-5 w-4 h-4 text-slate-300 group-focus-within:text-medical-600" />
                                        <textarea name="address" value={formData.address} onChange={handleChange} rows={3} className={`${inputClass} pl-14 pt-4`} placeholder="Votre adresse complète..."></textarea>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-slate-900 text-white py-6 rounded-[24px] font-black text-sm uppercase tracking-widest hover:bg-medical-600 transition-all shadow-2xl shadow-slate-200 flex items-center justify-center gap-3 group disabled:opacity-50"
                            >
                                {loading ? (
                                    <Loader2 className="w-6 h-6 animate-spin" />
                                ) : (
                                    <>
                                        <span>CRÉER MON COMPTE SANTÉ</span>
                                        <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </motion.div>
                
                <p className="text-center mt-12 text-slate-400 text-sm font-bold">
                    Déjà inscrit ? <Link to="/login" className="text-medical-600 hover:underline">Connectez-vous ici</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
