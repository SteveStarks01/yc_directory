'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { 
  ChevronDownIcon,
  ClockIcon,
  FireIcon,
  ChatBubbleLeftIcon,
  HeartIcon,
  ArrowsUpDownIcon
} from '@heroicons/react/24/outline';

// Sort options with metadata
export const COMMENT_SORT_OPTIONS = {
  newest: {
    value: 'newest',
    label: 'Newest First',
    description: 'Most recent comments first',
    icon: ClockIcon,
    apiParam: 'createdAt desc',
  },
  oldest: {
    value: 'oldest',
    label: 'Oldest First', 
    description: 'Original comments first',
    icon: ClockIcon,
    apiParam: 'createdAt asc',
  },
  mostReactions: {
    value: 'mostReactions',
    label: 'Most Reactions',
    description: 'Comments with most reactions first',
    icon: HeartIcon,
    apiParam: 'reactionCount desc',
  },
  mostReplies: {
    value: 'mostReplies',
    label: 'Most Replies',
    description: 'Comments with most replies first',
    icon: ChatBubbleLeftIcon,
    apiParam: 'replyCount desc',
  },
  trending: {
    value: 'trending',
    label: 'Trending',
    description: 'Comments with recent activity',
    icon: FireIcon,
    apiParam: 'lastActivity desc',
  },
} as const;

export type CommentSortOption = keyof typeof COMMENT_SORT_OPTIONS;

interface CommentSortControlsProps {
  /** Currently selected sort option */
  currentSort: CommentSortOption;
  /** Total number of comments */
  commentCount?: number;
  /** Whether sorting is in progress */
  isLoading?: boolean;
  /** Whether to show comment count */
  showCount?: boolean;
  /** Whether to show sort description */
  showDescription?: boolean;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Callback when sort option changes */
  onSortChange: (sortOption: CommentSortOption) => void;
  /** Custom className */
  className?: string;
}

export default function CommentSortControls({
  currentSort,
  commentCount = 0,
  isLoading = false,
  showCount = true,
  showDescription = false,
  size = 'md',
  onSortChange,
  className,
}: CommentSortControlsProps) {
  const currentSortOption = COMMENT_SORT_OPTIONS[currentSort];

  // Size classes
  const sizeClasses = {
    sm: {
      button: 'h-8 px-3 text-sm',
      icon: 'w-3 h-3',
      badge: 'text-xs px-2 py-0.5',
    },
    md: {
      button: 'h-9 px-4 text-sm',
      icon: 'w-4 h-4',
      badge: 'text-sm px-2.5 py-0.5',
    },
    lg: {
      button: 'h-10 px-5 text-base',
      icon: 'w-5 h-5',
      badge: 'text-base px-3 py-1',
    },
  };

  const classes = sizeClasses[size];

  return (
    <div className={cn('flex items-center justify-between', className)}>
      {/* Comment count and current sort info */}
      <div className="flex items-center gap-3">
        {showCount && (
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={classes.badge}>
              {commentCount} {commentCount === 1 ? 'comment' : 'comments'}
            </Badge>
            {commentCount > 0 && (
              <span className="text-sm text-gray-500">•</span>
            )}
          </div>
        )}

        {showDescription && currentSortOption && (
          <div className="flex items-center gap-2">
            <currentSortOption.icon className={cn('text-gray-400', classes.icon)} />
            <span className="text-sm text-gray-600">
              {currentSortOption.description}
            </span>
          </div>
        )}
      </div>

      {/* Sort dropdown */}
      {commentCount > 1 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              disabled={isLoading}
              className={cn(
                'flex items-center gap-2 transition-all duration-200',
                classes.button,
                isLoading && 'opacity-50 cursor-not-allowed'
              )}
            >
              {isLoading ? (
                <div className={cn('animate-spin rounded-full border-2 border-gray-300 border-t-blue-600', classes.icon)} />
              ) : (
                <currentSortOption.icon className={classes.icon} />
              )}
              <span>{currentSortOption.label}</span>
              <ChevronDownIcon className={cn('text-gray-400', classes.icon)} />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-56">
            {Object.values(COMMENT_SORT_OPTIONS).map((option) => {
              const isSelected = option.value === currentSort;
              const IconComponent = option.icon;

              return (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => onSortChange(option.value)}
                  disabled={isLoading}
                  className={cn(
                    'flex items-start gap-3 py-3 cursor-pointer',
                    isSelected && 'bg-blue-50 text-blue-700'
                  )}
                >
                  <IconComponent className={cn(
                    'mt-0.5 flex-shrink-0',
                    classes.icon,
                    isSelected ? 'text-blue-600' : 'text-gray-400'
                  )} />
                  <div className="flex-1 min-w-0">
                    <div className={cn(
                      'font-medium',
                      isSelected && 'text-blue-700'
                    )}>
                      {option.label}
                      {isSelected && (
                        <Badge variant="secondary" className="ml-2 text-xs">
                          Current
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {option.description}
                    </div>
                  </div>
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {/* Loading indicator for when there are few comments */}
      {isLoading && commentCount <= 1 && (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <div className={cn('animate-spin rounded-full border-2 border-gray-300 border-t-blue-600', classes.icon)} />
          <span>Sorting comments...</span>
        </div>
      )}
    </div>
  );
}

/**
 * Get API query parameters for a sort option
 */
export function getSortApiParams(sortOption: CommentSortOption): {
  orderBy: string;
  direction: 'asc' | 'desc';
} {
  const option = COMMENT_SORT_OPTIONS[sortOption];
  const [field, direction] = option.apiParam.split(' ');
  
  return {
    orderBy: field,
    direction: direction as 'asc' | 'desc',
  };
}

/**
 * Get the default sort option
 */
export function getDefaultSort(): CommentSortOption {
  return 'newest';
}

// Export types for use in other components
export type { CommentSortControlsProps };
