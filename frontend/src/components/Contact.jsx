import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, Loader2, CheckCircle2, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import Navbar from './Navbar.jsx';
import Footer from './Footer.jsx';
import api from '../api.js';

const Contact = () => {
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSending(true);
        setError('');

        const formData = new FormData(e.target);
        const data = {
            name: formData.get('name'),
            email: formData.get('email'),
            subject: formData.get('subject'),
            message: formData.get('message'),
        };

        try {
            await api.get('/sanctum/csrf-cookie');
            await api.post('/api/contact', data);
            setSending(false);
            setSent(true);
            e.target.reset();
        } catch (err) {
            setSending(false);
            const msg =
                err.response?.data?.message ||
                (err.response?.data?.errors && Object.values(err.response.data.errors).flat().join(' ')) ||
                'Une erreur est survenue. Veuillez réessayer.';
            setError(msg);
            console.error('Contact form error:', err);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />
            
            <main className="pt-32 pb-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <motion.h1 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-5xl font-black text-slate-900 mb-6"
                        >
                            Contactez <span className="text-medical-600">SmilePro</span>
                        </motion.h1>
                        <motion.p 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-lg text-slate-500 font-medium"
                        >
                            Une question ? Besoin d'un conseil ? Notre équipe est à votre écoute pour vous accompagner dans votre parcours de soin.
                        </motion.p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                        {/* Contact Info */}
                        <div className="space-y-8">
                            {[
                                { 
                                    icon: Phone, 
                                    title: "Téléphone", 
                                    val: "+212 5 22 00 00 00", 
                                    desc: "Lun-Ven, 9h-18h",
                                    color: "bg-emerald-50 text-emerald-600"
                                },
                                { 
                                    icon: Mail, 
                                    title: "Email", 
                                    val: "contact@smilepro.ma", 
                                    desc: "Réponse en 24h",
                                    color: "bg-medical-50 text-medical-600"
                                },
                                { 
                                    icon: MapPin, 
                                    title: "Adresse", 
                                    val: "123 Bd Mohammed V", 
                                    desc: "Casablanca, Maroc",
                                    color: "bg-indigo-50 text-indigo-600"
                                }
                            ].map((item, i) => (
                                <motion.div 
                                    key={i}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="bg-white p-8 rounded-[32px] shadow-xl shadow-slate-200/50 border border-slate-100 flex items-start gap-6 group hover:border-medical-500/20 transition-all"
                                >
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${item.color} shrink-0 group-hover:scale-110 transition-transform`}>
                                        <item.icon size={24} strokeWidth={2.5} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{item.title}</p>
                                        <p className="text-lg font-black text-slate-800">{item.val}</p>
                                        <p className="text-sm font-bold text-slate-400">{item.desc}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Form */}
                        <div className="lg:col-span-2">
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-white rounded-[40px] shadow-2xl shadow-slate-200/50 border border-slate-100 p-12"
                            >
                                {sent ? (
                                    <div className="py-20 text-center space-y-6">
                                        <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto">
                                            <CheckCircle2 size={40} />
                                        </div>
                                        <h3 className="text-3xl font-black text-slate-800">Message envoyé !</h3>
                                        <p className="text-slate-500 font-bold max-w-sm mx-auto">Merci de nous avoir contactés. Un membre de notre équipe vous répondra très prochainement.</p>
                                        <button 
                                            onClick={() => setSent(false)}
                                            className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-medical-600 transition-all"
                                        >
                                            ENVOYER UN AUTRE MESSAGE
                                        </button>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubmit} className="space-y-8">
                                        {error && (
                                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
                                                {error}
                                            </div>
                                        )}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nom complet</label>
                                                <input required name="name" type="text" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-700 font-bold focus:bg-white focus:ring-4 focus:ring-medical-500/10 focus:border-medical-500 transition-all outline-none" placeholder="Jean Dupont" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email</label>
                                                <input required name="email" type="email" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-700 font-bold focus:bg-white focus:ring-4 focus:ring-medical-500/10 focus:border-medical-500 transition-all outline-none" placeholder="jean@exemple.com" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Sujet</label>
                                            <select name="subject" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-700 font-bold focus:bg-white focus:ring-4 focus:ring-medical-500/10 focus:border-medical-500 transition-all outline-none">
                                                <option value="Demande d'information">Demande d'information</option>
                                                <option value="Urgence dentaire">Urgence dentaire</option>
                                                <option value="Question sur un rendez-vous">Question sur un rendez-vous</option>
                                                <option value="Autre">Autre</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Message</label>
                                            <textarea required name="message" rows={6} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-700 font-bold focus:bg-white focus:ring-4 focus:ring-medical-500/10 focus:border-medical-500 transition-all outline-none" placeholder="Comment pouvons-nous vous aider ?"></textarea>
                                        </div>
                                        <button 
                                            type="submit"
                                            disabled={sending}
                                            className="w-full py-6 bg-slate-900 text-white rounded-[24px] font-black text-sm uppercase tracking-widest hover:bg-medical-600 transition-all shadow-2xl shadow-slate-200 flex items-center justify-center gap-3 disabled:opacity-50"
                                        >
                                            {sending ? <Loader2 className="animate-spin" /> : (
                                                <>
                                                    <span>ENVOYER LE MESSAGE</span>
                                                    <Send size={18} />
                                                </>
                                            )}
                                        </button>
                                    </form>
                                )}
                            </motion.div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default Contact;
