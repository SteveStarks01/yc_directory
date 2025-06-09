import { NextRequest, NextResponse } from 'next/server';
import { rateLimit, withRateLimit } from '@/lib/rate-limiter';

// Rate limit middleware configuration
interface RateLimitMiddlewareConfig {
  windowMs: number;
  maxRequests: number;
  message?: string;
  keyGenerator?: (request: NextRequest) => string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  onLimitReached?: (request: NextRequest, result: any) => void;
}

// Create rate limit middleware
export function createRateLimitMiddleware(config: RateLimitMiddlewareConfig) {
  const limiter = withRateLimit(rateLimit(config));

  return {
    // Check rate limit before processing request
    checkLimit: (request: NextRequest): NextResponse | null => {
      const result = limiter.check(request);

      if (!result.success && result.error) {
        // Log rate limit exceeded
        console.warn('Rate limit exceeded:', {
          timestamp: new Date().toISOString(),
          ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
          userAgent: request.headers.get('user-agent'),
          url: request.url,
          method: request.method,
          limit: result.limit,
          retryAfter: result.retryAfter
        });

        // Call custom handler if provided
        if (config.onLimitReached) {
          config.onLimitReached(request, result);
        }

        // Return rate limit error response
        const response = NextResponse.json(result.error, { status: 429 });
        limiter.addHeaders(response.headers, result);
        return response;
      }

      return null; // No rate limit hit, continue processing
    },

    // Add rate limit headers to successful response
    addHeaders: (response: NextResponse, request: NextRequest) => {
      const status = limiter.getStatus(request);
      limiter.addHeaders(response.headers, status);
      return response;
    },

    // Record result for conditional counting
    recordResult: limiter.recordResult,

    // Get current status
    getStatus: limiter.getStatus
  };
}

// Predefined middleware instances
export const rateLimitMiddleware = {
  // Community creation rate limiting
  communityCreation: createRateLimitMiddleware({
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 3,
    message: 'You can only create 3 communities per hour. Please try again later.',
    skipFailedRequests: true,
    onLimitReached: (request, result) => {
      console.log('Community creation rate limit exceeded:', {
        url: request.url,
        userAgent: request.headers.get('user-agent'),
        retryAfter: result.retryAfter
      });
    }
  }),

  // Member management rate limiting
  memberManagement: createRateLimitMiddleware({
    windowMs: 5 * 60 * 1000, // 5 minutes
    maxRequests: 20,
    message: 'Too many member management actions. Please wait before trying again.',
  }),

  // General API rate limiting
  general: createRateLimitMiddleware({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100,
    message: 'Too many requests. Please slow down.',
  }),
};

// Helper function to apply rate limiting to API route handlers
export function withRateLimiting<T extends any[]>(
  middleware: ReturnType<typeof createRateLimitMiddleware>,
  handler: (request: NextRequest, ...args: T) => Promise<NextResponse>
) {
  return async (request: NextRequest, ...args: T): Promise<NextResponse> => {
    // Check rate limit
    const rateLimitResponse = middleware.checkLimit(request);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    try {
      // Execute the original handler
      const response = await handler(request, ...args);
      
      // Add rate limit headers to successful response
      middleware.addHeaders(response, request);
      
      // Record successful request if needed
      if (response.status < 400) {
        middleware.recordResult(request, true);
      } else {
        middleware.recordResult(request, false);
      }

      return response;
    } catch (error) {
      // Record failed request
      middleware.recordResult(request, false);
      throw error;
    }
  };
}

// Rate limiting decorator for class methods
export function RateLimit(config: RateLimitMiddlewareConfig) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    const middleware = createRateLimitMiddleware(config);

    descriptor.value = async function (request: NextRequest, ...args: any[]) {
      // Check rate limit
      const rateLimitResponse = middleware.checkLimit(request);
      if (rateLimitResponse) {
        return rateLimitResponse;
      }

      try {
        // Execute the original method
        const response = await method.apply(this, [request, ...args]);
        
        // Add rate limit headers
        middleware.addHeaders(response, request);
        
        // Record result
        middleware.recordResult(request, response.status < 400);

        return response;
      } catch (error) {
        // Record failed request
        middleware.recordResult(request, false);
        throw error;
      }
    };

    return descriptor;
  };
}

// Rate limit status checker for debugging
export function getRateLimitStatus(request: NextRequest, type: 'communityCreation' | 'memberManagement' | 'general') {
  const middleware = rateLimitMiddleware[type];
  return middleware.getStatus(request);
}

// Rate limit reset function for testing/admin purposes
export function resetRateLimit(key: string) {
  // This would need to be implemented based on the storage backend
  // For now, it's a placeholder for future Redis implementation
  console.log(`Rate limit reset requested for key: ${key}`);
}
