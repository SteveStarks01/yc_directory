'use client';

import { useEffect } from 'react';

interface PerformanceMetrics {
  lcp?: number;
  fid?: number;
  cls?: number;
  fcp?: number;
  ttfb?: number;
}

declare global {
  interface Window {
    webVitals?: {
      getLCP: (callback: (metric: any) => void) => void;
      getFID: (callback: (metric: any) => void) => void;
      getCLS: (callback: (metric: any) => void) => void;
      getFCP: (callback: (metric: any) => void) => void;
      getTTFB: (callback: (metric: any) => void) => void;
    };
  }
}

export default function PerformanceMonitor() {
  useEffect(() => {
    // Only run in production or when explicitly enabled
    if (process.env.NODE_ENV !== 'production' && !process.env.NEXT_PUBLIC_ENABLE_PERFORMANCE_MONITORING) {
      return;
    }

    const metrics: PerformanceMetrics = {};

    // Function to send metrics to analytics
    const sendToAnalytics = (metric: any) => {
      const { name, value, id } = metric;
      
      // Store metric
      metrics[name.toLowerCase() as keyof PerformanceMetrics] = value;

      // Log to console in development
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Performance] ${name}: ${value}ms`);
      }

      // Send to analytics service (replace with your analytics provider)
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', name, {
          event_category: 'Web Vitals',
          event_label: id,
          value: Math.round(name === 'CLS' ? value * 1000 : value),
          non_interaction: true,
        });
      }

      // Send to custom analytics endpoint
      if (process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT) {
        fetch(process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            metric: name,
            value,
            id,
            url: window.location.href,
            timestamp: Date.now(),
          }),
        }).catch(console.error);
      }
    };

    // Load web-vitals library dynamically
    const loadWebVitals = async () => {
      try {
        const { getCLS, getFID, getFCP, getLCP, getTTFB } = await import('web-vitals');
        
        getCLS(sendToAnalytics);
        getFID(sendToAnalytics);
        getFCP(sendToAnalytics);
        getLCP(sendToAnalytics);
        getTTFB(sendToAnalytics);
      } catch (error) {
        console.warn('Failed to load web-vitals:', error);
      }
    };

    // Performance observer for custom metrics
    const observePerformance = () => {
      if ('PerformanceObserver' in window) {
        // Observe navigation timing
        const navObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'navigation') {
              const navEntry = entry as PerformanceNavigationTiming;
              
              // Calculate custom metrics
              const domContentLoaded = navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart;
              const loadComplete = navEntry.loadEventEnd - navEntry.loadEventStart;
              
              console.log(`[Performance] DOM Content Loaded: ${domContentLoaded}ms`);
              console.log(`[Performance] Load Complete: ${loadComplete}ms`);
            }
          }
        });

        try {
          navObserver.observe({ entryTypes: ['navigation'] });
        } catch (error) {
          console.warn('Navigation timing not supported');
        }

        // Observe resource timing for large resources
        const resourceObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            const resourceEntry = entry as PerformanceResourceTiming;
            
            // Flag slow resources (>1s)
            if (resourceEntry.duration > 1000) {
              console.warn(`[Performance] Slow resource: ${resourceEntry.name} (${resourceEntry.duration}ms)`);
            }
          }
        });

        try {
          resourceObserver.observe({ entryTypes: ['resource'] });
        } catch (error) {
          console.warn('Resource timing not supported');
        }

        // Observe long tasks (>50ms)
        const longTaskObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            console.warn(`[Performance] Long task detected: ${entry.duration}ms`);
          }
        });

        try {
          longTaskObserver.observe({ entryTypes: ['longtask'] });
        } catch (error) {
          console.warn('Long task timing not supported');
        }
      }
    };

    // Memory usage monitoring
    const monitorMemory = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        const memoryInfo = {
          usedJSHeapSize: memory.usedJSHeapSize,
          totalJSHeapSize: memory.totalJSHeapSize,
          jsHeapSizeLimit: memory.jsHeapSizeLimit,
        };

        // Log memory usage every 30 seconds
        const logMemory = () => {
          const currentMemory = (performance as any).memory;
          const usedMB = Math.round(currentMemory.usedJSHeapSize / 1024 / 1024);
          const totalMB = Math.round(currentMemory.totalJSHeapSize / 1024 / 1024);
          
          console.log(`[Performance] Memory usage: ${usedMB}MB / ${totalMB}MB`);
          
          // Warn if memory usage is high
          if (usedMB > 100) {
            console.warn(`[Performance] High memory usage detected: ${usedMB}MB`);
          }
        };

        const memoryInterval = setInterval(logMemory, 30000);
        
        return () => clearInterval(memoryInterval);
      }
    };

    // Initialize monitoring
    loadWebVitals();
    observePerformance();
    const cleanupMemory = monitorMemory();

    // Cleanup function
    return () => {
      if (cleanupMemory) {
        cleanupMemory();
      }
    };
  }, []);

  // This component doesn't render anything
  return null;
}

// Helper function to manually track custom metrics
export const trackCustomMetric = (name: string, value: number, labels?: Record<string, string>) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Performance] Custom metric - ${name}: ${value}`, labels);
  }

  // Send to analytics
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'custom_metric', {
      event_category: 'Performance',
      event_label: name,
      value: Math.round(value),
      custom_map: labels,
    });
  }
};

// Helper function to measure component render time
export const measureRenderTime = (componentName: string) => {
  const startTime = performance.now();
  
  return () => {
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    trackCustomMetric(`${componentName}_render_time`, renderTime);
  };
};
