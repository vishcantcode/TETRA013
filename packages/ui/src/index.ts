// ============================================================================
// @healthsense/ui – Master Enterprise Design System & UI Components
// ============================================================================

export interface DesignTokens {
  colors: {
    primaryBg: string;
    secondaryBg: string;
    cardBg: string;
    accent: string;
    textPrimary: string;
    textSecondary: string;
    border: string;
    success: string;
    warning: string;
    danger: string;
    info: string;
  };
  typography: {
    fontFamily: string;
    headingScale: Record<string, string>;
  };
  radius: Record<string, string>;
  shadows: Record<string, string>;
}

export const HealthSenseDesignTokens: DesignTokens = {
  colors: {
    primaryBg: '#09090b',
    secondaryBg: '#111113',
    cardBg: 'rgba(24, 24, 27, 0.7)',
    accent: '#3b82f6',
    textPrimary: '#fafafa',
    textSecondary: '#a1a1aa',
    border: '#27272a',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#06b6d4',
  },
  typography: {
    fontFamily: "'Inter', sans-serif",
    headingScale: {
      h1: '2.25rem',
      h2: '1.75rem',
      h3: '1.25rem',
      h4: '1rem',
    },
  },
  radius: {
    sm: '0.5rem',
    md: '0.75rem',
    lg: '1rem',
    xl: '1.25rem',
  },
  shadows: {
    sm: '0 1px 2px rgba(0,0,0,0.3)',
    md: '0 4px 6px rgba(0,0,0,0.3)',
    lg: '0 10px 25px rgba(0,0,0,0.4)',
    glow: '0 0 20px rgba(59,130,246,0.15)',
  },
};

/**
 * Returns classNames for clinical badges according to status.
 */
export function getBadgeClasses(status: 'healthy' | 'critical' | 'warning' | 'info' | 'routine' | string): string {
  const normalized = status.toLowerCase();
  if (normalized.includes('critical') || normalized.includes('danger') || normalized.includes('high')) {
    return 'badge badge-danger';
  }
  if (normalized.includes('warning') || normalized.includes('moderate') || normalized.includes('attention')) {
    return 'badge badge-warning';
  }
  if (normalized.includes('healthy') || normalized.includes('success') || normalized.includes('optimal') || normalized.includes('active')) {
    return 'badge badge-success';
  }
  if (normalized.includes('info') || normalized.includes('dispatched') || normalized.includes('routine')) {
    return 'badge badge-info';
  }
  return 'badge badge-neutral';
}

/**
 * Returns classNames for button variants.
 */
export function getButtonClasses(variant: 'primary' | 'secondary' | 'danger' | 'ghost' = 'primary', size: 'sm' | 'md' | 'lg' = 'md'): string {
  const sizeClass = size === 'sm' ? 'btn-sm' : size === 'lg' ? 'btn-lg' : '';
  return `btn btn-${variant} ${sizeClass}`.trim();
}
