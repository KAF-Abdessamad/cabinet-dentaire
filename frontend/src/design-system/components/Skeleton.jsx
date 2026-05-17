import React from 'react';
import { cn } from '../utils.js';

function Bone({ className, style, ...props }) {
    return (
        <div
            className={cn('rounded-dp-md bg-dp-neutral-200/70 animate-pulse', className)}
            style={style}
            aria-hidden
            {...props}
        />
    );
}

export function Skeleton({ className, width, height, circle }) {
    return <Bone className={cn(circle && 'rounded-full', className)} style={{ width, height }} />;
}

export function SkeletonText({ lines = 3, className }) {
    return (
        <div className={cn('space-y-2', className)} aria-busy="true" aria-label="Chargement">
            {Array.from({ length: lines }).map((_, i) => (
                <Bone key={i} className={cn('h-3', i === lines - 1 ? 'w-2/3' : 'w-full')} />
            ))}
        </div>
    );
}

export function SkeletonCard({ className }) {
    return (
        <div className={cn('p-5 rounded-dp-xl border border-dp-neutral-100 bg-dp-white', className)} aria-busy="true">
            <div className="flex gap-4">
                <Bone className="h-12 w-12 rounded-dp-lg shrink-0" />
                <div className="flex-1 space-y-2">
                    <Bone className="h-4 w-1/2" />
                    <Bone className="h-3 w-1/3" />
                    <Bone className="h-3 w-full" />
                </div>
            </div>
        </div>
    );
}

export function SkeletonTable({ rows = 5, cols = 4, className }) {
    return (
        <div className={cn('rounded-dp-xl border border-dp-neutral-200 overflow-hidden', className)} aria-busy="true">
            <div className="bg-dp-accent/50 p-4 flex gap-4">
                {Array.from({ length: cols }).map((_, i) => (
                    <Bone key={i} className="h-4 flex-1" />
                ))}
            </div>
            {Array.from({ length: rows }).map((_, r) => (
                <div key={r} className="flex gap-4 p-4 border-t border-dp-neutral-100">
                    {Array.from({ length: cols }).map((_, c) => (
                        <Bone key={c} className="h-3 flex-1" />
                    ))}
                </div>
            ))}
        </div>
    );
}

export function SkeletonStat({ className }) {
    return (
        <div className={cn('p-6 rounded-dp-xl border border-dp-neutral-100 bg-dp-white', className)} aria-busy="true">
            <Bone className="h-3 w-24 mb-4" />
            <Bone className="h-10 w-20" />
        </div>
    );
}

export default Skeleton;
