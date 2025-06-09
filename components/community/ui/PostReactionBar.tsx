'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { cn } from '@/lib/utils';
import ReactionButton, { REACTION_TYPES, ReactionType } from './ReactionButton';

interface ReactionData {
  [key: string]: number;
}

interface PostReactionBarProps {
  /** Post ID */
  postId: string;
  /** Initial reaction counts */
  initialReactions?: ReactionData;
  /** Current user's reaction */
  userReaction?: ReactionType | null;
  /** Whether to show all reaction types or only active ones */
  showAllTypes?: boolean;
  /** Maximum number of reaction types to display */
  maxVisible?: number;
  /** Size of reaction buttons */
  size?: 'sm' | 'md' | 'lg';
  /** Whether the component is in a loading state */
  isLoading?: boolean;
  /** Custom className */
  className?: string;
  /** Callback when reactions are updated */
  onReactionUpdate?: (reactions: ReactionData, userReaction: ReactionType | null) => void;
}

export default function PostReactionBar({
  postId,
  initialReactions = {},
  userReaction = null,
  showAllTypes = false,
  maxVisible = 8,
  size = 'md',
  isLoading = false,
  className,
  onReactionUpdate,
}: PostReactionBarProps) {
  const { data: session } = useSession();
  const [reactions, setReactions] = useState<ReactionData>(initialReactions);
  const [currentUserReaction, setCurrentUserReaction] = useState<ReactionType | null>(userReaction);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch latest reaction data
  const fetchReactions = async () => {
    if (!postId) return;
    
    setIsRefreshing(true);
    try {
      const url = new URL(`/api/communities/posts/${postId}/reactions`, window.location.origin);
      if (session?.user?.id) {
        url.searchParams.set('userId', session.user.id);
      }

      const response = await fetch(url.toString());
      if (response.ok) {
        const data = await response.json();
        setReactions(data.reactions || {});
        setCurrentUserReaction(data.userReaction || null);
        
        // Notify parent component
        onReactionUpdate?.(data.reactions || {}, data.userReaction || null);
      }
    } catch (error) {
      console.error('Error fetching reactions:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Fetch reactions on mount and when postId changes
  useEffect(() => {
    fetchReactions();
  }, [postId, session?.user?.id]);

  // Handle individual reaction updates
  const handleReactionClick = async (reactionType: ReactionType, action: 'add' | 'remove') => {
    // Update local state optimistically
    setReactions(prev => {
      const newReactions = { ...prev };
      if (action === 'add') {
        newReactions[reactionType] = (newReactions[reactionType] || 0) + 1;
      } else {
        newReactions[reactionType] = Math.max((newReactions[reactionType] || 0) - 1, 0);
        if (newReactions[reactionType] === 0) {
          delete newReactions[reactionType];
        }
      }
      return newReactions;
    });

    // Update user's current reaction
    if (action === 'add') {
      // Remove previous reaction count if switching
      if (currentUserReaction && currentUserReaction !== reactionType) {
        setReactions(prev => {
          const newReactions = { ...prev };
          newReactions[currentUserReaction] = Math.max((newReactions[currentUserReaction] || 0) - 1, 0);
          if (newReactions[currentUserReaction] === 0) {
            delete newReactions[currentUserReaction];
          }
          return newReactions;
        });
      }
      setCurrentUserReaction(reactionType);
    } else {
      setCurrentUserReaction(null);
    }

    // Refresh data from server after a short delay to ensure consistency
    setTimeout(fetchReactions, 1000);
  };

  // Determine which reactions to show
  const visibleReactions = useMemo(() => {
    const allTypes = Object.keys(REACTION_TYPES) as ReactionType[];
    
    if (showAllTypes) {
      return allTypes.slice(0, maxVisible);
    }

    // Show reactions that have counts or user's current reaction
    const activeReactions = allTypes.filter(type => 
      reactions[type] > 0 || currentUserReaction === type
    );

    // If no active reactions, show the most common ones
    if (activeReactions.length === 0) {
      return ['like', 'heart', 'fire', 'celebrate'].slice(0, maxVisible) as ReactionType[];
    }

    // Sort by count (descending) and take up to maxVisible
    return activeReactions
      .sort((a, b) => (reactions[b] || 0) - (reactions[a] || 0))
      .slice(0, maxVisible);
  }, [reactions, currentUserReaction, showAllTypes, maxVisible]);

  // Calculate total reaction count
  const totalReactions = Object.values(reactions).reduce((sum, count) => sum + count, 0);

  if (visibleReactions.length === 0 && !showAllTypes) {
    return null;
  }

  return (
    <div 
      className={cn(
        'flex items-center gap-1 flex-wrap',
        className
      )}
      role="group"
      aria-label="Post reactions"
    >
      {/* Reaction buttons */}
      {visibleReactions.map((reactionType) => (
        <ReactionButton
          key={reactionType}
          reactionType={reactionType}
          count={reactions[reactionType] || 0}
          isActive={currentUserReaction === reactionType}
          isLoading={isLoading || isRefreshing}
          targetId={postId}
          targetType="post"
          size={size}
          onReactionClick={handleReactionClick}
          showZeroCount={showAllTypes}
          className="transition-all duration-200 hover:shadow-sm"
        />
      ))}

      {/* Total count display for mobile/compact view */}
      {totalReactions > 0 && size === 'sm' && (
        <div 
          className="text-xs text-gray-500 ml-2 px-2 py-1 bg-gray-50 rounded-full"
          aria-label={`${totalReactions} total reactions`}
        >
          {totalReactions}
        </div>
      )}

      {/* Loading indicator */}
      {(isLoading || isRefreshing) && (
        <div 
          className="flex items-center justify-center w-8 h-8"
          aria-label="Loading reactions"
        >
          <div className="w-4 h-4 border border-gray-300 border-t-blue-600 rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}

// Export types for use in other components
export type { PostReactionBarProps, ReactionData };
