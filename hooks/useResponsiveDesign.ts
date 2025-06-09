'use client';

import { useState, useEffect } from 'react';

// Breakpoint definitions matching YC Directory
const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

type Breakpoint = keyof typeof breakpoints;

interface ResponsiveState {
  width: number;
  height: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isLargeDesktop: boolean;
  currentBreakpoint: Breakpoint | 'xs';
  orientation: 'portrait' | 'landscape';
  isTouch: boolean;
  pixelRatio: number;
}

/**
 * Hook for responsive design utilities
 * Provides screen size information and responsive helpers
 */
export function useResponsiveDesign(): ResponsiveState {
  const [state, setState] = useState<ResponsiveState>({
    width: 0,
    height: 0,
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    isLargeDesktop: false,
    currentBreakpoint: 'xs',
    orientation: 'portrait',
    isTouch: false,
    pixelRatio: 1,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const updateState = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      // Determine current breakpoint
      let currentBreakpoint: Breakpoint | 'xs' = 'xs';
      if (width >= breakpoints['2xl']) currentBreakpoint = '2xl';
      else if (width >= breakpoints.xl) currentBreakpoint = 'xl';
      else if (width >= breakpoints.lg) currentBreakpoint = 'lg';
      else if (width >= breakpoints.md) currentBreakpoint = 'md';
      else if (width >= breakpoints.sm) currentBreakpoint = 'sm';

      // Device type detection
      const isMobile = width < breakpoints.md;
      const isTablet = width >= breakpoints.md && width < breakpoints.lg;
      const isDesktop = width >= breakpoints.lg && width < breakpoints.xl;
      const isLargeDesktop = width >= breakpoints.xl;

      // Orientation detection
      const orientation = width > height ? 'landscape' : 'portrait';

      // Touch detection
      const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

      // Pixel ratio
      const pixelRatio = window.devicePixelRatio || 1;

      setState({
        width,
        height,
        isMobile,
        isTablet,
        isDesktop,
        isLargeDesktop,
        currentBreakpoint,
        orientation,
        isTouch,
        pixelRatio,
      });
    };

    // Initial update
    updateState();

    // Listen for resize events
    window.addEventListener('resize', updateState);
    window.addEventListener('orientationchange', updateState);

    return () => {
      window.removeEventListener('resize', updateState);
      window.removeEventListener('orientationchange', updateState);
    };
  }, []);

  return state;
}

/**
 * Hook for responsive values
 * Returns different values based on current breakpoint
 */
export function useResponsiveValue<T>(values: {
  xs?: T;
  sm?: T;
  md?: T;
  lg?: T;
  xl?: T;
  '2xl'?: T;
}): T | undefined {
  const { currentBreakpoint } = useResponsiveDesign();

  // Return value for current breakpoint or fallback to smaller breakpoints
  if (currentBreakpoint === '2xl' && values['2xl'] !== undefined) return values['2xl'];
  if ((currentBreakpoint === '2xl' || currentBreakpoint === 'xl') && values.xl !== undefined) return values.xl;
  if ((currentBreakpoint === '2xl' || currentBreakpoint === 'xl' || currentBreakpoint === 'lg') && values.lg !== undefined) return values.lg;
  if ((currentBreakpoint !== 'xs' && currentBreakpoint !== 'sm') && values.md !== undefined) return values.md;
  if (currentBreakpoint !== 'xs' && values.sm !== undefined) return values.sm;
  return values.xs;
}

/**
 * Hook for responsive grid columns
 * Returns appropriate column count based on screen size
 */
export function useResponsiveColumns(options: {
  mobile?: number;
  tablet?: number;
  desktop?: number;
  largeDesktop?: number;
} = {}) {
  const { isMobile, isTablet, isDesktop, isLargeDesktop } = useResponsiveDesign();

  const defaults = {
    mobile: 1,
    tablet: 2,
    desktop: 3,
    largeDesktop: 4,
  };

  const config = { ...defaults, ...options };

  if (isLargeDesktop) return config.largeDesktop;
  if (isDesktop) return config.desktop;
  if (isTablet) return config.tablet;
  return config.mobile;
}

/**
 * Hook for responsive spacing
 * Returns appropriate spacing values based on screen size
 */
export function useResponsiveSpacing(options: {
  mobile?: string;
  tablet?: string;
  desktop?: string;
} = {}) {
  const { isMobile, isTablet } = useResponsiveDesign();

  const defaults = {
    mobile: '1rem',
    tablet: '1.5rem',
    desktop: '2rem',
  };

  const config = { ...defaults, ...options };

  if (isMobile) return config.mobile;
  if (isTablet) return config.tablet;
  return config.desktop;
}

/**
 * Hook for responsive font sizes
 * Returns appropriate font size based on screen size
 */
export function useResponsiveFontSize(options: {
  mobile?: string;
  tablet?: string;
  desktop?: string;
} = {}) {
  const { isMobile, isTablet } = useResponsiveDesign();

  const defaults = {
    mobile: '0.875rem',
    tablet: '1rem',
    desktop: '1.125rem',
  };

  const config = { ...defaults, ...options };

  if (isMobile) return config.mobile;
  if (isTablet) return config.tablet;
  return config.desktop;
}

/**
 * Hook for responsive component variants
 * Returns different component props based on screen size
 */
export function useResponsiveVariant<T>(variants: {
  mobile?: T;
  tablet?: T;
  desktop?: T;
}): T | undefined {
  const { isMobile, isTablet } = useResponsiveDesign();

  if (isMobile && variants.mobile !== undefined) return variants.mobile;
  if (isTablet && variants.tablet !== undefined) return variants.tablet;
  return variants.desktop;
}

/**
 * Hook for detecting mobile gestures and interactions
 */
export function useMobileInteractions() {
  const { isMobile, isTouch } = useResponsiveDesign();
  const [isScrolling, setIsScrolling] = useState(false);

  useEffect(() => {
    if (!isMobile) return;

    let scrollTimeout: NodeJS.Timeout;

    const handleScroll = () => {
      setIsScrolling(true);
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => setIsScrolling(false), 150);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, [isMobile]);

  return {
    isMobile,
    isTouch,
    isScrolling,
    // Helper for touch-friendly button sizes
    getTouchSize: (baseSize: string) => isMobile ? '44px' : baseSize,
    // Helper for mobile-optimized spacing
    getMobileSpacing: (baseSpacing: string) => isMobile ? '0.75rem' : baseSpacing,
  };
}

/**
 * Hook for responsive container queries
 * Provides container-based responsive behavior
 */
export function useContainerQuery(containerRef: React.RefObject<HTMLElement>) {
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });

    resizeObserver.observe(containerRef.current);

    return () => resizeObserver.disconnect();
  }, [containerRef]);

  return {
    containerWidth,
    isNarrow: containerWidth < 400,
    isMedium: containerWidth >= 400 && containerWidth < 600,
    isWide: containerWidth >= 600,
  };
}

export default {
  useResponsiveDesign,
  useResponsiveValue,
  useResponsiveColumns,
  useResponsiveSpacing,
  useResponsiveFontSize,
  useResponsiveVariant,
  useMobileInteractions,
  useContainerQuery,
};
