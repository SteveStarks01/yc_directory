'use client';

import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// Post type definitions with enhanced metadata
export const POST_TYPES = {
  text: {
    value: 'text',
    label: 'Text Post',
    emoji: '📝',
    description: 'Share thoughts, ideas, or general updates',
    color: 'bg-gray-100 text-gray-800 border-gray-300',
    placeholder: 'What\'s on your mind? Share your thoughts...',
  },
  update: {
    value: 'update',
    label: 'Update',
    emoji: '📢',
    description: 'Share progress, news, or important information',
    color: 'bg-blue-100 text-blue-800 border-blue-300',
    placeholder: 'Share an update about your progress or recent developments...',
  },
  milestone: {
    value: 'milestone',
    label: 'Milestone',
    emoji: '🎉',
    description: 'Celebrate achievements and important milestones',
    color: 'bg-green-100 text-green-800 border-green-300',
    placeholder: 'Celebrate a milestone or achievement...',
  },
  question: {
    value: 'question',
    label: 'Question',
    emoji: '❓',
    description: 'Ask for advice, feedback, or community input',
    color: 'bg-purple-100 text-purple-800 border-purple-300',
    placeholder: 'Ask a question to get advice or feedback from the community...',
  },
  announcement: {
    value: 'announcement',
    label: 'Announcement',
    emoji: '📣',
    description: 'Make important announcements to the community',
    color: 'bg-orange-100 text-orange-800 border-orange-300',
    placeholder: 'Make an important announcement to the community...',
  },
} as const;

export type PostType = keyof typeof POST_TYPES;

interface PostTypeSelectorProps {
  /** Currently selected post type */
  value: PostType;
  /** Callback when post type changes */
  onValueChange: (value: PostType) => void;
  /** Whether the selector is disabled */
  disabled?: boolean;
  /** Show description below selector */
  showDescription?: boolean;
  /** Custom className */
  className?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
}

export default function PostTypeSelector({
  value,
  onValueChange,
  disabled = false,
  showDescription = true,
  className,
  size = 'md',
}: PostTypeSelectorProps) {
  const selectedType = POST_TYPES[value];

  const sizeClasses = {
    sm: 'h-8 text-sm',
    md: 'h-10 text-base',
    lg: 'h-12 text-lg',
  };

  return (
    <div className={cn('space-y-2', className)}>
      {/* Post Type Selector */}
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-gray-700 min-w-fit">
          Post Type:
        </label>
        <Select 
          value={value} 
          onValueChange={onValueChange}
          disabled={disabled}
        >
          <SelectTrigger className={cn('w-full max-w-xs', sizeClasses[size])}>
            <SelectValue>
              <div className="flex items-center gap-2">
                <span className="text-lg">{selectedType.emoji}</span>
                <span>{selectedType.label}</span>
              </div>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {Object.values(POST_TYPES).map((type) => (
              <SelectItem 
                key={type.value} 
                value={type.value}
                className="cursor-pointer"
              >
                <div className="flex items-center gap-3 py-1">
                  <span className="text-lg">{type.emoji}</span>
                  <div className="flex flex-col">
                    <span className="font-medium">{type.label}</span>
                    <span className="text-xs text-gray-500 max-w-xs">
                      {type.description}
                    </span>
                  </div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Selected Type Badge and Description */}
      {showDescription && (
        <div className="flex items-start gap-3">
          <Badge 
            variant="outline" 
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium',
              selectedType.color
            )}
          >
            <span className="text-base">{selectedType.emoji}</span>
            <span>{selectedType.label}</span>
          </Badge>
          <p className="text-sm text-gray-600 leading-relaxed">
            {selectedType.description}
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * Get placeholder text for a specific post type
 */
export function getPostTypePlaceholder(postType: PostType): string {
  return POST_TYPES[postType]?.placeholder || POST_TYPES.text.placeholder;
}

/**
 * Get color classes for a specific post type
 */
export function getPostTypeColor(postType: PostType): string {
  return POST_TYPES[postType]?.color || POST_TYPES.text.color;
}

/**
 * Get emoji for a specific post type
 */
export function getPostTypeEmoji(postType: PostType): string {
  return POST_TYPES[postType]?.emoji || POST_TYPES.text.emoji;
}

// Export types for use in other components
export type { PostTypeSelectorProps };
