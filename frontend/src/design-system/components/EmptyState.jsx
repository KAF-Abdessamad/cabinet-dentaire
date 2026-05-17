import React from 'react';
import { CalendarX2, Users, FileText, Inbox } from 'lucide-react';
import { cn } from '../utils.js';
import { Button } from './Button.jsx';

const presets = {
    appointments: {
        Icon: CalendarX2,
        title: 'Aucun rendez-vous',
        description: 'Il n’y a pas encore de rendez-vous pour cette période.',
    },
    patients: {
        Icon: Users,
        title: 'Aucun patient',
        description: 'Commencez par ajouter un patient ou importez votre liste.',
    },
    invoices: {
        Icon: FileText,
        title: 'Aucune facture',
        description: 'Les factures générées apparaîtront ici.',
    },
    default: {
        Icon: Inbox,
        title: 'Rien à afficher',
        description: 'Cette liste est vide pour le moment.',
    },
};

function Illustration({ variant = 'default' }) {
    const { Icon } = presets[variant] || presets.default;
    return (
        <div
            className="relative mx-auto h-28 w-28 rounded-full bg-dp-accent flex items-center justify-center"
            aria-hidden
        >
            <div className="absolute inset-2 rounded-full border-2 border-dashed border-dp-secondary/25" />
            <Icon className="h-12 w-12 text-dp-secondary/70" strokeWidth={1.25} />
        </div>
    );
}

export function EmptyState({
    variant = 'default',
    title,
    description,
    actionLabel,
    onAction,
    icon: CustomIcon,
    children,
    className,
}) {
    const preset = presets[variant] || presets.default;
    const Icon = CustomIcon || preset.Icon;
    const heading = title || preset.title;
    const body = description || preset.description;

    return (
        <div
            className={cn(
                'flex flex-col items-center justify-center text-center px-6 py-12 max-w-md mx-auto',
                className
            )}
            role="status"
        >
            {CustomIcon ? (
                <div className="h-28 w-28 rounded-full bg-dp-accent flex items-center justify-center mb-6" aria-hidden>
                    <Icon className="h-12 w-12 text-dp-secondary/70" strokeWidth={1.25} />
                </div>
            ) : (
                <Illustration variant={variant} />
            )}
            <h3 className="font-display text-xl text-dp-primary mt-6">{heading}</h3>
            <p className="text-sm text-dp-neutral-600 mt-2 leading-relaxed">{body}</p>
            {children}
            {actionLabel && onAction && (
                <Button className="mt-6" onClick={onAction}>
                    {actionLabel}
                </Button>
            )}
        </div>
    );
}

export default EmptyState;
