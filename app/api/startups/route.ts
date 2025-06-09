import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { client } from "@/sanity/lib/client";
import { writeClient } from "@/sanity/lib/write-client";
import { Role, hasPermission, Permission } from "@/lib/permissions";
import { 
  STARTUPS_QUERY, 
  SEARCH_STARTUPS_QUERY, 
  STARTUP_COUNT_QUERY,
  FEATURED_STARTUPS_QUERY,
  TRENDING_STARTUPS_QUERY,
  RECENTLY_FUNDED_STARTUPS_QUERY,
  STARTUP_STATS_QUERY
} from "@/sanity/lib/startupQueries";

// GET /api/startups - List and search startups
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const search = searchParams.get('search') || '';
    const industry = searchParams.get('industry') || '';
    const stage = searchParams.get('stage') || '';
    const location = searchParams.get('location') || '';
    const businessModel = searchParams.get('businessModel') || '';
    const fundingMin = parseInt(searchParams.get('fundingMin') || '0');
    const fundingMax = parseInt(searchParams.get('fundingMax') || '0');
    const teamSizeMin = parseInt(searchParams.get('teamSizeMin') || '0');
    const teamSizeMax = parseInt(searchParams.get('teamSizeMax') || '0');
    const featured = searchParams.get('featured') === 'true';
    const trending = searchParams.get('trending') === 'true';
    const recentlyFunded = searchParams.get('recentlyFunded') === 'true';
    const stats = searchParams.get('stats') === 'true';
    const author = searchParams.get('author'); // User ID to filter by founder

    // Pagination
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    // Handle special queries
    if (stats) {
      const statistics = await client.fetch(STARTUP_STATS_QUERY);
      return NextResponse.json({ stats: statistics });
    }

    // Handle user-specific startups query
    if (author) {
      // First get the user's profile to find their userProfile._id
      const userProfile = await client.fetch(
        `*[_type == "userProfile" && userId == $userId][0]{ _id }`,
        { userId: author }
      );

      if (!userProfile) {
        return NextResponse.json({
          startups: [],
          pagination: {
            total: 0,
            limit,
            offset,
            hasMore: false,
          }
        });
      }

      // Query startups where the user is a founder
      const userStartupsQuery = `
        *[_type == "startup" && references($userProfileId) && status == "active"] | order(createdAt desc) {
          _id,
          name,
          slug,
          tagline,
          description,
          logo,
          industry,
          stage,
          foundedYear,
          teamSize,
          location,
          totalFunding,
          valuation,
          website,
          status,
          visibility,
          featured,
          verified,
          views,
          createdAt,
          updatedAt,
          founders[]->{
            _id,
            userId,
            role,
            company,
            position
          },
          // Legacy fields for compatibility
          "title": name,
          "category": industry,
          "image": logo,
          "author": founders[0]->{
            _id,
            "name": coalesce(company, "Unknown"),
            "image": null
          }
        } [$offset...$limit]
      `;

      const userStartupsCountQuery = `
        count(*[_type == "startup" && references($userProfileId) && status == "active"])
      `;

      const [startups, total] = await Promise.all([
        client.fetch(userStartupsQuery, {
          userProfileId: userProfile._id,
          offset,
          limit: offset + limit
        }),
        client.fetch(userStartupsCountQuery, {
          userProfileId: userProfile._id
        }),
      ]);

      return NextResponse.json({
        startups,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total,
        },
        filters: {
          author,
        },
      });
    }

    if (featured) {
      const startups = await client.fetch(FEATURED_STARTUPS_QUERY);
      return NextResponse.json({
        startups,
        pagination: {
          total: startups.length,
          limit: startups.length,
          offset: 0,
          hasMore: false,
        }
      });
    }

    if (trending) {
      const startups = await client.fetch(TRENDING_STARTUPS_QUERY);
      return NextResponse.json({
        startups,
        pagination: {
          total: startups.length,
          limit: startups.length,
          offset: 0,
          hasMore: false,
        }
      });
    }

    if (recentlyFunded) {
      const startups = await client.fetch(RECENTLY_FUNDED_STARTUPS_QUERY);
      return NextResponse.json({
        startups,
        pagination: {
          total: startups.length,
          limit: startups.length,
          offset: 0,
          hasMore: false,
        }
      });
    }

    // Build query parameters
    const queryParams = {
      search,
      industry,
      stage,
      location,
      businessModel,
      fundingMin,
      fundingMax,
      teamSizeMin,
      teamSizeMax,
      featured,
      author,
      offset,
      limit: offset + limit,
    };

    // Determine which query to use
    const hasFilters = search || industry || stage || location || businessModel ||
                      fundingMin > 0 || fundingMax > 0 || teamSizeMin > 0 || teamSizeMax > 0 || featured || author;

    let startups;
    let total;

    if (hasFilters) {
      // Use search query with filters
      [startups, total] = await Promise.all([
        client.fetch(SEARCH_STARTUPS_QUERY, queryParams),
        client.fetch(STARTUP_COUNT_QUERY, queryParams),
      ]);
    } else {
      // Use basic query
      [startups, total] = await Promise.all([
        client.fetch(STARTUPS_QUERY + ` [$offset...$limit]`, { offset, limit: offset + limit }),
        client.fetch(`count(` + STARTUPS_QUERY.split('{')[0] + `)`),
      ]);
    }

    return NextResponse.json({
      startups,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
      filters: {
        search,
        industry,
        stage,
        location,
        businessModel,
        fundingRange: fundingMin > 0 || fundingMax > 0 ? [fundingMin, fundingMax] : null,
        teamSizeRange: teamSizeMin > 0 || teamSizeMax > 0 ? [teamSizeMin, teamSizeMax] : null,
        featured,
        author,
      },
    });
  } catch (error) {
    console.error('Error fetching startups:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/startups - Create new startup
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // For now, allow all authenticated users to create startups
    // TODO: Implement role-based permissions with Clerk

    const body = await request.json();

    // Get user profile
    const userProfile = await client.fetch(
      `*[_type == "userProfile" && userId == $userId][0]`,
      { userId }
    );

    if (!userProfile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }

    // Validate required fields
    if (!body.name || !body.industry || !body.stage) {
      return NextResponse.json(
        { error: 'Missing required fields: name, industry, stage' },
        { status: 400 }
      );
    }

    // Create startup data
    const startupData = {
      _type: 'startup',
      name: body.name,
      slug: {
        _type: 'slug',
        current: body.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, ''),
      },
      tagline: body.tagline || '',
      description: body.description || '',
      industry: body.industry,
      stage: body.stage,
      foundedYear: body.foundedYear || new Date().getFullYear(),
      teamSize: body.teamSize || 1,
      location: body.location || {},
      businessModel: body.businessModel || '',
      revenueModel: body.revenueModel || '',
      targetMarket: body.targetMarket || '',
      website: body.website || '',
      productDemo: body.productDemo || '',
      techStack: body.techStack || [],
      socialLinks: body.socialLinks || {},
      status: 'active',
      visibility: body.visibility || 'public',
      featured: false,
      verified: false,
      views: 0,
      totalFunding: body.totalFunding || 0,
      valuation: body.valuation || 0,
      metrics: body.metrics || {},
      founders: [
        {
          _type: 'reference',
          _ref: userProfile._id,
        },
      ],
      teamMembers: body.teamMembers ? body.teamMembers.map((id: string) => ({
        _type: 'reference',
        _ref: id,
      })) : [],
      investors: body.investors || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Create startup
    const startup = await writeClient.create(startupData);

    return NextResponse.json(startup, { status: 201 });
  } catch (error) {
    console.error('Error creating startup:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/startups - Bulk update startups (admin only)
export async function PUT(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // TODO: Implement admin permissions check with Clerk
    // For now, restrict bulk operations
    return NextResponse.json(
      { error: 'Bulk operations not available yet' },
      { status: 403 }
    );

    const body = await request.json();
    const { action, startupIds, updates } = body;

    if (!action || !startupIds || !Array.isArray(startupIds)) {
      return NextResponse.json(
        { error: 'Missing required fields: action, startupIds' },
        { status: 400 }
      );
    }

    let results = [];

    switch (action) {
      case 'feature':
        for (const id of startupIds) {
          const result = await writeClient
            .patch(id)
            .set({ featured: true, updatedAt: new Date().toISOString() })
            .commit();
          results.push(result);
        }
        break;

      case 'unfeature':
        for (const id of startupIds) {
          const result = await writeClient
            .patch(id)
            .set({ featured: false, updatedAt: new Date().toISOString() })
            .commit();
          results.push(result);
        }
        break;

      case 'verify':
        for (const id of startupIds) {
          const result = await writeClient
            .patch(id)
            .set({ verified: true, updatedAt: new Date().toISOString() })
            .commit();
          results.push(result);
        }
        break;

      case 'unverify':
        for (const id of startupIds) {
          const result = await writeClient
            .patch(id)
            .set({ verified: false, updatedAt: new Date().toISOString() })
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
        for (const id of startupIds) {
          const result = await writeClient
            .patch(id)
            .set({ ...updates, updatedAt: new Date().toISOString() })
            .commit();
          results.push(result);
        }
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action. Supported: feature, unfeature, verify, unverify, update' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      message: `Successfully ${action}d ${results.length} startups`,
      results,
    });
  } catch (error) {
    console.error('Error bulk updating startups:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
