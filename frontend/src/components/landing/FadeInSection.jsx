import React from 'react';
import { useInView } from '../../hooks/useInView.js';

export function FadeInSection({ children, className = '', delay = 0, as: Tag = 'section', ...rest }) {
    const [ref, inView] = useInView({ threshold: 0.12, once: true });

    return (
        <Tag
            ref={ref}
            className={`transition-all duration-700 ease-out ${className} ${
                inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
            style={{ transitionDelay: `${delay}ms` }}
            {...rest}
        >
            {children}
        </Tag>
    );
}

export default FadeInSection;
