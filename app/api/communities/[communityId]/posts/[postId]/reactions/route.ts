import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getCurrentUser } from '@/lib/clerk-auth';
import { client } from '@/sanity/lib/client';
import { writeClient } from '@/sanity/lib/write-client';

interface RouteParams {
  params: { 
    communityId: string;
    postId: string;
  };
}

// POST /api/communities/[communityId]/posts/[postId]/reactions - Add or toggle reaction
export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 401 }
      );
    }

    const { communityId, postId } = params;
    const body = await request.json();
    const { type } = body; // 'like', 'heart', etc.

    if (!type) {
      return NextResponse.json(
        { error: 'Reaction type is required' },
        { status: 400 }
      );
    }

    // Verify post exists and belongs to the community
    const post = await client.fetch(
      `*[_type == "communityPost" && _id == $postId && community._ref == $communityId][0] {
        _id,
        likes,
        hearts,
        reactions[] {
          userId,
          type,
          createdAt
        }
      }`,
      { postId, communityId }
    );

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    // Check if user has already reacted with this type
    const existingReactions = post.reactions || [];
    const userReaction = existingReactions.find(
      (reaction: any) => reaction.userId === userId && reaction.type === type
    );

    let updateData: any = {};
    let isToggleOff = false;

    if (userReaction) {
      // User already reacted, so remove the reaction (toggle off)
      const filteredReactions = existingReactions.filter(
        (reaction: any) => !(reaction.userId === userId && reaction.type === type)
      );

      updateData.reactions = filteredReactions;
      isToggleOff = true;

      // Decrement count
      if (type === 'like') {
        updateData.likes = Math.max((post.likes || 0) - 1, 0);
      } else if (type === 'heart') {
        updateData.hearts = Math.max((post.hearts || 0) - 1, 0);
      }
    } else {
      // Add new reaction
      const newReaction = {
        userId,
        type,
        createdAt: new Date().toISOString()
      };

      updateData.reactions = [...existingReactions, newReaction];

      // Increment count
      if (type === 'like') {
        updateData.likes = (post.likes || 0) + 1;
      } else if (type === 'heart') {
        updateData.hearts = (post.hearts || 0) + 1;
      }
    }

    // Update the post
    await writeClient
      .patch(postId)
      .set(updateData)
      .commit();

    // Return the updated reaction counts and user's reaction status
    return NextResponse.json({
      likes: updateData.likes !== undefined ? updateData.likes : post.likes || 0,
      hearts: updateData.hearts !== undefined ? updateData.hearts : post.hearts || 0,
      userReacted: !isToggleOff,
      message: isToggleOff ? 'Reaction removed successfully' : 'Reaction added successfully',
    });

  } catch (error) {
    console.error('Error adding reaction:', error);
    return NextResponse.json(
      { error: 'Failed to add reaction' },
      { status: 500 }
    );
  }
}

// GET /api/communities/[communityId]/posts/[postId]/reactions - Get reaction counts
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { communityId, postId } = params;

    // Get current reaction counts
    const post = await client.fetch(
      `*[_type == "communityPost" && _id == $postId && community._ref == $communityId][0] {
        _id,
        likes,
        hearts,
        reactions[]
      }`,
      { postId, communityId }
    );

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      likes: post.likes || 0,
      hearts: post.hearts || 0,
      reactions: post.reactions || [],
    });

  } catch (error) {
    console.error('Error fetching reactions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reactions' },
      { status: 500 }
    );
  }
}

// DELETE /api/communities/[communityId]/posts/[postId]/reactions - Remove reaction
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { communityId, postId } = params;
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    if (!type) {
      return NextResponse.json(
        { error: 'Reaction type is required' },
        { status: 400 }
      );
    }

    // Verify post exists
    const post = await client.fetch(
      `*[_type == "communityPost" && _id == $postId && community._ref == $communityId][0] {
        _id,
        likes,
        hearts
      }`,
      { postId, communityId }
    );

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    // Decrement reaction count (ensure it doesn't go below 0)
    let updateData: any = {};
    
    if (type === 'like') {
      updateData.likes = Math.max((post.likes || 0) - 1, 0);
    } else if (type === 'heart') {
      updateData.hearts = Math.max((post.hearts || 0) - 1, 0);
    }

    // Update the post
    await writeClient
      .patch(postId)
      .set(updateData)
      .commit();

    return NextResponse.json({
      likes: updateData.likes || post.likes || 0,
      hearts: updateData.hearts || post.hearts || 0,
      message: 'Reaction removed successfully',
    });

  } catch (error) {
    console.error('Error removing reaction:', error);
    return NextResponse.json(
      { error: 'Failed to remove reaction' },
      { status: 500 }
    );
  }
}
