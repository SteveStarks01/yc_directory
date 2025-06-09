'use client';

import React, { useState, useEffect, ErrorBoundary } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  ChatBubbleLeftIcon,
  ShareIcon,
  EllipsisHorizontalIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { formatDate } from '@/lib/utils';
import CommunityComments from './CommunityComments';
import PostReactionBar from './ui/PostReactionBar';
import { ReactionData } from './ui/PostReactionBar';
import { POST_TYPES, PostType, getPostTypeColor, getPostTypeEmoji } from './ui/PostTypeSelector';

interface Post {
  _id: string;
  content: any[];
  postType: PostType;
  images?: any[];
  likes: number;
  hearts: number;
  commentCount: number;
  shareCount: number;
  allowComments: boolean;
  isPinned: boolean;
  isAnnouncement: boolean;
  tags?: string[];
  publishedAt: string;
  createdAt: string;
  author: {
    _id: string;
    userId: string;
    role?: string;
    bio?: string;
    company?: string;
    position?: string;
  };
  community: {
    _id: string;
    name: string;
    slug: { current: string };
  };
  // Enhanced reaction data
  reactions?: ReactionData;
  userReaction?: string | null;
}

interface CommunityPostListProps {
  communityId: string;
  refreshTrigger: number;
}

// Error Boundary Component for Reactions
function ReactionErrorBoundary({ children, postId }: { children: React.ReactNode; postId: string }) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [postId]);

  if (hasError) {
    return (
      <div className="flex items-center gap-2 text-sm text-red-500 bg-red-50 px-3 py-2 rounded-md">
        <ExclamationTriangleIcon className="w-4 h-4" />
        <span>Reactions temporarily unavailable</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setHasError(false)}
          className="text-red-600 hover:text-red-700"
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div onError={() => setHasError(true)}>
      {children}
    </div>
  );
}

export default function CommunityPostList({
  communityId,
  refreshTrigger
}: CommunityPostListProps) {
  const { data: session } = useSession();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [reactionErrors, setReactionErrors] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchPosts();
  }, [communityId, refreshTrigger]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/communities/${communityId}/posts`);
      if (response.ok) {
        const data = await response.json();
        setPosts(data.posts);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleComments = (postId: string) => {
    const newExpanded = new Set(expandedComments);
    if (newExpanded.has(postId)) {
      newExpanded.delete(postId);
    } else {
      newExpanded.add(postId);
    }
    setExpandedComments(newExpanded);
  };

  // Handle reaction updates with real-time sync
  const handleReactionUpdate = (postId: string, reactions: ReactionData, userReaction: string | null) => {
    setPosts(prevPosts =>
      prevPosts.map(post =>
        post._id === postId
          ? { ...post, reactions, userReaction }
          : post
      )
    );

    // Clear any previous errors for this post
    setReactionErrors(prev => {
      const newErrors = new Set(prev);
      newErrors.delete(postId);
      return newErrors;
    });
  };

  // Handle reaction errors
  const handleReactionError = (postId: string) => {
    setReactionErrors(prev => new Set(prev).add(postId));
  };

  // Enhanced post type display with character count and read more
  const renderPostContent = (post: Post) => {
    const content = renderContent(post.content);
    const contentText = post.content
      .map(block => block.children?.map((child: any) => child.text).join('') || '')
      .join(' ');

    const isLongContent = contentText.length > 200;
    const [isExpanded, setIsExpanded] = useState(false);

    if (isLongContent && !isExpanded) {
      const truncatedText = contentText.substring(0, 200) + '...';
      return (
        <div className="space-y-2">
          <p className="text-gray-900 leading-relaxed">{truncatedText}</p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(true)}
            className="text-blue-600 hover:text-blue-700 p-0 h-auto font-medium"
          >
            Read more
          </Button>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {content}
        {isLongContent && isExpanded && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(false)}
            className="text-blue-600 hover:text-blue-700 p-0 h-auto font-medium"
          >
            Show less
          </Button>
        )}
      </div>
    );
  };

  const renderContent = (content: any[]) => {
    return content.map((block, index) => {
      if (block._type === 'block') {
        return (
          <p key={index} className="text-gray-900 leading-relaxed">
            {block.children?.map((child: any, childIndex: number) => (
              <span key={childIndex}>{child.text}</span>
            ))}
          </p>
        );
      }
      return null;
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/6"></div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <Card key={post._id} className={`${post.isPinned ? 'ring-2 ring-blue-500' : ''}`}>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${post.author.role}`} />
                  <AvatarFallback>
                    {post.author.role?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900">
                      {post.author.role || 'Community Member'}
                    </span>
                    {post.isPinned && (
                      <Badge variant="secondary" className="text-xs">
                        📌 Pinned
                      </Badge>
                    )}
                    {post.isAnnouncement && (
                      <Badge className="text-xs bg-blue-500">
                        📣 Announcement
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Badge
                      variant="outline"
                      className={`text-xs ${getPostTypeColor(post.postType)} border-current`}
                    >
                      <span className="mr-1">{getPostTypeEmoji(post.postType)}</span>
                      {POST_TYPES[post.postType]?.label || post.postType}
                    </Badge>
                    <span>•</span>
                    <span>{formatDate(post.publishedAt)}</span>
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="sm">
                <EllipsisHorizontalIcon className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="pt-0">
            {/* Enhanced Post Content */}
            <div className="mb-4">
              {renderPostContent(post)}
            </div>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {post.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    #{tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Enhanced Reaction Bar */}
            <div className="space-y-3">
              <ReactionErrorBoundary postId={post._id}>
                <PostReactionBar
                  postId={post._id}
                  initialReactions={post.reactions || {}}
                  userReaction={post.userReaction || null}
                  onReactionUpdate={(reactions, userReaction) =>
                    handleReactionUpdate(post._id, reactions, userReaction)
                  }
                  className="mb-3"
                />
              </ReactionErrorBoundary>

              {/* Engagement Stats */}
              <div className="flex items-center gap-6 text-sm text-gray-500">
                <span>
                  {Object.values(post.reactions || {}).reduce((sum, count) => sum + count, 0) || (post.likes + post.hearts)} reactions
                </span>
                <span>{post.commentCount} comments</span>
                <span>{post.shareCount} shares</span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-3 border-t">
                <div className="flex items-center gap-4">
                  {post.allowComments && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center gap-2"
                      onClick={() => toggleComments(post._id)}
                    >
                      <ChatBubbleLeftIcon className="w-5 h-5" />
                      <span>Comment</span>
                    </Button>
                  )}

                  <Button variant="ghost" size="sm" className="flex items-center gap-2">
                    <ShareIcon className="w-5 h-5" />
                    <span>Share</span>
                  </Button>
                </div>
              </div>
            </div>

            {/* Comments Section */}
            {expandedComments.has(post._id) && post.allowComments && (
              <div className="mt-4 pt-4 border-t">
                <CommunityComments postId={post._id} />
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      {posts.length === 0 && !loading && (
        <div className="text-center py-8 text-gray-500">
          No posts yet. Be the first to share something!
        </div>
      )}
    </div>
  );
}
