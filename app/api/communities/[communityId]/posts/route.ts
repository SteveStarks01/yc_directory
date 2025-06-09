import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getCurrentUser } from '@/lib/clerk-auth';
import { client } from '@/sanity/lib/client';
import { writeClient } from '@/sanity/lib/write-client';

interface RouteParams {
  params: { communityId: string };
}

// GET /api/communities/[communityId]/posts - Get posts for a community
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { communityId } = params;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    const posts = await client.fetch(
      `*[_type == "communityPost" && community._ref == $communityId] | order(publishedAt desc) [${offset}...${offset + limit}] {
        _id,
        content,
        postType,
        images,
        likes,
        hearts,
        commentCount,
        shareCount,
        allowComments,
        isPinned,
        isAnnouncement,
        tags,
        publishedAt,
        createdAt,
        author->{
          _id,
          userId,
          name,
          role,
          bio,
          company,
          position,
          image
        },
        community->{
          _id,
          name,
          slug
        }
      }`,
      { communityId }
    );

    return NextResponse.json({
      posts,
      total: posts.length,
    });
  } catch (error) {
    console.error('Error fetching community posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}

// POST /api/communities/[communityId]/posts - Create a new post
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

    const { communityId } = params;
    const body = await request.json();
    const { content, postType, images, tags } = body;

    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    // Verify community exists and user has permission to post
    const community = await client.fetch(
      `*[_type == "startupCommunity" && _id == $communityId][0] {
        _id,
        name,
        isActive,
        allowGuestPosts,
        startup->{
          _id,
          author->{
            _id,
            userId
          }
        }
      }`,
      { communityId }
    );

    if (!community) {
      return NextResponse.json(
        { error: 'Community not found' },
        { status: 404 }
      );
    }

    if (!community.isActive) {
      return NextResponse.json(
        { error: 'Community is not active' },
        { status: 403 }
      );
    }

    // Check if user can post (founder or guest posts allowed)
    const isFounder = community.startup.author.userId === userId;
    if (!isFounder && !community.allowGuestPosts) {
      return NextResponse.json(
        { error: 'Only founders can post in this community' },
        { status: 403 }
      );
    }

    // Create the post
    const postData = {
      _type: 'communityPost',
      community: {
        _type: 'reference',
        _ref: communityId,
      },
      author: {
        _type: 'reference',
        _ref: user._id,
      },
      content,
      postType: postType || 'text',
      images: images || [],
      tags: tags || [],
      likes: 0,
      hearts: 0,
      commentCount: 0,
      shareCount: 0,
      allowComments: true,
      isPinned: false,
      isAnnouncement: false,
      publishedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const post = await writeClient.create(postData);

    // Update community post count
    await writeClient
      .patch(communityId)
      .inc({ postCount: 1 })
      .set({ lastActivity: new Date().toISOString() })
      .commit();

    // Fetch the created post with populated author data
    const populatedPost = await client.fetch(
      `*[_type == "communityPost" && _id == $postId][0] {
        _id,
        content,
        postType,
        images,
        likes,
        hearts,
        commentCount,
        shareCount,
        allowComments,
        isPinned,
        isAnnouncement,
        tags,
        publishedAt,
        createdAt,
        author->{
          _id,
          userId,
          name,
          role,
          bio,
          company,
          position,
          image
        }
      }`,
      { postId: post._id }
    );

    return NextResponse.json({
      ...populatedPost,
      message: 'Post created successfully',
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    );
  }
}
