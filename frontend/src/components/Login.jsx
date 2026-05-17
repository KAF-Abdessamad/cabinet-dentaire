import React, { useState, useCallback, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft,
    Mail,
    Lock,
    Loader2,
    ArrowRight,
    Eye,
    EyeOff,
    Calendar,
    Star,
    Check,
} from 'lucide-react';
import patientImg from '../img/patient.jpg';
import logo from '../img/logo-removebg-preview.png';

const benefits = [
    'Rendez-vous en ligne 24h/24',
    'Historique de soins sécurisé',
    'Factures et notifications centralisées',
];

const floatIcons = [
    { Icon: ToothIcon, className: 'top-[12%] left-[8%]', delay: 0, duration: 6 },
    { Icon: Calendar, className: 'top-[22%] right-[10%]', delay: 0.8, duration: 7 },
    { Icon: Star, className: 'bottom-[28%] left-[12%]', delay: 1.2, duration: 5.5 },
    { Icon: Star, className: 'bottom-[18%] right-[14%]', delay: 0.4, duration: 6.5, size: 18 },
];

function ToothIcon({ className, size = 28 }) {
    return (
        <svg
            className={className}
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
        >
            <path d="M12 2c-2.5 0-4.5 2.2-4.5 5 0 1.8.6 3.2 1 4.5.5 1.5 1 3.5 1 5.5 0 1.2.8 2 1.5 2s1.5-.8 1.5-2c0-2 .5-4 1-5.5.4-1.3 1-2.7 1-4.5C16.5 4.2 14.5 2 12 2z" />
        </svg>
    );
}

function FloatingField({
    id,
    label,
    type = 'text',
    value,
    onChange,
    icon: Icon,
    error,
    autoComplete,
    rightSlot,
}) {
    const [focused, setFocused] = useState(false);
    const hasValue = String(value).length > 0;
    const lifted = focused || hasValue;

    return (
        <div className="w-full">
            <div
                className={`relative rounded-2xl border-2 bg-dp-neutral-50 transition-all duration-300 ${
                    error
                        ? 'border-dp-danger ring-4 ring-dp-danger/10'
                        : focused
                          ? 'border-dp-secondary ring-4 ring-dp-secondary/15 bg-white'
                          : 'border-dp-neutral-200 hover:border-dp-neutral-300'
                }`}
            >
                {Icon && (
                    <Icon
                        className={`absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 z-10 transition-colors ${
                            error ? 'text-dp-danger' : focused ? 'text-dp-secondary' : 'text-dp-neutral-400'
                        }`}
                        aria-hidden
                    />
                )}
                <input
                    id={id}
                    type={type}
                    value={value}
                    onChange={onChange}
                    autoComplete={autoComplete}
                    required
                    aria-invalid={!!error}
                    aria-describedby={error ? `${id}-error` : undefined}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    className={`w-full rounded-2xl bg-transparent font-medium text-dp-neutral-800 outline-none transition-all ${
                        Icon ? 'pl-12 pr-12' : 'px-4'
                    } ${lifted ? 'pt-6 pb-2' : 'py-4'} ${rightSlot ? 'pr-12' : ''}`}
                    placeholder=" "
                />
                <label
                    htmlFor={id}
                    className={`pointer-events-none absolute left-12 transition-all duration-300 ease-out ${
                        lifted
                            ? 'top-2 text-[11px] font-bold uppercase tracking-wider text-dp-secondary'
                            : 'top-1/2 -translate-y-1/2 text-sm font-medium text-dp-neutral-500'
                    }`}
                >
                    {label}
                </label>
                {rightSlot && <div className="absolute right-3 top-1/2 -translate-y-1/2 z-10">{rightSlot}</div>}
            </div>
            <AnimatePresence mode="wait">
                {error && (
                    <motion.p
                        id={`${id}-error`}
                        role="alert"
                        initial={{ opacity: 0, y: -4, x: 0 }}
                        animate={{ opacity: 1, y: 0, x: [0, -6, 6, -4, 4, 0] }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ x: { duration: 0.45 }, opacity: { duration: 0.2 } }}
                        className="mt-2 text-xs font-semibold text-dp-danger flex items-center gap-1.5"
                    >
                        {error}
                    </motion.p>
                )}
            </AnimatePresence>
        </div>
    );
}

