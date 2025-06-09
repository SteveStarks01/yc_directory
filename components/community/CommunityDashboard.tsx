'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { 
  CalendarIcon, 
  FileTextIcon, 
  UsersIcon, 
  TrendingUpIcon,
  PlusIcon,
  StarIcon,
  DownloadIcon,
  EyeIcon
} from 'lucide-react';

interface DashboardStats {
  totalEvents: number;
  upcomingEvents: number;
  totalResources: number;
  totalDownloads: number;
  userEvents: number;
  userResources: number;
}

interface RecentActivity {
  id: string;
  type: 'event' | 'resource' | 'rsvp' | 'download';
  title: string;
  description: string;
  timestamp: string;
  url: string;
}

export default function CommunityDashboard() {
  const { user } = useUser();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch dashboard statistics
      const [eventsRes, resourcesRes] = await Promise.all([
        fetch('/api/events?limit=1'),
        fetch('/api/resources?limit=1'),
      ]);

      const eventsData = await eventsRes.json();
      const resourcesData = await resourcesRes.json();

      // Mock stats for demonstration
      const dashboardStats: DashboardStats = {
        totalEvents: eventsData.pagination?.total || 0,
        upcomingEvents: 0, // Would fetch from upcoming events endpoint
        totalResources: resourcesData.pagination?.total || 0,
        totalDownloads: 0, // Would fetch from analytics endpoint
        userEvents: 0, // Would fetch user's events
        userResources: 0, // Would fetch user's resources
      };

      setStats(dashboardStats);

      // Mock recent activity with static timestamps to prevent hydration issues
      const mockActivity: RecentActivity[] = [
        {
          id: '1',
          type: 'event',
          title: 'New Event Created',
          description: 'YC Demo Day 2024 has been scheduled',
          timestamp: new Date('2024-01-15T10:00:00Z').toISOString(),
          url: '/events/yc-demo-day-2024',
        },
        {
          id: '2',
          type: 'resource',
          title: 'Resource Added',
          description: 'Startup Funding Guide uploaded',
          timestamp: new Date('2024-01-15T08:00:00Z').toISOString(),
          url: '/resources/startup-funding-guide',
        },
        {
          id: '3',
          type: 'rsvp',
          title: 'New RSVP',
          description: 'Someone joined your networking event',
          timestamp: new Date('2024-01-15T06:00:00Z').toISOString(),
          url: '/events/networking-meetup',
        },
      ];

      setRecentActivity(mockActivity);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'event':
        return <CalendarIcon className="w-4 h-4 text-blue-500" />;
      case 'resource':
        return <FileTextIcon className="w-4 h-4 text-green-500" />;
      case 'rsvp':
        return <UsersIcon className="w-4 h-4 text-purple-500" />;
      case 'download':
        return <DownloadIcon className="w-4 h-4 text-orange-500" />;
      default:
        return <TrendingUpIcon className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    // Use a more stable time calculation to prevent hydration issues
    const time = new Date(timestamp);
    const now = new Date('2024-01-15T12:00:00Z'); // Fixed reference time for consistency
    const diffInHours = Math.floor((now.getTime() - time.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white p-6 rounded-lg shadow-sm">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Community Dashboard</h1>
            <p className="text-gray-600 mt-2">
              Welcome back, {user?.firstName || 'Community Member'}!
            </p>
          </div>
          <div className="flex space-x-4">
            <Link
              href="/events/create"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors"
            >
              <PlusIcon className="w-4 h-4" />
              <span>Create Event</span>
            </Link>
            <Link
              href="/resources/create"
              className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-green-700 transition-colors"
            >
              <PlusIcon className="w-4 h-4" />
              <span>Add Resource</span>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Events</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.totalEvents || 0}</p>
              </div>
              <CalendarIcon className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Resources</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.totalResources || 0}</p>
              </div>
              <FileTextIcon className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Your Events</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.userEvents || 0}</p>
              </div>
              <UsersIcon className="w-8 h-8 text-purple-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Your Resources</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.userResources || 0}</p>
              </div>
              <StarIcon className="w-8 h-8 text-orange-500" />
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
              </div>
              <div className="p-6">
                {recentActivity.length > 0 ? (
                  <div className="space-y-4">
                    {recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-1">
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">
                            {activity.title}
                          </p>
                          <p className="text-sm text-gray-500">{activity.description}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {formatTimeAgo(activity.timestamp)}
                          </p>
                        </div>
                        <Link
                          href={activity.url}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          View
                        </Link>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No recent activity</p>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
              </div>
              <div className="p-6 space-y-4">
                <Link
                  href="/events"
                  className="block w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <CalendarIcon className="w-5 h-5 text-blue-500" />
                    <span className="font-medium">Browse Events</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Discover upcoming community events
                  </p>
                </Link>

                <Link
                  href="/resources"
                  className="block w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <FileTextIcon className="w-5 h-5 text-green-500" />
                    <span className="font-medium">Explore Resources</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Access startup guides and tools
                  </p>
                </Link>

                <Link
                  href="/profile"
                  className="block w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <UsersIcon className="w-5 h-5 text-purple-500" />
                    <span className="font-medium">Update Profile</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Manage your community profile
                  </p>
                </Link>
              </div>
            </div>

            {/* Community Stats */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Community Stats</h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Active Members</span>
                  <span className="font-semibold">1,234</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">This Month&apos;s Events</span>
                  <span className="font-semibold">12</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Resources Shared</span>
                  <span className="font-semibold">{stats?.totalResources || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Downloads</span>
                  <span className="font-semibold">5,678</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
