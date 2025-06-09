'use client';

import React, { useState, useEffect, memo, lazy, Suspense } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Users,
  FileText,
  Plus,
  Calendar,
  Eye,
  Settings,
  MessageSquare,
  TrendingUp,
  ToggleLeft,
  ToggleRight,
  Globe,
  Lock
} from 'lucide-react';
import OptimizedImage from '@/components/ui/OptimizedImage';
import { formatDate, cn } from '@/lib/utils';
import CommunityFeed from './CommunityFeed';

// Lazy load heavy components
const CommunityPostForm = lazy(() => import('./CommunityPostForm'));
const CommunityPostList = lazy(() => import('./CommunityPostList'));

interface Community {
  _id: string;
  name: string;
  slug: { current: string };
  description?: string;
  isActive: boolean;
  isPublic: boolean;
  allowGuestPosts: boolean;
  memberCount: number;
  postCount: number;
  lastActivity?: string;
  createdAt: string;
  startup: {
    _id: string;
    title: string;
    image?: string;
    description?: string;
    category?: string;
    author: {
      _id: string;
      userId: string;
      role?: string;
      bio?: string;
      company?: string;
      position?: string;
    };
  };
}

interface CommunityInterfaceProps {
  community: Community;
}

const CommunityInterface = memo(function CommunityInterface({ community }: CommunityInterfaceProps) {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState('feed');
  const [showPostForm, setShowPostForm] = useState(false);
  const [refreshPosts, setRefreshPosts] = useState(0);
  const [viewMode, setViewMode] = useState<'public' | 'owner'>('public');

  const isFounder = user?.id === community.startup.author.userId;
  const canPost = isFounder || community.allowGuestPosts;

  // Automatically set view mode based on user role
  useEffect(() => {
    if (isFounder) {
      setViewMode('owner');
    } else {
      setViewMode('public');
    }
  }, [isFounder]);

  const handlePostCreated = () => {
    setShowPostForm(false);
    setRefreshPosts(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Modern Sticky Header */}
      <div className="bg-white/95 backdrop-blur-md border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                {community.startup.image ? (
                  <OptimizedImage
                    src={community.startup.image}
                    alt={community.startup.title}
                    width={48}
                    height={48}
                    className="rounded-xl object-cover"
                  />
                ) : (
                  <span className="text-lg font-bold text-white">
                    {community.startup.title.charAt(0)}
                  </span>
                )}
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{community.name}</h1>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <span>{community.memberCount} members</span>
                  <span>•</span>
                  <span>{community.postCount} posts</span>
                  {isFounder && (
                    <>
                      <span>•</span>
                      <Badge
                        variant={viewMode === 'owner' ? 'default' : 'outline'}
                        className={cn(
                          "text-xs",
                          viewMode === 'owner' ? 'bg-purple-100 text-purple-800' : 'border-purple-300 text-purple-700'
                        )}
                      >
                        {viewMode === 'owner' ? 'Owner View' : 'Public View'}
                      </Badge>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Header Actions */}
            <div className="flex items-center space-x-3">
              <Link href={`/startup/${community.startup._id}`}>
                <Button variant="outline" size="sm" className="border-gray-300 hover:bg-gray-50">
                  <Eye className="w-4 h-4 mr-2" />
                  View Startup
                </Button>
              </Link>

              {isFounder && (
                <>
                  <Link href={`/community/${community.slug.current}/manage`}>
                    <Button size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                      <Settings className="w-4 h-4 mr-2" />
                      Manage
                    </Button>
                  </Link>

                  {/* View Mode Toggle */}
                  <div className="flex items-center bg-gray-100 rounded-lg p-1">
                    <Button
                      variant={viewMode === 'public' ? 'default' : 'ghost'}
                      size="sm"
                      className="text-xs px-3 py-1 h-8"
                      onClick={() => setViewMode('public')}
                    >
                      <Globe className="w-3 h-3 mr-1" />
                      Public
                    </Button>
                    <Button
                      variant={viewMode === 'owner' ? 'default' : 'ghost'}
                      size="sm"
                      className="text-xs px-3 py-1 h-8"
                      onClick={() => setViewMode('owner')}
                    >
                      <Settings className="w-3 h-3 mr-1" />
                      Owner
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Community Info Card */}
        <Card className="mb-8 bg-white border border-gray-200 shadow-sm">
          <CardHeader>
            <div className="flex items-start gap-4">
              {/* Startup Image */}
              <div className="relative">
                {community.startup.image ? (
                  <OptimizedImage
                    src={community.startup.image}
                    alt={community.startup.title}
                    width={80}
                    height={80}
                    className="rounded-lg object-cover"
                    priority={true}
                    quality={85}
                    sizes="80px"
                  />
                ) : (
                  <div className="w-20 h-20 bg-black rounded-lg flex items-center justify-center">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                )}
                {isFounder && (
                  <Badge className="absolute -top-2 -right-2 bg-black text-white text-xs">
                    Founder
                  </Badge>
                )}
              </div>

              {/* Community Info */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h2 className="text-2xl font-bold text-gray-900">{community.name}</h2>
                  {!community.isActive && (
                    <Badge variant="secondary">Inactive</Badge>
                  )}
                  {community.isPublic ? (
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      <Globe className="w-3 h-3 mr-1" />
                      Public
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-orange-600 border-orange-600">
                      <Lock className="w-3 h-3 mr-1" />
                      Private
                    </Badge>
                  )}
                </div>

                <Link
                  href={`/startup/${community.startup._id}`}
                  className="text-black hover:text-gray-700 font-medium mb-2 block"
                >
                  {community.startup.title}
                </Link>

                {community.description && (
                  <p className="text-gray-600 mb-3">{community.description}</p>
                )}

                {/* Community Stats */}
                <div className="flex items-center gap-6 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{community.memberCount} members</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FileText className="w-4 h-4" />
                    <span>{community.postCount} posts</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>Created {formatDate(community.createdAt)}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Modern Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-2">
            <TabsList className={cn(
              "grid w-full bg-transparent gap-2",
              isFounder && viewMode === 'owner' ? 'grid-cols-4' : 'grid-cols-3'
            )}>
              <TabsTrigger
                value="feed"
                className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white rounded-xl py-3 px-4 transition-all duration-200"
              >
                <MessageSquare className="w-4 h-4" />
                <span className="font-medium">Feed</span>
              </TabsTrigger>
              <TabsTrigger
                value="members"
                className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white rounded-xl py-3 px-4 transition-all duration-200"
              >
                <Users className="w-4 h-4" />
                <span className="font-medium">Members</span>
              </TabsTrigger>
              <TabsTrigger
                value="events"
                className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white rounded-xl py-3 px-4 transition-all duration-200"
              >
                <Calendar className="w-4 h-4" />
                <span className="font-medium">Events</span>
              </TabsTrigger>
              {/* Analytics tab only visible to owners in owner view */}
              {isFounder && viewMode === 'owner' && (
                <TabsTrigger
                  value="analytics"
                  className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white rounded-xl py-3 px-4 transition-all duration-200"
                >
                  <TrendingUp className="w-4 h-4" />
                  <span className="font-medium">Analytics</span>
                </TabsTrigger>
              )}
            </TabsList>
          </div>

        {/* Feed Tab */}
        <TabsContent value="feed" className="space-y-6">
          <CommunityFeed
            communityId={community._id}
            isOwner={isFounder}
          />
        </TabsContent>

        {/* Members Tab */}
        <TabsContent value="members" className="space-y-6">
          {isFounder && viewMode === 'owner' ? (
            // Owner view - Full member management
            <Card className="bg-white border border-gray-200">
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold">Member Management</h3>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    Owner View
                  </Badge>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium">Total Members</h4>
                      <p className="text-sm text-gray-600">{community.memberCount} active members</p>
                    </div>
                    <Button size="sm" variant="outline">
                      <Plus className="w-4 h-4 mr-2" />
                      Invite Members
                    </Button>
                  </div>

                  <div className="text-center py-8">
                    <Settings className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">Advanced member management features</p>
                    <p className="text-sm text-gray-400">
                      • Manage member roles and permissions<br/>
                      • Send invitations and manage requests<br/>
                      • View member activity and analytics<br/>
                      • Moderate community content
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            // Public view - Simple member list
            <Card className="bg-white border border-gray-200">
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold">Community Members</h3>
                  <Badge variant="outline" className="bg-green-100 text-green-800">
                    Public View
                  </Badge>
                </div>

                <div className="text-center py-8">
                  <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-2">{community.memberCount} members in this community</p>
                  <p className="text-sm text-gray-400">
                    Connect with fellow entrepreneurs and startup enthusiasts
                  </p>
                  {!user && (
                    <Button className="mt-4" size="sm">
                      Join Community
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Events Tab */}
        <TabsContent value="events" className="space-y-6">
          <Card className="bg-white border border-gray-200">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Community Events</h3>
              <div className="text-center py-8">
                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Events system coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab - Owner Only */}
        {isFounder && viewMode === 'owner' && (
          <TabsContent value="analytics" className="space-y-6">
            <Card className="bg-white border border-gray-200">
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold">Community Analytics</h3>
                  <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                    Owner Only
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-900">Total Members</h4>
                    <p className="text-2xl font-bold text-blue-700">{community.memberCount}</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-medium text-green-900">Total Posts</h4>
                    <p className="text-2xl font-bold text-green-700">{community.postCount}</p>
                  </div>
                  <div className="p-4 bg-orange-50 rounded-lg">
                    <h4 className="font-medium text-orange-900">Engagement</h4>
                    <p className="text-2xl font-bold text-orange-700">
                      {community.postCount > 0 ? Math.round((community.postCount / community.memberCount) * 100) : 0}%
                    </p>
                  </div>
                </div>

                <div className="text-center py-8">
                  <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">Advanced analytics dashboard</p>
                  <p className="text-sm text-gray-400">
                    • Member growth and retention metrics<br/>
                    • Post engagement and reach analytics<br/>
                    • Community health indicators<br/>
                    • Export data and generate reports
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
        </Tabs>
      </div>
    </div>
  );
});

export default CommunityInterface;
