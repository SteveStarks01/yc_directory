import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { client } from "@/sanity/lib/client";
import { writeClient } from "@/sanity/lib/write-client";
import { Role, hasPermission, Permission } from "@/lib/permissions";
import { AIMatchingEngine, StartupData, InvestorData } from "@/lib/ai-matching";
import { 
  STARTUP_MATCHING_SCORES_QUERY,
  INVESTOR_MATCHING_SCORES_QUERY,
  MATCHING_ANALYTICS_QUERY
} from "@/sanity/lib/analyticsQueries";

// GET /api/ai-matching - Get matching scores
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const { searchParams } = new URL(request.url);
    
    const startupId = searchParams.get('startupId');
    const investorId = searchParams.get('investorId');
    const analytics = searchParams.get('analytics') === 'true';

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Handle analytics request
    if (analytics) {
      if (!hasPermission(session.user.role || Role.USER, Permission.VIEW_ANALYTICS)) {
        return NextResponse.json(
          { error: 'Insufficient permissions to view matching analytics' },
          { status: 403 }
        );
      }

      const analyticsData = await client.fetch(MATCHING_ANALYTICS_QUERY);
      return NextResponse.json({ analytics: analyticsData });
    }

    // Handle startup matching scores
    if (startupId) {
      // Check if user can view startup matching scores
      const startup = await client.fetch(
        `*[_type == "startup" && _id == $startupId][0] {
          _id,
          founders[]->{
            userId
          }
        }`,
        { startupId }
      );

      if (!startup) {
        return NextResponse.json(
          { error: 'Startup not found' },
          { status: 404 }
        );
      }

      const isFounder = startup.founders?.some((founder: any) => founder.userId === session.id);
      const canViewAny = session.user.role && hasPermission(session.user.role, Permission.VIEW_ANALYTICS);

      if (!isFounder && !canViewAny) {
        return NextResponse.json(
          { error: 'Insufficient permissions to view startup matching scores' },
          { status: 403 }
        );
      }

      const matchingScores = await client.fetch(STARTUP_MATCHING_SCORES_QUERY, { startupId });
      return NextResponse.json({ startup: startupId, matches: matchingScores });
    }

    // Handle investor matching scores
    if (investorId) {
      // Check if user can view investor matching scores
      const investorProfile = await client.fetch(
        `*[_type == "investorProfile" && _id == $investorId][0] {
          _id,
          user->{
            userId
          }
        }`,
        { investorId }
      );

      if (!investorProfile) {
        return NextResponse.json(
          { error: 'Investor profile not found' },
          { status: 404 }
        );
      }

      const isInvestor = investorProfile.user?.userId === session.id;
      const canViewAny = session.user.role && hasPermission(session.user.role, Permission.VIEW_ANALYTICS);

      if (!isInvestor && !canViewAny) {
        return NextResponse.json(
          { error: 'Insufficient permissions to view investor matching scores' },
          { status: 403 }
        );
      }

      const matchingScores = await client.fetch(INVESTOR_MATCHING_SCORES_QUERY, { investorId });
      return NextResponse.json({ investor: investorId, matches: matchingScores });
    }

    return NextResponse.json(
      { error: 'Missing required parameter: startupId, investorId, or analytics=true' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error fetching matching scores:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/ai-matching - Generate new matching scores
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
    const { startupId, investorId, forceRecalculate = false } = body;

    if (!startupId || !investorId) {
      return NextResponse.json(
        { error: 'Missing required fields: startupId, investorId' },
        { status: 400 }
      );
    }

    // Check if user can generate matching scores
    const userRole = session.user.role || Role.USER;
    if (!hasPermission(userRole, Permission.VIEW_ANALYTICS)) {
      return NextResponse.json(
        { error: 'Insufficient permissions to generate matching scores' },
        { status: 403 }
      );
    }

    // Check if matching score already exists and is recent
    if (!forceRecalculate) {
      const existingScore = await client.fetch(
        `*[_type == "matchingScore" && startup._ref == $startupId && investor._ref == $investorId && createdAt > dateTime(now()) - 60*60*24*7][0]`,
        { startupId, investorId }
      );

      if (existingScore) {
        return NextResponse.json({
          message: 'Recent matching score found',
          matchingScore: existingScore,
          fromCache: true,
        });
      }
    }

    // Fetch startup data
    const startupData = await client.fetch(
      `*[_type == "startup" && _id == $startupId][0] {
        _id,
        name,
        industry,
        stage,
        totalFunding,
        valuation,
        location,
        teamSize,
        foundedYear,
        revenue,
        growthRate,
        businessModel,
        targetMarket,
        traction,
        founders[]->{
          experience,
          previousExits,
          education,
          expertise
        },
        technology,
        competitors,
        riskFactors,
        strengths
      }`,
      { startupId }
    );

    // Fetch investor data
    const investorData = await client.fetch(
      `*[_type == "investorProfile" && _id == $investorId][0] {
        _id,
        investorType,
        investmentStages,
        preferredIndustries,
        geographicFocus,
        minInvestmentAmount,
        maxInvestmentAmount,
        typicalCheckSize,
        leadInvestments,
        followOnInvestments,
        valueAdd,
        portfolioSize,
        investmentsPerYear,
        investmentPhilosophy,
        notableInvestments
      }`,
      { investorId }
    );

    if (!startupData || !investorData) {
      return NextResponse.json(
        { error: 'Startup or investor not found' },
        { status: 404 }
      );
    }

    // Generate matching score using AI engine
    const matchingEngine = new AIMatchingEngine();
    const matchingResult = matchingEngine.calculateMatch(
      startupData as StartupData,
      investorData as InvestorData
    );

    // Save matching score to database
    const matchingScoreData = {
      _type: 'matchingScore',
      startup: {
        _type: 'reference',
        _ref: startupId,
      },
      investor: {
        _type: 'reference',
        _ref: investorId,
      },
      matchType: 'investment',
      overallScore: matchingResult.overallScore,
      confidence: matchingResult.confidence,
      scoreBreakdown: matchingResult.scoreBreakdown,
      successProbability: matchingResult.successProbability,
      expectedOutcome: matchingResult.expectedOutcome,
      recommendedAction: matchingResult.recommendedAction,
      modelVersion: '1.0.0',
      algorithmType: 'rule-based',
      features: [
        'stage', 'industry', 'geography', 'checkSize', 'team', 
        'traction', 'valueAdd', 'network', 'timing', 'risk'
      ],
      status: 'active',
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
      lastUpdated: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const savedScore = await writeClient.create(matchingScoreData);

    return NextResponse.json({
      message: 'Matching score generated successfully',
      matchingScore: savedScore,
      reasoning: matchingResult.reasoning,
      fromCache: false,
    }, { status: 201 });
  } catch (error) {
    console.error('Error generating matching score:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/ai-matching - Update matching score with feedback
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
    const { matchingScoreId, userFeedback, actualOutcome, feedbackNotes } = body;

    if (!matchingScoreId) {
      return NextResponse.json(
        { error: 'Missing required field: matchingScoreId' },
        { status: 400 }
      );
    }

    // Get existing matching score
    const existingScore = await client.fetch(
      `*[_type == "matchingScore" && _id == $matchingScoreId][0] {
        _id,
        startup->{
          founders[]->{
            userId
          }
        },
        investor->{
          user->{
            userId
          }
        }
      }`,
      { matchingScoreId }
    );

    if (!existingScore) {
      return NextResponse.json(
        { error: 'Matching score not found' },
        { status: 404 }
      );
    }

    // Check permissions - startup founder, investor, or admin can provide feedback
    const isFounder = existingScore.startup?.founders?.some((founder: any) => founder.userId === session.id);
    const isInvestor = existingScore.investor?.user?.userId === session.id;
    const canEditAny = session.user.role && hasPermission(session.user.role, Permission.ADMIN_SYSTEM);

    if (!isFounder && !isInvestor && !canEditAny) {
      return NextResponse.json(
        { error: 'Insufficient permissions to provide feedback on this matching score' },
        { status: 403 }
      );
    }

    // Prepare update data
    const updateData: any = {
      updatedAt: new Date().toISOString(),
    };

    if (userFeedback) {
      if (isFounder) {
        updateData['userFeedback.startupFeedback'] = userFeedback;
      } else if (isInvestor) {
        updateData['userFeedback.investorFeedback'] = userFeedback;
      }
    }

    if (actualOutcome) {
      updateData.actualOutcome = actualOutcome;
    }

    if (feedbackNotes) {
      updateData['userFeedback.feedbackNotes'] = feedbackNotes;
    }

    // Update matching score
    const updatedScore = await writeClient
      .patch(matchingScoreId)
      .set(updateData)
      .commit();

    return NextResponse.json({
      message: 'Matching score updated with feedback',
      matchingScore: updatedScore,
    });
  } catch (error) {
    console.error('Error updating matching score:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/ai-matching - Delete matching score (admin only)
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    const { searchParams } = new URL(request.url);
    const matchingScoreId = searchParams.get('matchingScoreId');
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!matchingScoreId) {
      return NextResponse.json(
        { error: 'Missing required parameter: matchingScoreId' },
        { status: 400 }
      );
    }

    // Check admin permissions
    if (!hasPermission(session.user.role || Role.USER, Permission.ADMIN_SYSTEM)) {
      return NextResponse.json(
        { error: 'Admin permissions required to delete matching scores' },
        { status: 403 }
      );
    }

    // Delete the matching score
    await writeClient.delete(matchingScoreId);

    return NextResponse.json(
      { message: 'Matching score deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting matching score:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
