"use client";

import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Send, 
  Heart, 
  MessageCircle, 
  MoreHorizontal,
  Trash2,
  Edit3,
  X
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface Comment {
  _id: string;
  content: string;
  createdAt: string;
  author: {
    _id: string;
    userId: string;
    name?: string;
    image?: string;
    role?: string;
  };
  likes?: number;
  isEdited?: boolean;
}

interface CommentModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
  communityId: string;
  postAuthor?: string;
  postContent?: string;
}

export default function CommentModal({
  isOpen,
  onClose,
  postId,
  communityId,
  postAuthor,
  postContent
}: CommentModalProps) {
  const { user } = useUser();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  // Fetch comments when modal opens
  useEffect(() => {
    if (isOpen && postId) {
      fetchComments();
    }
  }, [isOpen, postId]);

  const fetchComments = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/communities/${communityId}/posts/${postId}/comments`);
      if (response.ok) {
        const data = await response.json();
        setComments(data.comments || []);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/communities/${communityId}/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: newComment.trim() }),
      });

      if (response.ok) {
        const newCommentData = await response.json();
        setComments(prev => [newCommentData, ...prev]);
        setNewComment('');
        
        // Update parent component's comment count
        window.dispatchEvent(new CustomEvent('commentAdded', { 
          detail: { postId, newCount: comments.length + 1 } 
        }));
      } else {
        throw new Error('Failed to post comment');
      }
    } catch (error) {
      console.error('Error posting comment:', error);
      // TODO: Show error toast
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditComment = async (commentId: string) => {
    if (!editContent.trim()) return;

    try {
      const response = await fetch(`/api/communities/${communityId}/posts/${postId}/comments/${commentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: editContent.trim() }),
      });

      if (response.ok) {
        const updatedComment = await response.json();
        setComments(prev => prev.map(comment => 
          comment._id === commentId ? updatedComment : comment
        ));
        setEditingComment(null);
        setEditContent('');
      }
    } catch (error) {
      console.error('Error editing comment:', error);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    try {
      const response = await fetch(`/api/communities/${communityId}/posts/${postId}/comments/${commentId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setComments(prev => prev.filter(comment => comment._id !== commentId));
        
        // Update parent component's comment count
        window.dispatchEvent(new CustomEvent('commentDeleted', { 
          detail: { postId, newCount: comments.length - 1 } 
        }));
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const startEdit = (comment: Comment) => {
    setEditingComment(comment._id);
    setEditContent(comment.content);
  };

  const cancelEdit = () => {
    setEditingComment(null);
    setEditContent('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] p-0">
        <DialogHeader className="p-6 pb-4 border-b">
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-blue-600" />
            Comments
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-600">
            {postAuthor && `Discussing ${postAuthor}'s post`}
          </DialogDescription>
        </DialogHeader>

        {/* Post Preview */}
        {postContent && (
          <div className="px-6 py-4 bg-gray-50 border-b">
            <p className="text-sm text-gray-700 line-clamp-2">{postContent}</p>
          </div>
        )}

        {/* Comments List */}
        <ScrollArea className="flex-1 max-h-96">
          <div className="p-6 space-y-4">
            {isLoading ? (
              // Loading skeletons
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex space-x-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                </div>
              ))
            ) : comments.length > 0 ? (
              comments.map((comment) => (
                <div key={comment._id} className="flex space-x-3 group">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={comment.author?.image} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs">
                      {(comment.author?.name || 'U').charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="bg-gray-50 rounded-2xl px-4 py-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm text-gray-900">
                          {comment.author?.name || 'Community Member'}
                        </span>
                        {comment.author?.role && (
                          <Badge variant="secondary" className="text-xs">
                            {comment.author.role}
                          </Badge>
                        )}
                        {comment.isEdited && (
                          <span className="text-xs text-gray-500">(edited)</span>
                        )}
                      </div>
                      
                      {editingComment === comment._id ? (
                        <div className="space-y-2">
                          <Textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="min-h-[60px] text-sm"
                            placeholder="Edit your comment..."
                          />
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              onClick={() => handleEditComment(comment._id)}
                              disabled={!editContent.trim()}
                            >
                              Save
                            </Button>
                            <Button size="sm" variant="outline" onClick={cancelEdit}>
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-800 whitespace-pre-wrap">
                          {comment.content}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span>{formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}</span>
                      
                      {/* Comment actions */}
                      {user?.id === comment.author?.userId && editingComment !== comment._id && (
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => startEdit(comment)}
                            className="hover:text-blue-600 flex items-center gap-1"
                          >
                            <Edit3 className="w-3 h-3" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteComment(comment._id)}
                            className="hover:text-red-600 flex items-center gap-1"
                          >
                            <Trash2 className="w-3 h-3" />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 mb-2">No comments yet</p>
                <p className="text-sm text-gray-400">Be the first to share your thoughts!</p>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Comment Input */}
        {user && (
          <div className="p-6 border-t bg-white">
            <form onSubmit={handleSubmitComment} className="space-y-3">
              <div className="flex space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.imageUrl} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs">
                    {(user.fullName || 'U').charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a comment..."
                    className="min-h-[80px] resize-none border-gray-200 focus:border-blue-500"
                    maxLength={1000}
                  />
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-gray-400">
                      {newComment.length}/1000
                    </span>
                    <Button
                      type="submit"
                      disabled={!newComment.trim() || isSubmitting}
                      size="sm"
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          Posting...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Comment
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
