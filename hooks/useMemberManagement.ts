import { useState, useCallback } from 'react';

interface MemberManagementHook {
  addMember: (communityId: string, userId: string, role?: string, inviteMessage?: string) => Promise<any>;
  updateMember: (communityId: string, memberId: string, updates: any) => Promise<any>;
  removeMember: (communityId: string, memberId: string) => Promise<any>;
  getMember: (communityId: string, memberId: string) => Promise<any>;
  loading: boolean;
  error: string | null;
}

export function useMemberManagement(): MemberManagementHook {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addMember = useCallback(async (
    communityId: string, 
    userId: string, 
    role = 'member', 
    inviteMessage?: string
  ) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/communities/${communityId}/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          role,
          inviteMessage,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to add member');
      }

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add member';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateMember = useCallback(async (
    communityId: string, 
    memberId: string, 
    updates: {
      role?: string;
      status?: string;
      moderationNote?: {
        note: string;
        type: 'warning' | 'suspension' | 'ban' | 'general';
      };
    }
  ) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/communities/${communityId}/members/${memberId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update member');
      }

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update member';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const removeMember = useCallback(async (communityId: string, memberId: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/communities/${communityId}/members/${memberId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to remove member');
      }

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove member';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getMember = useCallback(async (communityId: string, memberId: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/communities/${communityId}/members/${memberId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch member');
      }

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch member';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    addMember,
    updateMember,
    removeMember,
    getMember,
    loading,
    error,
  };
}

// Helper function to check if user has specific permission
export function hasPermission(
  userRole: string,
  targetRole: string,
  action: 'add' | 'update' | 'remove'
): boolean {
  const roleHierarchy = {
    owner: 4,
    admin: 3,
    moderator: 2,
    member: 1,
  };

  const userLevel = roleHierarchy[userRole as keyof typeof roleHierarchy] || 0;
  const targetLevel = roleHierarchy[targetRole as keyof typeof roleHierarchy] || 0;

  switch (action) {
    case 'add':
      // Owners and admins can add anyone, moderators can add members only
      return userLevel >= 3 || (userLevel === 2 && targetLevel === 1);
    
    case 'update':
    case 'remove':
      // Can only modify users with lower or equal role (except owners can modify anyone)
      return userLevel === 4 || (userLevel >= 3 && userLevel > targetLevel);
    
    default:
      return false;
  }
}

// Helper function to get available roles for a user
export function getAvailableRoles(userRole: string): string[] {
  switch (userRole) {
    case 'owner':
      return ['owner', 'admin', 'moderator', 'member'];
    case 'admin':
      return ['admin', 'moderator', 'member'];
    case 'moderator':
      return ['member'];
    default:
      return [];
  }
}
