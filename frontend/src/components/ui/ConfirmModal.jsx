import React from 'react';
import PropTypes from 'prop-types';
import { AlertOctagon, AlertTriangle, Info, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const variants = {
    danger: {
        icon: AlertOctagon,
        color: 'text-rose-500 bg-rose-50 border-rose-100',
        btnConfirm: 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-100'
    },
    warning: {
        icon: AlertTriangle,
        color: 'text-amber-500 bg-amber-50 border-amber-100',
        btnConfirm: 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-100'
    },
    info: {
        icon: Info,
        color: 'text-blue-500 bg-blue-50 border-blue-100',
        btnConfirm: 'bg-blue-500 hover:bg-blue-600 text-white shadow-blue-100'
    }
};

const ConfirmModal = ({ 
    isOpen,
    title, 
    message, 
    confirmLabel, 
    cancelLabel, 
    onConfirm, 
    onCancel, 
    variant 
}) => {
    const config = variants[variant] || variants.info;
    const Icon = config.icon;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onCancel}
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                    />

                    {/* Dialog Container */}
                    <motion.div 
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        className="relative bg-white rounded-3xl p-6 lg:p-8 max-w-md w-full shadow-2xl border border-slate-100 z-10 space-y-6"
                    >
                        {/* Close Trigger */}
                        <button 
                            onClick={onCancel} 
                            className="absolute top-5 right-4 p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-400 rounded-lg transition"
                        >
                            <X size={15} />
                        </button>

                        <div className="flex gap-4">
                            {/* Variant Icon */}
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${config.color}`}>
                                <Icon size={20} strokeWidth={2.5} />
                            </div>

                            {/* Text Contents */}
                            <div className="space-y-1.5">
                                <h3 className="text-base font-black text-slate-800 uppercase tracking-tight leading-snug">
                                    {title}
                                </h3>
                                <p className="text-xs font-semibold text-slate-550 leading-relaxed">
                                    {message}
                                </p>
                            </div>
                        </div>

                        {/* Buttons Block */}
                        <div className="flex items-center justify-end gap-3 pt-2">
                            <button 
                                onClick={onCancel} 
                                className="px-5 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl text-xs font-black uppercase tracking-wider transition border border-slate-200"
                            >
                                {cancelLabel}
                            </button>
                            <button 
                                onClick={onConfirm} 
                                className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition shadow-lg ${config.btnConfirm}`}
                            >
                                {confirmLabel}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

ConfirmModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    title: PropTypes.string.isRequired,
    message: PropTypes.string.isRequired,
    confirmLabel: PropTypes.string,
    cancelLabel: PropTypes.string,
    onConfirm: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    variant: PropTypes.oneOf(['danger', 'warning', 'info']),
};

ConfirmModal.defaultProps = {
    confirmLabel: 'Confirmer',
    cancelLabel: 'Annuler',
    variant: 'info',
};

export default ConfirmModal;
