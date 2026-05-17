import { useEffect, useState } from 'react';

/**
 * Anime un compteur numérique lorsque `active` est true.
 */
export function useAnimatedCounter(end, { duration = 2000, active = false, decimals = 0 } = {}) {
    const [value, setValue] = useState(0);

    useEffect(() => {
        if (!active) return;

        let start = null;
        let frame;

        const step = (timestamp) => {
            if (!start) start = timestamp;
            const progress = Math.min((timestamp - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = eased * end;
            setValue(decimals > 0 ? Number(current.toFixed(decimals)) : Math.floor(current));
            if (progress < 1) frame = requestAnimationFrame(step);
        };

        frame = requestAnimationFrame(step);
        return () => cancelAnimationFrame(frame);
    }, [end, duration, active, decimals]);

    return value;
}

export default useAnimatedCounter;
