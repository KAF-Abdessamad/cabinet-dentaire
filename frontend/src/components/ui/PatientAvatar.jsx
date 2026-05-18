import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';

const stringToColor = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash) % 360;
    return `hsl(${hue}, 55%, 45%)`;
};

const getInitials = (name) => {
    if (!name) return '??';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
};

const sizeClasses = {
    sm: 'w-9 h-9 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-20 h-20 text-2xl',
};

const PatientAvatar = ({ name, photo, size }) => {
    const initials = getInitials(name);
    const bgColor = stringToColor(name || 'Anonymous');
    const sizeClass = sizeClasses[size] || sizeClasses.md;

    return (
        <motion.div 
            whileHover={{ scale: 1.05, rotate: 2 }}
            className={`rounded-2xl flex items-center justify-center font-black tracking-tight text-white uppercase shadow-md select-none shrink-0 overflow-hidden ${sizeClass}`}
            style={!photo ? { backgroundColor: bgColor } : {}}
        >
            {photo ? (
                <img 
                    src={photo} 
                    alt={name} 
                    className="w-full h-full object-cover" 
                    loading="lazy"
                />
            ) : (
                initials
            )}
        </motion.div>
    );
};

PatientAvatar.propTypes = {
    name: PropTypes.string.isRequired,
    photo: PropTypes.string,
    size: PropTypes.oneOf(['sm', 'md', 'lg']),
};

PatientAvatar.defaultProps = {
    photo: null,
    size: 'md',
};

export default PatientAvatar;
