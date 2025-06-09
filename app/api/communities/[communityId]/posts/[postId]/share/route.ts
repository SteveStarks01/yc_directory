import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { client } from '@/sanity/lib/client';
import { writeClient } from '@/sanity/lib/write-client';

interface RouteParams {
  params: { 
    communityId: string;
    postId: string;
  };
}

// POST /api/communities/[communityId]/posts/[postId]/share - Track post share
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

    const { communityId, postId } = params;
    const body = await request.json();
    const { shareType = 'link' } = body; // 'link', 'social', 'email', etc.

    // Verify post exists and belongs to the community
    const post = await client.fetch(
      `*[_type == "communityPost" && _id == $postId && community._ref == $communityId][0] {
        _id,
        shareCount
      }`,
      { postId, communityId }
    );

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    // Increment share count
    await writeClient
      .patch(postId)
      .inc({ shareCount: 1 })
      .commit();

    // Optionally, you could track individual shares for analytics
    // const shareData = {
    //   _type: 'postShare',
    //   post: { _type: 'reference', _ref: postId },
    //   userId,
    //   shareType,
    //   createdAt: new Date().toISOString(),
    // };
    // await writeClient.create(shareData);

    return NextResponse.json({
      shareCount: (post.shareCount || 0) + 1,
      message: 'Share tracked successfully',
    });

  } catch (error) {
    console.error('Error tracking share:', error);
    return NextResponse.json(
      { error: 'Failed to track share' },
      { status: 500 }
    );
  }
}

// GET /api/communities/[communityId]/posts/[postId]/share - Get share count
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { communityId, postId } = params;

    // Get current share count
    const post = await client.fetch(
      `*[_type == "communityPost" && _id == $postId && community._ref == $communityId][0] {
        _id,
        shareCount
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
      shareCount: post.shareCount || 0,
    });

  } catch (error) {
    console.error('Error fetching share count:', error);
    return NextResponse.json(
      { error: 'Failed to fetch share count' },
      { status: 500 }
    );
  }
}
