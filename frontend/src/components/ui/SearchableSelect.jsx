import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { Search, ChevronDown, Check, X, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SearchableSelect = ({ 
    options: initialOptions, 
    value, 
    onChange, 
    placeholder, 
    multi, 
    onCreateOption, 
    asyncLoad,
    loading: externalLoading 
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [options, setOptions] = useState(initialOptions);
    const [loading, setLoading] = useState(false);
    const containerRef = useRef(null);

    useEffect(() => {
        setOptions(initialOptions);
    }, [initialOptions]);

    // Handle outside clicks to close dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Async load
    useEffect(() => {
        if (asyncLoad && search) {
            const loadAsync = async () => {
                setLoading(true);
                try {
                    const loaded = await asyncLoad(search);
                    setOptions(loaded);
                } catch (e) {
                    console.error(e);
                } finally {
                    setLoading(false);
                }
            };
            const debounce = setTimeout(loadAsync, 300);
            return () => clearTimeout(debounce);
        }
    }, [search, asyncLoad]);

    const filteredOptions = asyncLoad 
        ? options 
        : options.filter(opt => opt.label.toLowerCase().includes(search.toLowerCase()));

    const isSelected = (optValue) => {
        if (multi) {
            return Array.isArray(value) && value.includes(optValue);
        }
        return value === optValue;
    };

    const handleSelect = (optValue) => {
        if (multi) {
            const currentArr = Array.isArray(value) ? value : [];
            if (currentArr.includes(optValue)) {
                onChange(currentArr.filter(v => v !== optValue));
            } else {
                onChange([...currentArr, optValue]);
            }
        } else {
            onChange(optValue);
            setIsOpen(false);
        }
    };

    const handleCreate = () => {
        if (onCreateOption && search) {
            onCreateOption(search);
            setSearch('');
        }
    };

    // Label resolved
    const selectedLabel = () => {
        if (multi) {
            return `${Array.isArray(value) ? value.length : 0} sélectionnés`;
        }
        const found = options.find(o => o.value === value);
        return found ? found.label : placeholder;
    };

    return (
        <div ref={containerRef} className="relative w-full">
            {/* Trigger Selector block */}
            <div 
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 cursor-pointer hover:border-slate-300 transition select-none h-11"
            >
                <span className={!multi && !options.some(o => o.value === value) ? 'text-slate-400 font-semibold' : ''}>
                    {selectedLabel()}
                </span>
                <ChevronDown size={14} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </div>

            {/* Dropdown Container */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        className="absolute z-50 left-0 right-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-xl p-2.5 max-h-60 overflow-y-auto space-y-2.5"
                    >
                        {/* Search Input bar */}
                        <div className="relative">
                            <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input 
                                type="text"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Rechercher ou ajouter..."
                                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border-none rounded-lg text-xs font-bold text-slate-700 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-500/10 outline-none"
                            />
                        </div>

                        {/* Options List */}
                        <div className="space-y-0.5 max-h-40 overflow-y-auto">
                            {(loading || externalLoading) ? (
                                <p className="text-[10px] font-black text-slate-400 uppercase text-center py-3">Chargement...</p>
                            ) : filteredOptions.length === 0 ? (
                                <div className="py-2.5 text-center">
                                    <p className="text-[10px] font-bold text-slate-400 italic">Aucune option trouvée.</p>
                                    {onCreateOption && search && (
                                        <button 
                                            onClick={handleCreate}
                                            className="mt-2 flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg text-[10px] font-black uppercase tracking-wider mx-auto transition"
                                        >
                                            <Plus size={11} />
                                            Créer "{search}"
                                        </button>
                                    )}
                                </div>
                            ) : (
                                filteredOptions.map(opt => {
                                    const active = isSelected(opt.value);
                                    return (
                                        <div 
                                            key={opt.value}
                                            onClick={() => handleSelect(opt.value)}
                                            className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold cursor-pointer transition ${active ? 'bg-blue-50 text-blue-700' : 'text-slate-650 hover:bg-slate-50'}`}
                                        >
                                            <span>{opt.label}</span>
                                            {active && <Check size={13} className="text-blue-600 shrink-0" />}
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

SearchableSelect.propTypes = {
    options: PropTypes.arrayOf(PropTypes.shape({
        value: PropTypes.any.isRequired,
        label: PropTypes.string.isRequired
    })),
    value: PropTypes.any,
    onChange: PropTypes.func.isRequired,
    placeholder: PropTypes.string,
    multi: PropTypes.bool,
    onCreateOption: PropTypes.func,
    asyncLoad: PropTypes.func,
    loading: PropTypes.bool
};

SearchableSelect.defaultProps = {
    options: [],
    value: null,
    placeholder: 'Sélectionner...',
    multi: false,
    onCreateOption: null,
    asyncLoad: null,
    loading: false
};

export default SearchableSelect;
