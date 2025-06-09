import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getCurrentUser } from '@/lib/clerk-auth';
import { client } from '@/sanity/lib/client';
import { writeClient } from '@/sanity/lib/write-client';
import { createClient } from 'next-sanity';
import { apiVersion, dataset, projectId } from '@/sanity/env';
import { rateLimitMiddleware } from '@/lib/middleware/rate-limit-middleware';
import slugify from 'slugify';

// Create optimized client for API routes (no CDN for real-time data)
const apiClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false, // Disable CDN for API routes to get fresh data
  perspective: 'published',
  stega: false,
});

// Simple in-memory cache for frequently accessed data
interface CacheEntry {
  data: any;
  timestamp: number;
  ttl: number;
}

const queryCache = new Map<string, CacheEntry>();

const getCachedQuery = (key: string): any | null => {
  const entry = queryCache.get(key);
  if (entry && Date.now() - entry.timestamp < entry.ttl) {
    return entry.data;
  }
  if (entry) {
    queryCache.delete(key); // Remove expired entry
  }
  return null;
};

const setCachedQuery = (key: string, data: any, ttlMs: number = 60000): void => {
  queryCache.set(key, {
    data,
    timestamp: Date.now(),
    ttl: ttlMs
  });
};

// Performance monitoring utilities
interface QueryPerformanceMetrics {
  queryTime: number;
  resultCount?: number;
  cacheHit?: boolean;
  queryType: string;
}

const logQueryPerformance = (metrics: QueryPerformanceMetrics) => {
  const { queryTime, resultCount, cacheHit, queryType } = metrics;

  // Log performance warnings for slow queries
  if (queryTime > 2000) {
    console.warn(`Slow query detected: ${queryType}`, {
      queryTime: `${queryTime}ms`,
      resultCount,
      cacheHit,
      threshold: '2000ms'
    });
  } else if (queryTime > 1000) {
    console.log(`Query performance: ${queryType}`, {
      queryTime: `${queryTime}ms`,
      resultCount,
      cacheHit,
      status: 'acceptable'
    });
  }
};

// Query optimization helpers
const createOptimizedQuery = (baseFilter: string, fields: string[], orderBy = 'createdAt desc') => {
  return `*[${baseFilter}] | order(${orderBy}) {${fields.join(', ')}}`;
};

const createPaginatedQuery = (baseFilter: string, fields: string[], offset: number, limit: number, orderBy = 'createdAt desc') => {
  return `*[${baseFilter}] | order(${orderBy}) [${offset}...${offset + limit}] {${fields.join(', ')}}`;
};

// Enhanced error handling interfaces
interface CommunityCreationError {
  code: string;
  message: string;
  statusCode: number;
  timestamp: string;
  details?: string;
}

interface SessionValidationResult {
  isValid: boolean;
  session: any;
  error?: CommunityCreationError;
}

// Clerk-based session validation function
async function validateUserSession(): Promise<SessionValidationResult> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return {
        isValid: false,
        session: null,
        error: {
          code: 'NO_SESSION',
          message: 'No active session found. Please sign in.',
          statusCode: 401,
          timestamp: new Date().toISOString(),
        }
      };
    }

    // Get user data from Clerk and Sanity
    const user = await getCurrentUser();

    if (!user) {
      return {
        isValid: false,
        session: null,
        error: {
          code: 'NO_USER',
          message: 'User not found. Please sign in again.',
          statusCode: 401,
          timestamp: new Date().toISOString(),
        }
      };
    }

    // Create session-like object for compatibility
    const session = {
      user: {
        id: userId,
        email: user.email,
        name: user.name,
        image: user.image,
        role: user.role,
      },
      id: userId,
    };

    console.log('Clerk session validation:', {
      userId,
      hasUser: !!user,
      userRole: user.role,
    });

    return {
      isValid: true,
      session,
    };
  } catch (error) {
    console.error('Clerk session validation error:', error);

    return {
      isValid: false,
      session: null,
      error: {
        code: 'SESSION_ERROR',
        message: 'Authentication error. Please try signing in again.',
        statusCode: 401,
        timestamp: new Date().toISOString(),
        details: process.env.NODE_ENV === 'development' ? error?.message : undefined,
      }
    };
  }
}

