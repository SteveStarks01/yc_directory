import { NextRequest } from 'next/server';

// Rate limiting configuration interface
interface RateLimitConfig {
  windowMs: number;     // Time window in milliseconds
  maxRequests: number;  // Maximum requests per window
  keyGenerator?: (request: NextRequest) => string; // Custom key generator
  skipSuccessfulRequests?: boolean; // Don't count successful requests
  skipFailedRequests?: boolean;     // Don't count failed requests
  message?: string;     // Custom error message
}

// Rate limit entry interface
interface RateLimitEntry {
  count: number;
  resetTime: number;
  firstRequest: number;
}

// Rate limit result interface
interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
  error?: {
    code: string;
    message: string;
    statusCode: number;
    timestamp: string;
    details?: any;
  };
}

// In-memory store for rate limiting (in production, use Redis)
const rateLimitStore = new Map<string, RateLimitEntry>();

// Cleanup expired entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 60000); // Cleanup every minute

// Default key generator based on IP and user ID
function defaultKeyGenerator(request: NextRequest): string {
  // Try to get user ID from headers (set by auth middleware)
  const userId = request.headers.get('x-user-id');
  
  // Get IP address
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : 
             request.headers.get('x-real-ip') || 
             'unknown';

  // Use user ID if available, otherwise fall back to IP
  return userId ? `user:${userId}` : `ip:${ip}`;
}

// Main rate limiting function
export function rateLimit(config: RateLimitConfig) {
  const {
    windowMs,
    maxRequests,
    keyGenerator = defaultKeyGenerator,
    skipSuccessfulRequests = false,
    skipFailedRequests = false,
    message = 'Too many requests, please try again later.'
  } = config;

  return {
    check: (request: NextRequest): RateLimitResult => {
      const key = keyGenerator(request);
      const now = Date.now();
      const windowStart = now - windowMs;

      // Get or create rate limit entry
      let entry = rateLimitStore.get(key);
      
      if (!entry || now > entry.resetTime) {
        // Create new entry or reset expired entry
        entry = {
          count: 0,
          resetTime: now + windowMs,
          firstRequest: now
        };
        rateLimitStore.set(key, entry);
      }

      // Check if limit exceeded
      if (entry.count >= maxRequests) {
        const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
        
        return {
          success: false,
          limit: maxRequests,
          remaining: 0,
          resetTime: entry.resetTime,
          retryAfter,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message,
            statusCode: 429,
            timestamp: new Date().toISOString(),
            details: {
              limit: maxRequests,
              windowMs,
              retryAfter,
              resetTime: new Date(entry.resetTime).toISOString()
            }
          }
        };
      }

      // Increment counter
      entry.count++;
      rateLimitStore.set(key, entry);

      return {
        success: true,
        limit: maxRequests,
        remaining: maxRequests - entry.count,
        resetTime: entry.resetTime
      };
    },

    // Method to record the result (for conditional counting)
    recordResult: (request: NextRequest, success: boolean) => {
      if ((success && skipSuccessfulRequests) || (!success && skipFailedRequests)) {
        const key = keyGenerator(request);
        const entry = rateLimitStore.get(key);
        if (entry && entry.count > 0) {
          entry.count--;
          rateLimitStore.set(key, entry);
        }
      }
    },

    // Get current status without incrementing
    getStatus: (request: NextRequest): RateLimitResult => {
      const key = keyGenerator(request);
      const now = Date.now();
      const entry = rateLimitStore.get(key);

      if (!entry || now > entry.resetTime) {
        return {
          success: true,
          limit: maxRequests,
          remaining: maxRequests,
          resetTime: now + windowMs
        };
      }

      const remaining = Math.max(0, maxRequests - entry.count);
      
      return {
        success: remaining > 0,
        limit: maxRequests,
        remaining,
        resetTime: entry.resetTime,
        retryAfter: remaining === 0 ? Math.ceil((entry.resetTime - now) / 1000) : undefined
      };
    }
  };
}

// Predefined rate limiters for different use cases
export const rateLimiters = {
  // Community creation: 3 communities per hour per user
  communityCreation: rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 3,
    message: 'You can only create 3 communities per hour. Please try again later.',
    skipFailedRequests: true, // Don't count failed attempts
  }),

  // Member management: 20 actions per 5 minutes per user
  memberManagement: rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    maxRequests: 20,
    message: 'Too many member management actions. Please wait before trying again.',
  }),

  // Post creation: 10 posts per 10 minutes per user
  postCreation: rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    maxRequests: 10,
    message: 'You can only create 10 posts per 10 minutes. Please slow down.',
  }),

  // Comment creation: 30 comments per 5 minutes per user
  commentCreation: rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    maxRequests: 30,
    message: 'Too many comments. Please wait before commenting again.',
  }),

  // General API: 100 requests per minute per user
  general: rateLimit({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100,
    message: 'Too many requests. Please slow down.',
  }),

  // Authentication: 5 attempts per 15 minutes per IP
  authentication: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,
    keyGenerator: (request: NextRequest) => {
      const forwarded = request.headers.get('x-forwarded-for');
      const ip = forwarded ? forwarded.split(',')[0] : 
                 request.headers.get('x-real-ip') || 
                 'unknown';
      return `auth:${ip}`;
    },
    message: 'Too many authentication attempts. Please try again later.',
  }),
};

// Middleware helper for applying rate limiting
export function withRateLimit(limiter: ReturnType<typeof rateLimit>) {
  return {
    check: limiter.check,
    recordResult: limiter.recordResult,
    getStatus: limiter.getStatus,
    
    // Helper to add rate limit headers to response
    addHeaders: (headers: Headers, result: RateLimitResult) => {
      headers.set('X-RateLimit-Limit', result.limit.toString());
      headers.set('X-RateLimit-Remaining', result.remaining.toString());
      headers.set('X-RateLimit-Reset', new Date(result.resetTime).toISOString());
      
      if (result.retryAfter) {
        headers.set('Retry-After', result.retryAfter.toString());
      }
    }
  };
}
