import { useEffect, useRef, useState } from 'react';

/**
 * Détecte quand l'élément entre dans le viewport (Intersection Observer).
 */
export function useInView(options = {}) {
    const ref = useRef(null);
    const [inView, setInView] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setInView(true);
                    if (options.once !== false) observer.disconnect();
                } else if (!options.once) {
                    setInView(false);
                }
            },
            { threshold: options.threshold ?? 0.15, rootMargin: options.rootMargin ?? '0px' }
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, [options.threshold, options.rootMargin, options.once]);

    return [ref, inView];
}

export default useInView;
