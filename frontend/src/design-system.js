/**
 * DentistPro Design System
 * Point d’entrée unique : tokens, utilitaires CSS et composants React.
 *
 * @example
 * import { Button, tokens, ToastProvider, useToast } from './design-system.js';
 */

// ——— Tokens & variables CSS ———
export {
    colors,
    typography,
    shadows,
    radius,
    spacing,
    motion,
    statusTokens,
    tokens,
    cssVariables,
} from './design-system/tokens.js';

// ——— Utilitaires ———
export { cn, useRipple, getAutoPosition } from './design-system/utils.js';

// ——— Composants ———
export { Button } from './design-system/components/Button.jsx';
export { Input, Select, Textarea } from './design-system/components/Input.jsx';
export { Badge } from './design-system/components/Badge.jsx';
export {
    PatientCard,
    AppointmentCard,
    InvoiceCard,
    StatCard,
} from './design-system/components/Cards.jsx';
export { Modal } from './design-system/components/Modal.jsx';
export { DataTable } from './design-system/components/Table.jsx';
export { Alert } from './design-system/components/Alert.jsx';
export { Toast, ToastProvider, useToast } from './design-system/components/Toast.jsx';
export {
    Skeleton,
    SkeletonText,
    SkeletonCard,
    SkeletonTable,
    SkeletonStat,
} from './design-system/components/Skeleton.jsx';
export { EmptyState } from './design-system/components/EmptyState.jsx';
export { Tooltip } from './design-system/components/Tooltip.jsx';
export { Popover } from './design-system/components/Popover.jsx';

/** Initialise les variables CSS DentistPro sur :root */
export function injectDesignSystemStyles() {
    if (typeof document === 'undefined') return;
    const id = 'dentistpro-design-system-vars';
    if (document.getElementById(id)) return;
    const style = document.createElement('style');
    style.id = id;
    import('./design-system/tokens.js').then(({ cssVariables }) => {
        style.textContent = cssVariables;
    });
    document.head.appendChild(style);
}

export default {
    injectDesignSystemStyles,
};
