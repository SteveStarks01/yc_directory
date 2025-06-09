'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { 
  PlusIcon, 
  RocketIcon, 
  UsersIcon, 
  TrendingUpIcon,
  EditIcon,
  TrashIcon,
  EyeIcon,
  CalendarIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import StartupCard, { StartupTypeCard } from '@/components/StartupCard';

interface DashboardStats {
  totalStartups: number;
  totalViews: number;
  totalCommunities: number;
  recentActivity: number;
}

interface UserDashboardProps {
  userId: string;
}

export default function UserDashboard({ userId }: UserDashboardProps) {
  const { user } = useUser();
  const [stats, setStats] = useState<DashboardStats>({
    totalStartups: 0,
    totalViews: 0,
    totalCommunities: 0,
    recentActivity: 0,
  });
  const [startups, setStartups] = useState<StartupTypeCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [userId]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch user's startups
      const startupsResponse = await fetch(`/api/startups?author=${userId}`);

      if (startupsResponse.ok) {
        const startupsData = await startupsResponse.json();

        // The API returns { startups: [...], pagination: {...} }
        const userStartups = startupsData.startups || [];
        setStartups(userStartups);

        // Calculate total views from all user's startups
        const totalViews = userStartups.reduce((sum: number, startup: StartupTypeCard) =>
          sum + (startup.views || 0), 0
        );

        setStats(prev => ({
          ...prev,
          totalStartups: userStartups.length,
          totalViews: totalViews,
        }));
      } else {
        console.error('Failed to fetch startups:', startupsResponse.status);
        setStartups([]);
      }

      // TODO: Fetch additional stats like communities, etc.
      // This would require additional API endpoints

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setStartups([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Quick Actions */}
      <div className="flex flex-wrap gap-4">
        <Link href="/startup/create">
          <Button className="flex items-center space-x-2">
            <PlusIcon className="w-4 h-4" />
            <span>Create Startup</span>
          </Button>
        </Link>
        <Link href="/community">
          <Button variant="outline" className="flex items-center space-x-2">
            <UsersIcon className="w-4 h-4" />
            <span>Join Community</span>
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Startups</CardTitle>
            <RocketIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStartups}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <EyeIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalViews}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Communities</CardTitle>
            <UsersIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCommunities}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
            <TrendingUpIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.recentActivity}</div>
          </CardContent>
        </Card>
      </div>

      {/* My Startups Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">My Startups</h2>
          <Link href="/startup/create">
            <Button size="sm">
              <PlusIcon className="w-4 h-4 mr-2" />
              Add New
            </Button>
          </Link>
        </div>

        {startups.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {startups.map((startup) => (
              <div key={startup._id} className="relative">
                <StartupCard post={startup} />
                {/* Management Actions */}
                <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Link href={`/startup/${startup._id}/edit`}>
                    <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                      <EditIcon className="h-3 w-3" />
                    </Button>
                  </Link>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                    onClick={() => {
                      // TODO: Implement delete functionality
                      console.log('Delete startup:', startup._id);
                    }}
                  >
                    <TrashIcon className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <RocketIcon className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No startups yet</h3>
              <p className="text-gray-500 text-center mb-4">
                Get started by creating your first startup and sharing it with the community.
              </p>
              <Link href="/startup/create">
                <Button>
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Create Your First Startup
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
