'use client';

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react';
import { ReactNode, useEffect } from 'react';

interface SessionProviderProps {
  children: ReactNode;
}

export default function SessionProvider({ children }: SessionProviderProps) {
  // Handle NextAuth.js v5 beta session errors
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      // Check if this is a NextAuth.js session error
      if (event.reason && typeof event.reason === 'object') {
        const error = event.reason;

        // Handle specific NextAuth.js v5 beta errors
        if (error.message && typeof error.message === 'string') {
          if (error.message.includes('Failed to fetch') &&
              (error.message.includes('session') || error.message.includes('auth'))) {
            console.warn('NextAuth.js v5 beta session fetch error (handled):', error.message);
            event.preventDefault(); // Prevent the error from being thrown
            return;
          }

          if (error.message.includes('JWT') || error.message.includes('token')) {
            console.warn('NextAuth.js v5 beta JWT error (handled):', error.message);
            event.preventDefault(); // Prevent the error from being thrown
            return;
          }
        }

        // Handle NextAuth.js specific error types
        if (error.type && typeof error.type === 'string') {
          if (error.type.includes('ClientFetchError') ||
              error.type.includes('SessionError') ||
              error.type.includes('JWTError')) {
            console.warn('NextAuth.js v5 beta error (handled):', error.type);
            event.preventDefault(); // Prevent the error from being thrown
            return;
          }
        }
      }
    };

    // Add global error handler for NextAuth.js v5 beta issues
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return (
    <NextAuthSessionProvider
      // Enhanced configuration for NextAuth.js v5 beta
      refetchInterval={5 * 60} // Refetch session every 5 minutes
      refetchOnWindowFocus={true}
      refetchWhenOffline={false}
    >
      {children}
    </NextAuthSessionProvider>
  );
}