// GET /api/communities - List communities with optimized queries
export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    const { searchParams } = new URL(request.url);
    const startupId = searchParams.get('startupId');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100); // Cap at 100
    const offset = Math.max(parseInt(searchParams.get('offset') || '0'), 0);

    // Build optimized queries
    let baseFilter = `_type == "startupCommunity" && isActive == true`;
    let params: any = { limit, offset };

    if (startupId) {
      baseFilter += ` && startup._ref == $startupId`;
      params.startupId = startupId;
    }

    // Create cache key for this query
    const cacheKey = `communities:${startupId || 'all'}:${limit}:${offset}`;

    // Check cache first
    const cachedResult = getCachedQuery(cacheKey);
    if (cachedResult) {
      console.log('Cache hit for communities query:', cacheKey);
      const response = NextResponse.json({
        ...cachedResult,
        meta: {
          ...cachedResult.meta,
          cached: true,
          cacheKey
        }
      });

      // Add cache headers
      const cacheMaxAge = startupId ? 120 : 180; // Shorter cache for specific startup
      response.headers.set('Cache-Control', `public, s-maxage=${cacheMaxAge}, stale-while-revalidate=${cacheMaxAge * 2}`);
      response.headers.set('X-Cache', 'HIT');

      return response;
    }

    // Optimized parallel queries using helper functions with minimal fields
    const communityFields = [
      '_id',
      'name',
      'slug',
      'description',
      'isPublic',
      'memberCount',
      'postCount',
      'createdAt',
      '"startupId": startup._ref',
      '"startupTitle": startup->title'
      // Removed heavy image fields and author details for better performance
    ];

    const [communities, totalCount] = await Promise.all([
      // Main data query with optimized field selection using non-CDN client
      apiClient.fetch(
        createPaginatedQuery(baseFilter, communityFields, offset, limit),
        params
      ),
      // Separate optimized count query using non-CDN client
      apiClient.fetch(
        `count(*[${baseFilter}])`,
        startupId ? { startupId } : {}
      )
    ]);

    const queryTime = Date.now() - startTime;

    // Log performance metrics using utility
    logQueryPerformance({
      queryTime,
      resultCount: communities.length,
      queryType: startupId ? 'communities-by-startup' : 'communities-list',
      cacheHit: false
    });

    // Additional detailed logging
    console.log('Communities query details:', {
      queryTime: `${queryTime}ms`,
      resultCount: communities.length,
      totalCount,
      hasStartupFilter: !!startupId,
      pagination: { limit, offset },
      performance: queryTime < 1000 ? 'good' : queryTime < 2000 ? 'acceptable' : 'slow'
    });

    const responseData = {
      communities,
      total: totalCount,
      pagination: {
        limit,
        offset,
        hasMore: offset + limit < totalCount,
        totalPages: Math.ceil(totalCount / limit),
        currentPage: Math.floor(offset / limit) + 1
      },
      meta: {
        queryTime: `${queryTime}ms`,
        cached: false
      }
    };

    // Cache the result for future requests (2 minutes TTL)
    setCachedQuery(cacheKey, responseData, 120000);

    const response = NextResponse.json(responseData);

    // Enhanced caching headers based on data freshness
    const cacheMaxAge = startupId ? 120 : 180; // Shorter cache for specific startup
    response.headers.set('Cache-Control', `public, s-maxage=${cacheMaxAge}, stale-while-revalidate=${cacheMaxAge * 2}`);
    response.headers.set('CDN-Cache-Control', `public, s-maxage=${cacheMaxAge}`);
    response.headers.set('Vary', 'Accept-Encoding');
    response.headers.set('X-Cache', 'MISS');

    return response;
  } catch (error) {
    const queryTime = Date.now() - startTime;
    console.error('Error fetching communities:', {
      error: error.message,
      queryTime: `${queryTime}ms`,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });

    return NextResponse.json(
      {
        code: 'QUERY_ERROR',
        message: 'Failed to fetch communities',
        statusCode: 500,
        timestamp: new Date().toISOString(),
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

// POST /api/communities - Create a new community
export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting first
    const rateLimitCheck = rateLimitMiddleware.communityCreation.checkLimit(request);
    if (rateLimitCheck) {
      return rateLimitCheck;
    }

    // Use enhanced session validation
    const sessionValidation = await validateUserSession();

    if (!sessionValidation.isValid) {
      console.error('Session validation failed:', sessionValidation.error);

      // Record failed request for rate limiting
      rateLimitMiddleware.communityCreation.recordResult(request, false);

      return NextResponse.json(
        sessionValidation.error,
        { status: sessionValidation.error!.statusCode }
      );
    }

    const session = sessionValidation.session;

    // Enhanced request body parsing with validation
    let body;
    try {
      const rawBody = await request.text();

      if (!rawBody || rawBody.trim() === '') {
        return NextResponse.json(
          {
            code: 'EMPTY_BODY',
            message: 'Request body is empty',
            statusCode: 400,
            timestamp: new Date().toISOString(),
          },
          { status: 400 }
        );
      }

      body = JSON.parse(rawBody);

      if (!body || typeof body !== 'object') {
        return NextResponse.json(
          {
            code: 'INVALID_BODY',
            message: 'Request body must be a valid JSON object',
            statusCode: 400,
            timestamp: new Date().toISOString(),
          },
          { status: 400 }
        );
      }
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError);
      return NextResponse.json(
        {
          code: 'JSON_PARSE_ERROR',
          message: 'Invalid JSON in request body',
          statusCode: 400,
          timestamp: new Date().toISOString(),
          details: process.env.NODE_ENV === 'development' ? parseError?.message : undefined,
        },
        { status: 400 }
      );
    }

    const { startupId, name, description } = body;

    console.log('Community creation request:', {
      startupId,
      name,
      description,
      userId: session.user.id,
      userRole: session.user.role
    });

    // Enhanced field validation
    const validationErrors: string[] = [];

    if (!startupId) {
      validationErrors.push('startupId is required');
    } else if (typeof startupId !== 'string' || startupId.trim() === '') {
      validationErrors.push('startupId must be a non-empty string');
    }

    if (!name) {
      validationErrors.push('name is required');
    } else if (typeof name !== 'string' || name.trim() === '') {
      validationErrors.push('name must be a non-empty string');
    } else if (name.length < 3) {
      validationErrors.push('name must be at least 3 characters long');
    } else if (name.length > 100) {
      validationErrors.push('name must be no more than 100 characters long');
    }

    if (description && typeof description !== 'string') {
      validationErrors.push('description must be a string');
    } else if (description && description.length > 500) {
      validationErrors.push('description must be no more than 500 characters long');
    }

    if (validationErrors.length > 0) {
      console.error('Validation errors:', validationErrors);
      return NextResponse.json(
        {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input data',
          statusCode: 400,
          timestamp: new Date().toISOString(),
          details: validationErrors.join(', '),
        },
        { status: 400 }
      );
    }

    // Optimized parallel queries with timeout protection
    const queryStartTime = Date.now();

    const [startup, existingCommunity] = await Promise.race([
      Promise.all([
        // Enhanced startup ownership verification - check both legacy author and new founders fields
        apiClient.fetch(
          `*[_type == "startup" && _id == $startupId && (
            author._ref == $userId ||
            $userId in founders[]._ref
          )][0]{
            _id,
            title,
            name
          }`,
          { startupId, userId: session.user.id }
        ),
        // Optimized community existence check - minimal fields using non-CDN client
        apiClient.fetch(
          `*[_type == "startupCommunity" && startup._ref == $startupId][0]{
            _id
          }`,
          { startupId }
        )
      ]),
      // Reduced timeout for queries (5 seconds instead of 10)
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Database query timeout - queries took too long')), 5000)
      )
    ]);

    const queryTime = Date.now() - queryStartTime;

    // Log validation query performance
    logQueryPerformance({
      queryTime,
      resultCount: (startup ? 1 : 0) + (existingCommunity ? 1 : 0),
      queryType: 'community-validation',
      cacheHit: false
    });

    console.log('Validation queries details:', {
      queryTime: `${queryTime}ms`,
      startupFound: !!startup,
      communityExists: !!existingCommunity,
      startupId,
      userId: session.user.id
    });

    if (!startup) {
      console.error('Startup ownership verification failed:', { startupId, userId: session.user.id });
      return NextResponse.json(
        {
          code: 'PERMISSION_ERROR',
          message: 'Startup not found or you do not have permission to create a community for it',
          statusCode: 403,
          timestamp: new Date().toISOString(),
        },
        { status: 403 }
      );
    }

    if (existingCommunity) {
      console.log('Community already exists for startup:', startupId);
      return NextResponse.json(
        {
          code: 'DUPLICATE_ERROR',
          message: 'A community already exists for this startup',
          statusCode: 409,
          timestamp: new Date().toISOString(),
        },
        { status: 409 }
      );
    }

    // Optimized community creation with performance monitoring
    const creationStartTime = Date.now();
    const slug = slugify(name, { lower: true, strict: true });

    // Streamlined community data structure
    const communityData = {
      _type: 'startupCommunity',
      startup: {
        _type: 'reference',
        _ref: startupId,
      },
      name: name.trim(),
      slug: {
        _type: 'slug',
        current: slug,
      },
      description: description?.trim() || `Official community for ${startup.title || startup.name || 'this startup'}`,
      isActive: true,
      isPublic: true,
      allowGuestPosts: false,
      memberCount: 1,
      postCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    console.log('Creating community with optimized data:', {
      name: name.trim(),
      slug,
      startupId,
      startupTitle: startup.title
    });

    // Create community with reduced timeout and better error handling
    const community = await Promise.race([
      writeClient.create(communityData),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Community creation timeout - database write took too long')), 7000)
      )
    ]);

    // Get the userProfile ID for the current user
    const userProfile = await apiClient.fetch(
      `*[_type == "userProfile" && userId == $userId][0] {
        _id,
        userId,
        name
      }`,
      { userId: session.user.id }
    );

    if (!userProfile) {
      console.error('User profile not found for userId:', session.user.id);
      return NextResponse.json(
        {
          code: 'USER_PROFILE_ERROR',
          message: 'User profile not found. Please ensure you have a complete profile.',
          statusCode: 400,
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // Auto-add creator as owner member
    const ownerMembershipData = {
      _type: 'communityMember',
      community: {
        _type: 'reference',
        _ref: community._id,
      },
      user: {
        _type: 'reference',
        _ref: userProfile._id,  // Use the Sanity userProfile ID, not the Clerk user ID
      },
      role: 'owner',
      permissions: {
        canPost: true,
        canComment: true,
        canModerate: true,
        canInvite: true,
        canManageMembers: true,
      },
      status: 'active',
      joinedAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      postCount: 0,
      commentCount: 0,
      updatedAt: new Date().toISOString(),
    };

    // Create owner membership
    await writeClient.create(ownerMembershipData);

    const creationTime = Date.now() - creationStartTime;

    // Log creation performance
    logQueryPerformance({
      queryTime: creationTime,
      resultCount: 1,
      queryType: 'community-creation',
      cacheHit: false
    });

    console.log('Community creation success:', {
      creationTime: `${creationTime}ms`,
      communityId: community._id,
      communityName: name.trim(),
      startupId,
      ownerAdded: true,
      performance: creationTime < 2000 ? 'good' : creationTime < 5000 ? 'acceptable' : 'slow'
    });

    return NextResponse.json({
      ...community,
      message: 'Community created successfully',
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating community:', error);

    // Enhanced error handling with proper typing
    const createErrorResponse = (
      code: string,
      message: string,
      statusCode: number,
      details?: string
    ): CommunityCreationError => ({
      code,
      message,
      statusCode,
      timestamp: new Date().toISOString(),
      details: process.env.NODE_ENV === 'development' ? details : undefined,
    });

    let errorResponse: CommunityCreationError;

    if (error instanceof Error) {
      if (error.message.includes('timeout')) {
        errorResponse = createErrorResponse(
          'TIMEOUT_ERROR',
          'Community creation timed out - please try again',
          408,
          error.message
        );
      } else if (error.message.includes('validation')) {
        errorResponse = createErrorResponse(
          'VALIDATION_ERROR',
          'Invalid data provided',
          400,
          error.message
        );
      } else if (error.message.includes('permission') || error.message.includes('unauthorized')) {
        errorResponse = createErrorResponse(
          'PERMISSION_ERROR',
          'Authentication required',
          401,
          error.message
        );
      } else if (error.message.includes('duplicate') || error.message.includes('already exists')) {
        errorResponse = createErrorResponse(
          'DUPLICATE_ERROR',
          'A community already exists for this startup',
          409,
          error.message
        );
      } else if (error.message.includes('network') || error.message.includes('connection')) {
        errorResponse = createErrorResponse(
          'NETWORK_ERROR',
          'Database connection error - please try again',
          503,
          error.message
        );
      } else {
        errorResponse = createErrorResponse(
          'INTERNAL_ERROR',
          'An unexpected error occurred while creating the community',
          500,
          error.message
        );
      }
    } else {
      errorResponse = createErrorResponse(
        'UNKNOWN_ERROR',
        'An unknown error occurred',
        500,
        String(error)
      );
    }

    return NextResponse.json(errorResponse, { status: errorResponse.statusCode });
  }
}
