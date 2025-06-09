import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { client } from '@/sanity/lib/client';
import { writeClient } from '@/sanity/lib/write-client';

interface RouteParams {
  params: { postId: string };
}

// GET /api/communities/posts/[postId]/reactions - Get reactions for a post
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { postId } = params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    // Get all reactions for the post
    const reactions = await client.fetch(
      `*[_type == "communityReaction" && targetPost._ref == $postId] {
        _id,
        reactionType,
        user->{
          _id,
          userId,
          role
        },
        createdAt
      } | order(createdAt desc)`,
      { postId }
    );

    // Aggregate reaction counts
    const reactionCounts = reactions.reduce((acc: Record<string, number>, reaction: any) => {
      acc[reaction.reactionType] = (acc[reaction.reactionType] || 0) + 1;
      return acc;
    }, {});

    // Get user's reaction if userId provided
    let userReaction = null;
    if (userId) {
      userReaction = reactions.find((r: any) => r.user.userId === userId);
    }

    return NextResponse.json({
      reactions: reactionCounts,
      userReaction: userReaction?.reactionType || null,
      total: reactions.length,
    });
  } catch (error) {
    console.error('Error fetching post reactions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reactions' },
      { status: 500 }
    );
  }
}

// POST /api/communities/posts/[postId]/reactions - Add or update reaction
export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { postId } = params;
    const body = await request.json();
    const { reactionType } = body;

    // Validate reaction type
    const validReactions = ['like', 'heart', 'fire', 'idea', 'celebrate', 'clap', 'rocket', 'hundred'];
    if (!reactionType || !validReactions.includes(reactionType)) {
      return NextResponse.json(
        { error: 'Invalid reaction type' },
        { status: 400 }
      );
    }

    // Verify post exists
    const post = await client.fetch(
      `*[_type == "communityPost" && _id == $postId][0] {
        _id,
        community->{
          _id,
          isActive
        }
      }`,
      { postId }
    );

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    if (!post.community.isActive) {
      return NextResponse.json(
        { error: 'Community is not active' },
        { status: 403 }
      );
    }

    // Get user profile
    const userProfile = await client.fetch(
      `*[_type == "userProfile" && userId == $userId][0]`,
      { userId: session.user.id }
    );

    if (!userProfile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }

    // Check for existing reaction
    const existingReaction = await client.fetch(
      `*[_type == "communityReaction" && targetPost._ref == $postId && user._ref == $userRef][0]`,
      { postId, userRef: userProfile._id }
    );

    if (existingReaction) {
      if (existingReaction.reactionType === reactionType) {
        // Same reaction - remove it
        await writeClient.delete(existingReaction._id);
        
        return NextResponse.json({
          action: 'removed',
          reactionType,
          message: 'Reaction removed successfully',
        });
      } else {
        // Different reaction - update it
        const updatedReaction = await writeClient
          .patch(existingReaction._id)
          .set({ 
            reactionType,
            updatedAt: new Date().toISOString()
          })
          .commit();

        return NextResponse.json({
          action: 'updated',
          reactionType,
          reaction: updatedReaction,
          message: 'Reaction updated successfully',
        });
      }
    } else {
      // New reaction - create it
      const reactionData = {
        _type: 'communityReaction',
        user: {
          _type: 'reference',
          _ref: userProfile._id,
        },
        reactionType,
        targetType: 'post',
        targetPost: {
          _type: 'reference',
          _ref: postId,
        },
        community: {
          _type: 'reference',
          _ref: post.community._id,
        },
        createdAt: new Date().toISOString(),
      };

      const newReaction = await writeClient.create(reactionData);

      return NextResponse.json({
        action: 'added',
        reactionType,
        reaction: newReaction,
        message: 'Reaction added successfully',
      }, { status: 201 });
    }
  } catch (error) {
    console.error('Error handling post reaction:', error);
    return NextResponse.json(
      { error: 'Failed to handle reaction' },
      { status: 500 }
    );
  }
}

// DELETE /api/communities/posts/[postId]/reactions - Remove user's reaction
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { postId } = params;

    // Get user profile
    const userProfile = await client.fetch(
      `*[_type == "userProfile" && userId == $userId][0]`,
      { userId: session.user.id }
    );

    if (!userProfile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }

    // Find and delete user's reaction
    const existingReaction = await client.fetch(
      `*[_type == "communityReaction" && targetPost._ref == $postId && user._ref == $userRef][0]`,
      { postId, userRef: userProfile._id }
    );

    if (!existingReaction) {
      return NextResponse.json(
        { error: 'No reaction found to remove' },
        { status: 404 }
      );
    }

    await writeClient.delete(existingReaction._id);

    return NextResponse.json({
      message: 'Reaction removed successfully',
    });
  } catch (error) {
    console.error('Error removing post reaction:', error);
    return NextResponse.json(
      { error: 'Failed to remove reaction' },
      { status: 500 }
    );
  }
}
