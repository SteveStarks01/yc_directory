import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { client } from "@/sanity/lib/client";
import { writeClient } from "@/sanity/lib/write-client";
import { Role, hasPermission, Permission } from "@/lib/permissions";
import { 
  USER_INTERACTIONS_QUERY,
  USER_INTERACTION_SUMMARY_QUERY,
  PLATFORM_ANALYTICS_QUERY,
  USER_BEHAVIOR_PATTERNS_QUERY,
  TRENDING_INSIGHTS_QUERY,
  MARKET_INTELLIGENCE_QUERY
} from "@/sanity/lib/analyticsQueries";

// GET /api/analytics - Get analytics data
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const { searchParams } = new URL(request.url);
    
    const type = searchParams.get('type');
    const userId = searchParams.get('userId');

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check permissions based on analytics type
    if (type === 'platform' || type === 'market-intelligence') {
      if (!hasPermission(session.user.role || Role.USER, Permission.VIEW_ANALYTICS)) {
        return NextResponse.json(
          { error: 'Insufficient permissions to view platform analytics' },
          { status: 403 }
        );
      }
    }

    // Check if user can view specific user analytics
    if (userId && userId !== session.id && !hasPermission(session.user.role || Role.USER, Permission.VIEW_ANALYTICS)) {
      return NextResponse.json(
        { error: 'Insufficient permissions to view user analytics' },
        { status: 403 }
      );
    }

    let analyticsData;

    switch (type) {
      case 'user-interactions':
        const targetUserId = userId || session.id;
        const userProfile = await client.fetch(
          `*[_type == "userProfile" && userId == $userId][0]._id`,
          { userId: targetUserId }
        );
        
        if (!userProfile) {
          return NextResponse.json(
            { error: 'User profile not found' },
            { status: 404 }
          );
        }

        analyticsData = await client.fetch(USER_INTERACTIONS_QUERY, { userId: userProfile });
        break;

      case 'user-summary':
        const summaryUserId = userId || session.id;
        const summaryUserProfile = await client.fetch(
          `*[_type == "userProfile" && userId == $userId][0]._id`,
          { userId: summaryUserId }
        );
        
        if (!summaryUserProfile) {
          return NextResponse.json(
            { error: 'User profile not found' },
            { status: 404 }
          );
        }

        analyticsData = await client.fetch(USER_INTERACTION_SUMMARY_QUERY, { userId: summaryUserProfile });
        break;

      case 'user-behavior':
        const behaviorUserId = userId || session.id;
        const behaviorUserProfile = await client.fetch(
          `*[_type == "userProfile" && userId == $userId][0]._id`,
          { userId: behaviorUserId }
        );
        
        if (!behaviorUserProfile) {
          return NextResponse.json(
            { error: 'User profile not found' },
            { status: 404 }
          );
        }

        analyticsData = await client.fetch(USER_BEHAVIOR_PATTERNS_QUERY, { userId: behaviorUserProfile });
        break;

      case 'platform':
        analyticsData = await client.fetch(PLATFORM_ANALYTICS_QUERY);
        break;

      case 'trending':
        analyticsData = await client.fetch(TRENDING_INSIGHTS_QUERY);
        break;

      case 'market-intelligence':
        analyticsData = await client.fetch(MARKET_INTELLIGENCE_QUERY);
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid analytics type. Supported types: user-interactions, user-summary, user-behavior, platform, trending, market-intelligence' },
          { status: 400 }
        );
    }

    return NextResponse.json({ 
      type,
      data: analyticsData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/analytics - Track user interaction
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
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
    if (!body.interactionType) {
      return NextResponse.json(
        { error: 'Missing required field: interactionType' },
        { status: 400 }
      );
    }

    // Create interaction data
    const interactionData = {
      _type: 'userInteraction',
      user: {
        _type: 'reference',
        _ref: userProfile._id,
      },
      interactionType: body.interactionType,
      targetType: body.targetType,
      targetId: body.targetId,
      targetReference: body.targetReference ? {
        _type: 'reference',
        _ref: body.targetReference,
      } : null,
      metadata: {
        searchQuery: body.searchQuery,
        filters: body.filters,
        rating: body.rating,
        duration: body.duration,
        source: body.source || 'direct',
        device: body.device || 'desktop',
        browser: body.browser,
        location: body.location,
      },
      outcome: body.outcome || 'completed',
      conversionValue: body.conversionValue || 0,
      followUpAction: body.followUpAction,
      sessionId: body.sessionId,
      pageUrl: body.pageUrl,
      referrerUrl: body.referrerUrl,
      aiScore: body.aiScore,
      recommendationId: body.recommendationId,
      experimentId: body.experimentId,
      timestamp: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    // Create interaction record
    const interaction = await writeClient.create(interactionData);

    return NextResponse.json(interaction, { status: 201 });
  } catch (error) {
    console.error('Error tracking interaction:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/analytics - Update interaction (e.g., add outcome)
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { interactionId, ...updates } = body;

    if (!interactionId) {
      return NextResponse.json(
        { error: 'Missing required field: interactionId' },
        { status: 400 }
      );
    }

    // Get existing interaction
    const existingInteraction = await client.fetch(
      `*[_type == "userInteraction" && _id == $interactionId][0] {
        _id,
        user->{
          userId
        }
      }`,
      { interactionId }
    );

    if (!existingInteraction) {
      return NextResponse.json(
        { error: 'Interaction not found' },
        { status: 404 }
      );
    }

    // Check permissions - user or admin can edit
    const isOwner = existingInteraction.user?.userId === session.id;
    const canEditAny = session.user.role && hasPermission(session.user.role, Permission.ADMIN_SYSTEM);

    if (!isOwner && !canEditAny) {
      return NextResponse.json(
        { error: 'Insufficient permissions to edit this interaction' },
        { status: 403 }
      );
    }

    // Define allowed fields for updates
    const allowedFields = [
      'outcome', 'conversionValue', 'followUpAction', 'duration', 
      'aiScore', 'metadata'
    ];

    const updateData: any = {};
    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        updateData[field] = updates[field];
      }
    }

    // Update interaction
    const updatedInteraction = await writeClient
      .patch(interactionId)
      .set(updateData)
      .commit();

    return NextResponse.json(updatedInteraction);
  } catch (error) {
    console.error('Error updating interaction:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/analytics - Delete interaction (admin only)
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    const { searchParams } = new URL(request.url);
    const interactionId = searchParams.get('interactionId');
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!interactionId) {
      return NextResponse.json(
        { error: 'Missing required parameter: interactionId' },
        { status: 400 }
      );
    }

    // Check admin permissions
    if (!hasPermission(session.user.role || Role.USER, Permission.ADMIN_SYSTEM)) {
      return NextResponse.json(
        { error: 'Admin permissions required to delete interactions' },
        { status: 403 }
      );
    }

    // Delete the interaction
    await writeClient.delete(interactionId);

    return NextResponse.json(
      { message: 'Interaction deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting interaction:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
