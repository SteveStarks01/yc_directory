import { Suspense } from 'react';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { client } from '@/sanity/lib/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings, 
  Users, 
  BarChart3, 
  Shield, 
  MessageSquare,
  ArrowLeft,
  Eye,
  Globe,
  Lock,
  UserPlus,
  Trash2,
  Edit
} from 'lucide-react';
import Link from 'next/link';

interface CommunityManagePageProps {
  params: Promise<{ slug: string }>;
}

async function getCommunityWithPermissions(slug: string, userId: string) {
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
      createdAt,
      startup->{
        _id,
        title,
        name,
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
        },
        founders[]->{
          _id,
          userId,
          role,
          company,
          position
        }
      }
    }`,
    { slug }
  );

  if (!community) return null;

  // Check if user is founder/owner
  const isFounder = community.startup.author?.userId === userId ||
    community.startup.founders?.some((founder: any) => founder.userId === userId);

  return { community, isFounder };
}

export default async function CommunityManagePage({ params }: CommunityManagePageProps) {
  const { slug } = await params;
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  const result = await getCommunityWithPermissions(slug, userId);

  if (!result) {
    notFound();
  }

  const { community, isFounder } = result;

  if (!isFounder) {
    redirect(`/community/${slug}`);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href={`/community/${slug}`}>
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Community
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold text-gray-900">Community Management</h1>
              <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                Owner
              </Badge>
            </div>
          </div>
          <p className="text-gray-600">
            Manage settings, members, and content for <strong>{community.name}</strong>
          </p>
        </div>

        {/* Management Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-white border">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="members" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Members
            </TabsTrigger>
            <TabsTrigger value="content" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Content
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
            <TabsTrigger value="moderation" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Moderation
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-600" />
                    Members
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {community.memberCount}
                  </div>
                  <p className="text-sm text-gray-600">Total active members</p>
                  <Button size="sm" className="mt-3 w-full" variant="outline">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Invite Members
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-green-600" />
                    Posts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {community.postCount}
                  </div>
                  <p className="text-sm text-gray-600">Total community posts</p>
                  <Button size="sm" className="mt-3 w-full" variant="outline">
                    <Eye className="w-4 h-4 mr-2" />
                    View All Posts
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-purple-600" />
                    Engagement
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-600 mb-2">
                    {community.postCount > 0 ? Math.round((community.postCount / community.memberCount) * 100) : 0}%
                  </div>
                  <p className="text-sm text-gray-600">Member engagement rate</p>
                  <Button size="sm" className="mt-3 w-full" variant="outline">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    View Analytics
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button variant="outline" className="h-20 flex-col">
                    <UserPlus className="w-6 h-6 mb-2" />
                    Invite Members
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <MessageSquare className="w-6 h-6 mb-2" />
                    Create Post
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <Settings className="w-6 h-6 mb-2" />
                    Edit Settings
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <BarChart3 className="w-6 h-6 mb-2" />
                    View Reports
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Members Tab */}
          <TabsContent value="members" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Member Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Advanced Member Management</h3>
                  <p className="text-gray-600 mb-6">
                    Comprehensive member management features coming soon
                  </p>
                  <div className="space-y-2 text-sm text-gray-500">
                    <p>• Invite and manage member roles</p>
                    <p>• Set permissions and access levels</p>
                    <p>• View member activity and engagement</p>
                    <p>• Handle membership requests</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Content Tab */}
          <TabsContent value="content" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Content Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Content Moderation Tools</h3>
                  <p className="text-gray-600 mb-6">
                    Advanced content management features coming soon
                  </p>
                  <div className="space-y-2 text-sm text-gray-500">
                    <p>• Moderate posts and comments</p>
                    <p>• Set content guidelines and rules</p>
                    <p>• Manage featured and pinned content</p>
                    <p>• Content analytics and insights</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Community Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Community Visibility</h4>
                      <p className="text-sm text-gray-600">
                        {community.isPublic ? 'Public - Anyone can view' : 'Private - Invite only'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {community.isPublic ? (
                        <Globe className="w-5 h-5 text-green-600" />
                      ) : (
                        <Lock className="w-5 h-5 text-orange-600" />
                      )}
                      <Button size="sm" variant="outline">
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Guest Posts</h4>
                      <p className="text-sm text-gray-600">
                        {community.allowGuestPosts ? 'Enabled - Non-members can post' : 'Disabled - Members only'}
                      </p>
                    </div>
                    <Button size="sm" variant="outline">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg border-red-200">
                    <div>
                      <h4 className="font-medium text-red-900">Danger Zone</h4>
                      <p className="text-sm text-red-600">
                        Permanently delete this community
                      </p>
                    </div>
                    <Button size="sm" variant="destructive">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Moderation Tab */}
          <TabsContent value="moderation" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Moderation Tools</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Community Moderation</h3>
                  <p className="text-gray-600 mb-6">
                    Advanced moderation features coming soon
                  </p>
                  <div className="space-y-2 text-sm text-gray-500">
                    <p>• Automated content filtering</p>
                    <p>• Report management system</p>
                    <p>• Member warnings and suspensions</p>
                    <p>• Moderation activity logs</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
