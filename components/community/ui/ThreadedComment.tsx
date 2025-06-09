'use client';

import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDate, cn } from '@/lib/utils';
import { 
  ChatBubbleLeftIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  MinusIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import ReactionButton, { ReactionType } from './ReactionButton';

interface Comment {
  _id: string;
  content: string;
  author: {
    _id: string;
    userId: string;
    role?: string;
    bio?: string;
    company?: string;
    position?: string;
  };
  parentComment?: {
    _id: string;
  };
  threadLevel: number;
  likes: number;
  hearts: number;
  replyCount: number;
  isEdited: boolean;
  editedAt?: string;
  createdAt: string;
  reactions?: { [key: string]: number };
  userReaction?: ReactionType | null;
}

interface ThreadedCommentProps {
  /** The comment data */
  comment: Comment;
  /** Whether this comment thread is collapsed */
  isCollapsed?: boolean;
  /** Whether to show thread lines */
  showThreadLines?: boolean;
  /** Maximum nesting level to display */
  maxNestingLevel?: number;
  /** Whether the current user can reply */
  canReply?: boolean;
  /** Whether the current user can edit this comment */
  canEdit?: boolean;
  /** Callback when reply button is clicked */
  onReply?: (commentId: string) => void;
  /** Callback when edit button is clicked */
  onEdit?: (commentId: string) => void;
  /** Callback when reaction is updated */
  onReactionUpdate?: (commentId: string, reactionType: ReactionType, action: 'add' | 'remove') => void;
  /** Callback when thread is collapsed/expanded */
  onToggleCollapse?: (commentId: string, isCollapsed: boolean) => void;
  /** Custom className */
  className?: string;
}

export default function ThreadedComment({
  comment,
  isCollapsed = false,
  showThreadLines = true,
  maxNestingLevel = 3,
  canReply = true,
  canEdit = false,
  onReply,
  onEdit,
  onReactionUpdate,
  onToggleCollapse,
  className,
}: ThreadedCommentProps) {
  const [localCollapsed, setLocalCollapsed] = useState(isCollapsed);
  
  // Calculate visual nesting properties
  const nestingLevel = Math.min(comment.threadLevel, maxNestingLevel);
  const isMaxNested = comment.threadLevel >= maxNestingLevel;
  const hasReplies = comment.replyCount > 0;
  
  // Thread line colors based on nesting level
  const threadColors = [
    'border-blue-300',    // Level 0
    'border-green-300',   // Level 1  
    'border-purple-300',  // Level 2
    'border-orange-300',  // Level 3+
  ];
  
  const threadColor = threadColors[nestingLevel] || threadColors[3];

  // Handle collapse/expand
  const handleToggleCollapse = () => {
    const newCollapsed = !localCollapsed;
    setLocalCollapsed(newCollapsed);
    onToggleCollapse?.(comment._id, newCollapsed);
  };

  // Handle reaction updates
  const handleReactionClick = (reactionType: ReactionType, action: 'add' | 'remove') => {
    onReactionUpdate?.(comment._id, reactionType, action);
  };

  return (
    <div 
      className={cn(
        'relative',
        nestingLevel > 0 && 'ml-6',
        className
      )}
    >
      {/* Thread line indicator */}
      {showThreadLines && nestingLevel > 0 && (
        <div 
          className={cn(
            'absolute left-0 top-0 bottom-0 w-0.5 opacity-60',
            threadColor
          )}
          style={{ left: '-12px' }}
        />
      )}

      {/* Comment container */}
      <div className={cn(
        'group relative bg-white rounded-lg transition-all duration-200',
        'hover:shadow-sm hover:bg-gray-50/50',
        nestingLevel > 0 && 'border-l-2 border-transparent hover:border-gray-200'
      )}>
        
        {/* Comment header with collapse button */}
        <div className="flex items-start gap-3 p-3">
          {/* Avatar */}
          <Avatar className={cn(
            'flex-shrink-0',
            nestingLevel === 0 ? 'w-10 h-10' : 'w-8 h-8'
          )}>
            <AvatarImage 
              src={`https://api.dicebear.com/7.x/initials/svg?seed=${comment.author.role}`} 
            />
            <AvatarFallback className="text-xs">
              {comment.author.role?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>

          {/* Comment content */}
          <div className="flex-1 min-w-0">
            {/* Author info and metadata */}
            <div className="flex items-center gap-2 mb-1">
              <span className={cn(
                'font-medium text-gray-900',
                nestingLevel === 0 ? 'text-sm' : 'text-xs'
              )}>
                {comment.author.role || 'Community Member'}
              </span>
              
              {/* Thread level indicator */}
              {nestingLevel > 0 && (
                <Badge 
                  variant="outline" 
                  className={cn(
                    'text-xs px-1.5 py-0.5 h-auto',
                    threadColor.replace('border-', 'text-').replace('-300', '-600')
                  )}
                >
                  L{nestingLevel}
                </Badge>
              )}
              
              <span className="text-xs text-gray-500">
                {formatDate(comment.createdAt)}
                {comment.isEdited && ' (edited)'}
              </span>

              {/* Collapse button for threads with replies */}
              {hasReplies && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleToggleCollapse}
                  className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                  aria-label={localCollapsed ? 'Expand thread' : 'Collapse thread'}
                >
                  {localCollapsed ? (
                    <ChevronRightIcon className="w-3 h-3" />
                  ) : (
                    <ChevronDownIcon className="w-3 h-3" />
                  )}
                </Button>
              )}
            </div>

            {/* Comment content */}
            {!localCollapsed && (
              <>
                <div className={cn(
                  'bg-gray-50 rounded-lg px-3 py-2 mb-2',
                  nestingLevel > 1 && 'bg-gray-25'
                )}>
                  <p className={cn(
                    'text-gray-800 leading-relaxed',
                    nestingLevel === 0 ? 'text-sm' : 'text-xs'
                  )}>
                    {comment.content}
                  </p>
                </div>

                {/* Comment actions */}
                <div className="flex items-center gap-3">
                  {/* Reactions */}
                  <div className="flex items-center gap-1">
                    <ReactionButton
                      reactionType="like"
                      count={comment.reactions?.like || 0}
                      isActive={comment.userReaction === 'like'}
                      targetId={comment._id}
                      targetType="comment"
                      size="sm"
                      onReactionClick={handleReactionClick}
                    />
                    <ReactionButton
                      reactionType="heart"
                      count={comment.reactions?.heart || 0}
                      isActive={comment.userReaction === 'heart'}
                      targetId={comment._id}
                      targetType="comment"
                      size="sm"
                      onReactionClick={handleReactionClick}
                    />
                  </div>

                  {/* Reply button */}
                  {canReply && !isMaxNested && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onReply?.(comment._id)}
                      className="h-6 px-2 text-xs text-gray-500 hover:text-blue-600"
                    >
                      <ChatBubbleLeftIcon className="w-3 h-3 mr-1" />
                      Reply
                    </Button>
                  )}

                  {/* Edit button */}
                  {canEdit && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit?.(comment._id)}
                      className="h-6 px-2 text-xs text-gray-500 hover:text-blue-600"
                    >
                      Edit
                    </Button>
                  )}

                  {/* Reply count indicator */}
                  {hasReplies && (
                    <span className="text-xs text-gray-400">
                      {comment.replyCount} {comment.replyCount === 1 ? 'reply' : 'replies'}
                    </span>
                  )}
                </div>
              </>
            )}

            {/* Collapsed state indicator */}
            {localCollapsed && hasReplies && (
              <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                <ChevronRightIcon className="w-3 h-3" />
                <span>{comment.replyCount} hidden {comment.replyCount === 1 ? 'reply' : 'replies'}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Export types for use in other components
export type { ThreadedCommentProps, Comment };
