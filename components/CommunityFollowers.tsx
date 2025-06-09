"use client";

import { useState, useEffect } from 'react';
import { AnimatedTooltip } from '@/components/ui/animated-tooltip';
import { Users } from 'lucide-react';

interface CommunityFollower {
  id: number;
  name: string;
  designation: string;
  image: string;
}

interface CommunityFollowersProps {
  startupId: string;
  className?: string;
}

export default function CommunityFollowers({ startupId, className }: CommunityFollowersProps) {
  const [followers, setFollowers] = useState<CommunityFollower[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalFollowers, setTotalFollowers] = useState(0);

  // Mock data for demonstration - in a real app, this would come from your API
  const generateMockFollowers = (): CommunityFollower[] => {
    const mockUsers = [
      {
        id: 1,
        name: "Alex Chen",
        designation: "Product Manager",
        image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face"
      },
      {
        id: 2,
        name: "Sarah Johnson",
        designation: "UX Designer",
        image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face"
      },
      {
        id: 3,
        name: "Michael Rodriguez",
        designation: "Software Engineer",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face"
      },
      {
        id: 4,
        name: "Emily Davis",
        designation: "Marketing Lead",
        image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face"
      },
      {
        id: 5,
        name: "David Kim",
        designation: "Data Scientist",
        image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face"
      },
      {
        id: 6,
        name: "Lisa Wang",
        designation: "Business Analyst",
        image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face"
      },
      {
        id: 7,
        name: "James Wilson",
        designation: "DevOps Engineer",
        image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop&crop=face"
      },
      {
        id: 8,
        name: "Maria Garcia",
        designation: "Content Creator",
        image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face"
      }
    ];

    // Simulate different numbers of followers for different startups
    const followerCount = Math.floor(Math.random() * 8) + 1;
    return mockUsers.slice(0, followerCount);
  };

  useEffect(() => {
    const fetchCommunityFollowers = async () => {
      setIsLoading(true);
      
      try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // In a real implementation, you would fetch from your API:
        // const response = await fetch(`/api/communities/followers?startupId=${startupId}`);
        // const data = await response.json();
        
        const mockFollowers = generateMockFollowers();
        setFollowers(mockFollowers);
        setTotalFollowers(mockFollowers.length + Math.floor(Math.random() * 50)); // Add some extra followers not shown
      } catch (error) {
        console.error('Failed to fetch community followers:', error);
        setFollowers([]);
        setTotalFollowers(0);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCommunityFollowers();
  }, [startupId]);

  if (isLoading) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Users className="size-3 text-muted-foreground" />
        <span className="text-xs text-muted-foreground">Loading...</span>
      </div>
    );
  }

  if (followers.length === 0) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Users className="size-3 text-muted-foreground" />
        <span className="text-xs text-muted-foreground">No community</span>
      </div>
    );
  }

  const displayFollowers = followers.slice(0, 3); // Show max 3 avatars for compact design
  const remainingCount = Math.max(0, totalFollowers - 3);

  return (
    <div className={`flex items-center justify-between ${className}`}>
      <div className="flex items-center gap-1">
        <Users className="size-3 text-muted-foreground" />
        <span className="text-xs text-muted-foreground">Community</span>
      </div>

      <div className="flex items-center gap-1">
        <AnimatedTooltip items={displayFollowers} className="flex items-center -space-x-1" />

        {remainingCount > 0 && (
          <div className="flex items-center justify-center h-6 w-6 rounded-full bg-muted border border-background text-[10px] font-medium text-muted-foreground ml-1">
            +{remainingCount}
          </div>
        )}

        <span className="text-xs text-muted-foreground ml-2">
          {totalFollowers}
        </span>
      </div>
    </div>
  );
}
