/**
 * Community Platform Design System
 * Ensures consistency with existing YC Directory styling patterns
 */

// Color palette matching YC Directory
export const communityColors = {
  // Primary colors (matching YC orange/red theme)
  primary: {
    50: '#fff7ed',
    100: '#ffedd5',
    200: '#fed7aa',
    300: '#fdba74',
    400: '#fb923c',
    500: '#f97316', // Main YC orange
    600: '#ea580c',
    700: '#c2410c',
    800: '#9a3412',
    900: '#7c2d12',
  },
  
  // Secondary colors (complementary blues)
  secondary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },
  
  // Neutral grays (matching directory cards)
  neutral: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
  },
  
  // Status colors
  success: {
    50: '#f0fdf4',
    500: '#22c55e',
    600: '#16a34a',
  },
  warning: {
    50: '#fffbeb',
    500: '#f59e0b',
    600: '#d97706',
  },
  error: {
    50: '#fef2f2',
    500: '#ef4444',
    600: '#dc2626',
  },
};

// Typography scale matching YC Directory
export const communityTypography = {
  fontFamily: {
    sans: ['Inter', 'system-ui', 'sans-serif'],
    mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'monospace'],
  },
  fontSize: {
    xs: ['0.75rem', { lineHeight: '1rem' }],
    sm: ['0.875rem', { lineHeight: '1.25rem' }],
    base: ['1rem', { lineHeight: '1.5rem' }],
    lg: ['1.125rem', { lineHeight: '1.75rem' }],
    xl: ['1.25rem', { lineHeight: '1.75rem' }],
    '2xl': ['1.5rem', { lineHeight: '2rem' }],
    '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
};

// Spacing scale matching directory components
export const communitySpacing = {
  xs: '0.25rem',   // 4px
  sm: '0.5rem',    // 8px
  md: '0.75rem',   // 12px
  lg: '1rem',      // 16px
  xl: '1.5rem',    // 24px
  '2xl': '2rem',   // 32px
  '3xl': '3rem',   // 48px
  '4xl': '4rem',   // 64px
};

// Border radius matching YC Directory cards
export const communityBorderRadius = {
  none: '0',
  sm: '0.125rem',   // 2px
  md: '0.375rem',   // 6px
  lg: '0.5rem',     // 8px
  xl: '0.75rem',    // 12px
  '2xl': '1rem',    // 16px
  full: '9999px',
};

// Shadow system matching directory cards
export const communityShadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
};

// Component-specific styling patterns
export const communityComponents = {
  // Card styling matching StartupCard
  card: {
    base: 'bg-white rounded-lg border border-neutral-200 shadow-sm hover:shadow-md transition-shadow duration-200',
    padding: 'p-6',
    header: 'border-b border-neutral-100 pb-4 mb-4',
  },
  
  // Button styling matching directory buttons
  button: {
    primary: 'bg-primary-500 hover:bg-primary-600 text-white font-medium px-4 py-2 rounded-md transition-colors duration-200',
    secondary: 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-medium px-4 py-2 rounded-md transition-colors duration-200',
    ghost: 'hover:bg-neutral-100 text-neutral-600 hover:text-neutral-700 font-medium px-3 py-2 rounded-md transition-colors duration-200',
  },
  
  // Badge styling matching directory tags
  badge: {
    default: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-800',
    primary: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800',
    success: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-100 text-success-800',
  },
  
  // Input styling matching directory forms
  input: {
    base: 'block w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
    error: 'border-error-500 focus:ring-error-500 focus:border-error-500',
  },
  
  // Avatar styling matching directory profiles
  avatar: {
    sm: 'h-6 w-6 rounded-full',
    md: 'h-8 w-8 rounded-full',
    lg: 'h-10 w-10 rounded-full',
    xl: 'h-12 w-12 rounded-full',
  },
};

// Animation presets matching directory interactions
export const communityAnimations = {
  // Hover effects
  hover: {
    scale: 'hover:scale-105 transition-transform duration-200',
    lift: 'hover:-translate-y-1 hover:shadow-lg transition-all duration-200',
    glow: 'hover:shadow-lg hover:shadow-primary-500/25 transition-shadow duration-200',
  },
  
  // Loading states
  loading: {
    pulse: 'animate-pulse',
    spin: 'animate-spin',
    bounce: 'animate-bounce',
  },
  
  // Entrance animations
  entrance: {
    fadeIn: 'animate-in fade-in duration-300',
    slideUp: 'animate-in slide-in-from-bottom-4 duration-300',
    slideDown: 'animate-in slide-in-from-top-4 duration-300',
    scaleIn: 'animate-in zoom-in-95 duration-200',
  },
  
  // Exit animations
  exit: {
    fadeOut: 'animate-out fade-out duration-200',
    slideDown: 'animate-out slide-out-to-bottom-4 duration-200',
    slideUp: 'animate-out slide-out-to-top-4 duration-200',
    scaleOut: 'animate-out zoom-out-95 duration-150',
  },
};

// Responsive breakpoints matching directory layout
export const communityBreakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

// Layout patterns matching directory structure
export const communityLayouts = {
  // Container widths
  container: {
    sm: 'max-w-2xl mx-auto',
    md: 'max-w-4xl mx-auto',
    lg: 'max-w-6xl mx-auto',
    xl: 'max-w-7xl mx-auto',
    full: 'w-full',
  },
  
  // Grid patterns
  grid: {
    cards: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6',
    list: 'space-y-4',
    masonry: 'columns-1 md:columns-2 lg:columns-3 gap-6',
  },
  
  // Flex patterns
  flex: {
    between: 'flex items-center justify-between',
    center: 'flex items-center justify-center',
    start: 'flex items-center justify-start',
    column: 'flex flex-col',
  },
};

// Utility functions for consistent styling
export const communityUtils = {
  // Generate consistent class names
  cn: (...classes: (string | undefined | null | false)[]) => {
    return classes.filter(Boolean).join(' ');
  },
  
  // Get color variant
  getColorVariant: (color: keyof typeof communityColors, shade: number = 500) => {
    return communityColors[color]?.[shade as keyof typeof communityColors[typeof color]] || communityColors.neutral[500];
  },
  
  // Get responsive classes
  getResponsiveClasses: (base: string, variants: Record<string, string>) => {
    const classes = [base];
    Object.entries(variants).forEach(([breakpoint, className]) => {
      classes.push(`${breakpoint}:${className}`);
    });
    return classes.join(' ');
  },
  
  // Generate consistent spacing
  getSpacing: (size: keyof typeof communitySpacing) => {
    return communitySpacing[size];
  },
};

export default {
  colors: communityColors,
  typography: communityTypography,
  spacing: communitySpacing,
  borderRadius: communityBorderRadius,
  shadows: communityShadows,
  components: communityComponents,
  animations: communityAnimations,
  breakpoints: communityBreakpoints,
  layouts: communityLayouts,
  utils: communityUtils,
};
