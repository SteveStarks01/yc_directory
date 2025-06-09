'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Users,
  UserPlus,
  MoreVertical,
  ShieldCheck,
  User,
  Crown
} from 'lucide-react';

interface CommunityMember {
  _id: string;
  role: 'owner' | 'admin' | 'moderator' | 'member';
  status: 'active' | 'pending' | 'suspended' | 'banned' | 'left';
  joinedAt: string;
  lastActive?: string;
  postCount: number;
  commentCount: number;
  permissions: {
    canPost: boolean;
    canComment: boolean;
    canModerate: boolean;
    canInvite: boolean;
    canManageMembers: boolean;
  };
  user: {
    _id: string;
    userId: string;
    name: string;
    image?: string;
    role: string;
    isVerified: boolean;
  };
}

interface MemberManagementProps {
  communityId: string;
  currentUserRole?: string;
  canManageMembers?: boolean;
}

const ROLE_COLORS = {
  owner: 'bg-purple-100 text-purple-800 border-purple-200',
  admin: 'bg-red-100 text-red-800 border-red-200',
  moderator: 'bg-blue-100 text-blue-800 border-blue-200',
  member: 'bg-gray-100 text-gray-800 border-gray-200',
};

const ROLE_ICONS = {
  owner: CrownIcon,
  admin: ShieldCheckIcon,
  moderator: UserGroupIcon,
  member: UserIcon,
};

export default function MemberManagement({ 
  communityId, 
  currentUserRole, 
  canManageMembers = false 
}: MemberManagementProps) {
  const [members, setMembers] = useState<CommunityMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalMembers, setTotalMembers] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRole, setSelectedRole] = useState<string>('all');

  const fetchMembers = async (page = 1, role = 'all') => {
    try {
      setLoading(true);
      const limit = 20;
      const offset = (page - 1) * limit;
      
      let url = `/api/communities/${communityId}/members?limit=${limit}&offset=${offset}`;
      if (role !== 'all') {
        url += `&role=${role}`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (response.ok) {
        setMembers(data.members);
        setTotalMembers(data.total);
        setError(null);
      } else {
        setError(data.message || 'Failed to fetch members');
      }
    } catch (err) {
      setError('Failed to fetch members');
      console.error('Error fetching members:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers(currentPage, selectedRole);
  }, [communityId, currentPage, selectedRole]);

  const handleRoleFilter = (role: string) => {
    setSelectedRole(role);
    setCurrentPage(1);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getRoleIcon = (role: string) => {
    const IconComponent = ROLE_ICONS[role as keyof typeof ROLE_ICONS] || UserIcon;
    return <IconComponent className="h-4 w-4" />;
  };

  if (loading && members.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserGroupIcon className="h-5 w-5" />
            Community Members
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserGroupIcon className="h-5 w-5" />
            Community Members
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => fetchMembers(currentPage, selectedRole)}>
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <UserGroupIcon className="h-5 w-5" />
            Community Members ({totalMembers})
          </CardTitle>
          {canManageMembers && (
            <Button size="sm" className="flex items-center gap-2">
              <UserPlusIcon className="h-4 w-4" />
              Add Member
            </Button>
          )}
        </div>
        
        {/* Role Filter */}
        <div className="flex gap-2 mt-4">
          <Button
            variant={selectedRole === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleRoleFilter('all')}
          >
            All
          </Button>
          {['owner', 'admin', 'moderator', 'member'].map((role) => (
            <Button
              key={role}
              variant={selectedRole === role ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleRoleFilter(role)}
              className="capitalize"
            >
              {role}
            </Button>
          ))}
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {members.map((member) => (
            <div
              key={member._id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
            >
              <div className="flex items-center gap-4">
                <div className="relative">
                  {member.user.image ? (
                    <img
                      src={member.user.image}
                      alt={member.user.name}
                      className="h-10 w-10 rounded-full"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <UserIcon className="h-5 w-5 text-gray-500" />
                    </div>
                  )}
                  {member.user.isVerified && (
                    <div className="absolute -top-1 -right-1 h-4 w-4 bg-blue-500 rounded-full flex items-center justify-center">
                      <ShieldCheckIcon className="h-3 w-3 text-white" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{member.user.name}</h3>
                    <Badge className={ROLE_COLORS[member.role]}>
                      <span className="flex items-center gap-1">
                        {getRoleIcon(member.role)}
                        {member.role}
                      </span>
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-500">
                    Joined {formatDate(member.joinedAt)} • {member.postCount} posts • {member.commentCount} comments
                  </div>
                  {member.lastActive && (
                    <div className="text-xs text-gray-400">
                      Last active {formatDate(member.lastActive)}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {member.status !== 'active' && (
                  <Badge variant="outline" className="text-xs">
                    {member.status}
                  </Badge>
                )}
                
                {canManageMembers && member.role !== 'owner' && (
                  <Button variant="ghost" size="sm">
                    <EllipsisVerticalIcon className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {/* Pagination */}
        {totalMembers > 20 && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t">
            <div className="text-sm text-gray-500">
              Showing {((currentPage - 1) * 20) + 1} to {Math.min(currentPage * 20, totalMembers)} of {totalMembers} members
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage * 20 >= totalMembers}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
