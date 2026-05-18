import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { motion } from 'framer-motion';

const colorThemes = {
    blue: 'text-blue-600 bg-blue-50/50 border-blue-100 shadow-blue-100/10',
    emerald: 'text-emerald-600 bg-emerald-50/50 border-emerald-100 shadow-emerald-100/10',
    amber: 'text-amber-600 bg-amber-50/50 border-amber-100 shadow-amber-100/10',
    rose: 'text-rose-600 bg-rose-50/50 border-rose-100 shadow-rose-100/10',
};

const StatCard = ({ title, value, icon: Icon, trend, trendUp, color }) => {
    const [displayVal, setDisplayVal] = useState(0);
    const themeClass = colorThemes[color] || colorThemes.blue;

    // Premium Count-Up logic
    useEffect(() => {
        const numVal = parseFloat(String(value).replace(/[^\d.]/g, ''));
        if (isNaN(numVal)) {
            setDisplayVal(value);
            return;
        }

        let start = 0;
        const duration = 800; // ms
        const stepTime = 16; // ~60fps
        const steps = Math.ceil(duration / stepTime);
        const increment = numVal / steps;
        
        let currentStep = 0;
        const timer = setInterval(() => {
            currentStep++;
            if (currentStep >= steps) {
                setDisplayVal(value);
                clearInterval(timer);
            } else {
                start += increment;
                // Preserve currency symbols or formatting if needed
                const isCurrency = String(value).includes('DH');
                if (isCurrency) {
                    setDisplayVal(`${Math.round(start).toLocaleString('fr-FR')} DH`);
                } else {
                    setDisplayVal(Math.round(start).toLocaleString('fr-FR'));
                }
            }
        }, stepTime);

        return () => clearInterval(timer);
    }, [value]);

    return (
        <motion.div 
            whileHover={{ y: -4 }}
            className={`bg-white rounded-3xl p-6 border border-slate-100 shadow-md hover:shadow-xl transition-all duration-300 relative overflow-hidden`}
        >
            <div className="flex justify-between items-start">
                <div className="space-y-1.5">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
                        {title}
                    </p>
                    <h3 className="text-3xl font-black text-slate-800 tracking-tight leading-none uppercase">
                        {displayVal}
                    </h3>
                </div>

                {/* Styled icon box */}
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border shrink-0 ${themeClass}`}>
                    <Icon size={20} strokeWidth={2.5} />
                </div>
            </div>

            {/* Trend Indicator */}
            {trend && (
                <div className="flex items-center gap-1.5 mt-5">
                    <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider ${trendUp ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                        {trendUp ? <ArrowUpRight size={10} strokeWidth={3} /> : <ArrowDownRight size={10} strokeWidth={3} />}
                        {trend}%
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">ce mois-ci</span>
                </div>
            )}
        </motion.div>
    );
};

StatCard.propTypes = {
    title: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    icon: PropTypes.elementType.isRequired,
    trend: PropTypes.string,
    trendUp: PropTypes.bool,
    color: PropTypes.oneOf(['blue', 'emerald', 'amber', 'rose']),
};

StatCard.defaultProps = {
    trend: null,
    trendUp: true,
    color: 'blue',
};

export default StatCard;
