import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { 
    ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown, 
    Download, CheckSquare, Square
} from 'lucide-react';
import { motion } from 'framer-motion';

const DataTable = ({ 
    columns, 
    data, 
    pagination, 
    sortable, 
    selectable, 
    onRowClick, 
    actions 
}) => {
    const [sortKey, setSortKey] = useState(null);
    const [sortDirection, setSortDirection] = useState('asc'); // 'asc' | 'desc'
    const [selectedRows, setSelectedRows] = useState(new Set());

    // Sorting
    const handleSort = (key) => {
        if (!sortable) return;
        if (sortKey === key) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(key);
            setSortDirection('asc');
        }
    };

    const sortedData = useMemo(() => {
        if (!sortKey) return data;
        
        return [...data].sort((a, b) => {
            let valA = a[sortKey];
            let valB = b[sortKey];
            
            if (typeof valA === 'string') {
                return sortDirection === 'asc' 
                    ? valA.localeCompare(valB) 
                    : valB.localeCompare(valA);
            }
            
            return sortDirection === 'asc' ? valA - valB : valB - valA;
        });
    }, [data, sortKey, sortDirection]);

    // Selectable triggers
    const toggleSelectRow = (id, e) => {
        e.stopPropagation();
        const next = new Set(selectedRows);
        if (next.has(id)) {
            next.delete(id);
        } else {
            next.add(id);
        }
        setSelectedRows(next);
    };

    const toggleSelectAll = () => {
        if (selectedRows.size === data.length) {
            setSelectedRows(new Set());
        } else {
            setSelectedRows(new Set(data.map(d => d.id)));
        }
    };

    // Client CSV Export
    const handleCSVExport = () => {
        const headers = columns.map(c => c.label);
        const rows = data.map(row => 
            columns.map(c => {
                const rawVal = row[c.key];
                return typeof rawVal === 'object' ? '' : String(rawVal || '');
            })
        );

        let csvContent = "data:text/csv;charset=utf-8,\uFEFF";
        csvContent += [headers.join(','), ...rows.map(e => e.map(val => `"${val.replace(/"/g, '""')}"`).join(','))].join('\n');
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `export_${Date.now()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-4">
            
            {/* Table Action utilities */}
            <div className="flex justify-between items-center px-2">
                <p className="text-xs font-bold text-slate-400">
                    {selectable && selectedRows.size > 0 && (
                        <span className="text-blue-600 bg-blue-50 px-3 py-1.5 rounded-xl font-black uppercase text-[10px] tracking-wider">
                            {selectedRows.size} ligne(s) sélectionnée(s)
                        </span>
                    )}
                </p>
                <button 
                    onClick={handleCSVExport}
                    className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-800 rounded-xl text-xs font-black uppercase tracking-wider transition shadow-sm"
                >
                    <Download size={13} />
                    Exporter CSV
                </button>
            </div>

            {/* Core Table container */}
            <div className="bg-white rounded-[32px] border border-slate-100/80 shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                {selectable && (
                                    <th className="px-6 py-5 w-12 text-center">
                                        <button 
                                            onClick={toggleSelectAll} 
                                            className="text-slate-400 hover:text-slate-600 transition"
                                        >
                                            {selectedRows.size === data.length ? <CheckSquare size={16} className="text-blue-600" /> : <Square size={16} />}
                                        </button>
                                    </th>
                                )}
                                {columns.map((col) => (
                                    <th 
                                        key={col.key}
                                        onClick={() => handleSort(col.key)}
                                        className={`px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest ${sortable ? 'cursor-pointer hover:text-slate-700 select-none' : ''}`}
                                    >
                                        <div className="flex items-center gap-1.5">
                                            <span>{col.label}</span>
                                            {sortable && sortKey === col.key ? (
                                                sortDirection === 'asc' ? <ArrowUp size={11} /> : <ArrowDown size={11} />
                                            ) : sortable ? (
                                                <ArrowUpDown size={11} className="opacity-40" />
                                            ) : null}
                                        </div>
                                    </th>
                                ))}
                                {actions && <th className="px-6 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {sortedData.map((row) => (
                                <tr 
                                    key={row.id}
                                    onClick={() => onRowClick && onRowClick(row)}
                                    className={`transition-colors duration-250 ${onRowClick ? 'cursor-pointer hover:bg-slate-50/70' : 'hover:bg-slate-50/40'}`}
                                >
                                    {selectable && (
                                        <td className="px-6 py-4 text-center">
                                            <button 
                                                onClick={(e) => toggleSelectRow(row.id, e)}
                                                className="text-slate-450 hover:text-slate-650 transition"
                                            >
                                                {selectedRows.has(row.id) ? <CheckSquare size={15} className="text-blue-600" /> : <Square size={15} />}
                                            </button>
                                        </td>
                                    )}
                                    {columns.map((col) => (
                                        <td key={col.key} className="px-6 py-4 text-xs font-bold text-slate-700">
                                            {col.render ? col.render(row) : row[col.key]}
                                        </td>
                                    ))}
                                    {actions && (
                                        <td className="px-6 py-4 text-right" onClick={e => e.stopPropagation()}>
                                            {actions(row)}
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination Controls */}
            {pagination && (
                <div className="bg-white rounded-2xl border border-slate-100 p-4 flex items-center justify-between shadow-sm select-none">
                    <p className="text-xs font-bold text-slate-400">
                        Affichage de {data.length} sur {pagination.total} éléments
                    </p>
                    <div className="flex gap-2">
                        <button 
                            disabled={pagination.currentPage === 1}
                            onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
                            className="p-2 bg-slate-50 border border-slate-200 text-slate-550 rounded-lg disabled:opacity-40 disabled:hover:bg-transparent transition hover:bg-slate-100"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <button 
                            disabled={pagination.currentPage === pagination.lastPage}
                            onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
                            className="p-2 bg-slate-50 border border-slate-200 text-slate-550 rounded-lg disabled:opacity-40 disabled:hover:bg-transparent transition hover:bg-slate-100"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

DataTable.propTypes = {
    columns: PropTypes.arrayOf(PropTypes.shape({
        key: PropTypes.string.isRequired,
        label: PropTypes.string.isRequired,
        render: PropTypes.func
    })).isRequired,
    data: PropTypes.array.isRequired,
    pagination: PropTypes.shape({
        currentPage: PropTypes.number.isRequired,
        lastPage: PropTypes.number.isRequired,
        total: PropTypes.number.isRequired,
        onPageChange: PropTypes.func.isRequired
    }),
    sortable: PropTypes.bool,
    selectable: PropTypes.bool,
    onRowClick: PropTypes.func,
    actions: PropTypes.func
};

DataTable.defaultProps = {
    pagination: null,
    sortable: true,
    selectable: false,
    onRowClick: null,
    actions: null
};

export default DataTable;
