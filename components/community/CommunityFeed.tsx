"use client";

import { useState, useEffect, useCallback } from 'react';
import { useInView } from 'react-intersection-observer';
import { useUser } from '@clerk/nextjs';
import PostComposer from './PostComposer';
import { CommunityPostCard } from './CommunityPostCard';
import CommentModal from './CommentModal';
import ShareModal from './ShareModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { RefreshCw, AlertCircle, Sparkles, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface CommunityFeedProps {
  communityId: string;
  className?: string;
  isOwner?: boolean;
}

interface PostData {
  _id: string;
  content: string;
  postType: 'text' | 'image' | 'link' | 'announcement' | 'update' | 'question';
  images?: string[];
  likes?: number;
  hearts?: number;
  commentCount?: number;
  shareCount?: number;
  allowComments?: boolean;
  isPinned?: boolean;
  isAnnouncement?: boolean;
  tags?: string[];
  publishedAt: string;
  createdAt: string;
  author?: {
    _id: string;
    userId: string;
    name?: string;
    role?: string;
    company?: string;
    position?: string;
    image?: string;
  } | null;
}

export default function CommunityFeed({ communityId, className, isOwner = false }: CommunityFeedProps) {
  const { user } = useUser();
  const { toast } = useToast();
  const [posts, setPosts] = useState<PostData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);

  // Comment modal state
  const [commentModal, setCommentModal] = useState<{
    isOpen: boolean;
    postId: string;
    postAuthor?: string;
    postContent?: string;
  }>({
    isOpen: false,
    postId: '',
  });

  // Share modal state
  const [shareModal, setShareModal] = useState<{
    isOpen: boolean;
    postId: string;
    postAuthor?: string;
    postContent?: string;
  }>({
    isOpen: false,
    postId: '',
  });

  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0.1,
    triggerOnce: false,
  });

  // Fetch posts
  const fetchPosts = useCallback(async (pageNum: number = 0) => {
    try {
      const response = await fetch(
        `/api/communities/${communityId}/posts?page=${pageNum}&limit=10`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch posts');
      }
      
      const data = await response.json();
      return data;
    } catch (err) {
      console.error('Error fetching posts:', err);
      throw err;
    }
  }, [communityId]);

  // Load initial posts
  useEffect(() => {
    const loadInitialPosts = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await fetchPosts(0);
        setPosts(data.posts || []);
        setHasMore(data.hasMore || false);
        setPage(1);
      } catch (error) {
        setError('Failed to load posts. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialPosts();
  }, [communityId, fetchPosts]);

  // Listen for comment count updates
  useEffect(() => {
    const handleCommentAdded = (event: CustomEvent) => {
      const { postId, newCount } = event.detail;
      setPosts(prev => prev.map(post =>
        post._id === postId
          ? { ...post, commentCount: newCount }
          : post
      ));
    };

    const handleCommentDeleted = (event: CustomEvent) => {
      const { postId, newCount } = event.detail;
      setPosts(prev => prev.map(post =>
        post._id === postId
          ? { ...post, commentCount: Math.max(newCount, 0) }
          : post
      ));
    };

    window.addEventListener('commentAdded', handleCommentAdded as EventListener);
    window.addEventListener('commentDeleted', handleCommentDeleted as EventListener);

    return () => {
      window.removeEventListener('commentAdded', handleCommentAdded as EventListener);
      window.removeEventListener('commentDeleted', handleCommentDeleted as EventListener);
    };
  }, []);

  // Load more posts when scrolling
  useEffect(() => {
    if (inView && hasMore && !isLoading) {
      const loadMorePosts = async () => {
        try {
          const data = await fetchPosts(page);
          setPosts(prev => [...prev, ...(data.posts || [])]);
          setHasMore(data.hasMore || false);
          setPage(prev => prev + 1);
        } catch (err) {
          console.error('Error loading more posts:', err);
        }
      };

      loadMorePosts();
    }
  }, [inView, hasMore, isLoading, page, fetchPosts]);

  // Handle new post creation
  const handlePostCreated = (newPost: PostData) => {
    // Add the new post to the beginning of the list
    setPosts(prev => [newPost, ...prev]);

    // Optionally scroll to top to show the new post
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle post reactions
  const handleReaction = async (postId: string, reactionType: string = 'like') => {
    try {
      const response = await fetch(`/api/communities/${communityId}/posts/${postId}/reactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type: reactionType }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to react to post');
      }

      const updatedReactions = await response.json();

      // Update local state with the new reaction counts
      setPosts(prev => prev.map(post =>
        post._id === postId
          ? {
              ...post,
              likes: updatedReactions.likes,
              hearts: updatedReactions.hearts,
              userReacted: updatedReactions.userReacted
            }
          : post
      ));
    } catch (err) {
      console.error('Error reacting to post:', err);
      // TODO: Show error toast to user
    }
  };

  // Handle post comments
  const handleComment = (postId: string) => {
    const post = posts.find(p => p._id === postId);
    setCommentModal({
      isOpen: true,
      postId,
      postAuthor: post?.author?.name || 'Community Member',
      postContent: post?.content,
    });
  };

  // Handle post sharing (quick share - copy link)
  const handleShare = async (postId: string) => {
    try {
      // Copy post URL to clipboard
      const postUrl = `${window.location.origin}/community/${communityId}/post/${postId}`;
      await navigator.clipboard.writeText(postUrl);

      // Track the share
      await fetch(`/api/communities/${communityId}/posts/${postId}/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ shareType: 'link' }),
      });

      // Update local state
      setPosts(prev => prev.map(post =>
        post._id === postId
          ? { ...post, shareCount: (post.shareCount || 0) + 1 }
          : post
      ));

      // Show success toast
      toast({
        title: "Link copied!",
        description: "Post URL has been copied to your clipboard.",
      });
    } catch (err) {
      console.error('Error sharing post:', err);
      toast({
        title: "Share failed",
        description: "Could not copy link to clipboard.",
        variant: "destructive",
      });
    }
  };

  // Handle advanced sharing (open share modal)
  const handleAdvancedShare = (postId: string) => {
    const post = posts.find(p => p._id === postId);
    setShareModal({
      isOpen: true,
      postId,
      postAuthor: post?.author?.name || 'Community Member',
      postContent: post?.content,
    });
  };

  // Refresh feed
  const refreshFeed = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await fetchPosts(0);
      setPosts(data.posts || []);
      setHasMore(data.hasMore || false);
      setPage(1);
    } catch (err) {
      setError('Failed to refresh posts. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (error && posts.length === 0) {
    return (
      <div className={cn("max-w-2xl mx-auto space-y-6", className)}>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-red-900 mb-2">Failed to Load Posts</h3>
            <p className="text-red-700 mb-4">{error}</p>
            <Button onClick={refreshFeed} variant="outline" className="border-red-300 text-red-700">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={cn("max-w-2xl mx-auto space-y-6", className)}>
      {/* Modern Feed Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-100 p-4 -mx-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-5 w-5 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900">Community Feed</h2>
            </div>
            <Badge variant="secondary" className="bg-blue-50 text-blue-700">
              Live
            </Badge>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              onClick={refreshFeed}
              variant="ghost"
              size="sm"
              disabled={isLoading}
              className="text-gray-600 hover:text-gray-900"
            >
              <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
            </Button>
            <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
              <TrendingUp className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Post Composer */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <PostComposer
          communityId={communityId}
          onPostCreated={handlePostCreated}
        />
      </div>

      {/* Posts Feed */}
      <div className="space-y-4">
        {posts.map((post, index) => (
          <div
            key={post._id}
            className="animate-in slide-in-from-top-2 duration-300"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <CommunityPostCard
              post={post}
              onLike={handleReaction}
              onComment={handleComment}
              onShare={handleShare}
              onBookmark={(postId) => console.log('Bookmark:', postId)}
              isOwner={isOwner}
            />
          </div>
        ))}

        {/* Loading Skeletons */}
        {isLoading && (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
                <div className="flex items-center space-x-3">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <Skeleton className="h-20 w-full rounded-lg" />
                <div className="flex space-x-4">
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-8 w-16" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Infinite Scroll Trigger */}
        {hasMore && !isLoading && (
          <div ref={loadMoreRef} className="flex justify-center py-8">
            <div className="animate-pulse">
              <div className="h-2 w-2 bg-blue-600 rounded-full animate-bounce"></div>
            </div>
          </div>
        )}

        {/* End of Feed */}
        {!hasMore && posts.length > 0 && (
          <div className="text-center py-12">
            <div className="inline-flex items-center space-x-2 text-gray-500">
              <div className="h-px bg-gray-300 w-16"></div>
              <span className="text-sm font-medium">You&apos;re all caught up!</span>
              <div className="h-px bg-gray-300 w-16"></div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && posts.length === 0 && !error && (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <div className="space-y-6">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-gray-900">Start the conversation</h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  Be the first to share an update, ask a question, or start a discussion with the community.
                </p>
              </div>
              <Button
                onClick={() => document.querySelector('textarea')?.focus()}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Create First Post
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Comment Modal */}
      <CommentModal
        isOpen={commentModal.isOpen}
        onClose={() => setCommentModal({ isOpen: false, postId: '' })}
        postId={commentModal.postId}
        communityId={communityId}
        postAuthor={commentModal.postAuthor}
        postContent={commentModal.postContent}
      />

      {/* Share Modal */}
      <ShareModal
        isOpen={shareModal.isOpen}
        onClose={() => setShareModal({ isOpen: false, postId: '' })}
        postId={shareModal.postId}
        communityId={communityId}
        postAuthor={shareModal.postAuthor}
        postContent={shareModal.postContent}
      />
    </div>
  );
}
