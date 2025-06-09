import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { createClient } from 'next-sanity';
import { writeClient } from '@/sanity/lib/write-client';
import { apiVersion, dataset, projectId } from '@/sanity/env';

// Create optimized client
const apiClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  perspective: 'published',
  stega: false,
});

// Role permissions mapping
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

// Check member management permissions
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

// GET /api/communities/[communityId]/members/[memberId] - Get specific member
export async function GET(
  request: NextRequest,
  { params }: { params: { communityId: string; memberId: string } }
) {
  try {
    const { communityId, memberId } = params;

    const member = await apiClient.fetch(
      `*[_type == "communityMember" && _id == $memberId && community._ref == $communityId][0]{
        _id,
        role,
        status,
        joinedAt,
        lastActive,
        postCount,
        commentCount,
        permissions,
        invitedBy->{
          _id,
          "name": coalesce(name, "Unknown User")
        },
        inviteMessage,
        moderationNotes,
        user->{
          _id,
          userId,
          "name": coalesce(name, "Unknown User"),
          "image": image,
          role,
          isVerified,
          bio,
          company,
          position
        }
      }`,
      { memberId, communityId }
    );

    if (!member) {
      return NextResponse.json(
        {
          code: 'MEMBER_NOT_FOUND',
          message: 'Member not found in this community',
          statusCode: 404,
          timestamp: new Date().toISOString(),
        },
        { status: 404 }
      );
    }

    return NextResponse.json({ member });

  } catch (error) {
    console.error('Error fetching community member:', error);
    return NextResponse.json(
      {
        code: 'FETCH_ERROR',
        message: 'Failed to fetch community member',
        statusCode: 500,
        timestamp: new Date().toISOString(),
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

// PATCH /api/communities/[communityId]/members/[memberId] - Update member
export async function PATCH(
  request: NextRequest,
  { params }: { params: { communityId: string; memberId: string } }
) {
  try {
    const { communityId, memberId } = params;
    
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
    const { role, status, moderationNote } = body;

    // Get current member
    const currentMember = await apiClient.fetch(
      `*[_type == "communityMember" && _id == $memberId && community._ref == $communityId][0]`,
      { memberId, communityId }
    );

    if (!currentMember) {
      return NextResponse.json(
        {
          code: 'MEMBER_NOT_FOUND',
          message: 'Member not found in this community',
          statusCode: 404,
          timestamp: new Date().toISOString(),
        },
        { status: 404 }
      );
    }

    // Prevent owners from being demoted by non-owners
    if (currentMember.role === 'owner' && permissionCheck.role !== 'owner') {
      return NextResponse.json(
        {
          code: 'CANNOT_MODIFY_OWNER',
          message: 'Only owners can modify other owners',
          statusCode: 403,
          timestamp: new Date().toISOString(),
        },
        { status: 403 }
      );
    }

    // Build update data
    const updateData: any = {
      updatedAt: new Date().toISOString(),
    };

    if (role && role !== currentMember.role) {
      updateData.role = role;
      updateData.permissions = ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.member;
    }

    if (status && status !== currentMember.status) {
      updateData.status = status;
    }

    // Add moderation note if provided
    if (moderationNote) {
      const newNote = {
        note: moderationNote.note,
        moderator: {
          _type: 'reference',
          _ref: session.user.id,
        },
        createdAt: new Date().toISOString(),
        type: moderationNote.type || 'general',
      };

      updateData.moderationNotes = [
        ...(currentMember.moderationNotes || []),
        newNote
      ];
    }

    // Update member
    const updatedMember = await writeClient
      .patch(memberId)
      .set(updateData)
      .commit();

    return NextResponse.json({
      ...updatedMember,
      message: 'Member updated successfully',
    });

  } catch (error) {
    console.error('Error updating community member:', error);
    return NextResponse.json(
      {
        code: 'UPDATE_ERROR',
        message: 'Failed to update community member',
        statusCode: 500,
        timestamp: new Date().toISOString(),
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

// DELETE /api/communities/[communityId]/members/[memberId] - Remove member
export async function DELETE(
  request: NextRequest,
  { params }: { params: { communityId: string; memberId: string } }
) {
  try {
    const { communityId, memberId } = params;
    
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

    // Get current member
    const currentMember = await apiClient.fetch(
      `*[_type == "communityMember" && _id == $memberId && community._ref == $communityId][0]`,
      { memberId, communityId }
    );

    if (!currentMember) {
      return NextResponse.json(
        {
          code: 'MEMBER_NOT_FOUND',
          message: 'Member not found in this community',
          statusCode: 404,
          timestamp: new Date().toISOString(),
        },
        { status: 404 }
      );
    }

    // Prevent owners from being removed by non-owners
    if (currentMember.role === 'owner' && permissionCheck.role !== 'owner') {
      return NextResponse.json(
        {
          code: 'CANNOT_REMOVE_OWNER',
          message: 'Only owners can remove other owners',
          statusCode: 403,
          timestamp: new Date().toISOString(),
        },
        { status: 403 }
      );
    }

    // Remove member (soft delete by updating status)
    await writeClient
      .patch(memberId)
      .set({
        status: 'left',
        updatedAt: new Date().toISOString(),
      })
      .commit();

    // Update community member count
    await writeClient
      .patch(communityId)
      .dec({ memberCount: 1 })
      .commit();

    return NextResponse.json({
      message: 'Member removed successfully',
      memberId,
    });

  } catch (error) {
    console.error('Error removing community member:', error);
    return NextResponse.json(
      {
        code: 'REMOVE_ERROR',
        message: 'Failed to remove community member',
        statusCode: 500,
        timestamp: new Date().toISOString(),
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
