const a={primary:"#1B3A6B",primaryHover:"#152E56",secondary:"#2E8B8B",accent:"#E8F4F8",success:"#22C55E",danger:"#EF4444",warning:"#F59E0B",info:"#3B82F6",background:"#F0F4F8",white:"#FFFFFF",neutral:{50:"#F8FAFC",100:"#F1F5F9",200:"#E2E8F0",300:"#CBD5E1",400:"#94A3B8",500:"#64748B",600:"#475569",700:"#334155",800:"#1E293B",900:"#0F172A"}},r={fontDisplay:'"DM Serif Display", "Playfair Display", Georgia, serif',fontSans:'"DM Sans", system-ui, sans-serif',fontMono:'"JetBrains Mono", ui-monospace, monospace'},n={card:"0 4px 24px -4px rgb(27 58 107 / 0.12), 0 0 0 1px rgb(27 58 107 / 0.04)",cardHover:"0 12px 32px -8px rgb(27 58 107 / 0.18), 0 0 0 1px rgb(46 139 139 / 0.12)"},o={lg:"0.75rem"},e={base:"250ms",easing:"cubic-bezier(0.22, 1, 0.36, 1)"},s=`
:root {
  --dp-primary: ${a.primary};
  --dp-primary-hover: ${a.primaryHover};
  --dp-secondary: ${a.secondary};
  --dp-accent: ${a.accent};
  --dp-success: ${a.success};
  --dp-danger: ${a.danger};
  --dp-warning: ${a.warning};
  --dp-info: ${a.info};
  --dp-bg: ${a.background};
  --dp-white: ${a.white};
  --dp-neutral-50: ${a.neutral[50]};
  --dp-neutral-100: ${a.neutral[100]};
  --dp-neutral-200: ${a.neutral[200]};
  --dp-neutral-300: ${a.neutral[300]};
  --dp-neutral-400: ${a.neutral[400]};
  --dp-neutral-500: ${a.neutral[500]};
  --dp-neutral-600: ${a.neutral[600]};
  --dp-neutral-700: ${a.neutral[700]};
  --dp-neutral-800: ${a.neutral[800]};
  --dp-neutral-900: ${a.neutral[900]};
  --dp-font-display: ${r.fontDisplay};
  --dp-font-sans: ${r.fontSans};
  --dp-font-mono: ${r.fontMono};
  --dp-shadow-card: ${n.card};
  --dp-shadow-card-hover: ${n.cardHover};
  --dp-radius-lg: ${o.lg};
  --dp-motion-base: ${e.base};
  --dp-motion-easing: ${e.easing};
}
`;export{a as colors,s as cssVariables,e as motion,o as radius,n as shadows,r as typography};
