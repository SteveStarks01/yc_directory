'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useSession } from 'next-auth/react';
import { useCommentCharacterCount } from '@/hooks/useCharacterCount';
import { cn } from '@/lib/utils';
import { 
  PaperAirplaneIcon,
  XMarkIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface ParentComment {
  _id: string;
  author: {
    role?: string;
    userId: string;
  };
  content: string;
  threadLevel: number;
}

interface InlineReplyFormProps {
  /** The parent comment being replied to */
  parentComment: ParentComment;
  /** Whether the form is visible */
  isVisible: boolean;
  /** Whether the form is in a submitting state */
  isSubmitting?: boolean;
  /** Placeholder text for the textarea */
  placeholder?: string;
  /** Maximum character limit */
  maxLength?: number;
  /** Whether to show parent comment context */
  showParentContext?: boolean;
  /** Whether to auto-focus the textarea when visible */
  autoFocus?: boolean;
  /** Callback when form is submitted */
  onSubmit: (content: string, parentId: string) => Promise<void>;
  /** Callback when form is cancelled */
  onCancel: () => void;
  /** Custom className */
  className?: string;
}

export default function InlineReplyForm({
  parentComment,
  isVisible,
  isSubmitting = false,
  placeholder = "Write a reply...",
  maxLength = 500,
  showParentContext = true,
  autoFocus = true,
  onSubmit,
  onCancel,
  className,
}: InlineReplyFormProps) {
  const { data: session } = useSession();
  const [content, setContent] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Character count management
  const characterCount = useCommentCharacterCount(content);

  // Auto-focus when form becomes visible
  useEffect(() => {
    if (isVisible && autoFocus && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isVisible, autoFocus]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [content]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim() || characterCount.isOverLimit || isSubmitting) {
      return;
    }

    try {
      await onSubmit(content.trim(), parentComment._id);
      setContent('');
    } catch (error) {
      console.error('Error submitting reply:', error);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    setContent('');
    onCancel();
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleCancel();
    } else if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  if (!isVisible) {
    return null;
  }

  // Calculate nesting level for styling
  const nestingLevel = Math.min(parentComment.threadLevel + 1, 3);
  const marginLeft = nestingLevel * 24;

  return (
    <div 
      className={cn(
        'mt-3 animate-in slide-in-from-top-2 duration-200',
        className
      )}
      style={{ marginLeft: `${marginLeft}px` }}
    >
      {/* Parent comment context */}
      {showParentContext && (
        <div className="mb-3 p-2 bg-gray-50 rounded-lg border-l-2 border-blue-200">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium text-gray-600">
              Replying to {parentComment.author.role || 'Community Member'}
            </span>
            <Badge variant="outline" className="text-xs px-1.5 py-0.5 h-auto">
              L{nestingLevel}
            </Badge>
          </div>
          <p className="text-xs text-gray-500 line-clamp-2">
            {parentComment.content}
          </p>
        </div>
      )}

      {/* Reply form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex gap-3">
          {/* User avatar */}
          <Avatar className="w-8 h-8 flex-shrink-0">
            <AvatarImage 
              src={`https://api.dicebear.com/7.x/initials/svg?seed=${session?.user?.name}`} 
            />
            <AvatarFallback className="text-xs">
              {session?.user?.name?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>

          {/* Input area */}
          <div className="flex-1 space-y-2">
            {/* Textarea */}
            <Textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className={cn(
                'min-h-[60px] max-h-[200px] resize-none transition-colors',
                characterCount.isOverLimit && 'border-red-500 focus:border-red-500'
              )}
              maxLength={maxLength}
              disabled={isSubmitting}
            />

            {/* Character count and validation */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {characterCount.message && (
                  <div className="flex items-center gap-1">
                    <ExclamationTriangleIcon className="w-4 h-4 text-yellow-500" />
                    <span className="text-xs text-yellow-600">
                      {characterCount.message}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                {/* Character count */}
                <span className={cn('text-xs font-medium', characterCount.colorClass)}>
                  {characterCount.count}/{maxLength}
                </span>
                
                {/* Progress indicator */}
                <div className="w-6 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={cn(
                      'h-full transition-all duration-200',
                      characterCount.isOverLimit 
                        ? 'bg-red-500' 
                        : characterCount.isDanger 
                        ? 'bg-red-400' 
                        : characterCount.isWarning 
                        ? 'bg-yellow-400' 
                        : 'bg-green-400'
                    )}
                    style={{ 
                      width: `${Math.min(characterCount.percentage, 100)}%` 
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-between">
              <div className="text-xs text-gray-500">
                <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-xs">Esc</kbd> to cancel, 
                <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-xs ml-1">Cmd+Enter</kbd> to submit
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                  className="h-8"
                >
                  <XMarkIcon className="w-3 h-3 mr-1" />
                  Cancel
                </Button>
                
                <Button
                  type="submit"
                  size="sm"
                  disabled={!content.trim() || characterCount.isOverLimit || isSubmitting}
                  className="h-8 bg-blue-600 hover:bg-blue-700"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1" />
                      Replying...
                    </>
                  ) : (
                    <>
                      <PaperAirplaneIcon className="w-3 h-3 mr-1" />
                      Reply
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

// Export types for use in other components
export type { InlineReplyFormProps, ParentComment };
