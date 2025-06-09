import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { client } from "@/sanity/lib/client";
import { writeClient } from "@/sanity/lib/write-client";
import { Role, hasPermission, Permission } from "@/lib/permissions";

// GET /api/community-votes - Get community votes
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const { searchParams } = new URL(request.url);
    
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const voteType = searchParams.get('voteType');
    const category = searchParams.get('category');
    const targetType = searchParams.get('targetType');
    const targetId = searchParams.get('targetId');
    const userId = searchParams.get('userId');
    const aggregated = searchParams.get('aggregated') === 'true';

    // Build query filters
    let filters = ['status == "active"'];
    
    if (voteType) {
      filters.push(`voteType == "${voteType}"`);
    }
    
    if (category) {
      filters.push(`category == "${category}"`);
    }
    
    if (targetType) {
      filters.push(`targetType == "${targetType}"`);
    }
    
    if (targetId) {
      filters.push(`target${targetType.charAt(0).toUpperCase() + targetType.slice(1)}._ref == "${targetId}"`);
    }
    
    if (userId) {
      const userProfile = await client.fetch(
        `*[_type == "userProfile" && userId == $userId][0]._id`,
        { userId }
      );
      if (userProfile) {
        filters.push(`voter._ref == "${userProfile}"`);
      }
    }

    const filterString = filters.length > 0 ? ` && ${filters.join(' && ')}` : '';

    if (aggregated) {
      // Return aggregated vote results
      const aggregatedResults = await client.fetch(
        `*[_type == "communityVote"${filterString}] {
          voteType,
          targetType,
          targetStartup,
          targetFounder,
          targetPitch,
          targetEvent,
          targetResource,
          targetInvestor,
          voteValue,
          maxVoteValue,
          weight
        } | {
          "voteType": voteType,
          "targetType": targetType,
          "targetId": coalesce(targetStartup._ref, targetFounder._ref, targetPitch._ref, targetEvent._ref, targetResource._ref, targetInvestor._ref),
          "totalVotes": count(*[voteType == ^.voteType && targetType == ^.targetType]),
          "averageRating": math::avg(*[voteType == ^.voteType && targetType == ^.targetType].voteValue),
          "weightedAverage": sum(*[voteType == ^.voteType && targetType == ^.targetType].(voteValue * weight)) / sum(*[voteType == ^.voteType && targetType == ^.targetType].weight),
          "ratingDistribution": {
            "1": count(*[voteType == ^.voteType && targetType == ^.targetType && voteValue == 1]),
            "2": count(*[voteType == ^.voteType && targetType == ^.targetType && voteValue == 2]),
            "3": count(*[voteType == ^.voteType && targetType == ^.targetType && voteValue == 3]),
            "4": count(*[voteType == ^.voteType && targetType == ^.targetType && voteValue == 4]),
            "5": count(*[voteType == ^.voteType && targetType == ^.targetType && voteValue == 5])
          }
        } | order(weightedAverage desc) [0...20]`
      );

      return NextResponse.json({ aggregatedResults });
    } else {
      // Return individual votes
      const votes = await client.fetch(
        `*[_type == "communityVote"${filterString}] | order(votedAt desc) [$offset...$limit] {
          _id,
          voteType,
          category,
          targetType,
          voteValue,
          maxVoteValue,
          comment,
          criteria,
          weight,
          confidence,
          status,
          votedAt,
          voter->{
            _id,
            userId,
            role,
            profileImage
          },
          targetStartup->{
            _id,
            name,
            logo,
            industry,
            stage
          },
          targetFounder->{
            _id,
            userId,
            role,
            profileImage,
            company
          },
          targetPitch->{
            _id,
            title,
            startup->{
              name
            }
          },
          targetEvent->{
            _id,
            title,
            eventType
          },
          targetResource->{
            _id,
            title,
            resourceType
          },
          targetInvestor->{
            _id,
            firmName,
            user->{
              userId
            }
          }
        }`,
        { offset, limit: offset + limit }
      );

      // Get total count for pagination
      const total = await client.fetch(
        `count(*[_type == "communityVote"${filterString}])`
      );

      return NextResponse.json({
        votes,
        pagination: {
          limit,
          offset,
          total,
          hasMore: offset + votes.length < total,
        },
      });
    }
  } catch (error) {
    console.error('Error fetching community votes:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/community-votes - Submit a community vote
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
    if (!body.voteType || !body.category || !body.targetType || !body.voteValue) {
      return NextResponse.json(
        { error: 'Missing required fields: voteType, category, targetType, voteValue' },
        { status: 400 }
      );
    }

    // Validate target reference
    const targetField = `target${body.targetType.charAt(0).toUpperCase() + body.targetType.slice(1)}`;
    if (!body[targetField]) {
      return NextResponse.json(
        { error: `Missing target reference: ${targetField}` },
        { status: 400 }
      );
    }

    // Check if user has already voted for this target with this vote type
    const existingVote = await client.fetch(
      `*[_type == "communityVote" && voter._ref == $voterId && voteType == $voteType && targetType == $targetType && ${targetField}._ref == $targetId][0]`,
      { 
        voterId: userProfile._id, 
        voteType: body.voteType, 
        targetType: body.targetType,
        targetId: body[targetField]
      }
    );

    if (existingVote) {
      return NextResponse.json(
        { error: 'You have already voted for this item with this vote type' },
        { status: 400 }
      );
    }

    // Check voter eligibility
    const voterEligibility = body.voterEligibility || {
      requiredRole: 'user',
      minimumReputation: 0,
      requiresVerification: false,
    };

    // Validate user role
    const userRole = session.user.role || Role.USER;
    if (voterEligibility.requiredRole !== 'user') {
      const roleHierarchy = {
        'user': 0,
        'verified': 1,
        'founder': 2,
        'investor': 3,
        'mentor': 4,
        'alumni': 5,
      };
      
      const requiredLevel = roleHierarchy[voterEligibility.requiredRole] || 0;
      const userLevel = roleHierarchy[userRole] || 0;
      
      if (userLevel < requiredLevel) {
        return NextResponse.json(
          { error: `Insufficient role. Required: ${voterEligibility.requiredRole}` },
          { status: 403 }
        );
      }
    }

    // Calculate vote weight based on user role and reputation
    let voteWeight = 1;
    const roleWeights = {
      [Role.USER]: 1,
      [Role.FOUNDER]: 1.2,
      [Role.INVESTOR]: 1.5,
      [Role.MENTOR]: 1.3,
      [Role.ADMIN]: 2,
    };
    voteWeight = roleWeights[userRole] || 1;

    // Create vote data
    const voteData = {
      _type: 'communityVote',
      voter: {
        _type: 'reference',
        _ref: userProfile._id,
      },
      voteType: body.voteType,
      category: body.category,
      targetType: body.targetType,
      [targetField]: {
        _type: 'reference',
        _ref: body[targetField],
      },
      voteValue: body.voteValue,
      maxVoteValue: body.maxVoteValue || 5,
      comment: body.comment,
      criteria: body.criteria || [],
      votingPeriod: body.votingPeriod,
      relatedEvent: body.relatedEvent ? {
        _type: 'reference',
        _ref: body.relatedEvent,
      } : null,
      isPublic: body.isPublic !== false,
      voterEligibility,
      isVerified: false, // Will be verified by moderators if needed
      weight: voteWeight,
      influence: userProfile.reputationScore || 0,
      confidence: 0.8, // Default confidence, can be adjusted by AI
      status: 'active',
      votedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Create vote
    const vote = await writeClient.create(voteData);

    // Get the created vote with populated references
    const createdVote = await client.fetch(
      `*[_type == "communityVote" && _id == $voteId][0] {
        _id,
        voteType,
        category,
        targetType,
        voteValue,
        maxVoteValue,
        comment,
        criteria,
        weight,
        confidence,
        status,
        votedAt,
        voter->{
          _id,
          userId,
          role,
          profileImage
        }
      }`,
      { voteId: vote._id }
    );

    return NextResponse.json(createdVote, { status: 201 });
  } catch (error) {
    console.error('Error creating community vote:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/community-votes - Update a vote (edit or moderate)
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
    const { voteId, ...updates } = body;

    if (!voteId) {
      return NextResponse.json(
        { error: 'Missing required field: voteId' },
        { status: 400 }
      );
    }

    // Get existing vote
    const existingVote = await client.fetch(
      `*[_type == "communityVote" && _id == $voteId][0] {
        _id,
        voter->{
          userId
        },
        votedAt
      }`,
      { voteId }
    );

    if (!existingVote) {
      return NextResponse.json(
        { error: 'Vote not found' },
        { status: 404 }
      );
    }

    // Check permissions - voter can edit their own vote, moderators can moderate
    const isVoter = existingVote.voter?.userId === session.id;
    const canModerate = session.user.role && hasPermission(session.user.role, Permission.ADMIN_SYSTEM);

    if (!isVoter && !canModerate) {
      return NextResponse.json(
        { error: 'Insufficient permissions to edit this vote' },
        { status: 403 }
      );
    }

    // Check if vote is too old to edit (24 hours for regular users)
    if (isVoter && !canModerate) {
      const votedAt = new Date(existingVote.votedAt);
      const now = new Date();
      const hoursSinceVote = (now.getTime() - votedAt.getTime()) / (1000 * 60 * 60);

      if (hoursSinceVote > 24) {
        return NextResponse.json(
          { error: 'Vote is too old to edit' },
          { status: 400 }
        );
      }
    }

    // Define allowed fields for updates
    const allowedFields = isVoter 
      ? ['voteValue', 'comment', 'criteria']
      : ['status', 'isVerified', 'verifiedBy', 'moderationNotes', 'confidence'];

    const updateData: any = { updatedAt: new Date().toISOString() };
    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        updateData[field] = updates[field];
      }
    }

    // If moderator is verifying, add verifiedBy reference
    if (canModerate && updates.isVerified) {
      const moderatorProfile = await client.fetch(
        `*[_type == "userProfile" && userId == $userId][0]._id`,
        { userId: session.id }
      );
      
      if (moderatorProfile) {
        updateData.verifiedBy = {
          _type: 'reference',
          _ref: moderatorProfile,
        };
      }
    }

    // Update vote
    const updatedVote = await writeClient
      .patch(voteId)
      .set(updateData)
      .commit();

    return NextResponse.json(updatedVote);
  } catch (error) {
    console.error('Error updating community vote:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/community-votes - Delete/withdraw a vote
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    const { searchParams } = new URL(request.url);
    const voteId = searchParams.get('voteId');
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!voteId) {
      return NextResponse.json(
        { error: 'Missing required parameter: voteId' },
        { status: 400 }
      );
    }

    // Get existing vote
    const existingVote = await client.fetch(
      `*[_type == "communityVote" && _id == $voteId][0] {
        _id,
        voter->{
          userId
        }
      }`,
      { voteId }
    );

    if (!existingVote) {
      return NextResponse.json(
        { error: 'Vote not found' },
        { status: 404 }
      );
    }

    // Check permissions - voter or admin can delete
    const isVoter = existingVote.voter?.userId === session.id;
    const canDeleteAny = session.user.role && hasPermission(session.user.role, Permission.ADMIN_SYSTEM);

    if (!isVoter && !canDeleteAny) {
      return NextResponse.json(
        { error: 'Insufficient permissions to delete this vote' },
        { status: 403 }
      );
    }

    // Update status to withdrawn instead of deleting
    const updatedVote = await writeClient
      .patch(voteId)
      .set({
        status: 'withdrawn',
        updatedAt: new Date().toISOString(),
      })
      .commit();

    return NextResponse.json(
      { message: 'Vote withdrawn successfully', vote: updatedVote },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting community vote:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