const LoginBranding = () => {
    const panelRef = useRef(null);
    const [parallax, setParallax] = useState({ x: 0, y: 0 });

    const onMouseMove = useCallback((e) => {
        const el = panelRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
        const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
        setParallax({ x, y });
    }, []);

    const onMouseLeave = useCallback(() => setParallax({ x: 0, y: 0 }), []);

    return (
        <div
            ref={panelRef}
            onMouseMove={onMouseMove}
            onMouseLeave={onMouseLeave}
            className="hidden lg:flex lg:w-[40%] relative overflow-hidden items-center justify-center p-10 xl:p-14"
            style={{
                background: 'linear-gradient(145deg, #0F2347 0%, #1B3A6B 45%, #1a4a6e 100%)',
            }}
        >
            <img
                src={patientImg}
                alt=""
                className="absolute inset-0 h-full w-full object-cover opacity-20 mix-blend-luminosity"
            />
            <motion.div
                className="absolute inset-0 opacity-30"
                style={{
                    backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.1) 1px, transparent 0)`,
                    backgroundSize: '28px 28px',
                    transform: `translate(${parallax.x * 6}px, ${parallax.y * 6}px)`,
                }}
                aria-hidden
            />
            <div
                className="absolute inset-0 bg-gradient-to-br from-[#0F2347]/50 via-transparent to-[#2E8B8B]/25"
                aria-hidden
            />

            {floatIcons.map(({ Icon, className, delay, duration, size }, i) => (
                <motion.div
                    key={i}
                    className={`absolute text-white/20 ${className}`}
                    animate={{ y: [0, -12, 0], rotate: [0, 5, -5, 0] }}
                    transition={{ duration, delay, repeat: Infinity, ease: 'easeInOut' }}
                    style={{
                        transform: `translate(${parallax.x * (8 + i * 2)}px, ${parallax.y * (8 + i * 2)}px)`,
                    }}
                >
                    <Icon size={size ?? 28} className="h-7 w-7 shrink-0" />
                </motion.div>
            ))}

            <motion.div
                initial={{ opacity: 0, y: 24, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                style={{
                    transform: `translate(${parallax.x * -10}px, ${parallax.y * -10}px)`,
                }}
                className="relative z-10 w-full max-w-md"
            >
                <div className="rounded-[2rem] border border-white/15 bg-white/10 backdrop-blur-xl p-10 shadow-2xl shadow-black/30">
                    <div className="flex justify-center mb-8">
                        <div className="h-20 w-20 rounded-2xl bg-white shadow-lg flex items-center justify-center p-2">
                            <img src={logo} alt="DentistPro" className="h-full w-full object-contain" />
                        </div>
                    </div>
                    <h2 className="font-display text-2xl xl:text-3xl text-white text-center leading-snug">
                        Bienvenue dans votre Espace Santé
                    </h2>
                    <p className="mt-4 text-sm text-white/70 text-center leading-relaxed">
                        Votre parcours dentaire, simplifié et sécurisé.
                    </p>
                    <ul className="mt-8 space-y-4">
                        {benefits.map((text, i) => (
                            <motion.li
                                key={text}
                                initial={{ opacity: 0, x: -12 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.5 + i * 0.12, duration: 0.45 }}
                                className="flex items-center gap-3 text-sm text-white/90"
                            >
                                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#2E8B8B]/40 border border-[#2E8B8B]/60">
                                    <motion.span
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ delay: 0.65 + i * 0.12, type: 'spring', stiffness: 400 }}
                                    >
                                        <Check className="h-3.5 w-3.5 text-[#a8e6e6]" strokeWidth={3} />
                                    </motion.span>
                                </span>
                                {text}
                            </motion.li>
                        ))}
                    </ul>
                </div>
            </motion.div>
        </div>
    );
};

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({ email: '', password: '', global: '' });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const validate = () => {
        const next = { email: '', password: '', global: '' };
        if (!email.trim()) next.email = 'L’adresse email est requise';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = 'Format d’email invalide';
        if (!password) next.password = 'Le mot de passe est requis';
        else if (password.length < 6) next.password = 'Minimum 6 caractères';
        setErrors(next);
        return !next.email && !next.password;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({ email: '', password: '', global: '' });
        if (!validate()) return;

        setLoading(true);
        try {
            const result = await login(email, password);
            if (result.success) {
                navigate('/patient/dashboard', { replace: true });
            } else {
                setErrors((prev) => ({
                    ...prev,
                    global: result.error || 'Email ou mot de passe incorrect',
                }));
            }
        } catch {
            setErrors((prev) => ({
                ...prev,
                global: 'Une erreur est survenue. Veuillez réessayer.',
            }));
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div className="min-h-screen flex flex-col lg:flex-row bg-dp-bg overflow-hidden">
            <div
                className="lg:hidden py-6 px-6 text-center shrink-0 order-first"
                style={{ background: 'linear-gradient(135deg, #0F2347, #1B3A6B)' }}
            >
                <img src={logo} alt="DentistPro" className="h-12 w-12 mx-auto rounded-xl bg-white p-1.5 mb-2" />
                <p className="font-display text-base text-white">Espace Patient DentistPro</p>
            </div>

            <LoginBranding />

            {/* Formulaire — 60% */}
            <motion.div
                initial={{ opacity: 0, x: 48 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                className="flex-1 lg:w-[60%] flex items-center justify-center p-6 sm:p-10 lg:p-14 bg-white min-h-screen"
            >
                <div className="w-full max-w-md">
                    <Link
                        to="/"
                        className="group inline-flex items-center gap-2 text-sm font-semibold text-dp-neutral-500 hover:text-dp-primary mb-10 transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" aria-hidden />
                        Retour au site
                    </Link>

                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15, duration: 0.45 }}
                    >
                        <h1 className="font-display text-3xl sm:text-4xl text-dp-primary tracking-tight">Connexion</h1>
                        <p className="mt-2 text-dp-neutral-500 font-sans">
                            Accédez à votre espace patient sécurisé DentistPro.
                        </p>
                    </motion.div>

                    <AnimatePresence>
                        {errors.global && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto', x: [0, -4, 4, 0] }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-6 p-4 rounded-2xl bg-dp-danger/10 border border-dp-danger/25 text-dp-danger text-sm font-semibold"
                                role="alert"
                            >
                                {errors.global}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate>
                        <FloatingField
                            id="login-email"
                            label="Adresse email"
                            type="email"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                if (errors.email) setErrors((p) => ({ ...p, email: '' }));
                            }}
                            icon={Mail}
                            error={errors.email}
                            autoComplete="email"
                        />

                        <div>
                            <FloatingField
                                id="login-password"
                                label="Mot de passe"
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    if (errors.password) setErrors((p) => ({ ...p, password: '' }));
                                }}
                                icon={Lock}
                                error={errors.password}
                                autoComplete="current-password"
                                rightSlot={
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((v) => !v)}
                                        className="p-2 rounded-lg text-dp-neutral-400 hover:text-dp-primary hover:bg-dp-neutral-100 transition-colors"
                                        aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                                    >
                                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                }
                            />
                            <div className="flex justify-end mt-2">
                                <a
                                    href="#"
                                    className="text-xs font-semibold text-dp-secondary hover:text-dp-primary hover:underline underline-offset-4 transition-colors"
                                    onClick={(e) => e.preventDefault()}
                                >
                                    Mot de passe oublié ?
                                </a>
                            </div>
                        </div>

                        <motion.button
                            type="submit"
                            disabled={loading}
                            whileHover={!loading ? { scale: 1.01 } : {}}
                            whileTap={!loading ? { scale: 0.99 } : {}}
                            className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-2xl bg-[#0F172A] text-white font-bold text-sm uppercase tracking-widest shadow-lg shadow-slate-900/20 hover:bg-dp-primary disabled:opacity-60 disabled:cursor-not-allowed transition-colors group"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
                                    <span>Connexion en cours…</span>
                                </>
                            ) : (
                                <>
                                    <span>SE CONNECTER</span>
                                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" aria-hidden />
                                </>
                            )}
                        </motion.button>

                        <div className="relative py-4">
                            <div className="absolute inset-0 flex items-center" aria-hidden>
                                <div className="w-full border-t border-dp-neutral-200" />
                            </div>
                            <div className="relative flex justify-center">
                                <span className="bg-white px-4 text-xs font-bold uppercase tracking-widest text-dp-neutral-400">
                                    ou
                                </span>
                            </div>
                        </div>

                        <button
                            type="button"
                            disabled
                            title="Bientôt disponible"
                            className="w-full flex items-center justify-center gap-3 py-3.5 px-6 rounded-2xl border-2 border-dp-neutral-200 bg-white text-dp-neutral-600 font-semibold text-sm opacity-70 cursor-not-allowed"
                        >
                            <GoogleIcon />
                            Continuer avec Google
                            <span className="text-[10px] font-bold uppercase tracking-wider text-dp-neutral-400 ml-1">
                                (bientôt)
                            </span>
                        </button>
                    </form>

                    <p className="mt-10 pt-8 border-t border-dp-neutral-100 text-center text-sm text-dp-neutral-600">
                        Pas encore de compte ?{' '}
                        <Link
                            to="/register"
                            className="font-bold text-dp-secondary hover:text-dp-primary relative inline-block group"
                        >
                            Créer un profil patient
                            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-dp-secondary group-hover:w-full transition-all duration-300" />
                        </Link>
                    </p>
                </div>
            </motion.div>
        </motion.div>
    );
};

function GoogleIcon() {
    return (
        <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden>
            <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
        </svg>
    );
}

export default Login;
