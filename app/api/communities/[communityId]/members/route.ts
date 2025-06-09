import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { createClient } from 'next-sanity';
import { writeClient } from '@/sanity/lib/write-client';
import { apiVersion, dataset, projectId } from '@/sanity/env';

// Create optimized client for member management
const apiClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  perspective: 'published',
  stega: false,
});

// Member management error interface
interface MemberManagementError {
  code: string;
  message: string;
  statusCode: number;
  timestamp: string;
  details?: string;
}

// Member role permissions mapping
const ROLE_PERMISSIONS = {
  owner: {
    canPost: true,
    canComment: true,
    canModerate: true,
    canInvite: true,
    canManageMembers: true,
  },
  admin: {
    canPost: true,
    canComment: true,
    canModerate: true,
    canInvite: true,
    canManageMembers: true,
  },
  moderator: {
    canPost: true,
    canComment: true,
    canModerate: true,
    canInvite: false,
    canManageMembers: false,
  },
  member: {
    canPost: true,
    canComment: true,
    canModerate: false,
    canInvite: false,
    canManageMembers: false,
  },
};

// Validate user session
async function validateUserSession() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return {
        isValid: false,
        error: {
          code: 'NO_SESSION',
          message: 'Authentication required',
          statusCode: 401,
          timestamp: new Date().toISOString(),
        }
      };
    }
    return { isValid: true, session };
  } catch (error) {
    return {
      isValid: false,
      error: {
        code: 'SESSION_ERROR',
        message: 'Authentication error',
        statusCode: 401,
        timestamp: new Date().toISOString(),
      }
    };
  }
}

// Check if user has permission to manage members
async function checkMemberManagementPermission(communityId: string, userId: string) {
  const membership = await apiClient.fetch(
    `*[_type == "communityMember" && community._ref == $communityId && user._ref == $userId && status == "active"][0]{
      role,
      permissions
    }`,
    { communityId, userId }
  );

  if (!membership) {
    return { hasPermission: false, error: 'Not a member of this community' };
  }

  const canManage = membership.role === 'owner' || 
                   membership.role === 'admin' || 
                   membership.permissions?.canManageMembers;

  return { 
    hasPermission: canManage, 
    role: membership.role,
    error: canManage ? null : 'Insufficient permissions to manage members'
  };
}

// GET /api/communities/[communityId]/members - List community members
export async function GET(
  request: NextRequest,
  { params }: { params: { communityId: string } }
) {
  const startTime = Date.now();
  
  try {
    const { communityId } = params;
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const offset = Math.max(parseInt(searchParams.get('offset') || '0'), 0);
    const role = searchParams.get('role');
    const status = searchParams.get('status') || 'active';

    // Build filter
    let filter = `_type == "communityMember" && community._ref == $communityId && status == $status`;
    let params: any = { communityId, status, limit, offset };

    if (role) {
      filter += ` && role == $role`;
      params.role = role;
    }

    // Fetch members and total count
    const [members, totalCount] = await Promise.all([
      apiClient.fetch(
        `*[${filter}] | order(joinedAt desc) [${offset}...${offset + limit}] {
          _id,
          role,
          status,
          joinedAt,
          lastActive,
          postCount,
          commentCount,
          permissions,
          user->{
            _id,
            userId,
            "name": coalesce(name, "Unknown User"),
            "image": image,
            role,
            isVerified
          }
        }`,
        params
      ),
      apiClient.fetch(`count(*[${filter}])`, { communityId, status, role })
    ]);

    const queryTime = Date.now() - startTime;

    return NextResponse.json({
      members,
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
        communityId
      }
    });

  } catch (error) {
    const queryTime = Date.now() - startTime;
    console.error('Error fetching community members:', {
      error: error.message,
      queryTime: `${queryTime}ms`,
      communityId: params.communityId
    });

    return NextResponse.json(
      {
        code: 'FETCH_ERROR',
        message: 'Failed to fetch community members',
        statusCode: 500,
        timestamp: new Date().toISOString(),
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

// POST /api/communities/[communityId]/members - Add member to community
export async function POST(
  request: NextRequest,
  { params }: { params: { communityId: string } }
) {
  try {
    const { communityId } = params;
    
    // Validate session
    const sessionValidation = await validateUserSession();
    if (!sessionValidation.isValid) {
      return NextResponse.json(sessionValidation.error, { status: sessionValidation.error!.statusCode });
    }

    const session = sessionValidation.session;

    // Check permissions
    const permissionCheck = await checkMemberManagementPermission(communityId, session.user.id);
    if (!permissionCheck.hasPermission) {
      return NextResponse.json(
        {
          code: 'PERMISSION_DENIED',
          message: permissionCheck.error,
          statusCode: 403,
          timestamp: new Date().toISOString(),
        },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { userId, role = 'member', inviteMessage } = body;

    if (!userId) {
      return NextResponse.json(
        {
          code: 'MISSING_USER_ID',
          message: 'User ID is required',
          statusCode: 400,
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await apiClient.fetch(
      `*[_type == "userProfile" && userId == $userId][0]{ _id }`,
      { userId }
    );

    if (!user) {
      return NextResponse.json(
        {
          code: 'USER_NOT_FOUND',
          message: 'User not found',
          statusCode: 404,
          timestamp: new Date().toISOString(),
        },
        { status: 404 }
      );
    }

    // Check if already a member
    const existingMembership = await apiClient.fetch(
      `*[_type == "communityMember" && community._ref == $communityId && user._ref == $userRef][0]`,
      { communityId, userRef: user._id }
    );

    if (existingMembership) {
      return NextResponse.json(
        {
          code: 'ALREADY_MEMBER',
          message: 'User is already a member of this community',
          statusCode: 409,
          timestamp: new Date().toISOString(),
        },
        { status: 409 }
      );
    }

    // Create membership
    const membershipData = {
      _type: 'communityMember',
      community: {
        _type: 'reference',
        _ref: communityId,
      },
      user: {
        _type: 'reference',
        _ref: user._id,
      },
      role,
      permissions: ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.member,
      status: 'active',
      invitedBy: {
        _type: 'reference',
        _ref: session.user.id,
      },
      inviteMessage,
      joinedAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      postCount: 0,
      commentCount: 0,
      updatedAt: new Date().toISOString(),
    };

    const membership = await writeClient.create(membershipData);

    // Update community member count
    await writeClient
      .patch(communityId)
      .inc({ memberCount: 1 })
      .commit();

    return NextResponse.json({
      ...membership,
      message: 'Member added successfully',
    }, { status: 201 });

  } catch (error) {
    console.error('Error adding community member:', error);
    return NextResponse.json(
      {
        code: 'ADD_MEMBER_ERROR',
        message: 'Failed to add member to community',
        statusCode: 500,
        timestamp: new Date().toISOString(),
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
