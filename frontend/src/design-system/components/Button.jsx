import React from 'react';
import { cn, useRipple } from '../utils.js';

const variants = {
    primary:
        'bg-dp-primary text-white hover:bg-dp-primary-hover active:bg-dp-primary-active shadow-md hover:shadow-lg',
    secondary:
        'bg-dp-secondary text-white hover:opacity-90 active:opacity-80 shadow-md',
    ghost:
        'bg-transparent text-dp-primary border-2 border-dp-neutral-200 hover:bg-dp-accent hover:border-dp-secondary/30',
    danger: 'bg-dp-danger text-white hover:opacity-90 active:opacity-80',
    icon: 'bg-dp-accent text-dp-primary hover:bg-dp-secondary/15 p-2.5',
};

const sizes = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-5 py-2.5 text-sm gap-2',
    lg: 'px-7 py-3.5 text-base gap-2.5',
};

export function Button({
    children,
    variant = 'primary',
    size = 'md',
    type = 'button',
    disabled = false,
    loading = false,
    icon: Icon,
    iconPosition = 'left',
    className,
    onClick,
    'aria-label': ariaLabel,
    ...props
}) {
    const ripple = useRipple();
    const isIconOnly = variant === 'icon' || (!children && Icon);

    return (
        <button
            type={type}
            disabled={disabled || loading}
            aria-label={ariaLabel || (isIconOnly ? 'Action' : undefined)}
            aria-busy={loading}
            onClick={(e) => {
                if (!disabled && !loading) ripple(e);
                onClick?.(e);
            }}
            className={cn(
                'relative overflow-hidden inline-flex items-center justify-center font-sans font-semibold rounded-dp-lg',
                'transition-all duration-dp-base ease-dp focus:outline-none focus-visible:ring-2 focus-visible:ring-dp-secondary focus-visible:ring-offset-2',
                'disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed',
                variants[variant] || variants.primary,
                !isIconOnly && sizes[size],
                isIconOnly && 'rounded-dp-md',
                className
            )}
            {...props}
        >
            {loading && (
                <span
                    className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin"
                    aria-hidden
                />
            )}
            {!loading && Icon && iconPosition === 'left' && <Icon className="h-4 w-4 shrink-0" aria-hidden />}
            {!loading && children}
            {!loading && Icon && iconPosition === 'right' && <Icon className="h-4 w-4 shrink-0" aria-hidden />}
        </button>
    );
}

export default Button;
