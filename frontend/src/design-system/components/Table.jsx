import React, { useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, ChevronsUpDown } from 'lucide-react';
import { cn } from '../utils.js';
import { Button } from './Button.jsx';

export function DataTable({
    columns,
    data = [],
    keyField = 'id',
    selectable = false,
    selectedIds = [],
    onSelectionChange,
    pageSize = 10,
    emptyState,
    rowActions,
    className,
}) {
    const [sortKey, setSortKey] = useState(null);
    const [sortDir, setSortDir] = useState('asc');
    const [page, setPage] = useState(0);

    const sorted = useMemo(() => {
        if (!sortKey) return data;
        return [...data].sort((a, b) => {
            const av = a[sortKey];
            const bv = b[sortKey];
            if (av == null) return 1;
            if (bv == null) return -1;
            const cmp = String(av).localeCompare(String(bv), 'fr', { numeric: true });
            return sortDir === 'asc' ? cmp : -cmp;
        });
    }, [data, sortKey, sortDir]);

    const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
    const pageData = sorted.slice(page * pageSize, page * pageSize + pageSize);
    const allPageSelected = pageData.length > 0 && pageData.every((r) => selectedIds.includes(r[keyField]));

    const toggleSort = (key) => {
        if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
        else {
            setSortKey(key);
            setSortDir('asc');
        }
    };

    const toggleRow = (id) => {
        if (!onSelectionChange) return;
        onSelectionChange(
            selectedIds.includes(id) ? selectedIds.filter((x) => x !== id) : [...selectedIds, id]
        );
    };

    const toggleAll = () => {
        if (!onSelectionChange) return;
        if (allPageSelected) {
            const pageIds = new Set(pageData.map((r) => r[keyField]));
            onSelectionChange(selectedIds.filter((id) => !pageIds.has(id)));
        } else {
            const merged = new Set([...selectedIds, ...pageData.map((r) => r[keyField])]);
            onSelectionChange([...merged]);
        }
    };

    return (
        <div className={cn('rounded-dp-xl border border-dp-neutral-200 bg-dp-white overflow-hidden shadow-dp-card', className)}>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left" role="table">
                    <thead className="bg-dp-accent/60 text-dp-neutral-700">
                        <tr>
                            {selectable && (
                                <th scope="col" className="w-12 px-4 py-3">
                                    <input
                                        type="checkbox"
                                        checked={allPageSelected}
                                        onChange={toggleAll}
                                        aria-label="Sélectionner toute la page"
                                        className="rounded border-dp-neutral-300 text-dp-secondary focus:ring-dp-secondary"
                                    />
                                </th>
                            )}
                            {columns.map((col) => (
                                <th key={col.key} scope="col" className="px-4 py-3 font-semibold whitespace-nowrap">
                                    {col.sortable ? (
                                        <button
                                            type="button"
                                            onClick={() => toggleSort(col.key)}
                                            className="inline-flex items-center gap-1 hover:text-dp-primary focus:outline-none focus-visible:underline"
                                        >
                                            {col.label}
                                            {sortKey === col.key ? (
                                                sortDir === 'asc' ? (
                                                    <ChevronUp className="h-4 w-4" aria-hidden />
                                                ) : (
                                                    <ChevronDown className="h-4 w-4" aria-hidden />
                                                )
                                            ) : (
                                                <ChevronsUpDown className="h-4 w-4 opacity-40" aria-hidden />
                                            )}
                                        </button>
                                    ) : (
                                        col.label
                                    )}
                                </th>
                            ))}
                            {rowActions && <th scope="col" className="px-4 py-3 w-24">Actions</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {pageData.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length + (selectable ? 1 : 0) + (rowActions ? 1 : 0)} className="p-8">
                                    {emptyState || <p className="text-center text-dp-neutral-500">Aucune donnée</p>}
                                </td>
                            </tr>
                        ) : (
                            pageData.map((row) => (
                                <tr
                                    key={row[keyField]}
                                    className="border-t border-dp-neutral-100 hover:bg-dp-accent/30 transition-colors"
                                >
                                    {selectable && (
                                        <td className="px-4 py-3">
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.includes(row[keyField])}
                                                onChange={() => toggleRow(row[keyField])}
                                                aria-label={`Sélectionner ligne ${row[keyField]}`}
                                                className="rounded border-dp-neutral-300 text-dp-secondary focus:ring-dp-secondary"
                                            />
                                        </td>
                                    )}
                                    {columns.map((col) => (
                                        <td key={col.key} className="px-4 py-3 text-dp-neutral-800">
                                            {col.render ? col.render(row) : row[col.key]}
                                        </td>
                                    ))}
                                    {rowActions && (
                                        <td className="px-4 py-3">
                                            <div className="flex gap-1">{rowActions(row)}</div>
                                        </td>
                                    )}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            {sorted.length > pageSize && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-dp-neutral-100 bg-dp-neutral-50">
                    <p className="text-xs text-dp-neutral-500">
                        {page * pageSize + 1}–{Math.min((page + 1) * pageSize, sorted.length)} sur {sorted.length}
                    </p>
                    <div className="flex gap-2">
                        <Button variant="ghost" size="sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
                            Précédent
                        </Button>
                        <Button variant="ghost" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)}>
                            Suivant
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default DataTable;
