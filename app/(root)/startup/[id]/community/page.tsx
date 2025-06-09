import { notFound, redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { client } from '@/sanity/lib/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, AlertCircle } from 'lucide-react';

interface CommunityPageProps {
  params: Promise<{ id: string }>;
}

interface AutoCommunityCreationResult {
  success: boolean;
  community?: any;
  error?: string;
  redirectUrl?: string | null;
}

async function getStartupAndCommunity(startupId: string, userId: string) {
  console.log('getStartupAndCommunity called with:', { startupId, userId });

  // Check if startup exists and get both legacy and new fields
  const startup = await client.fetch(
    `*[_type == "startup" && _id == $startupId][0] {
      _id,
      name,
      title,
      description,
      image,
      // Legacy author field
      author->{
        _id,
        userId
      },
      // New founders field
      founders[]->{
        _id,
        userId
      }
    }`,
    { startupId }
  );

  console.log('Fetched startup:', startup);

  if (!startup) {
    return { startup: null, community: null, isOwner: false };
  }

  // Check ownership using both legacy author and new founders fields
  let isOwner = false;

  // Check legacy author field
  if (startup.author?.userId === userId) {
    isOwner = true;
  }

  // Check new founders field
  if (startup.founders && startup.founders.length > 0) {
    isOwner = startup.founders.some((founder: any) => founder.userId === userId);
  }

  console.log('Ownership check:', {
    startupAuthorUserId: startup.author?.userId,
    startupFounders: startup.founders?.map((f: any) => f.userId),
    currentUserId: userId,
    isOwner
  });

  // Check if community already exists
  const community = await client.fetch(
    `*[_type == "startupCommunity" && startup._ref == $startupId][0] {
      _id,
      name,
      slug,
      description,
      isActive,
      isPublic,
      allowGuestPosts,
      memberCount,
      postCount,
      createdAt
    }`,
    { startupId }
  );

  console.log('Existing community:', community);

  return { startup, community, isOwner };
}

async function createCommunityAutomatically(startup: any, userId: string): Promise<AutoCommunityCreationResult> {
  try {
    console.log('Auto-creating community for startup:', startup._id);

    // Get startup name from either title or name field
    const startupName = startup.title || startup.name || 'Startup';

    // Import the writeClient and slugify here to avoid import issues
    const { writeClient } = await import('@/sanity/lib/write-client');
    const { client } = await import('@/sanity/lib/client');
    const slugify = (await import('slugify')).default;

    // First, get the userProfile ID from the Clerk user ID
    const userProfile = await client.fetch(
      `*[_type == "userProfile" && userId == $userId][0] {
        _id,
        userId,
        name
      }`,
      { userId }
    );

    if (!userProfile) {
      console.error('User profile not found for userId:', userId);
      return {
        success: false,
        error: 'User profile not found. Please ensure you have a complete profile.',
        redirectUrl: null
      };
    }

    console.log('Found user profile:', userProfile._id, 'for Clerk user:', userId);

    // Auto-populate community data using startup information
    const communityName = `${startupName} Community`;
    const communityDescription = `Official community for ${startupName}. Connect with users, share updates, and discuss everything related to ${startupName}.`;
    const slug = slugify(communityName, { lower: true, strict: true });

    console.log('Creating community with data:', {
      name: communityName,
      description: communityDescription,
      slug,
      startupId: startup._id,
    });

    // Create community data structure
    const communityData = {
      _type: 'startupCommunity',
      startup: {
        _type: 'reference',
        _ref: startup._id,
      },
      name: communityName,
      slug: {
        _type: 'slug',
        current: slug,
      },
      description: communityDescription,
      isActive: true,
      isPublic: true,
      allowGuestPosts: false,
      memberCount: 1,
      postCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Create the community
    const community = await writeClient.create(communityData);
    console.log('Community created successfully:', community);

    // Auto-add creator as owner member
    const ownerMembershipData = {
      _type: 'communityMember',
      community: {
        _type: 'reference',
        _ref: community._id,
      },
      user: {
        _type: 'reference',
        _ref: userProfile._id,  // Use the Sanity userProfile ID, not the Clerk user ID
      },
      role: 'owner',
      permissions: {
        canPost: true,
        canComment: true,
        canModerate: true,
        canInvite: true,
        canManageMembers: true,
      },
      status: 'active',
      joinedAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      postCount: 0,
      commentCount: 0,
      updatedAt: new Date().toISOString(),
    };

    // Create owner membership
    await writeClient.create(ownerMembershipData);
    console.log('Owner membership created successfully');

    return {
      success: true,
      community,
      redirectUrl: `/community/${community.slug.current}`,
    };
  } catch (error) {
    console.error('Error in automatic community creation:', error);

    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
}

export default async function CommunityPage({ params }: CommunityPageProps) {
  // Await the params Promise as required in Next.js 15
  const { id } = await params;
  console.log('CommunityPage: Processing startup ID:', id);

  const { userId } = await auth();
  console.log('CommunityPage: User ID:', userId);

  if (!userId) {
    console.log('CommunityPage: No user ID, redirecting to sign-in');
    redirect('/sign-in');
  }

  const { startup, community, isOwner } = await getStartupAndCommunity(id, userId);

  console.log('CommunityPage: Results:', {
    hasStartup: !!startup,
    hasCommunity: !!community,
    isOwner,
    startupName: startup?.title || startup?.name
  });

  if (!startup) {
    console.log('CommunityPage: Startup not found, calling notFound()');
    notFound();
  }

  // If community exists, redirect to the community page
  if (community && community.slug?.current) {
    console.log('CommunityPage: Community exists, redirecting to:', `/community/${community.slug.current}`);
    redirect(`/community/${community.slug.current}`);
  }

  // Check ownership before allowing community creation
  if (!isOwner) {
    console.log('CommunityPage: User is not owner, redirecting to startup page');
    redirect(`/startup/${id}`);
  }

  // Automatically create community
  console.log('CommunityPage: Starting automatic community creation');
  const creationResult = await createCommunityAutomatically(startup, userId);

  if (creationResult.success && creationResult.redirectUrl) {
    console.log('CommunityPage: Community created successfully, redirecting to:', creationResult.redirectUrl);
    redirect(creationResult.redirectUrl);
  }

  // If we reach here, automatic creation failed
  const startupName = startup.title || startup.name || 'this startup';

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="size-5" />
              Community Creation Failed
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center py-8">
              <AlertCircle className="size-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Unable to Create Community</h2>
              <p className="text-muted-foreground mb-6">
                We encountered an error while trying to automatically create a community for <strong>{startupName}</strong>.
              </p>

              {creationResult.error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-red-700">
                    <strong>Error:</strong> {creationResult.error}
                  </p>
                </div>
              )}

              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  You can try the following options:
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <a
                    href={`/startup/${id}/community`}
                    className="inline-flex items-center justify-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                  >
                    <Loader2 className="size-4 mr-2" />
                    Try Again
                  </a>

                  <a
                    href={`/startup/${id}`}
                    className="inline-flex items-center justify-center px-4 py-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md transition-colors"
                  >
                    Back to Startup
                  </a>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Debug Information:</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p>Startup ID: {startup._id}</p>
                <p>Startup Name: {startupName}</p>
                <p>User ID: {userId}</p>
                <p>Is Owner: {isOwner ? 'Yes' : 'No'}</p>
                <p>Error: {creationResult.error || 'Unknown error'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
