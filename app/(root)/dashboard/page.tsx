import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import UserDashboard from "@/components/UserDashboard";
import { getCurrentUser } from "@/lib/clerk-auth";

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Get current user details from Clerk
  const user = await getCurrentUser();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Welcome back, {user?.firstName || 'User'}! Manage your startups and profile.
          </p>
        </div>

        <Suspense fallback={<div>Loading dashboard...</div>}>
          <UserDashboard userId={userId} />
        </Suspense>
      </div>
    </div>
  );
}
