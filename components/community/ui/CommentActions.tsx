'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useSession } from 'next-auth/react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { 
  EllipsisHorizontalIcon,
  PencilIcon,
  TrashIcon,
  FlagIcon,
  ClockIcon,
  CheckIcon
} from '@heroicons/react/24/outline';

interface Comment {
  _id: string;
  content: string;
  author: {
    _id: string;
    userId: string;
    role?: string;
  };
  isEdited: boolean;
  editedAt?: string;
  createdAt: string;
}

interface CommentActionsProps {
  /** The comment data */
  comment: Comment;
  /** Whether the current user can edit this comment */
  canEdit?: boolean;
  /** Whether the current user can delete this comment */
  canDelete?: boolean;
  /** Whether the current user can report this comment */
  canReport?: boolean;
  /** Whether to show timestamp and edit indicators */
  showTimestamp?: boolean;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Callback when edit is requested */
  onEdit?: (commentId: string) => void;
  /** Callback when delete is requested */
  onDelete?: (commentId: string) => void;
  /** Callback when report is requested */
  onReport?: (commentId: string) => void;
  /** Custom className */
  className?: string;
}

export default function CommentActions({
  comment,
  canEdit = false,
  canDelete = false,
  canReport = true,
  showTimestamp = true,
  size = 'sm',
  onEdit,
  onDelete,
  onReport,
  className,
}: CommentActionsProps) {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isReporting, setIsReporting] = useState(false);

  // Check if current user is the comment author
  const isAuthor = session?.user?.id === comment.author.userId;
  const actualCanEdit = canEdit && isAuthor;
  const actualCanDelete = canDelete && isAuthor;

  // Handle edit action
  const handleEdit = () => {
    if (actualCanEdit) {
      onEdit?.(comment._id);
    }
  };

  // Handle delete action
  const handleDelete = async () => {
    if (!actualCanDelete || isDeleting) return;

    const confirmed = window.confirm(
      'Are you sure you want to delete this comment? This action cannot be undone.'
    );

    if (!confirmed) return;

    setIsDeleting(true);
    try {
      // Call delete API
      const response = await fetch(`/api/communities/comments/${comment._id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: 'Comment deleted',
          description: 'Your comment has been deleted successfully.',
        });
        onDelete?.(comment._id);
      } else {
        throw new Error('Failed to delete comment');
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete comment. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle report action
  const handleReport = async () => {
    if (!canReport || isReporting || isAuthor) return;

    const reason = window.prompt(
      'Please provide a reason for reporting this comment:'
    );

    if (!reason?.trim()) return;

    setIsReporting(true);
    try {
      // Call report API
      const response = await fetch(`/api/communities/comments/${comment._id}/report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reason: reason.trim(),
        }),
      });

      if (response.ok) {
        toast({
          title: 'Comment reported',
          description: 'Thank you for reporting this comment. We will review it shortly.',
        });
        onReport?.(comment._id);
      } else {
        throw new Error('Failed to report comment');
      }
    } catch (error) {
      console.error('Error reporting comment:', error);
      toast({
        title: 'Error',
        description: 'Failed to report comment. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsReporting(false);
    }
  };

  // Format timestamp
  const formatTimestamp = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d ago`;
    
    return date.toLocaleDateString();
  };

  // Size classes
  const sizeClasses = {
    sm: 'h-6 w-6 text-xs',
    md: 'h-8 w-8 text-sm',
    lg: 'h-10 w-10 text-base',
  };

  const hasActions = actualCanEdit || actualCanDelete || (canReport && !isAuthor);

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {/* Timestamp and edit indicator */}
      {showTimestamp && (
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <ClockIcon className="w-3 h-3" />
          <span>{formatTimestamp(comment.createdAt)}</span>
          {comment.isEdited && (
            <>
              <span>•</span>
              <div className="flex items-center gap-1">
                <CheckIcon className="w-3 h-3" />
                <span>edited</span>
              </div>
            </>
          )}
        </div>
      )}

      {/* Actions dropdown */}
      {hasActions && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                'text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity',
                sizeClasses[size]
              )}
              disabled={isDeleting || isReporting}
            >
              <EllipsisHorizontalIcon className="w-4 h-4" />
              <span className="sr-only">Comment actions</span>
            </Button>
          </DropdownMenuTrigger>
          
          <DropdownMenuContent align="end" className="w-48">
            {/* Edit action */}
            {actualCanEdit && (
              <DropdownMenuItem onClick={handleEdit}>
                <PencilIcon className="w-4 h-4 mr-2" />
                Edit comment
              </DropdownMenuItem>
            )}

            {/* Delete action */}
            {actualCanDelete && (
              <>
                {actualCanEdit && <DropdownMenuSeparator />}
                <DropdownMenuItem 
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="text-red-600 focus:text-red-600"
                >
                  <TrashIcon className="w-4 h-4 mr-2" />
                  {isDeleting ? 'Deleting...' : 'Delete comment'}
                </DropdownMenuItem>
              </>
            )}

            {/* Report action */}
            {canReport && !isAuthor && (
              <>
                {(actualCanEdit || actualCanDelete) && <DropdownMenuSeparator />}
                <DropdownMenuItem 
                  onClick={handleReport}
                  disabled={isReporting}
                  className="text-orange-600 focus:text-orange-600"
                >
                  <FlagIcon className="w-4 h-4 mr-2" />
                  {isReporting ? 'Reporting...' : 'Report comment'}
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}

// Export types for use in other components
export type { CommentActionsProps };
