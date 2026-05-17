import React, { useEffect, useId } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '../utils.js';

export function Modal({ isOpen, onClose, title, description, children, size = 'md', footer, className }) {
    const titleId = useId();
    const descId = useId();

    useEffect(() => {
        if (!isOpen) return;
        const onKey = (e) => e.key === 'Escape' && onClose?.();
        document.addEventListener('keydown', onKey);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', onKey);
            document.body.style.overflow = '';
        };
    }, [isOpen, onClose]);

    const sizes = {
        sm: 'max-w-md',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl',
    };

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 z-[200] flex items-center justify-center p-4"
                    role="presentation"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <button
                        type="button"
                        className="absolute inset-0 bg-dp-neutral-900/50 backdrop-blur-sm"
                        aria-label="Fermer la fenêtre"
                        onClick={onClose}
                    />
                    <motion.div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby={titleId}
                        aria-describedby={description ? descId : undefined}
                        initial={{ opacity: 0, scale: 0.95, y: 12 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 12 }}
                        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                        className={cn(
                            'relative w-full rounded-dp-2xl bg-dp-white shadow-dp-xl border border-dp-neutral-100 max-h-[90vh] flex flex-col',
                            sizes[size],
                            className
                        )}
                    >
                        <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-dp-neutral-100 bg-dp-accent/40 rounded-t-dp-2xl">
                            <div>
                                <h2 id={titleId} className="font-display text-xl text-dp-primary">
                                    {title}
                                </h2>
                                {description && (
                                    <p id={descId} className="text-sm text-dp-neutral-600 mt-1">
                                        {description}
                                    </p>
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={onClose}
                                className="p-2 rounded-dp-md hover:bg-dp-white text-dp-neutral-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-dp-secondary"
                                aria-label="Fermer"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
                        {footer && (
                            <div className="px-6 py-4 border-t border-dp-neutral-100 bg-dp-neutral-50 rounded-b-dp-2xl flex justify-end gap-3">
                                {footer}
                            </div>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>,
        document.body
    );
}

export default Modal;
