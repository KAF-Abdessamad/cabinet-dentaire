import React from 'react';
import { cn } from '../utils.js';
import { statusTokens } from '../tokens.js';

const variants = {
    success: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    danger: 'bg-red-100 text-red-800 border-red-200',
    warning: 'bg-amber-100 text-amber-900 border-amber-200',
    info: 'bg-blue-100 text-blue-800 border-blue-200',
    neutral: 'bg-dp-neutral-100 text-dp-neutral-700 border-dp-neutral-200',
    primary: 'bg-dp-accent text-dp-primary border-dp-primary/20',
};

export function Badge({ children, variant = 'neutral', status, className, dot = false }) {
    const fromStatus = status && statusTokens[status];
    const v = fromStatus ? variants[fromStatus.variant] || variants.neutral : variants[variant] || variants.neutral;
    const label = children || fromStatus?.label || status;

    return (
        <span
            className={cn(
                'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-dp-full text-xs font-bold uppercase tracking-wide border',
                v,
                className
            )}
        >
            {dot && <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" aria-hidden />}
            {label}
        </span>
    );
}

export default Badge;
