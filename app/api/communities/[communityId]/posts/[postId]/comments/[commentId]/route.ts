import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getCurrentUser } from '@/lib/clerk-auth';
import { client } from '@/sanity/lib/client';
import { writeClient } from '@/sanity/lib/write-client';

interface RouteParams {
  params: { 
    communityId: string;
    postId: string;
    commentId: string;
  };
}

// PATCH /api/communities/[communityId]/posts/[postId]/comments/[commentId] - Edit comment
export async function PATCH(
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

    const { communityId, postId, commentId } = params;
    const body = await request.json();
    const { content } = body;

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: 'Comment content is required' },
        { status: 400 }
      );
    }

    // Verify comment exists and user owns it
    const comment = await client.fetch(
      `*[_type == "communityComment" && _id == $commentId && post._ref == $postId][0] {
        _id,
        author->{
          _id,
          userId
        }
      }`,
      { commentId, postId }
    );

    if (!comment) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      );
    }

    if (comment.author.userId !== userId) {
      return NextResponse.json(
        { error: 'You can only edit your own comments' },
        { status: 403 }
      );
    }

    // Update the comment
    await writeClient
      .patch(commentId)
      .set({
        content: content.trim(),
        isEdited: true,
        updatedAt: new Date().toISOString(),
      })
      .commit();

    // Fetch the updated comment with populated author data
    const updatedComment = await client.fetch(
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
      { commentId }
    );

    return NextResponse.json(updatedComment);

  } catch (error) {
    console.error('Error updating comment:', error);
    return NextResponse.json(
      { error: 'Failed to update comment' },
      { status: 500 }
    );
  }
}

// DELETE /api/communities/[communityId]/posts/[postId]/comments/[commentId] - Delete comment
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

    const { communityId, postId, commentId } = params;

    // Verify comment exists and user owns it
    const comment = await client.fetch(
      `*[_type == "communityComment" && _id == $commentId && post._ref == $postId][0] {
        _id,
        author->{
          _id,
          userId
        }
      }`,
      { commentId, postId }
    );

    if (!comment) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      );
    }

    if (comment.author.userId !== userId) {
      return NextResponse.json(
        { error: 'You can only delete your own comments' },
        { status: 403 }
      );
    }

    // Delete the comment
    await writeClient.delete(commentId);

    // Update post comment count
    await writeClient
      .patch(postId)
      .dec({ commentCount: 1 })
      .commit();

    return NextResponse.json({
      message: 'Comment deleted successfully',
    });

  } catch (error) {
    console.error('Error deleting comment:', error);
    return NextResponse.json(
      { error: 'Failed to delete comment' },
      { status: 500 }
    );
  }
}
