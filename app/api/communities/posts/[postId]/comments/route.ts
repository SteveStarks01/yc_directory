import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { client } from '@/sanity/lib/client';
import { writeClient } from '@/sanity/lib/write-client';

interface RouteParams {
  params: { postId: string };
}

// GET /api/communities/posts/[postId]/comments - Get comments for a post
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { postId } = params;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'asc';
    const userId = searchParams.get('userId');

    // Build sort clause based on parameters
    let orderClause = 'order(createdAt asc)';
    switch (sortBy) {
      case 'createdAt':
        orderClause = `order(createdAt ${sortOrder})`;
        break;
      case 'reactionCount':
        orderClause = `order((likes + hearts) ${sortOrder})`;
        break;
      case 'replyCount':
        orderClause = `order(replyCount ${sortOrder})`;
        break;
      case 'lastActivity':
        orderClause = `order(coalesce(editedAt, createdAt) ${sortOrder})`;
        break;
      default:
        orderClause = 'order(createdAt asc)';
    }

    // Enhanced query with reaction data and user-specific reactions
    const comments = await client.fetch(
      `*[_type == "communityComment" && post._ref == $postId] | ${orderClause} [${offset}...${offset + limit}] {
        _id,
        content,
        author->{
          _id,
          userId,
          role,
          bio,
          company,
          position
        },
        parentComment->{
          _id
        },
        threadLevel,
        likes,
        hearts,
        replyCount,
        isEdited,
        editedAt,
        createdAt,
        updatedAt,
        "reactions": *[_type == "communityReaction" && targetComment._ref == ^._id] {
          reactionType,
          user->{userId}
        },
        "userReaction": *[_type == "communityReaction" && targetComment._ref == ^._id && user->userId == $userId][0].reactionType
      }`,
      { postId, userId }
    );

    // Process reactions into counts
    const processedComments = comments.map((comment: any) => {
      const reactionCounts = comment.reactions?.reduce((acc: Record<string, number>, reaction: any) => {
        acc[reaction.reactionType] = (acc[reaction.reactionType] || 0) + 1;
        return acc;
      }, {}) || {};

      return {
        ...comment,
        reactions: reactionCounts,
        userReaction: comment.userReaction || null,
      };
    });

    return NextResponse.json({
      comments: processedComments,
      total: processedComments.length,
      sortBy,
      sortOrder,
    });
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}

// POST /api/communities/posts/[postId]/comments - Create a new comment
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
    const { content, parentComment } = body;

    if (!content?.trim()) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    // Verify post exists and allows comments
    const post = await client.fetch(
      `*[_type == "communityPost" && _id == $postId][0] {
        _id,
        allowComments,
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

    if (!post.allowComments) {
      return NextResponse.json(
        { error: 'Comments are not allowed on this post' },
        { status: 403 }
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

    // Calculate thread level if this is a reply
    let threadLevel = 0;
    if (parentComment) {
      const parentCommentData = await client.fetch(
        `*[_type == "communityComment" && _id == $parentId][0] {
          threadLevel
        }`,
        { parentId: parentComment }
      );

      if (parentCommentData) {
        threadLevel = parentCommentData.threadLevel + 1;
      }
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
        _ref: userProfile._id,
      },
      content: content.trim(),
      parentComment: parentComment ? {
        _type: 'reference',
        _ref: parentComment,
      } : undefined,
      threadLevel,
      likes: 0,
      hearts: 0,
      replyCount: 0,
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

    // Update parent comment reply count if this is a reply
    if (parentComment) {
      await writeClient
        .patch(parentComment)
        .inc({ replyCount: 1 })
        .commit();
    }

    // Update community last activity
    await writeClient
      .patch(post.community._id)
      .set({ lastActivity: new Date().toISOString() })
      .commit();

    return NextResponse.json({
      ...comment,
      message: 'Comment created successfully',
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    );
  }
}
