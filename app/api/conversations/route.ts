import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { client } from "@/sanity/lib/client";
import { writeClient } from "@/sanity/lib/write-client";
import { Role, hasPermission, Permission } from "@/lib/permissions";

// GET /api/conversations - Get user's conversations
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const { searchParams } = new URL(request.url);
    
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const status = searchParams.get('status') || 'active';

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user profile
    const userProfile = await client.fetch(
      `*[_type == "userProfile" && userId == $userId][0]._id`,
      { userId: session.id }
    );

    if (!userProfile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }

    // Get conversations where user is a participant
    const conversations = await client.fetch(
      `*[_type == "conversation" && $userProfile in participants[].user._ref && status == $status] | order(lastActivity desc) [$offset...$limit] {
        _id,
        conversationType,
        title,
        description,
        isPrivate,
        status,
        messageCount,
        lastActivity,
        createdAt,
        participants[]{
          user->{
            _id,
            userId,
            role,
            profileImage,
            company
          },
          role,
          joinedAt,
          lastReadAt,
          notificationsEnabled
        },
        lastMessage->{
          _id,
          content,
          messageType,
          sentAt,
          sender->{
            userId
          }
        },
        relatedStartup->{
          _id,
          name,
          logo
        },
        relatedEvent->{
          _id,
          title
        },
        relatedInvestor->{
          _id,
          firmName,
          user->{
            userId
          }
        }
      }`,
      { userProfile, status, offset, limit: offset + limit }
    );

    // Calculate unread message counts for each conversation
    const conversationsWithUnread = await Promise.all(
      conversations.map(async (conversation: any) => {
        const userParticipant = conversation.participants?.find(
          (p: any) => p.user?._id === userProfile
        );
        
        const lastReadAt = userParticipant?.lastReadAt || conversation.createdAt;
        
        const unreadCount = await client.fetch(
          `count(*[_type == "message" && conversation._ref == $conversationId && sentAt > $lastReadAt && sender._ref != $userProfile])`,
          { 
            conversationId: conversation._id, 
            lastReadAt,
            userProfile 
          }
        );

        return {
          ...conversation,
          unreadCount,
        };
      })
    );

    return NextResponse.json({
      conversations: conversationsWithUnread,
      pagination: {
        limit,
        offset,
        total: conversations.length,
        hasMore: conversations.length === limit,
      },
    });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/conversations - Create a new conversation
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
    if (!body.participants || body.participants.length < 1) {
      return NextResponse.json(
        { error: 'At least one other participant is required' },
        { status: 400 }
      );
    }

    // Check if direct conversation already exists (for direct messages)
    if (body.conversationType === 'direct' && body.participants.length === 1) {
      const otherParticipant = body.participants[0];
      
      const existingConversation = await client.fetch(
        `*[_type == "conversation" && conversationType == "direct" && count(participants) == 2 && $userProfile in participants[].user._ref && $otherParticipant in participants[].user._ref][0]._id`,
        { userProfile: userProfile._id, otherParticipant }
      );

      if (existingConversation) {
        return NextResponse.json(
          { 
            message: 'Conversation already exists',
            conversationId: existingConversation,
            existing: true
          },
          { status: 200 }
        );
      }
    }

    // Prepare participants array
    const participants = [
      {
        user: { _type: 'reference', _ref: userProfile._id },
        role: 'owner',
        joinedAt: new Date().toISOString(),
        notificationsEnabled: true,
      },
      ...body.participants.map((participantId: string) => ({
        user: { _type: 'reference', _ref: participantId },
        role: 'member',
        joinedAt: new Date().toISOString(),
        notificationsEnabled: true,
      })),
    ];

    // Create conversation data
    const conversationData = {
      _type: 'conversation',
      conversationType: body.conversationType || 'direct',
      title: body.title,
      description: body.description,
      participants,
      isPrivate: body.isPrivate !== false,
      allowInvites: body.allowInvites || false,
      maxParticipants: body.maxParticipants,
      relatedStartup: body.relatedStartup ? {
        _type: 'reference',
        _ref: body.relatedStartup,
      } : null,
      relatedEvent: body.relatedEvent ? {
        _type: 'reference',
        _ref: body.relatedEvent,
      } : null,
      relatedInvestor: body.relatedInvestor ? {
        _type: 'reference',
        _ref: body.relatedInvestor,
      } : null,
      relatedConnectionRequest: body.relatedConnectionRequest ? {
        _type: 'reference',
        _ref: body.relatedConnectionRequest,
      } : null,
      status: 'active',
      priority: body.priority || 'normal',
      messageCount: 0,
      lastActivity: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Create conversation
    const conversation = await writeClient.create(conversationData);

    // Get the created conversation with populated references
    const createdConversation = await client.fetch(
      `*[_type == "conversation" && _id == $conversationId][0] {
        _id,
        conversationType,
        title,
        description,
        isPrivate,
        status,
        messageCount,
        lastActivity,
        createdAt,
        participants[]{
          user->{
            _id,
            userId,
            role,
            profileImage,
            company
          },
          role,
          joinedAt,
          notificationsEnabled
        },
        relatedStartup->{
          _id,
          name,
          logo
        },
        relatedEvent->{
          _id,
          title
        },
        relatedInvestor->{
          _id,
          firmName,
          user->{
            userId
          }
        }
      }`,
      { conversationId: conversation._id }
    );

    return NextResponse.json(createdConversation, { status: 201 });
  } catch (error) {
    console.error('Error creating conversation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/conversations - Update conversation settings
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
    const { conversationId, ...updates } = body;

    if (!conversationId) {
      return NextResponse.json(
        { error: 'Missing required field: conversationId' },
        { status: 400 }
      );
    }

    // Get user profile
    const userProfile = await client.fetch(
      `*[_type == "userProfile" && userId == $userId][0]._id`,
      { userId: session.id }
    );

    // Get existing conversation
    const existingConversation = await client.fetch(
      `*[_type == "conversation" && _id == $conversationId][0] {
        _id,
        participants[]{
          user->{
            _id,
            userId
          },
          role
        }
      }`,
      { conversationId }
    );

    if (!existingConversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      );
    }

    // Check permissions - participant with owner/admin role or system admin
    const userParticipant = existingConversation.participants?.find(
      (p: any) => p.user?.userId === session.id
    );
    const canEdit = userParticipant?.role === 'owner' || 
                   userParticipant?.role === 'admin' ||
                   hasPermission(session.user.role || Role.USER, Permission.ADMIN_SYSTEM);

    if (!canEdit) {
      return NextResponse.json(
        { error: 'Insufficient permissions to edit this conversation' },
        { status: 403 }
      );
    }

    // Define allowed fields for updates
    const allowedFields = [
      'title', 'description', 'status', 'priority', 'allowInvites', 
      'maxParticipants', 'isModerated'
    ];

    const updateData: any = { updatedAt: new Date().toISOString() };
    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        updateData[field] = updates[field];
      }
    }

    // Handle participant updates separately
    if (updates.participants) {
      // This would require more complex logic to add/remove participants
      // For now, we'll skip this and handle it in a separate endpoint
    }

    // Update conversation
    const updatedConversation = await writeClient
      .patch(conversationId)
      .set(updateData)
      .commit();

    return NextResponse.json(updatedConversation);
  } catch (error) {
    console.error('Error updating conversation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/conversations - Archive/delete conversation
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversationId');
    const action = searchParams.get('action') || 'archive'; // 'archive' or 'delete'
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!conversationId) {
      return NextResponse.json(
        { error: 'Missing required parameter: conversationId' },
        { status: 400 }
      );
    }

    // Get user profile
    const userProfile = await client.fetch(
      `*[_type == "userProfile" && userId == $userId][0]._id`,
      { userId: session.id }
    );

    // Get existing conversation
    const existingConversation = await client.fetch(
      `*[_type == "conversation" && _id == $conversationId][0] {
        _id,
        participants[]{
          user->{
            _id,
            userId
          },
          role
        }
      }`,
      { conversationId }
    );

    if (!existingConversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      );
    }

    // Check permissions
    const userParticipant = existingConversation.participants?.find(
      (p: any) => p.user?.userId === session.id
    );
    const canDelete = userParticipant?.role === 'owner' ||
                     hasPermission(session.user.role || Role.USER, Permission.ADMIN_SYSTEM);

    if (!canDelete) {
      return NextResponse.json(
        { error: 'Insufficient permissions to delete this conversation' },
        { status: 403 }
      );
    }

    if (action === 'archive') {
      // Archive the conversation
      await writeClient
        .patch(conversationId)
        .set({
          status: 'archived',
          archivedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
        .commit();

      return NextResponse.json(
        { message: 'Conversation archived successfully' },
        { status: 200 }
      );
    } else {
      // Hard delete (admin only)
      if (!hasPermission(session.user.role || Role.USER, Permission.ADMIN_SYSTEM)) {
        return NextResponse.json(
          { error: 'Admin permissions required for permanent deletion' },
          { status: 403 }
        );
      }

      await writeClient.delete(conversationId);

      return NextResponse.json(
        { message: 'Conversation deleted successfully' },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error('Error deleting conversation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
