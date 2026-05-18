import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';

const statusNodeStyles = {
    pending: 'bg-blue-500 shadow-blue-500/20',
    confirmed: 'bg-emerald-500 shadow-emerald-500/20',
    completed: 'bg-teal-500 shadow-teal-500/20',
    cancelled: 'bg-rose-500 shadow-rose-500/20',
};

const TimelineItem = ({ date, title, description, icon: Icon, status }) => {
    const nodeColor = statusNodeStyles[status] || 'bg-slate-400';

    return (
        <motion.div 
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative pl-8 group pb-8 last:pb-0"
        >
            {/* Timeline Connector Line */}
            <div className="absolute left-2.5 top-2.5 bottom-0 w-0.5 bg-slate-100 group-last:hidden" />

            {/* Timeline Dot Node */}
            <div 
                className={`absolute left-0 top-1.5 w-5 h-5 rounded-full border-4 border-white shadow-md flex items-center justify-center transition-all duration-300 group-hover:scale-125 z-10 ${nodeColor}`}
            />

            {/* Content Card container */}
            <div className="p-5 bg-slate-50 border border-slate-100 hover:border-slate-200 rounded-2xl hover:bg-white hover:shadow-lg hover:shadow-slate-100/50 transition-all duration-300">
                <div className="flex justify-between items-start gap-4 flex-wrap">
                    <div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">
                            {date}
                        </span>
                        <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight">
                            {title}
                        </h4>
                    </div>

                    {/* Styled Icon inside card */}
                    {Icon && (
                        <div className="p-2 bg-slate-100 text-slate-500 rounded-xl shrink-0">
                            <Icon size={14} />
                        </div>
                    )}
                </div>

                {description && (
                    <p className="text-xs font-semibold text-slate-500 mt-2.5 leading-relaxed bg-white/60 p-3 rounded-xl border border-slate-100">
                        {description}
                    </p>
                )}
            </div>
        </motion.div>
    );
};

TimelineItem.propTypes = {
    date: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    icon: PropTypes.elementType,
    status: PropTypes.oneOf(['pending', 'confirmed', 'completed', 'cancelled']),
};

TimelineItem.defaultProps = {
    description: null,
    icon: null,
    status: 'pending',
};

export default TimelineItem;
