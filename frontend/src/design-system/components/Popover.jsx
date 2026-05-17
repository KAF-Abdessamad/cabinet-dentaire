import React, { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cn, getAutoPosition } from '../utils.js';

export function Popover({
    trigger,
    children,
    open: controlledOpen,
    onOpenChange,
    position: preferred = 'bottom',
    className,
    align = 'center',
}) {
    const [internalOpen, setInternalOpen] = useState(false);
    const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
    const setOpen = (v) => {
        if (controlledOpen === undefined) setInternalOpen(v);
        onOpenChange?.(v);
    };
    const triggerRef = useRef(null);
    const panelRef = useRef(null);
    const popoverId = useId();
    const [coords, setCoords] = useState({ top: 0, left: 0 });

    useEffect(() => {
        if (!open) return;
        const update = () => {
            const el = triggerRef.current;
            if (!el) return;
            const rect = el.getBoundingClientRect();
            const place = getAutoPosition(rect, preferred);
            let top = rect.bottom + 8;
            let left = rect.left;
            if (place === 'top') top = rect.top - 8;
            if (place === 'left') {
                top = rect.top;
                left = rect.left - 8;
            }
            if (place === 'right') {
                top = rect.top;
                left = rect.right + 8;
            }
            if (align === 'center' && (place === 'top' || place === 'bottom')) {
                left = rect.left + rect.width / 2;
            }
            setCoords({ top, left, place });
        };
        update();
        window.addEventListener('scroll', update, true);
        window.addEventListener('resize', update);
        return () => {
            window.removeEventListener('scroll', update, true);
            window.removeEventListener('resize', update);
        };
    }, [open, preferred, align]);

    useEffect(() => {
        if (!open) return;
        const onClick = (e) => {
            if (
                !triggerRef.current?.contains(e.target) &&
                !panelRef.current?.contains(e.target)
            ) {
                setOpen(false);
            }
        };
        const onKey = (e) => e.key === 'Escape' && setOpen(false);
        document.addEventListener('mousedown', onClick);
        document.addEventListener('keydown', onKey);
        return () => {
            document.removeEventListener('mousedown', onClick);
            document.removeEventListener('keydown', onKey);
        };
    }, [open]);

    const triggerEl =
        typeof trigger === 'function'
            ? trigger({ ref: triggerRef, open, setOpen, 'aria-expanded': open, 'aria-controls': popoverId })
            : React.cloneElement(trigger, {
                  ref: triggerRef,
                  onClick: (e) => {
                      trigger.props.onClick?.(e);
                      setOpen(!open);
                  },
                  'aria-expanded': open,
                  'aria-haspopup': 'dialog',
                  'aria-controls': popoverId,
              });

    return (
        <>
            {triggerEl}
            {createPortal(
                <AnimatePresence>
                    {open && (
                        <motion.div
                            ref={panelRef}
                            id={popoverId}
                            role="dialog"
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            style={{
                                position: 'fixed',
                                top: coords.top,
                                left: coords.left,
                                transform:
                                    coords.place === 'top'
                                        ? 'translateY(-100%)'
                                        : align === 'center' &&
                                            (coords.place === 'bottom' || coords.place === 'top')
                                          ? 'translateX(-50%)'
                                          : undefined,
                                zIndex: 350,
                            }}
                            className={cn(
                                'min-w-[200px] rounded-dp-xl border border-dp-neutral-200 bg-dp-white shadow-dp-xl p-4',
                                className
                            )}
                        >
                            {children}
                        </motion.div>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </>
    );
}

export default Popover;
