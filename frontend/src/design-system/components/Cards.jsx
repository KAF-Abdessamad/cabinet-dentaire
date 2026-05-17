import React from 'react';
import { cn } from '../utils.js';

function CardBase({ children, className, onClick, hoverable = true, ...props }) {
    const Comp = onClick ? 'button' : 'div';
    return (
        <Comp
            type={onClick ? 'button' : undefined}
            onClick={onClick}
            className={cn(
                'rounded-dp-xl bg-dp-white border border-dp-neutral-100 text-left w-full',
                'shadow-dp-card transition-all duration-dp-base ease-dp',
                hoverable && 'hover:shadow-dp-card-hover hover:border-dp-secondary/25',
                onClick && 'focus:outline-none focus-visible:ring-2 focus-visible:ring-dp-secondary focus-visible:ring-offset-2',
                className
            )}
            {...props}
        >
            {children}
        </Comp>
    );
}

export function PatientCard({ patient, footer, onClick, className }) {
    const initials = `${patient?.first_name?.[0] || ''}${patient?.last_name?.[0] || ''}`.toUpperCase();
    return (
        <CardBase onClick={onClick} className={cn('p-5', className)}>
            <div className="flex items-start gap-4">
                <div
                    className="h-12 w-12 rounded-dp-lg bg-dp-accent text-dp-primary font-display text-lg flex items-center justify-center shrink-0"
                    aria-hidden
                >
                    {initials || '?'}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="font-display text-lg text-dp-primary leading-tight">
                        {patient?.first_name} {patient?.last_name}
                    </p>
                    <p className="font-mono text-xs text-dp-neutral-500 mt-1">#{patient?.id}</p>
                    {patient?.phone && <p className="text-sm text-dp-neutral-600 mt-2">{patient.phone}</p>}
                    {patient?.email && <p className="text-sm text-dp-neutral-500 truncate">{patient.email}</p>}
                </div>
            </div>
            {footer && <div className="mt-4 pt-4 border-t border-dp-neutral-100">{footer}</div>}
        </CardBase>
    );
}

export function AppointmentCard({ appointment, badge, actions, onClick, className }) {
    return (
        <CardBase onClick={onClick} className={cn('p-5', className)}>
            <div className="flex justify-between items-start gap-2">
                <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-dp-neutral-400">Rendez-vous</p>
                    <p className="font-display text-xl text-dp-primary mt-1">
                        {appointment?.patient_name ||
                            `${appointment?.patient?.first_name || ''} ${appointment?.patient?.last_name || ''}`}
                    </p>
                </div>
                {badge}
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div>
                    <dt className="text-dp-neutral-400 text-xs font-semibold">Date</dt>
                    <dd className="font-medium text-dp-neutral-800">{appointment?.appointment_date || '—'}</dd>
                </div>
                <div>
                    <dt className="text-dp-neutral-400 text-xs font-semibold">Heure</dt>
                    <dd className="font-medium text-dp-neutral-800">
                        {appointment?.start_time?.slice?.(0, 5) || '—'}
                    </dd>
                </div>
                <div className="col-span-2">
                    <dt className="text-dp-neutral-400 text-xs font-semibold">Soin / Praticien</dt>
                    <dd className="font-medium text-dp-neutral-800">
                        {appointment?.treatment?.name || appointment?.reason || '—'}
                        {appointment?.dentist?.name ? ` · Dr. ${appointment.dentist.name}` : ''}
                    </dd>
                </div>
            </dl>
            {actions && <div className="mt-4 flex flex-wrap gap-2">{actions}</div>}
        </CardBase>
    );
}

export function InvoiceCard({ invoice, onClick, className }) {
    return (
        <CardBase onClick={onClick} className={cn('p-5', className)}>
            <p className="text-xs font-bold uppercase tracking-widest text-dp-neutral-400">Facture</p>
            <p className="font-mono text-sm text-dp-neutral-500 mt-1">#{invoice?.id}</p>
            <p className="font-display text-2xl text-dp-primary mt-2">
                {Number(invoice?.total_amount || 0).toFixed(2)} MAD
            </p>
            <p className="text-sm text-dp-neutral-600 mt-2">{invoice?.invoice_date || '—'}</p>
        </CardBase>
    );
}

export function StatCard({ title, value, trend, icon: Icon, className }) {
    return (
        <CardBase hoverable className={cn('p-6', className)}>
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-dp-neutral-400">{title}</p>
                    <p className="font-display text-4xl text-dp-primary mt-2">{value}</p>
                    {trend && <p className="text-sm font-semibold text-dp-success mt-1">{trend}</p>}
                </div>
                {Icon && (
                    <div className="p-3 rounded-dp-lg bg-dp-accent text-dp-secondary" aria-hidden>
                        <Icon className="h-6 w-6" />
                    </div>
                )}
            </div>
        </CardBase>
    );
}
