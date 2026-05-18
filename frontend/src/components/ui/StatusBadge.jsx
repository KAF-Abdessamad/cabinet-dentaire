import React from 'react';
import PropTypes from 'prop-types';
import { Clock, CheckCircle2, XCircle, CheckSquare, DollarSign, AlertCircle, TrendingDown } from 'lucide-react';
import { motion } from 'framer-motion';

const statusConfigs = {
    pending: { label: 'En attente', color: 'bg-blue-50 text-blue-700 border-blue-100', icon: Clock },
    confirmed: { label: 'Confirmé', color: 'bg-emerald-50 text-emerald-700 border-emerald-100', icon: CheckCircle2 },
    cancelled: { label: 'Annulé', color: 'bg-rose-50 text-rose-700 border-rose-100', icon: XCircle },
    completed: { label: 'Terminé', color: 'bg-teal-50 text-teal-700 border-teal-100', icon: CheckSquare },
    paid: { label: 'Payée', color: 'bg-green-50 text-green-700 border-green-100', icon: DollarSign },
    partial: { label: 'Partiel', color: 'bg-amber-50 text-amber-700 border-amber-100', icon: AlertCircle },
    unpaid: { label: 'Impayée', color: 'bg-red-50 text-red-700 border-red-100', icon: TrendingDown },
};

const StatusBadge = ({ status }) => {
    const config = statusConfigs[status] || { label: status, color: 'bg-slate-50 text-slate-700 border-slate-100', icon: Clock };
    const Icon = config.icon;

    return (
        <motion.div 
            whileHover={{ scale: 1.05 }}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-black uppercase tracking-wider ${config.color} shadow-sm select-none w-fit`}
        >
            <Icon size={12} strokeWidth={2.5} />
            <span>{config.label}</span>
        </motion.div>
    );
};

StatusBadge.propTypes = {
    status: PropTypes.oneOf(['pending', 'confirmed', 'cancelled', 'completed', 'paid', 'partial', 'unpaid']).isRequired,
};

export default StatusBadge;
