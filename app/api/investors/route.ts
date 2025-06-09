import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { client } from "@/sanity/lib/client";
import { writeClient } from "@/sanity/lib/write-client";
import { Role, hasPermission, Permission } from "@/lib/permissions";
import { 
  INVESTORS_QUERY, 
  SEARCH_INVESTORS_QUERY, 
  INVESTOR_COUNT_QUERY,
  FEATURED_INVESTORS_QUERY,
  INVESTOR_STATS_QUERY,
  MATCHING_INVESTORS_QUERY
} from "@/sanity/lib/investorQueries";

// GET /api/investors - List and search investors
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const search = searchParams.get('search') || '';
    const investorType = searchParams.get('investorType') || '';
    const stage = searchParams.get('stage') || '';
    const industry = searchParams.get('industry') || '';
    const geography = searchParams.get('geography') || '';
    const minAmount = parseInt(searchParams.get('minAmount') || '0');
    const maxAmount = parseInt(searchParams.get('maxAmount') || '0');
    const leadOnly = searchParams.get('leadOnly') === 'true';
    const verified = searchParams.get('verified') === 'true';
    const featured = searchParams.get('featured') === 'true';
    const stats = searchParams.get('stats') === 'true';
    
    // Matching parameters (for startup-investor matching)
    const matchingStartup = searchParams.get('matchingStartup');
    const askAmount = parseInt(searchParams.get('askAmount') || '0');
    const needsLead = searchParams.get('needsLead') === 'true';
    
    // Pagination
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    // Handle special queries
    if (stats) {
      const statistics = await client.fetch(INVESTOR_STATS_QUERY);
      return NextResponse.json({ stats: statistics });
    }

    if (featured) {
      const investors = await client.fetch(FEATURED_INVESTORS_QUERY);
      return NextResponse.json({ 
        investors,
        pagination: {
          total: investors.length,
          limit: investors.length,
          offset: 0,
          hasMore: false,
        }
      });
    }

    // Handle matching query
    if (matchingStartup && stage && industry) {
      const matchingInvestors = await client.fetch(MATCHING_INVESTORS_QUERY, {
        stage,
        industry,
        askAmount,
        needsLead,
      });
      return NextResponse.json({ 
        investors: matchingInvestors,
        pagination: {
          total: matchingInvestors.length,
          limit: matchingInvestors.length,
          offset: 0,
          hasMore: false,
        },
        matching: true,
      });
    }

    // Build query parameters
    const queryParams = {
      search,
      investorType,
      stage,
      industry,
      geography,
      minAmount,
      maxAmount,
      leadOnly,
      verified,
      offset,
      limit: offset + limit,
    };

    // Determine which query to use
    const hasFilters = search || investorType || stage || industry || geography || 
                      minAmount > 0 || maxAmount > 0 || leadOnly || verified;

    let investors;
    let total;

    if (hasFilters) {
      // Use search query with filters
      [investors, total] = await Promise.all([
        client.fetch(SEARCH_INVESTORS_QUERY, queryParams),
        client.fetch(INVESTOR_COUNT_QUERY, queryParams),
      ]);
    } else {
      // Use basic query
      [investors, total] = await Promise.all([
        client.fetch(INVESTORS_QUERY + ` [$offset...$limit]`, { offset, limit: offset + limit }),
        client.fetch(`count(` + INVESTORS_QUERY.split('{')[0] + `)`),
      ]);
    }

    return NextResponse.json({
      investors,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
      filters: {
        search,
        investorType,
        stage,
        industry,
        geography,
        amountRange: minAmount > 0 || maxAmount > 0 ? [minAmount, maxAmount] : null,
        leadOnly,
        verified,
      },
    });
  } catch (error) {
    console.error('Error fetching investors:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/investors - Create investor profile
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user can create investor profiles
    const userRole = session.user.role || Role.USER;
    if (!hasPermission(userRole, Permission.CREATE_INVESTOR_PROFILE)) {
      return NextResponse.json(
        { error: 'Insufficient permissions to create investor profiles' },
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

    // Check if investor profile already exists
    const existingInvestor = await client.fetch(
      `*[_type == "investorProfile" && user._ref == $userId][0]`,
      { userId: userProfile._id }
    );

    if (existingInvestor) {
      return NextResponse.json(
        { error: 'Investor profile already exists for this user' },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!body.investorType || !body.investmentStages || !body.preferredIndustries) {
      return NextResponse.json(
        { error: 'Missing required fields: investorType, investmentStages, preferredIndustries' },
        { status: 400 }
      );
    }

    // Create investor profile data
    const investorData = {
      _type: 'investorProfile',
      user: {
        _type: 'reference',
        _ref: userProfile._id,
      },
      investorType: body.investorType,
      firmName: body.firmName || '',
      title: body.title || '',
      bio: body.bio || '',
      investmentStages: body.investmentStages || [],
      preferredIndustries: body.preferredIndustries || [],
      geographicFocus: body.geographicFocus || [],
      minInvestmentAmount: body.minInvestmentAmount || 0,
      maxInvestmentAmount: body.maxInvestmentAmount || 0,
      typicalCheckSize: body.typicalCheckSize || 0,
      investmentsPerYear: body.investmentsPerYear || 0,
      leadInvestments: body.leadInvestments || false,
      followOnInvestments: body.followOnInvestments || true,
      investmentPhilosophy: body.investmentPhilosophy || '',
      valueAdd: body.valueAdd || [],
      portfolioSize: body.portfolioSize || 0,
      notableInvestments: body.notableInvestments || [],
      contactPreferences: body.contactPreferences || {
        acceptsColdOutreach: true,
        preferredContactMethod: 'email',
        responseTime: '2-3d',
      },
      socialLinks: body.socialLinks || {},
      verified: false,
      accredited: body.accredited || false,
      activelyInvesting: body.activelyInvesting !== false,
      visibility: body.visibility || 'community',
      profileViews: 0,
      connectionsRequested: 0,
      connectionsAccepted: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Create investor profile
    const investor = await writeClient.create(investorData);

    return NextResponse.json(investor, { status: 201 });
  } catch (error) {
    console.error('Error creating investor profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/investors - Bulk update investors (admin only)
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
    const { action, investorIds, updates } = body;

    if (!action || !investorIds || !Array.isArray(investorIds)) {
      return NextResponse.json(
        { error: 'Missing required fields: action, investorIds' },
        { status: 400 }
      );
    }

    let results = [];

    switch (action) {
      case 'verify':
        for (const id of investorIds) {
          const result = await writeClient
            .patch(id)
            .set({ verified: true, updatedAt: new Date().toISOString() })
            .commit();
          results.push(result);
        }
        break;

      case 'unverify':
        for (const id of investorIds) {
          const result = await writeClient
            .patch(id)
            .set({ verified: false, updatedAt: new Date().toISOString() })
            .commit();
          results.push(result);
        }
        break;

      case 'activate':
        for (const id of investorIds) {
          const result = await writeClient
            .patch(id)
            .set({ activelyInvesting: true, updatedAt: new Date().toISOString() })
            .commit();
          results.push(result);
        }
        break;

      case 'deactivate':
        for (const id of investorIds) {
          const result = await writeClient
            .patch(id)
            .set({ activelyInvesting: false, updatedAt: new Date().toISOString() })
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
        for (const id of investorIds) {
          const result = await writeClient
            .patch(id)
            .set({ ...updates, updatedAt: new Date().toISOString() })
            .commit();
          results.push(result);
        }
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action. Supported: verify, unverify, activate, deactivate, update' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      message: `Successfully ${action}d ${results.length} investor profiles`,
      results,
    });
  } catch (error) {
    console.error('Error bulk updating investors:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
