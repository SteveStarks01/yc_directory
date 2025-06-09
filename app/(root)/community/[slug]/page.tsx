import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { client } from '@/sanity/lib/client';
import CommunityInterface from '@/components/community/CommunityInterface';

interface CommunityPageProps {
  params: { slug: string };
}

async function getCommunity(slug: string) {
  const community = await client.fetch(
    `*[_type == "startupCommunity" && slug.current == $slug][0] {
      _id,
      name,
      slug,
      description,
      isActive,
      isPublic,
      allowGuestPosts,
      memberCount,
      postCount,
      lastActivity,
      createdAt,
      startup->{
        _id,
        title,
        image,
        description,
        category,
        author->{
          _id,
          userId,
          role,
          bio,
          company,
          position
        }
      }
    }`,
    { slug }
  );

  return community;
}

export default async function CommunityPage({ params }: CommunityPageProps) {
  const { slug } = params;
  const community = await getCommunity(slug);

  if (!community) {
    notFound();
  }

  if (!community.isPublic) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Private Community
          </h1>
          <p className="text-gray-600">
            This community is private and not accessible to the public.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Suspense fallback={
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      }>
        <CommunityInterface community={community} />
      </Suspense>
    </div>
  );
}

export async function generateMetadata({ params }: CommunityPageProps) {
  const { slug } = params;
  const community = await getCommunity(slug);

  if (!community) {
    return {
      title: 'Community Not Found',
    };
  }

  return {
    title: `${community.name} - YC Directory`,
    description: community.description || `Join the ${community.name} community to connect with fellow entrepreneurs and discuss ${community.startup.title}.`,
    openGraph: {
      title: community.name,
      description: community.description,
      images: community.startup.image ? [community.startup.image] : [],
    },
  };
}
