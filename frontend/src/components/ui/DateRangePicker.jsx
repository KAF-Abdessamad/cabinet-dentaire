import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Calendar, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

const DateRangePicker = ({ startDate, endDate, onChange }) => {
    const handlePreset = (type) => {
        const today = new Date();
        let start = new Date();
        let end = new Date();

        switch (type) {
            case 'today':
                // Today
                break;
            case 'week':
                // This week (start at Monday)
                const currentDay = today.getDay();
                const distanceToMonday = currentDay === 0 ? 6 : currentDay - 1;
                start.setDate(today.getDate() - distanceToMonday);
                end.setDate(start.getDate() + 6);
                break;
            case 'month':
                // This month
                start = new Date(today.getFullYear(), today.getMonth(), 1);
                end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                break;
            case '3months':
                // Last 3 months
                start.setMonth(today.getMonth() - 3);
                break;
            default:
                break;
        }

        onChange({
            start: start.toISOString().split('T')[0],
            end: end.toISOString().split('T')[0]
        });
    };

    return (
        <div className="bg-slate-50 rounded-[24px] border border-slate-100 p-4 space-y-4">
            {/* Presets Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                    { id: 'today', label: "Aujourd'hui" },
                    { id: 'week', label: 'Cette semaine' },
                    { id: 'month', label: 'Ce mois' },
                    { id: '3months', label: '3 derniers mois' }
                ].map((preset) => (
                    <motion.button
                        key={preset.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handlePreset(preset.id)}
                        className="py-2 px-3 bg-white border border-slate-200 text-[10px] font-black uppercase tracking-wider text-slate-600 rounded-xl hover:bg-slate-100 hover:text-slate-800 transition shadow-sm text-center"
                        type="button"
                    >
                        {preset.label}
                    </motion.button>
                ))}
            </div>

            {/* Inputs Box */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="relative w-full">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-350 pointer-events-none">
                        <Calendar size={14} />
                    </div>
                    <input
                        type="date"
                        value={startDate || ''}
                        onChange={(e) => onChange({ start: e.target.value, end: endDate })}
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition"
                    />
                </div>
                <ChevronRight size={16} className="text-slate-300 hidden sm:block shrink-0" />
                <div className="relative w-full">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-350 pointer-events-none">
                        <Calendar size={14} />
                    </div>
                    <input
                        type="date"
                        value={endDate || ''}
                        onChange={(e) => onChange({ start: startDate, end: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition"
                    />
                </div>
            </div>
        </div>
    );
};

DateRangePicker.propTypes = {
    startDate: PropTypes.string,
    endDate: PropTypes.string,
    onChange: PropTypes.func.isRequired,
};

DateRangePicker.defaultProps = {
    startDate: '',
    endDate: '',
};

export default DateRangePicker;
