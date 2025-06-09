import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { client } from "@/sanity/lib/client";
import { writeClient } from "@/sanity/lib/write-client";
import { Role, hasPermission, Permission } from "@/lib/permissions";
import { USER_CONNECTION_REQUESTS_QUERY } from "@/sanity/lib/investorQueries";

// GET /api/connection-requests - Get connection requests for a user
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const { searchParams } = new URL(request.url);
    
    const userId = searchParams.get('userId');

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user can view these connection requests
    if (userId && userId !== session.id && !hasPermission(session.user.role || Role.USER, Permission.VIEW_ANALYTICS)) {
      return NextResponse.json(
        { error: 'Insufficient permissions to view connection requests' },
        { status: 403 }
      );
    }

    const targetUserId = userId || session.id;

    // Get user profile ID
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

    const requests = await client.fetch(USER_CONNECTION_REQUESTS_QUERY, { userId: userProfile });

    return NextResponse.json({ requests });
  } catch (error) {
    console.error('Error fetching connection requests:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/connection-requests - Create connection request
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user can create connection requests
    const userRole = session.user.role || Role.USER;
    if (!hasPermission(userRole, Permission.CREATE_CONNECTION_REQUEST)) {
      return NextResponse.json(
        { error: 'Insufficient permissions to create connection requests' },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Get requester profile
    const requesterProfile = await client.fetch(
      `*[_type == "userProfile" && userId == $userId][0]`,
      { userId: session.id }
    );

    if (!requesterProfile) {
      return NextResponse.json(
        { error: 'Requester profile not found' },
        { status: 404 }
      );
    }

    // Validate required fields
    if (!body.recipient || !body.connectionType || !body.subject || !body.message) {
      return NextResponse.json(
        { error: 'Missing required fields: recipient, connectionType, subject, message' },
        { status: 400 }
      );
    }

    // Check if connection request already exists
    const existingRequest = await client.fetch(
      `*[_type == "connectionRequest" && requester._ref == $requesterId && recipient._ref == $recipientId && status == "pending"][0]`,
      { requesterId: requesterProfile._id, recipientId: body.recipient }
    );

    if (existingRequest) {
      return NextResponse.json(
        { error: 'A pending connection request already exists with this user' },
        { status: 400 }
      );
    }

    // Create connection request data
    const requestData = {
      _type: 'connectionRequest',
      requester: {
        _type: 'reference',
        _ref: requesterProfile._id,
      },
      recipient: {
        _type: 'reference',
        _ref: body.recipient,
      },
      connectionType: body.connectionType,
      relatedStartup: body.relatedStartup ? {
        _type: 'reference',
        _ref: body.relatedStartup,
      } : null,
      relatedPitch: body.relatedPitch ? {
        _type: 'reference',
        _ref: body.relatedPitch,
      } : null,
      relatedEvent: body.relatedEvent ? {
        _type: 'reference',
        _ref: body.relatedEvent,
      } : null,
      subject: body.subject,
      message: body.message,
      proposedMeetingType: body.proposedMeetingType || 'video-call',
      urgency: body.urgency || 'medium',
      investmentDetails: body.investmentDetails || null,
      status: 'pending',
      meetingScheduled: false,
      followUpRequired: false,
      source: body.source || 'platform',
      referredBy: body.referredBy ? {
        _type: 'reference',
        _ref: body.referredBy,
      } : null,
      allowPublicVisibility: body.allowPublicVisibility || false,
      notificationsEnabled: body.notificationsEnabled !== false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
    };

    // Create connection request
    const connectionRequest = await writeClient.create(requestData);

    return NextResponse.json(connectionRequest, { status: 201 });
  } catch (error) {
    console.error('Error creating connection request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/connection-requests - Update connection request (respond to request)
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
    const { requestId, status, responseMessage, meetingDate, meetingLink } = body;

    if (!requestId || !status) {
      return NextResponse.json(
        { error: 'Missing required fields: requestId, status' },
        { status: 400 }
      );
    }

    // Get existing request
    const existingRequest = await client.fetch(
      `*[_type == "connectionRequest" && _id == $requestId][0] {
        _id,
        status,
        recipient->{
          userId
        }
      }`,
      { requestId }
    );

    if (!existingRequest) {
      return NextResponse.json(
        { error: 'Connection request not found' },
        { status: 404 }
      );
    }

    // Check permissions - recipient or admin can respond
    const isRecipient = existingRequest.recipient?.userId === session.id;
    const canRespondToAny = session.user.role && hasPermission(session.user.role, Permission.ADMIN_SYSTEM);

    if (!isRecipient && !canRespondToAny) {
      return NextResponse.json(
        { error: 'Insufficient permissions to respond to this connection request' },
        { status: 403 }
      );
    }

    // Validate status
    if (!['accepted', 'declined'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be "accepted" or "declined"' },
        { status: 400 }
      );
    }

    // Update connection request
    const updateData: any = {
      status,
      responseDate: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (responseMessage) {
      updateData.responseMessage = responseMessage;
    }

    if (status === 'accepted' && meetingDate) {
      updateData.meetingScheduled = true;
      updateData.meetingDate = meetingDate;
      if (meetingLink) {
        updateData.meetingLink = meetingLink;
      }
    }

    const updatedRequest = await writeClient
      .patch(requestId)
      .set(updateData)
      .commit();

    return NextResponse.json(updatedRequest);
  } catch (error) {
    console.error('Error updating connection request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/connection-requests - Delete/withdraw connection request
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    const { searchParams } = new URL(request.url);
    const requestId = searchParams.get('requestId');
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!requestId) {
      return NextResponse.json(
        { error: 'Missing required parameter: requestId' },
        { status: 400 }
      );
    }

    // Get existing request
    const existingRequest = await client.fetch(
      `*[_type == "connectionRequest" && _id == $requestId][0] {
        _id,
        status,
        requester->{
          userId
        }
      }`,
      { requestId }
    );

    if (!existingRequest) {
      return NextResponse.json(
        { error: 'Connection request not found' },
        { status: 404 }
      );
    }

    // Check permissions - requester or admin can delete
    const isRequester = existingRequest.requester?.userId === session.id;
    const canDeleteAny = session.user.role && hasPermission(session.user.role, Permission.ADMIN_SYSTEM);

    if (!isRequester && !canDeleteAny) {
      return NextResponse.json(
        { error: 'Insufficient permissions to delete this connection request' },
        { status: 403 }
      );
    }

    // Update status to withdrawn instead of deleting
    const updatedRequest = await writeClient
      .patch(requestId)
      .set({ 
        status: 'withdrawn',
        updatedAt: new Date().toISOString()
      })
      .commit();

    return NextResponse.json(
      { message: 'Connection request withdrawn successfully', request: updatedRequest },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting connection request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
