import React, { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cn, getAutoPosition } from '../utils.js';

export function Tooltip({
    content,
    children,
    position: preferred = 'top',
    className,
    delay = 200,
}) {
    const [open, setOpen] = useState(false);
    const [coords, setCoords] = useState({ top: 0, left: 0, place: preferred });
    const triggerRef = useRef(null);
    const tipId = useId();
    let timer;

    const show = () => {
        timer = setTimeout(() => {
            const el = triggerRef.current;
            if (!el) return;
            const rect = el.getBoundingClientRect();
            const place = getAutoPosition(rect, preferred);
            const top =
                place === 'bottom'
                    ? rect.bottom + 8
                    : place === 'top'
                      ? rect.top - 8
                      : rect.top + rect.height / 2;
            const left =
                place === 'right'
                    ? rect.right + 8
                    : place === 'left'
                      ? rect.left - 8
                      : rect.left + rect.width / 2;
            setCoords({ top, left, place });
            setOpen(true);
        }, delay);
    };

    const hide = () => {
        clearTimeout(timer);
        setOpen(false);
    };

    useEffect(() => () => clearTimeout(timer), []);

    return (
        <>
            <span
                ref={triggerRef}
                className="inline-flex"
                onMouseEnter={show}
                onMouseLeave={hide}
                onFocus={show}
                onBlur={hide}
                aria-describedby={open ? tipId : undefined}
            >
                {children}
            </span>
            {createPortal(
                <AnimatePresence>
                    {open && content && (
                        <motion.div
                            id={tipId}
                            role="tooltip"
                            initial={{ opacity: 0, scale: 0.96 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.96 }}
                            style={{
                                position: 'fixed',
                                top: coords.top,
                                left: coords.left,
                                transform:
                                    coords.place === 'top'
                                        ? 'translate(-50%, -100%)'
                                        : coords.place === 'bottom'
                                          ? 'translate(-50%, 0)'
                                          : coords.place === 'left'
                                            ? 'translate(-100%, -50%)'
                                            : 'translate(0, -50%)',
                                zIndex: 400,
                            }}
                            className={cn(
                                'px-3 py-1.5 text-xs font-medium text-dp-white bg-dp-neutral-800 rounded-dp-md shadow-dp-lg max-w-xs pointer-events-none',
                                className
                            )}
                        >
                            {content}
                        </motion.div>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </>
    );
}

export default Tooltip;
