import React from 'react';
import PropTypes from 'prop-types';
import { ChevronRight } from 'lucide-react';

const PageHeader = ({ title, subtitle, breadcrumb, actions }) => {
    return (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-2 select-none border-b border-slate-50">
            <div className="space-y-1.5">
                {/* Optional Breadcrumb */}
                {breadcrumb && breadcrumb.length > 0 && (
                    <div className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                        {breadcrumb.map((crumb, idx) => (
                            <React.Fragment key={idx}>
                                {idx > 0 && <ChevronRight size={10} />}
                                <span className={idx === breadcrumb.length - 1 ? 'text-blue-600' : ''}>
                                    {crumb}
                                </span>
                            </React.Fragment>
                        ))}
                    </div>
                )}

                <h1 className="text-3xl font-black text-slate-800 tracking-tight uppercase leading-none">
                    {title}
                </h1>
                {subtitle && (
                    <p className="text-slate-500 font-bold italic text-xs leading-none mt-1">
                        {subtitle}
                    </p>
                )}
            </div>

            {/* Actions array */}
            {actions && actions.length > 0 && (
                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-start md:justify-end shrink-0">
                    {actions.map((action, idx) => (
                        <div key={idx} className="shrink-0 w-full sm:w-auto">
                            {action}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

PageHeader.propTypes = {
    title: PropTypes.string.isRequired,
    subtitle: PropTypes.string,
    breadcrumb: PropTypes.arrayOf(PropTypes.string),
    actions: PropTypes.arrayOf(PropTypes.node),
};

PageHeader.defaultProps = {
    subtitle: null,
    breadcrumb: [],
    actions: [],
};

export default PageHeader;
