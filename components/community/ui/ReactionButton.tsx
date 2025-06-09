'use client';

import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useSession } from 'next-auth/react';
import { useToast } from '@/hooks/use-toast';

// Reaction type definitions with emojis
export const REACTION_TYPES = {
  like: { emoji: '👍', label: 'Like' },
  heart: { emoji: '❤️', label: 'Love' },
  fire: { emoji: '🔥', label: 'Fire' },
  idea: { emoji: '💡', label: 'Idea' },
  celebrate: { emoji: '🎉', label: 'Celebrate' },
  clap: { emoji: '👏', label: 'Clap' },
  rocket: { emoji: '🚀', label: 'Rocket' },
  hundred: { emoji: '💯', label: 'Hundred' },
} as const;

export type ReactionType = keyof typeof REACTION_TYPES;

interface ReactionButtonProps {
  /** The type of reaction */
  reactionType: ReactionType;
  /** Current count for this reaction */
  count: number;
  /** Whether the current user has reacted with this type */
  isActive: boolean;
  /** Whether the button is in a loading state */
  isLoading?: boolean;
  /** Whether the button is disabled */
  disabled?: boolean;
  /** Target ID (post or comment) */
  targetId: string;
  /** Target type (post or comment) */
  targetType: 'post' | 'comment';
  /** Callback when reaction is clicked */
  onReactionClick?: (reactionType: ReactionType, action: 'add' | 'remove') => void;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Show count even when zero */
  showZeroCount?: boolean;
  /** Custom className */
  className?: string;
}

export default function ReactionButton({
  reactionType,
  count,
  isActive,
  isLoading = false,
  disabled = false,
  targetId,
  targetType,
  onReactionClick,
  size = 'md',
  showZeroCount = false,
  className,
}: ReactionButtonProps) {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [optimisticCount, setOptimisticCount] = useState(count);
  const [optimisticActive, setOptimisticActive] = useState(isActive);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reaction = REACTION_TYPES[reactionType];

  // Handle reaction click with optimistic updates
  const handleClick = useCallback(async () => {
    if (!session?.user?.id) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to react to posts',
        variant: 'destructive',
      });
      return;
    }

    if (disabled || isSubmitting) return;

    const action = optimisticActive ? 'remove' : 'add';
    const newCount = optimisticActive ? optimisticCount - 1 : optimisticCount + 1;
    const newActive = !optimisticActive;

    // Optimistic update
    setOptimisticCount(newCount);
    setOptimisticActive(newActive);
    setIsSubmitting(true);

    try {
      const endpoint = targetType === 'post' 
        ? `/api/communities/posts/${targetId}/reactions`
        : `/api/communities/comments/${targetId}/reactions`;

      const response = await fetch(endpoint, {
        method: action === 'remove' ? 'DELETE' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: action === 'add' ? JSON.stringify({ reactionType }) : undefined,
      });

      if (!response.ok) {
        throw new Error('Failed to update reaction');
      }

      const result = await response.json();
      
      // Call parent callback if provided
      onReactionClick?.(reactionType, action);

      // Show success feedback for significant actions
      if (action === 'add') {
        toast({
          title: 'Reaction added',
          description: `You reacted with ${reaction.label}`,
          duration: 2000,
        });
      }

    } catch (error) {
      console.error('Error updating reaction:', error);
      
      // Revert optimistic update on error
      setOptimisticCount(count);
      setOptimisticActive(isActive);
      
      toast({
        title: 'Error',
        description: 'Failed to update reaction. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [
    session,
    disabled,
    isSubmitting,
    optimisticActive,
    optimisticCount,
    targetId,
    targetType,
    reactionType,
    onReactionClick,
    reaction.label,
    toast,
    count,
    isActive,
  ]);

  // Size variants
  const sizeClasses = {
    sm: 'h-7 px-2 text-xs gap-1',
    md: 'h-8 px-3 text-sm gap-1.5',
    lg: 'h-9 px-4 text-base gap-2',
  };

  // Show count if greater than 0 or showZeroCount is true
  const shouldShowCount = optimisticCount > 0 || showZeroCount;

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleClick}
      disabled={disabled || isLoading || isSubmitting}
      className={cn(
        'transition-all duration-200 hover:scale-105',
        sizeClasses[size],
        optimisticActive && 'bg-blue-50 text-blue-600 border-blue-200',
        isSubmitting && 'opacity-50 cursor-not-allowed',
        className
      )}
      aria-label={`${reaction.label} reaction${optimisticActive ? ' (active)' : ''}`}
      aria-pressed={optimisticActive}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      <span 
        className={cn(
          'transition-transform duration-200',
          optimisticActive && 'scale-110',
          isSubmitting && 'animate-pulse'
        )}
        role="img"
        aria-label={reaction.label}
      >
        {reaction.emoji}
      </span>
      
      {shouldShowCount && (
        <span 
          className={cn(
            'font-medium transition-colors duration-200',
            optimisticActive && 'text-blue-600'
          )}
          aria-label={`${optimisticCount} ${reaction.label} reactions`}
        >
          {optimisticCount}
        </span>
      )}
      
      {/* Loading indicator */}
      {(isLoading || isSubmitting) && (
        <div 
          className="absolute inset-0 flex items-center justify-center bg-white/50 rounded-md"
          aria-hidden="true"
        >
          <div className="w-3 h-3 border border-gray-300 border-t-blue-600 rounded-full animate-spin" />
        </div>
      )}
    </Button>
  );
}

// Export types for use in other components
export type { ReactionButtonProps };
