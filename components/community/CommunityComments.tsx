'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  ChatBubbleLeftIcon,
  PaperAirplaneIcon
} from '@heroicons/react/24/outline';
import { formatDate } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import ReactionButton, { ReactionType } from './ui/ReactionButton';

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
  // Enhanced reaction data
  reactions?: { [key: string]: number };
  userReaction?: ReactionType | null;
}

interface CommunityCommentsProps {
  postId: string;
}

export default function CommunityComments({ postId }: CommunityCommentsProps) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/communities/posts/${postId}/comments`);
      if (response.ok) {
        const data = await response.json();
        setComments(data.comments);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (content: string, parentId?: string) => {
    if (!content.trim() || !session) return;

    setSubmitting(true);
    try {
      const response = await fetch(`/api/communities/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: content.trim(),
          parentComment: parentId || null,
        }),
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Comment posted successfully!',
        });
        setNewComment('');
        setReplyContent('');
        setReplyingTo(null);
        fetchComments();
      } else {
        const error = await response.json();
        toast({
          title: 'Error',
          description: error.error || 'Failed to post comment',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error posting comment:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Handle comment reaction updates
  const handleCommentReactionUpdate = (commentId: string, reactionType: ReactionType, action: 'add' | 'remove') => {
    setComments(prevComments =>
      prevComments.map(comment => {
        if (comment._id === commentId) {
          const newReactions = { ...comment.reactions } || {};

          if (action === 'add') {
            // Remove previous reaction if switching
            if (comment.userReaction && comment.userReaction !== reactionType) {
              newReactions[comment.userReaction] = Math.max((newReactions[comment.userReaction] || 0) - 1, 0);
              if (newReactions[comment.userReaction] === 0) {
                delete newReactions[comment.userReaction];
              }
            }
            newReactions[reactionType] = (newReactions[reactionType] || 0) + 1;

            return {
              ...comment,
              reactions: newReactions,
              userReaction: reactionType,
            };
          } else {
            newReactions[reactionType] = Math.max((newReactions[reactionType] || 0) - 1, 0);
            if (newReactions[reactionType] === 0) {
              delete newReactions[reactionType];
            }

            return {
              ...comment,
              reactions: newReactions,
              userReaction: null,
            };
          }
        }
        return comment;
      })
    );
  };

  const renderComment = (comment: Comment) => {
    const indentLevel = Math.min(comment.threadLevel, 3); // Max 3 levels of nesting
    const marginLeft = indentLevel * 24;

    return (
      <div key={comment._id} style={{ marginLeft: `${marginLeft}px` }} className="mb-4">
        <div className="flex items-start gap-3">
          <Avatar className="w-8 h-8">
            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${comment.author.role}`} />
            <AvatarFallback className="text-xs">
              {comment.author.role?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="bg-gray-50 rounded-lg px-3 py-2">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-sm text-gray-900">
                  {comment.author.role || 'Community Member'}
                </span>
                <span className="text-xs text-gray-500">
                  {formatDate(comment.createdAt)}
                  {comment.isEdited && ' (edited)'}
                </span>
              </div>
              <p className="text-sm text-gray-800">{comment.content}</p>
            </div>
            
            <div className="flex items-center gap-4 mt-2">
              {/* Comment Reactions */}
              <div className="flex items-center gap-1">
                <ReactionButton
                  reactionType="like"
                  count={comment.reactions?.like || 0}
                  isActive={comment.userReaction === 'like'}
                  targetId={comment._id}
                  targetType="comment"
                  size="sm"
                  onReactionClick={(reactionType, action) =>
                    handleCommentReactionUpdate(comment._id, reactionType, action)
                  }
                />
                <ReactionButton
                  reactionType="heart"
                  count={comment.reactions?.heart || 0}
                  isActive={comment.userReaction === 'heart'}
                  targetId={comment._id}
                  targetType="comment"
                  size="sm"
                  onReactionClick={(reactionType, action) =>
                    handleCommentReactionUpdate(comment._id, reactionType, action)
                  }
                />
              </div>

              {session && comment.threadLevel < 3 && (
                <button
                  onClick={() => setReplyingTo(comment._id)}
                  className="flex items-center gap-1 hover:text-blue-500 text-xs text-gray-500"
                >
                  <ChatBubbleLeftIcon className="w-4 h-4" />
                  <span>Reply</span>
                </button>
              )}
            </div>

            {/* Reply Form */}
            {replyingTo === comment._id && (
              <div className="mt-3">
                <div className="flex gap-2">
                  <Avatar className="w-6 h-6">
                    <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${session?.user?.name}`} />
                    <AvatarFallback className="text-xs">
                      {session?.user?.name?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <Textarea
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      placeholder="Write a reply..."
                      className="min-h-[60px] text-sm"
                      maxLength={500}
                    />
                    <div className="flex justify-end gap-2 mt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setReplyingTo(null);
                          setReplyContent('');
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleSubmitComment(replyContent, comment._id)}
                        disabled={!replyContent.trim() || submitting}
                      >
                        Reply
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="flex items-start gap-3 animate-pulse">
            <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
            <div className="flex-1">
              <div className="bg-gray-100 rounded-lg p-3">
                <div className="h-3 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* New Comment Form */}
      {session && (
        <div className="flex gap-3">
          <Avatar className="w-8 h-8">
            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${session.user?.name}`} />
            <AvatarFallback className="text-xs">
              {session.user?.name?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              className="min-h-[80px]"
              maxLength={1000}
            />
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-gray-500">
                {newComment.length}/1000 characters
              </span>
              <Button
                onClick={() => handleSubmitComment(newComment)}
                disabled={!newComment.trim() || submitting}
                size="sm"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                    Posting...
                  </>
                ) : (
                  <>
                    <PaperAirplaneIcon className="w-4 h-4 mr-1" />
                    Comment
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-1">
        {comments.map(renderComment)}
      </div>

      {comments.length === 0 && !loading && (
        <div className="text-center py-4 text-gray-500 text-sm">
          No comments yet. Be the first to comment!
        </div>
      )}
    </div>
  );
}
