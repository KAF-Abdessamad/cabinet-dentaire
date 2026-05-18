import React from 'react';
import PropTypes from 'prop-types';
import { HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const EmptyState = ({ icon: Icon, title, description, actionLabel, onAction }) => {
    return (
        <motion.div 
            initial={{ scale: 0.98, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="py-16 px-6 bg-white border border-slate-100 rounded-[32px] text-center max-w-lg mx-auto shadow-sm flex flex-col items-center justify-center space-y-5"
        >
            {/* Visual Icon container */}
            <div className="w-16 h-16 rounded-[22px] bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400">
                <Icon size={24} strokeWidth={2} />
            </div>

            {/* Typography */}
            <div className="space-y-1.5 max-w-sm">
                <h4 className="text-base font-black text-slate-800 uppercase tracking-tight">
                    {title}
                </h4>
                <p className="text-xs font-semibold text-slate-500 leading-relaxed italic">
                    {description}
                </p>
            </div>

            {/* Action Call-to-action button */}
            {actionLabel && onAction && (
                <motion.button 
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={onAction}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition shadow-lg shadow-blue-100"
                >
                    {actionLabel}
                </motion.button>
            )}
        </motion.div>
    );
};

EmptyState.propTypes = {
    icon: PropTypes.elementType,
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    actionLabel: PropTypes.string,
    onAction: PropTypes.func,
};

EmptyState.defaultProps = {
    icon: HelpCircle,
    actionLabel: null,
    onAction: null,
};

export default EmptyState;
