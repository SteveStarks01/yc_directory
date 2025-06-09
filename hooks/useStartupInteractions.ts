import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useToast } from '@/hooks/use-toast';

interface StartupInteractions {
  followCount: number;
  loveCount: number;
  isFollowing: boolean;
  isLoved: boolean;
}

interface UseStartupInteractionsReturn extends StartupInteractions {
  isLoading: boolean;
  isFollowLoading: boolean;
  isLoveLoading: boolean;
  toggleFollow: () => Promise<void>;
  toggleLove: () => Promise<void>;
  refreshInteractions: () => Promise<void>;
}

export function useStartupInteractions(startupId: string): UseStartupInteractionsReturn {
  const { user, isLoaded, isSignedIn } = useUser();
  const { toast } = useToast();
  
  const [interactions, setInteractions] = useState<StartupInteractions>({
    followCount: 0,
    loveCount: 0,
    isFollowing: false,
    isLoved: false,
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [isLoveLoading, setIsLoveLoading] = useState(false);

  const fetchInteractions = async () => {
    if (!startupId) return;
    
    try {
      const [followResponse, loveResponse] = await Promise.all([
        fetch(`/api/startups/${startupId}/follow`),
        fetch(`/api/startups/${startupId}/love`),
      ]);

      if (followResponse.ok && loveResponse.ok) {
        const [followData, loveData] = await Promise.all([
          followResponse.json(),
          loveResponse.json(),
        ]);

        setInteractions({
          followCount: followData.followCount || 0,
          loveCount: loveData.loveCount || 0,
          isFollowing: followData.isFollowing || false,
          isLoved: loveData.isLoved || false,
        });
      }
    } catch (error) {
      console.error('Error fetching interactions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFollow = async () => {
    if (!isLoaded || !isSignedIn || !user) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to follow startups',
        variant: 'destructive',
      });
      return;
    }

    setIsFollowLoading(true);
    
    try {
      const method = interactions.isFollowing ? 'DELETE' : 'POST';
      const response = await fetch(`/api/startups/${startupId}/follow`, {
        method,
      });

      if (response.ok) {
        setInteractions(prev => ({
          ...prev,
          isFollowing: !prev.isFollowing,
          followCount: prev.isFollowing 
            ? Math.max(0, prev.followCount - 1)
            : prev.followCount + 1,
        }));

        toast({
          title: interactions.isFollowing ? 'Unfollowed' : 'Following',
          description: interactions.isFollowing 
            ? 'You are no longer following this startup'
            : 'You are now following this startup',
        });
      } else {
        const errorData = await response.json();
        toast({
          title: 'Error',
          description: errorData.error || 'Failed to update follow status',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
      toast({
        title: 'Error',
        description: 'Network error. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsFollowLoading(false);
    }
  };

  const toggleLove = async () => {
    if (!isLoaded || !isSignedIn || !user) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to love startups',
        variant: 'destructive',
      });
      return;
    }

    setIsLoveLoading(true);
    
    try {
      const method = interactions.isLoved ? 'DELETE' : 'POST';
      const response = await fetch(`/api/startups/${startupId}/love`, {
        method,
      });

      if (response.ok) {
        setInteractions(prev => ({
          ...prev,
          isLoved: !prev.isLoved,
          loveCount: prev.isLoved 
            ? Math.max(0, prev.loveCount - 1)
            : prev.loveCount + 1,
        }));

        toast({
          title: interactions.isLoved ? 'Unloved' : 'Loved',
          description: interactions.isLoved 
            ? 'You removed your love from this startup'
            : 'You loved this startup',
        });
      } else {
        const errorData = await response.json();
        toast({
          title: 'Error',
          description: errorData.error || 'Failed to update love status',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error toggling love:', error);
      toast({
        title: 'Error',
        description: 'Network error. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoveLoading(false);
    }
  };

  const refreshInteractions = async () => {
    setIsLoading(true);
    await fetchInteractions();
  };

  useEffect(() => {
    if (startupId) {
      fetchInteractions();
    }
  }, [startupId, isLoaded]);

  return {
    ...interactions,
    isLoading,
    isFollowLoading,
    isLoveLoading,
    toggleFollow,
    toggleLove,
    refreshInteractions,
  };
}
