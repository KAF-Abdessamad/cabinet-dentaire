import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { cn } from '../utils.js';

const icons = {
    success: CheckCircle2,
    error: XCircle,
    warning: AlertTriangle,
    info: Info,
};

const styles = {
    success: 'bg-dp-success/10 border-dp-success/30 text-dp-neutral-800',
    error: 'bg-dp-danger/10 border-dp-danger/30 text-dp-neutral-800',
    warning: 'bg-dp-warning/10 border-dp-warning/30 text-dp-neutral-800',
    info: 'bg-dp-info/10 border-dp-info/30 text-dp-neutral-800',
};

const iconColors = {
    success: 'text-dp-success',
    error: 'text-dp-danger',
    warning: 'text-dp-warning',
    info: 'text-dp-info',
};

const ToastContext = createContext(null);

let externalPush = null;

export function ToastProvider({ children, position = 'top-right', defaultDuration = 5000 }) {
    const [toasts, setToasts] = useState([]);

    const dismiss = useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const push = useCallback(
        (message, { type = 'info', title, duration = defaultDuration } = {}) => {
            const id = crypto.randomUUID?.() || String(Date.now() + Math.random());
            setToasts((prev) => [...prev, { id, message, type, title, duration }]);
            if (duration > 0) {
                setTimeout(() => dismiss(id), duration);
            }
            return id;
        },
        [defaultDuration, dismiss]
    );

    useEffect(() => {
        externalPush = push;
        return () => {
            externalPush = null;
        };
    }, [push]);

    const positions = {
        'top-right': 'top-4 right-4 items-end',
        'top-left': 'top-4 left-4 items-start',
        'bottom-right': 'bottom-4 right-4 items-end',
        'bottom-left': 'bottom-4 left-4 items-start',
    };

    return (
        <ToastContext.Provider value={{ push, dismiss }}>
            {children}
            {createPortal(
                <motion.div
                    role="region"
                    aria-live="polite"
                    aria-label="Notifications"
                    className={cn('fixed z-[300] flex flex-col gap-3 pointer-events-none', positions[position])}
                >
                    <AnimatePresence>
                        {toasts.map((t) => {
                            const Icon = icons[t.type] || Info;
                            return (
                                <motion.div
                                    key={t.id}
                                    layout
                                    initial={{ opacity: 0, x: 24, scale: 0.96 }}
                                    animate={{ opacity: 1, x: 0, scale: 1 }}
                                    exit={{ opacity: 0, x: 24, scale: 0.96 }}
                                    className={cn(
                                        'pointer-events-auto flex gap-3 min-w-[280px] max-w-sm p-4 rounded-dp-xl border shadow-dp-lg bg-dp-white',
                                        styles[t.type]
                                    )}
                                >
                                    <Icon className={cn('h-5 w-5 shrink-0 mt-0.5', iconColors[t.type])} aria-hidden />
                                    <div className="flex-1 min-w-0">
                                        {t.title && <p className="font-semibold text-sm text-dp-primary">{t.title}</p>}
                                        <p className="text-sm">{t.message}</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => dismiss(t.id)}
                                        className="shrink-0 p-1 rounded-dp-md hover:bg-dp-neutral-100 text-dp-neutral-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-dp-secondary"
                                        aria-label="Fermer la notification"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </motion.div>,
                document.body
            )}
        </ToastContext.Provider>
    );
}

export function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx) {
        return {
            push: (msg, opts) => externalPush?.(msg, opts),
            dismiss: () => {},
            success: (msg, opts) => externalPush?.(msg, { ...opts, type: 'success' }),
            error: (msg, opts) => externalPush?.(msg, { ...opts, type: 'error' }),
            warning: (msg, opts) => externalPush?.(msg, { ...opts, type: 'warning' }),
            info: (msg, opts) => externalPush?.(msg, { ...opts, type: 'info' }),
        };
    }
    return {
        ...ctx,
        success: (msg, opts) => ctx.push(msg, { ...opts, type: 'success' }),
        error: (msg, opts) => ctx.push(msg, { ...opts, type: 'error' }),
        warning: (msg, opts) => ctx.push(msg, { ...opts, type: 'warning' }),
        info: (msg, opts) => ctx.push(msg, { ...opts, type: 'info' }),
    };
}

export function Toast({ type = 'info', title, message, onClose, className }) {
    const Icon = icons[type] || Info;
    return (
        <div
            role="alert"
            className={cn(
                'flex gap-3 p-4 rounded-dp-xl border shadow-dp-md',
                styles[type],
                className
            )}
        >
            <Icon className={cn('h-5 w-5 shrink-0', iconColors[type])} aria-hidden />
            <div className="flex-1">
                {title && <p className="font-semibold text-sm">{title}</p>}
                <p className="text-sm">{message}</p>
            </div>
            {onClose && (
                <button type="button" onClick={onClose} aria-label="Fermer" className="p-1">
                    <X className="h-4 w-4" />
                </button>
            )}
        </div>
    );
}

export default ToastProvider;
