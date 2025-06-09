import { Suspense } from 'react';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import CommunityLayout from '@/components/community/CommunityLayout';
import CommunityDashboard from '@/components/community/CommunityDashboard';

export default async function CommunityPage() {
  const { userId } = await auth();

  // Redirect to sign in if not authenticated
  if (!userId) {
    redirect('/sign-in?redirect_url=/community');
  }

  return (
    <CommunityLayout
      title="Community Dashboard"
      description="Welcome to the YC Directory community platform"
    >
      <Suspense fallback={<div>Loading dashboard...</div>}>
        <CommunityDashboard />
      </Suspense>
    </CommunityLayout>
  );
}
