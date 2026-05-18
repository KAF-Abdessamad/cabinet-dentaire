import { useRef } from 'react';

export function useSwipeable({ onSwipedLeft, onSwipedRight, delta = 50 }) {
    const touchStartX = useRef(0);
    const touchEndX = useRef(0);

    const onTouchStart = (e) => {
        touchStartX.current = e.targetTouches[0].clientX;
        touchEndX.current = e.targetTouches[0].clientX;
    };

    const onTouchMove = (e) => {
        touchEndX.current = e.targetTouches[0].clientX;
    };

    const onTouchEnd = () => {
        const diff = touchStartX.current - touchEndX.current;
        if (Math.abs(diff) > delta) {
            if (diff > 0 && onSwipedLeft) {
                onSwipedLeft();
            } else if (diff < 0 && onSwipedRight) {
                onSwipedRight();
            }
        }
    };

    return {
        onTouchStart,
        onTouchMove,
        onTouchEnd,
    };
}
