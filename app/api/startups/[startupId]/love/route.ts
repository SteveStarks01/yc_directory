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

    // Check if user already loves this startup
    const existingLove = await client.fetch(
      `*[_type == "startupLove" && userId == $userId && startup._ref == $startupId && isActive == true][0]`,
      { userId, startupId }
    );

    if (existingLove) {
      return NextResponse.json({ error: 'Already loved this startup' }, { status: 409 });
    }

    // Create love record
    const love = await client.create({
      _type: 'startupLove',
      userId,
      startup: {
        _type: 'reference',
        _ref: startupId,
      },
      lovedAt: new Date().toISOString(),
      isActive: true,
    });

    return NextResponse.json({ success: true, love });
  } catch (error) {
    console.error('Error loving startup:', error);
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

    // Find and deactivate the love record
    const existingLove = await client.fetch(
      `*[_type == "startupLove" && userId == $userId && startup._ref == $startupId && isActive == true][0]`,
      { userId, startupId }
    );

    if (!existingLove) {
      return NextResponse.json({ error: 'Not loving this startup' }, { status: 404 });
    }

    // Deactivate the love instead of deleting
    await client.patch(existingLove._id).set({ isActive: false }).commit();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error unloving startup:', error);
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

    // Get love count and user's love status
    const [loveCount, userLove] = await Promise.all([
      client.fetch(
        `count(*[_type == "startupLove" && startup._ref == $startupId && isActive == true])`,
        { startupId }
      ),
      userId ? client.fetch(
        `*[_type == "startupLove" && userId == $userId && startup._ref == $startupId && isActive == true][0]`,
        { userId, startupId }
      ) : null,
    ]);

    return NextResponse.json({
      loveCount,
      isLoved: !!userLove,
    });
  } catch (error) {
    console.error('Error getting love status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
