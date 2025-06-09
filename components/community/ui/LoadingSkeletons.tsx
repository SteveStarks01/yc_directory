'use client';

import React from 'react';
import { cn } from '@/lib/utils';

// Base skeleton component
interface SkeletonProps {
  className?: string;
  children?: React.ReactNode;
}

function Skeleton({ className, children, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-gray-200',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// Post card skeleton
export function PostCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('bg-white rounded-lg border border-gray-200 p-6 space-y-4', className)}>
      {/* Header */}
      <div className="flex items-start gap-3">
        <Skeleton className="w-10 h-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-16" />
          </div>
          <Skeleton className="h-3 w-32" />
        </div>
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>

      {/* Content */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-4 w-3/5" />
      </div>

      {/* Tags */}
      <div className="flex gap-2">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-14 rounded-full" />
      </div>

      {/* Reactions */}
      <div className="flex items-center gap-2 pt-3 border-t">
        <Skeleton className="h-8 w-12 rounded-md" />
        <Skeleton className="h-8 w-12 rounded-md" />
        <Skeleton className="h-8 w-12 rounded-md" />
        <Skeleton className="h-8 w-12 rounded-md" />
      </div>

      {/* Stats */}
      <div className="flex items-center gap-6 text-sm">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-14" />
      </div>
    </div>
  );
}

// Comment skeleton
export function CommentSkeleton({ 
  className,
  nestingLevel = 0 
}: { 
  className?: string;
  nestingLevel?: number;
}) {
  const marginLeft = nestingLevel * 24;

  return (
    <div 
      className={cn('space-y-3', className)}
      style={{ marginLeft: `${marginLeft}px` }}
    >
      <div className="flex items-start gap-3">
        <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
        <div className="flex-1 space-y-2">
          {/* Author info */}
          <div className="flex items-center gap-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-3 w-16" />
          </div>
          
          {/* Comment content */}
          <div className="bg-gray-50 rounded-lg p-3 space-y-2">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-4/5" />
          </div>
          
          {/* Actions */}
          <div className="flex items-center gap-3">
            <Skeleton className="h-6 w-10" />
            <Skeleton className="h-6 w-10" />
            <Skeleton className="h-6 w-12" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Comment list skeleton
export function CommentListSkeleton({ 
  count = 3,
  className 
}: { 
  count?: number;
  className?: string;
}) {
  return (
    <div className={cn('space-y-4', className)}>
      {Array.from({ length: count }).map((_, index) => (
        <CommentSkeleton 
          key={index}
          nestingLevel={Math.floor(Math.random() * 3)}
        />
      ))}
    </div>
  );
}

// Post list skeleton
export function PostListSkeleton({ 
  count = 5,
  className 
}: { 
  count?: number;
  className?: string;
}) {
  return (
    <div className={cn('space-y-6', className)}>
      {Array.from({ length: count }).map((_, index) => (
        <PostCardSkeleton key={index} />
      ))}
    </div>
  );
}

// Community header skeleton
export function CommunityHeaderSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('bg-white rounded-lg border border-gray-200 p-6', className)}>
      <div className="flex items-start gap-4">
        <Skeleton className="w-16 h-16 rounded-lg" />
        <div className="flex-1 space-y-3">
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
          <div className="flex items-center gap-4">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-18" />
          </div>
        </div>
        <Skeleton className="h-10 w-24 rounded-md" />
      </div>
    </div>
  );
}

// Post composer skeleton
export function PostComposerSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('bg-white rounded-lg border border-gray-200 p-6 space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-16" />
      </div>

      {/* Post type selector */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-10 w-48" />
      </div>

      {/* Content area */}
      <div className="space-y-2">
        <Skeleton className="h-32 w-full rounded-md" />
        <div className="flex justify-between items-center">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>

      {/* Tags */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-16" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-32 rounded-md" />
          <Skeleton className="h-8 w-16 rounded-md" />
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Skeleton className="h-10 w-20 rounded-md" />
        <Skeleton className="h-10 w-16 rounded-md" />
      </div>
    </div>
  );
}

// Reaction bar skeleton
export function ReactionBarSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      {Array.from({ length: 4 }).map((_, index) => (
        <Skeleton key={index} className="h-8 w-12 rounded-md" />
      ))}
    </div>
  );
}

// Typing indicator skeleton
export function TypingIndicatorSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2', className)}>
      <div className="flex gap-1">
        <Skeleton className="w-4 h-4 rounded-full" />
        <Skeleton className="w-4 h-4 rounded-full" />
      </div>
      <Skeleton className="h-3 w-24" />
      <div className="flex gap-0.5">
        <Skeleton className="w-1 h-1 rounded-full" />
        <Skeleton className="w-1 h-1 rounded-full" />
        <Skeleton className="w-1 h-1 rounded-full" />
      </div>
    </div>
  );
}

// Generic content skeleton
export function ContentSkeleton({ 
  lines = 3,
  className 
}: { 
  lines?: number;
  className?: string;
}) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton 
          key={index}
          className={cn(
            'h-4',
            index === lines - 1 ? 'w-3/4' : 'w-full'
          )}
        />
      ))}
    </div>
  );
}

// Loading state wrapper
export function LoadingWrapper({ 
  isLoading,
  skeleton,
  children,
  className 
}: {
  isLoading: boolean;
  skeleton: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      {isLoading ? skeleton : children}
    </div>
  );
}

export {
  Skeleton,
  PostCardSkeleton,
  CommentSkeleton,
  CommentListSkeleton,
  PostListSkeleton,
  CommunityHeaderSkeleton,
  PostComposerSkeleton,
  ReactionBarSkeleton,
  TypingIndicatorSkeleton,
  ContentSkeleton,
  LoadingWrapper,
};
