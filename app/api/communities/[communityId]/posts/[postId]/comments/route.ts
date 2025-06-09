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

// GET /api/communities/[communityId]/posts/[postId]/comments - Get comments for a post
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { communityId, postId } = params;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Verify post exists and belongs to the community
    const post = await client.fetch(
      `*[_type == "communityPost" && _id == $postId && community._ref == $communityId][0] {
        _id
      }`,
      { postId, communityId }
    );

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    // Fetch comments
    const comments = await client.fetch(
      `*[_type == "communityComment" && post._ref == $postId] | order(createdAt desc) [${offset}...${offset + limit}] {
        _id,
        content,
        createdAt,
        updatedAt,
        isEdited,
        likes,
        author->{
          _id,
          userId,
          name,
          image,
          role,
          company,
          position
        }
      }`,
      { postId }
    );

    return NextResponse.json({
      comments,
      total: comments.length,
    });

  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}

// POST /api/communities/[communityId]/posts/[postId]/comments - Create a new comment
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
    const { content } = body;

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: 'Comment content is required' },
        { status: 400 }
      );
    }

    // Verify post exists and belongs to the community
    const post = await client.fetch(
      `*[_type == "communityPost" && _id == $postId && community._ref == $communityId][0] {
        _id,
        commentCount
      }`,
      { postId, communityId }
    );

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    // Create the comment
    const commentData = {
      _type: 'communityComment',
      post: {
        _type: 'reference',
        _ref: postId,
      },
      author: {
        _type: 'reference',
        _ref: user._id,
      },
      content: content.trim(),
      likes: 0,
      isEdited: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const comment = await writeClient.create(commentData);

    // Update post comment count
    await writeClient
      .patch(postId)
      .inc({ commentCount: 1 })
      .commit();

    // Fetch the created comment with populated author data
    const populatedComment = await client.fetch(
      `*[_type == "communityComment" && _id == $commentId][0] {
        _id,
        content,
        createdAt,
        updatedAt,
        isEdited,
        likes,
        author->{
          _id,
          userId,
          name,
          image,
          role,
          company,
          position
        }
      }`,
      { commentId: comment._id }
    );

    return NextResponse.json(populatedComment, { status: 201 });

  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    );
  }
}
