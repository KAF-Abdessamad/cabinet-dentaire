import React from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { cn } from '../utils.js';

const config = {
    success: { Icon: CheckCircle2, box: 'bg-dp-success/10 border-dp-success/30', icon: 'text-dp-success' },
    error: { Icon: XCircle, box: 'bg-dp-danger/10 border-dp-danger/30', icon: 'text-dp-danger' },
    warning: { Icon: AlertTriangle, box: 'bg-dp-warning/10 border-dp-warning/30', icon: 'text-dp-warning' },
    info: { Icon: Info, box: 'bg-dp-info/10 border-dp-info/30', icon: 'text-dp-info' },
};

export function Alert({ type = 'info', title, children, onDismiss, className }) {
    const { Icon, box, icon } = config[type] || config.info;

    return (
        <div role="alert" className={cn('flex gap-3 p-4 rounded-dp-xl border', box, className)}>
            <Icon className={cn('h-5 w-5 shrink-0 mt-0.5', icon)} aria-hidden />
            <div className="flex-1 min-w-0">
                {title && <p className="font-semibold text-sm text-dp-primary">{title}</p>}
                <div className="text-sm text-dp-neutral-700">{children}</div>
            </div>
            {onDismiss && (
                <button
                    type="button"
                    onClick={onDismiss}
                    className="shrink-0 p-1 rounded-dp-md hover:bg-dp-white/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-dp-secondary"
                    aria-label="Fermer l’alerte"
                >
                    <X className="h-4 w-4 text-dp-neutral-500" />
                </button>
            )}
        </div>
    );
}

export default Alert;
