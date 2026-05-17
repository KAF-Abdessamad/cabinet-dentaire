import React, { useId, useState } from 'react';
import { cn } from '../utils.js';

const stateStyles = {
    default: 'border-dp-neutral-200 focus:border-dp-secondary focus:ring-dp-secondary/20',
    success: 'border-dp-success focus:border-dp-success focus:ring-dp-success/20',
    error: 'border-dp-danger focus:border-dp-danger focus:ring-dp-danger/20',
    warning: 'border-dp-warning focus:border-dp-warning focus:ring-dp-warning/20',
};

const baseFieldClass = cn(
    'w-full rounded-dp-lg border-2 bg-dp-white font-sans text-dp-neutral-800',
    'transition-all duration-dp-base focus:outline-none focus:ring-4 px-4 py-3'
);

export function Input({
    label,
    type = 'text',
    error,
    hint,
    success,
    icon: Icon,
    floating = true,
    className,
    wrapperClassName,
    id: idProp,
    required,
    ...props
}) {
    const autoId = useId();
    const id = idProp || autoId;
    const errorId = `${id}-error`;
    const hintId = `${id}-hint`;
    const [focused, setFocused] = useState(false);
    const hasValue = props.value !== undefined && String(props.value).length > 0;
    const state = error ? 'error' : success ? 'success' : 'default';

    return (
        <div className="w-full">
            {!floating && label && (
                <label htmlFor={id} className="block text-sm font-semibold text-dp-neutral-700 mb-1.5">
                    {label}
                    {required && <span className="text-dp-danger"> *</span>}
                </label>
            )}
            <div className={cn('relative', wrapperClassName)}>
                {Icon && (
                    <span
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-dp-neutral-400 pointer-events-none z-10"
                        aria-hidden
                    >
                        <Icon className="h-5 w-5" />
                    </span>
                )}
                <input
                    id={id}
                    type={type}
                    required={required}
                    aria-invalid={!!error}
                    aria-describedby={[error && errorId, hint && hintId].filter(Boolean).join(' ') || undefined}
                    onFocus={(e) => {
                        setFocused(true);
                        props.onFocus?.(e);
                    }}
                    onBlur={(e) => {
                        setFocused(false);
                        props.onBlur?.(e);
                    }}
                    className={cn(
                        baseFieldClass,
                        floating && 'pt-5 pb-2 placeholder-transparent',
                        Icon && 'pl-11',
                        stateStyles[state],
                        className
                    )}
                    placeholder={floating ? label || ' ' : props.placeholder}
                    {...props}
                />
                {floating && label && (
                    <label
                        htmlFor={id}
                        className={cn(
                            'absolute font-sans text-dp-neutral-500 transition-all duration-dp-base pointer-events-none z-10',
                            Icon ? 'left-11' : 'left-4',
                            hasValue || focused
                                ? 'top-2 text-xs text-dp-secondary font-semibold'
                                : 'top-1/2 -translate-y-1/2 text-sm'
                        )}
                    >
                        {label}
                        {required && <span className="text-dp-danger ml-0.5">*</span>}
                    </label>
                )}
            </div>
            {error && (
                <p id={errorId} className="mt-1.5 text-xs font-medium text-dp-danger" role="alert">
                    {error}
                </p>
            )}
            {hint && !error && (
                <p id={hintId} className="mt-1.5 text-xs text-dp-neutral-500">
                    {hint}
                </p>
            )}
        </div>
    );
}

export function Select({ label, error, hint, options = [], id: idProp, required, className, ...props }) {
    const autoId = useId();
    const id = idProp || autoId;
    const state = error ? 'error' : 'default';

    return (
        <div className="w-full">
            {label && (
                <label htmlFor={id} className="block text-sm font-semibold text-dp-neutral-700 mb-1.5">
                    {label}
                    {required && <span className="text-dp-danger"> *</span>}
                </label>
            )}
            <select
                id={id}
                required={required}
                aria-invalid={!!error}
                className={cn(baseFieldClass, stateStyles[state], className)}
                {...props}
            >
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
            {error && (
                <p className="mt-1.5 text-xs text-dp-danger" role="alert">
                    {error}
                </p>
            )}
            {hint && !error && <p className="mt-1.5 text-xs text-dp-neutral-500">{hint}</p>}
        </div>
    );
}

export function Textarea({ label, error, hint, id: idProp, required, rows = 4, className, ...props }) {
    const autoId = useId();
    const id = idProp || autoId;
    const state = error ? 'error' : 'default';

    return (
        <div className="w-full">
            {label && (
                <label htmlFor={id} className="block text-sm font-semibold text-dp-neutral-700 mb-1.5">
                    {label}
                    {required && <span className="text-dp-danger"> *</span>}
                </label>
            )}
            <textarea
                id={id}
                rows={rows}
                required={required}
                aria-invalid={!!error}
                className={cn(baseFieldClass, 'resize-y min-h-[100px]', stateStyles[state], className)}
                {...props}
            />
            {error && (
                <p className="mt-1.5 text-xs text-dp-danger" role="alert">
                    {error}
                </p>
            )}
            {hint && !error && <p className="mt-1.5 text-xs text-dp-neutral-500">{hint}</p>}
        </div>
    );
}
