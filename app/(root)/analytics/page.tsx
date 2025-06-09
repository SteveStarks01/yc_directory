import { Suspense } from 'react';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { Role, hasPermission, Permission } from '@/lib/permissions';
import AnalyticsDashboard from '@/components/analytics/AnalyticsDashboard';

export default async function AnalyticsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  // Check if user has permission to view analytics
  const userRole = session.user.role || Role.USER;
  if (!hasPermission(userRole, Permission.VIEW_ANALYTICS)) {
    redirect('/');
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      }>
        <AnalyticsDashboard />
      </Suspense>
    </div>
  );
}
