import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { client } from "@/sanity/lib/client";
import { writeClient } from "@/sanity/lib/write-client";
import { Role, hasPermission, Permission } from "@/lib/permissions";

// GET /api/messages - Get messages for a conversation
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const { searchParams } = new URL(request.url);
    
    const conversationId = searchParams.get('conversationId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

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

    if (!userProfile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }

    // Check if user is participant in the conversation
    const conversation = await client.fetch(
      `*[_type == "conversation" && _id == $conversationId][0] {
        _id,
        participants[]{
          user->{
            _id,
            userId
          }
        }
      }`,
      { conversationId }
    );

    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      );
    }

    const isParticipant = conversation.participants?.some(
      (p: any) => p.user?.userId === session.id
    );

    if (!isParticipant && !hasPermission(session.user.role || Role.USER, Permission.ADMIN_SYSTEM)) {
      return NextResponse.json(
        { error: 'Access denied to this conversation' },
        { status: 403 }
      );
    }

    // Get messages
    const messages = await client.fetch(
      `*[_type == "message" && conversation._ref == $conversationId && !isDeleted] | order(sentAt desc) [$offset...$limit] {
        _id,
        messageType,
        content,
        attachments,
        links,
        status,
        priority,
        isEdited,
        editedAt,
        sentiment,
        topics,
        sentAt,
        sender->{
          _id,
          userId,
          role,
          profileImage
        },
        replyTo->{
          _id,
          content,
          sender->{
            userId
          }
        },
        readBy[]{
          user->{
            userId
          },
          readAt
        }
      }`,
      { conversationId, offset, limit: offset + limit }
    );

    // Mark messages as read for current user
    const unreadMessages = messages.filter((msg: any) => 
      !msg.readBy?.some((read: any) => read.user?.userId === session.id)
    );

    if (unreadMessages.length > 0) {
      // Update read status for unread messages
      for (const message of unreadMessages) {
        await writeClient
          .patch(message._id)
          .setIfMissing({ readBy: [] })
          .append('readBy', [{
            user: { _type: 'reference', _ref: userProfile },
            readAt: new Date().toISOString()
          }])
          .commit();
      }
    }

    return NextResponse.json({
      messages,
      pagination: {
        limit,
        offset,
        total: messages.length,
        hasMore: messages.length === limit,
      },
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/messages - Send a new message
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
    if (!body.conversationId || !body.content) {
      return NextResponse.json(
        { error: 'Missing required fields: conversationId, content' },
        { status: 400 }
      );
    }

    // Check if user is participant in the conversation
    const conversation = await client.fetch(
      `*[_type == "conversation" && _id == $conversationId][0] {
        _id,
        participants[]{
          user->{
            userId
          }
        }
      }`,
      { conversationId: body.conversationId }
    );

    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      );
    }

    const isParticipant = conversation.participants?.some(
      (p: any) => p.user?.userId === session.id
    );

    if (!isParticipant) {
      return NextResponse.json(
        { error: 'Access denied to this conversation' },
        { status: 403 }
      );
    }

    // Create message data
    const messageData = {
      _type: 'message',
      conversation: {
        _type: 'reference',
        _ref: body.conversationId,
      },
      sender: {
        _type: 'reference',
        _ref: userProfile._id,
      },
      messageType: body.messageType || 'text',
      content: body.content,
      attachments: body.attachments || [],
      links: body.links || [],
      replyTo: body.replyTo ? {
        _type: 'reference',
        _ref: body.replyTo,
      } : null,
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
      status: 'sent',
      priority: body.priority || 'normal',
      sentAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Create message
    const message = await writeClient.create(messageData);

    // Update conversation with last message and activity
    await writeClient
      .patch(body.conversationId)
      .set({
        lastMessage: { _type: 'reference', _ref: message._id },
        lastActivity: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .inc({ messageCount: 1 })
      .commit();

    // Get the created message with populated references
    const createdMessage = await client.fetch(
      `*[_type == "message" && _id == $messageId][0] {
        _id,
        messageType,
        content,
        attachments,
        links,
        status,
        priority,
        sentAt,
        sender->{
          _id,
          userId,
          role,
          profileImage
        },
        replyTo->{
          _id,
          content,
          sender->{
            userId
          }
        }
      }`,
      { messageId: message._id }
    );

    return NextResponse.json(createdMessage, { status: 201 });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/messages - Update a message (edit)
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
    const { messageId, content } = body;

    if (!messageId || !content) {
      return NextResponse.json(
        { error: 'Missing required fields: messageId, content' },
        { status: 400 }
      );
    }

    // Get existing message
    const existingMessage = await client.fetch(
      `*[_type == "message" && _id == $messageId][0] {
        _id,
        sender->{
          userId
        },
        sentAt
      }`,
      { messageId }
    );

    if (!existingMessage) {
      return NextResponse.json(
        { error: 'Message not found' },
        { status: 404 }
      );
    }

    // Check if user is the sender or admin
    const isSender = existingMessage.sender?.userId === session.id;
    const canEditAny = session.user.role && hasPermission(session.user.role, Permission.ADMIN_SYSTEM);

    if (!isSender && !canEditAny) {
      return NextResponse.json(
        { error: 'Insufficient permissions to edit this message' },
        { status: 403 }
      );
    }

    // Check if message is too old to edit (24 hours)
    const sentAt = new Date(existingMessage.sentAt);
    const now = new Date();
    const hoursSinceSent = (now.getTime() - sentAt.getTime()) / (1000 * 60 * 60);

    if (hoursSinceSent > 24 && !canEditAny) {
      return NextResponse.json(
        { error: 'Message is too old to edit' },
        { status: 400 }
      );
    }

    // Update message
    const updatedMessage = await writeClient
      .patch(messageId)
      .set({
        content,
        isEdited: true,
        editedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .commit();

    return NextResponse.json(updatedMessage);
  } catch (error) {
    console.error('Error updating message:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/messages - Delete a message
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    const { searchParams } = new URL(request.url);
    const messageId = searchParams.get('messageId');
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!messageId) {
      return NextResponse.json(
        { error: 'Missing required parameter: messageId' },
        { status: 400 }
      );
    }

    // Get existing message
    const existingMessage = await client.fetch(
      `*[_type == "message" && _id == $messageId][0] {
        _id,
        sender->{
          userId
        }
      }`,
      { messageId }
    );

    if (!existingMessage) {
      return NextResponse.json(
        { error: 'Message not found' },
        { status: 404 }
      );
    }

    // Check permissions - sender or admin can delete
    const isSender = existingMessage.sender?.userId === session.id;
    const canDeleteAny = session.user.role && hasPermission(session.user.role, Permission.ADMIN_SYSTEM);

    if (!isSender && !canDeleteAny) {
      return NextResponse.json(
        { error: 'Insufficient permissions to delete this message' },
        { status: 403 }
      );
    }

    // Soft delete the message
    const updatedMessage = await writeClient
      .patch(messageId)
      .set({
        isDeleted: true,
        deletedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .commit();

    return NextResponse.json(
      { message: 'Message deleted successfully', messageId },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting message:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
