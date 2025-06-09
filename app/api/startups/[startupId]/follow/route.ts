import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { client } from '@/sanity/lib/client';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ startupId: string }> }
) {
  try {
    const { userId } = await auth();
    const { startupId } = await params;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!startupId) {
      return NextResponse.json({ error: 'Startup ID required' }, { status: 400 });
    }

    // Check if user already follows this startup
    const existingFollow = await client.fetch(
      `*[_type == "startupFollow" && userId == $userId && startup._ref == $startupId && isActive == true][0]`,
      { userId, startupId }
    );

    if (existingFollow) {
      return NextResponse.json({ error: 'Already following this startup' }, { status: 409 });
    }

    // Create follow record
    const follow = await client.create({
      _type: 'startupFollow',
      userId,
      startup: {
        _type: 'reference',
        _ref: startupId,
      },
      followedAt: new Date().toISOString(),
      isActive: true,
    });

    return NextResponse.json({ success: true, follow });
  } catch (error) {
    console.error('Error following startup:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ startupId: string }> }
) {
  try {
    const { userId } = await auth();
    const { startupId } = await params;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!startupId) {
      return NextResponse.json({ error: 'Startup ID required' }, { status: 400 });
    }

    // Find and deactivate the follow record
    const existingFollow = await client.fetch(
      `*[_type == "startupFollow" && userId == $userId && startup._ref == $startupId && isActive == true][0]`,
      { userId, startupId }
    );

    if (!existingFollow) {
      return NextResponse.json({ error: 'Not following this startup' }, { status: 404 });
    }

    // Deactivate the follow instead of deleting
    await client.patch(existingFollow._id).set({ isActive: false }).commit();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error unfollowing startup:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ startupId: string }> }
) {
  try {
    const { userId } = await auth();
    const { startupId } = await params;

    if (!startupId) {
      return NextResponse.json({ error: 'Startup ID required' }, { status: 400 });
    }

    // Get follow count and user's follow status
    const [followCount, userFollow] = await Promise.all([
      client.fetch(
        `count(*[_type == "startupFollow" && startup._ref == $startupId && isActive == true])`,
        { startupId }
      ),
      userId ? client.fetch(
        `*[_type == "startupFollow" && userId == $userId && startup._ref == $startupId && isActive == true][0]`,
        { userId, startupId }
      ) : null,
    ]);

    return NextResponse.json({
      followCount,
      isFollowing: !!userFollow,
    });
  } catch (error) {
    console.error('Error getting follow status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
