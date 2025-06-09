import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { client } from "@/sanity/lib/client";
import { writeClient } from "@/sanity/lib/write-client";
import { Role, hasPermission, Permission } from "@/lib/permissions";
import { 
  STARTUP_INVESTMENT_INTERESTS_QUERY,
  INVESTOR_INVESTMENT_INTERESTS_QUERY 
} from "@/sanity/lib/investorQueries";

// GET /api/investment-interests - Get investment interests
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const { searchParams } = new URL(request.url);
    
    const startupId = searchParams.get('startupId');
    const investorId = searchParams.get('investorId');
    const userId = searchParams.get('userId');

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    let interests = [];

    if (startupId) {
      // Get investment interests for a startup
      interests = await client.fetch(STARTUP_INVESTMENT_INTERESTS_QUERY, { startupId });
      
      // Check if user can view these interests (startup founder or admin)
      const startup = await client.fetch(
        `*[_type == "startup" && _id == $startupId][0] {
          founders[]->{
            userId
          }
        }`,
        { startupId }
      );

      const isFounder = startup?.founders?.some((founder: any) => founder.userId === session.id);
      const canViewAny = session.user.role && hasPermission(session.user.role, Permission.VIEW_ANALYTICS);

      if (!isFounder && !canViewAny) {
        return NextResponse.json(
          { error: 'Insufficient permissions to view investment interests' },
          { status: 403 }
        );
      }
    } else if (investorId) {
      // Get investment interests for an investor
      const investorProfile = await client.fetch(
        `*[_type == "investorProfile" && _id == $investorId][0] {
          user->{
            userId
          }
        }`,
        { investorId }
      );

      const isInvestor = investorProfile?.user?.userId === session.id;
      const canViewAny = session.user.role && hasPermission(session.user.role, Permission.VIEW_ANALYTICS);

      if (!isInvestor && !canViewAny) {
        return NextResponse.json(
          { error: 'Insufficient permissions to view investment interests' },
          { status: 403 }
        );
      }

      interests = await client.fetch(INVESTOR_INVESTMENT_INTERESTS_QUERY, { investorId });
    } else if (userId) {
      // Get investment interests for a user (their investor profile)
      if (userId !== session.id && !hasPermission(session.user.role || Role.USER, Permission.VIEW_ANALYTICS)) {
        return NextResponse.json(
          { error: 'Insufficient permissions to view investment interests' },
          { status: 403 }
        );
      }

      const investorProfile = await client.fetch(
        `*[_type == "investorProfile" && user->userId == $userId][0]._id`,
        { userId }
      );

      if (investorProfile) {
        interests = await client.fetch(INVESTOR_INVESTMENT_INTERESTS_QUERY, { investorId: investorProfile });
      }
    } else {
      return NextResponse.json(
        { error: 'Missing required parameter: startupId, investorId, or userId' },
        { status: 400 }
      );
    }

    return NextResponse.json({ interests });
  } catch (error) {
    console.error('Error fetching investment interests:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/investment-interests - Create investment interest
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user can create investment interests (must be investor)
    const userRole = session.user.role || Role.USER;
    if (!hasPermission(userRole, Permission.CREATE_INVESTMENT_INTEREST)) {
      return NextResponse.json(
        { error: 'Insufficient permissions to create investment interests' },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Get investor profile for the user
    const investorProfile = await client.fetch(
      `*[_type == "investorProfile" && user->userId == $userId][0]`,
      { userId: session.id }
    );

    if (!investorProfile) {
      return NextResponse.json(
        { error: 'Investor profile not found. Please create an investor profile first.' },
        { status: 404 }
      );
    }

    // Validate required fields
    if (!body.startup || !body.interestLevel || !body.investmentStage) {
      return NextResponse.json(
        { error: 'Missing required fields: startup, interestLevel, investmentStage' },
        { status: 400 }
      );
    }

    // Check if interest already exists
    const existingInterest = await client.fetch(
      `*[_type == "investmentInterest" && investor._ref == $investorId && startup._ref == $startupId][0]`,
      { investorId: investorProfile._id, startupId: body.startup }
    );

    if (existingInterest) {
      return NextResponse.json(
        { error: 'Investment interest already exists for this startup' },
        { status: 400 }
      );
    }

    // Create investment interest data
    const interestData = {
      _type: 'investmentInterest',
      investor: {
        _type: 'reference',
        _ref: investorProfile._id,
      },
      startup: {
        _type: 'reference',
        _ref: body.startup,
      },
      pitch: body.pitch ? {
        _type: 'reference',
        _ref: body.pitch,
      } : null,
      interestLevel: body.interestLevel,
      investmentStage: body.investmentStage,
      potentialInvestmentAmount: body.potentialInvestmentAmount || 0,
      leadInterest: body.leadInterest || false,
      reasonsForInterest: body.reasonsForInterest || [],
      notes: body.notes || '',
      concerns: body.concerns || '',
      dueDiligenceStatus: 'not-started',
      dueDiligenceItems: [],
      meetingRequested: false,
      meetingScheduled: false,
      status: 'interested',
      source: body.source || 'platform',
      referredBy: body.referredBy ? {
        _type: 'reference',
        _ref: body.referredBy,
      } : null,
      visibility: body.visibility || 'private',
      allowStartupContact: body.allowStartupContact !== false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Create investment interest
    const interest = await writeClient.create(interestData);

    // Update investor profile connection stats
    await writeClient
      .patch(investorProfile._id)
      .inc({ connectionsRequested: 1 })
      .set({ updatedAt: new Date().toISOString() })
      .commit();

    return NextResponse.json(interest, { status: 201 });
  } catch (error) {
    console.error('Error creating investment interest:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/investment-interests - Update investment interest
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
    const { interestId, ...updates } = body;

    if (!interestId) {
      return NextResponse.json(
        { error: 'Missing required field: interestId' },
        { status: 400 }
      );
    }

    // Get existing interest
    const existingInterest = await client.fetch(
      `*[_type == "investmentInterest" && _id == $interestId][0] {
        _id,
        investor->{
          user->{
            userId
          }
        }
      }`,
      { interestId }
    );

    if (!existingInterest) {
      return NextResponse.json(
        { error: 'Investment interest not found' },
        { status: 404 }
      );
    }

    // Check permissions - investor or admin can edit
    const isInvestor = existingInterest.investor?.user?.userId === session.id;
    const canEditAny = session.user.role && hasPermission(session.user.role, Permission.ADMIN_SYSTEM);

    if (!isInvestor && !canEditAny) {
      return NextResponse.json(
        { error: 'Insufficient permissions to edit this investment interest' },
        { status: 403 }
      );
    }

    // Define allowed fields
    const allowedFields = [
      'interestLevel', 'investmentStage', 'potentialInvestmentAmount', 'leadInterest',
      'reasonsForInterest', 'notes', 'concerns', 'dueDiligenceStatus', 'dueDiligenceItems',
      'lastContactDate', 'nextFollowUpDate', 'meetingRequested', 'meetingScheduled',
      'meetingDate', 'status', 'decisionReason', 'termSheetSent', 'termSheetDate',
      'investmentDate', 'actualInvestmentAmount', 'visibility', 'allowStartupContact'
    ];

    const updateData: any = {};
    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        updateData[field] = updates[field];
      }
    }

    // Add updated timestamp
    updateData.updatedAt = new Date().toISOString();

    // Update investment interest
    const updatedInterest = await writeClient
      .patch(interestId)
      .set(updateData)
      .commit();

    return NextResponse.json(updatedInterest);
  } catch (error) {
    console.error('Error updating investment interest:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/investment-interests - Delete investment interest
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    const { searchParams } = new URL(request.url);
    const interestId = searchParams.get('interestId');
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!interestId) {
      return NextResponse.json(
        { error: 'Missing required parameter: interestId' },
        { status: 400 }
      );
    }

    // Get existing interest
    const existingInterest = await client.fetch(
      `*[_type == "investmentInterest" && _id == $interestId][0] {
        _id,
        investor->{
          user->{
            userId
          }
        }
      }`,
      { interestId }
    );

    if (!existingInterest) {
      return NextResponse.json(
        { error: 'Investment interest not found' },
        { status: 404 }
      );
    }

    // Check permissions - investor or admin can delete
    const isInvestor = existingInterest.investor?.user?.userId === session.id;
    const canDeleteAny = session.user.role && hasPermission(session.user.role, Permission.ADMIN_SYSTEM);

    if (!isInvestor && !canDeleteAny) {
      return NextResponse.json(
        { error: 'Insufficient permissions to delete this investment interest' },
        { status: 403 }
      );
    }

    // Delete the investment interest
    await writeClient.delete(interestId);

    return NextResponse.json(
      { message: 'Investment interest deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting investment interest:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
