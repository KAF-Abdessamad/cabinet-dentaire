/** Fusion de classes Tailwind */
export function cn(...parts) {
    return parts.filter(Boolean).join(' ');
}

export function useRipple() {
    const createRipple = (event) => {
        const button = event.currentTarget;
        const circle = document.createElement('span');
        const diameter = Math.max(button.clientWidth, button.clientHeight);
        const radius = diameter / 2;
        const rect = button.getBoundingClientRect();
        circle.style.width = circle.style.height = `${diameter}px`;
        circle.style.left = `${event.clientX - rect.left - radius}px`;
        circle.style.top = `${event.clientY - rect.top - radius}px`;
        circle.classList.add('dp-ripple');
        const existing = button.querySelector('.dp-ripple');
        if (existing) existing.remove();
        button.appendChild(circle);
        setTimeout(() => circle.remove(), 600);
    };
    return createRipple;
}

/** Position tooltip/popover */
export function getAutoPosition(rect, preferred = 'top') {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const space = {
        top: rect.top,
        bottom: vh - rect.bottom,
        left: rect.left,
        right: vw - rect.right,
    };
    const order = [preferred, 'bottom', 'top', 'right', 'left'];
    return order.find((p) => space[p] > 120) || preferred;
}
