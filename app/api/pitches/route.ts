import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { client } from "@/sanity/lib/client";
import { writeClient } from "@/sanity/lib/write-client";
import { Role, hasPermission, Permission } from "@/lib/permissions";
import { 
  PITCHES_QUERY, 
  SEARCH_PITCHES_QUERY, 
  PITCH_COUNT_QUERY,
  FEATURED_PITCHES_QUERY,
  TRENDING_PITCHES_QUERY,
  RECENT_PITCHES_QUERY,
  PITCH_STATS_QUERY
} from "@/sanity/lib/pitchQueries";

// GET /api/pitches - List and search pitches
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const search = searchParams.get('search') || '';
    const pitchType = searchParams.get('pitchType') || '';
    const industry = searchParams.get('industry') || '';
    const stage = searchParams.get('stage') || '';
    const askMin = parseInt(searchParams.get('askMin') || '0');
    const askMax = parseInt(searchParams.get('askMax') || '0');
    const hasVideo = searchParams.get('hasVideo') === 'true';
    const hasDeck = searchParams.get('hasDeck') === 'true';
    const featured = searchParams.get('featured') === 'true';
    const trending = searchParams.get('trending') === 'true';
    const recent = searchParams.get('recent') === 'true';
    const stats = searchParams.get('stats') === 'true';
    const eventId = searchParams.get('eventId') || '';
    
    // Pagination
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    // Handle special queries
    if (stats) {
      const statistics = await client.fetch(PITCH_STATS_QUERY);
      return NextResponse.json({ stats: statistics });
    }

    if (featured) {
      const pitches = await client.fetch(FEATURED_PITCHES_QUERY);
      return NextResponse.json({ 
        pitches,
        pagination: {
          total: pitches.length,
          limit: pitches.length,
          offset: 0,
          hasMore: false,
        }
      });
    }

    if (trending) {
      const pitches = await client.fetch(TRENDING_PITCHES_QUERY);
      return NextResponse.json({ 
        pitches,
        pagination: {
          total: pitches.length,
          limit: pitches.length,
          offset: 0,
          hasMore: false,
        }
      });
    }

    if (recent) {
      const pitches = await client.fetch(RECENT_PITCHES_QUERY);
      return NextResponse.json({ 
        pitches,
        pagination: {
          total: pitches.length,
          limit: pitches.length,
          offset: 0,
          hasMore: false,
        }
      });
    }

    // Build query parameters
    const queryParams = {
      search,
      pitchType,
      industry,
      stage,
      askMin,
      askMax,
      hasVideo,
      hasDeck,
      featured,
      eventId,
      offset,
      limit: offset + limit,
    };

    // Determine which query to use
    const hasFilters = search || pitchType || industry || stage || 
                      askMin > 0 || askMax > 0 || hasVideo || hasDeck || featured || eventId;

    let pitches;
    let total;

    if (hasFilters) {
      // Use search query with filters
      [pitches, total] = await Promise.all([
        client.fetch(SEARCH_PITCHES_QUERY, queryParams),
        client.fetch(PITCH_COUNT_QUERY, queryParams),
      ]);
    } else {
      // Use basic query
      [pitches, total] = await Promise.all([
        client.fetch(PITCHES_QUERY + ` [$offset...$limit]`, { offset, limit: offset + limit }),
        client.fetch(`count(` + PITCHES_QUERY.split('{')[0] + `)`),
      ]);
    }

    return NextResponse.json({
      pitches,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
      filters: {
        search,
        pitchType,
        industry,
        stage,
        askRange: askMin > 0 || askMax > 0 ? [askMin, askMax] : null,
        hasVideo,
        hasDeck,
        featured,
        eventId,
      },
    });
  } catch (error) {
    console.error('Error fetching pitches:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/pitches - Create new pitch
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user can create pitches
    const userRole = session.user.role || Role.USER;
    if (!hasPermission(userRole, Permission.CREATE_PITCH)) {
      return NextResponse.json(
        { error: 'Insufficient permissions to create pitches' },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Get user profile
    const userProfile = await client.fetch(
      `*[_type == "userProfile" && userId == $userId][0]`,
      { userId: session.id }
    );

    if (!userProfile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }

    // Validate required fields
    if (!body.title || !body.startup || !body.pitchType) {
      return NextResponse.json(
        { error: 'Missing required fields: title, startup, pitchType' },
        { status: 400 }
      );
    }

    // Verify startup exists and user has permission to create pitch for it
    const startup = await client.fetch(
      `*[_type == "startup" && _id == $startupId][0] {
        _id,
        name,
        founders[]->{
          _id,
          userId
        }
      }`,
      { startupId: body.startup }
    );

    if (!startup) {
      return NextResponse.json(
        { error: 'Startup not found' },
        { status: 404 }
      );
    }

    // Check if user is a founder of the startup or has admin permissions
    const isFounder = startup.founders?.some((founder: any) => founder.userId === session.id);
    const canCreateForAnyStartup = hasPermission(userRole, Permission.ADMIN_SYSTEM);

    if (!isFounder && !canCreateForAnyStartup) {
      return NextResponse.json(
        { error: 'You can only create pitches for startups you founded' },
        { status: 403 }
      );
    }

    // Create pitch data
    const pitchData = {
      _type: 'pitch',
      title: body.title,
      slug: {
        _type: 'slug',
        current: body.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, ''),
      },
      startup: {
        _type: 'reference',
        _ref: body.startup,
      },
      presenter: {
        _type: 'reference',
        _ref: userProfile._id,
      },
      description: body.description || '',
      problem: body.problem || '',
      solution: body.solution || '',
      marketSize: body.marketSize || '',
      businessModel: body.businessModel || '',
      traction: body.traction || '',
      competition: body.competition || '',
      askAmount: body.askAmount || 0,
      useOfFunds: body.useOfFunds || '',
      pitchType: body.pitchType,
      stage: body.stage || '',
      industry: body.industry || '',
      tags: body.tags || [],
      pitchVideoUrl: body.pitchVideoUrl || '',
      demoUrl: body.demoUrl || '',
      presentationDate: body.presentationDate || null,
      status: 'draft',
      visibility: body.visibility || 'community',
      featured: false,
      viewCount: 0,
      likeCount: 0,
      commentCount: 0,
      averageRating: 0,
      ratingCount: 0,
      additionalPresenters: body.additionalPresenters ? body.additionalPresenters.map((id: string) => ({
        _type: 'reference',
        _ref: id,
      })) : [],
      event: body.event ? {
        _type: 'reference',
        _ref: body.event,
      } : null,
      pitchOrder: body.pitchOrder || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Create pitch
    const pitch = await writeClient.create(pitchData);

    return NextResponse.json(pitch, { status: 201 });
  } catch (error) {
    console.error('Error creating pitch:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/pitches - Bulk update pitches (admin only)
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check admin permissions
    const userRole = session.user.role || Role.USER;
    if (!hasPermission(userRole, Permission.ADMIN_SYSTEM)) {
      return NextResponse.json(
        { error: 'Admin permissions required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { action, pitchIds, updates } = body;

    if (!action || !pitchIds || !Array.isArray(pitchIds)) {
      return NextResponse.json(
        { error: 'Missing required fields: action, pitchIds' },
        { status: 400 }
      );
    }

    let results = [];

    switch (action) {
      case 'approve':
        for (const id of pitchIds) {
          const result = await writeClient
            .patch(id)
            .set({ 
              status: 'approved', 
              approvedAt: new Date().toISOString(),
              updatedAt: new Date().toISOString() 
            })
            .commit();
          results.push(result);
        }
        break;

      case 'feature':
        for (const id of pitchIds) {
          const result = await writeClient
            .patch(id)
            .set({ featured: true, updatedAt: new Date().toISOString() })
            .commit();
          results.push(result);
        }
        break;

      case 'unfeature':
        for (const id of pitchIds) {
          const result = await writeClient
            .patch(id)
            .set({ featured: false, updatedAt: new Date().toISOString() })
            .commit();
          results.push(result);
        }
        break;

      case 'archive':
        for (const id of pitchIds) {
          const result = await writeClient
            .patch(id)
            .set({ status: 'archived', updatedAt: new Date().toISOString() })
            .commit();
          results.push(result);
        }
        break;

      case 'update':
        if (!updates) {
          return NextResponse.json(
            { error: 'Updates object required for update action' },
            { status: 400 }
          );
        }
        for (const id of pitchIds) {
          const result = await writeClient
            .patch(id)
            .set({ ...updates, updatedAt: new Date().toISOString() })
            .commit();
          results.push(result);
        }
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action. Supported: approve, feature, unfeature, archive, update' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      message: `Successfully ${action}d ${results.length} pitches`,
      results,
    });
  } catch (error) {
    console.error('Error bulk updating pitches:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
