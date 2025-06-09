"use client";

import React, { useState } from 'react';
import { 
  FaRegHeart, 
  FaHeart, 
  FaRegComment, 
  FaRegPaperPlane, 
  FaRegBookmark, 
  FaBookmark,
  FaEllipsisH 
} from "react-icons/fa";
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import OptimizedImage from '@/components/ui/OptimizedImage';
import { cn } from '@/lib/utils';

interface PostAuthor {
  _id: string;
  userId: string;
  name?: string;
  role?: string;
  company?: string;
  position?: string;
  image?: string;
}

interface CommunityPost {
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
  author?: PostAuthor | null;
}

interface CommunityPostCardProps {
  post: CommunityPost;
  onLike?: (postId: string) => void;
  onComment?: (postId: string) => void;
  onShare?: (postId: string) => void;
  onBookmark?: (postId: string) => void;
  className?: string;
  isOwner?: boolean;
}

const POST_TYPE_STYLES = {
  text: { emoji: '💬', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  image: { emoji: '📸', color: 'bg-green-50 text-green-700 border-green-200' },
  link: { emoji: '🔗', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  announcement: { emoji: '📢', color: 'bg-red-50 text-red-700 border-red-200' },
  update: { emoji: '📰', color: 'bg-orange-50 text-orange-700 border-orange-200' },
  question: { emoji: '❓', color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
};

export const CommunityPostCard: React.FC<CommunityPostCardProps> = ({
  post,
  onLike,
  onComment,
  onShare,
  onBookmark,
  className,
  isOwner = false
}) => {
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [showFullContent, setShowFullContent] = useState(false);

  const handleLike = () => {
    setLiked(prev => !prev);
    onLike?.(post._id);
  };

  const handleBookmark = () => {
    setBookmarked(prev => !prev);
    onBookmark?.(post._id);
  };

  const handleComment = () => {
    onComment?.(post._id);
  };

  const handleShare = () => {
    onShare?.(post._id);
  };

  const postTypeStyle = POST_TYPE_STYLES[post.postType] || POST_TYPE_STYLES.text;
  const timeAgo = formatDistanceToNow(new Date(post.publishedAt), { addSuffix: true });
  
  // Truncate content if too long
  const shouldTruncate = post.content.length > 280;
  const displayContent = shouldTruncate && !showFullContent 
    ? post.content.slice(0, 280) + '...' 
    : post.content;

  return (
    <div className={cn(
      "bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 p-6 space-y-4",
      post.isPinned && "ring-2 ring-blue-200 bg-blue-50/30",
      post.isAnnouncement && "ring-2 ring-red-200 bg-red-50/30",
      className
    )}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <Avatar className="h-12 w-12 ring-2 ring-gray-100">
            <AvatarImage
              src={post.author?.image || ''}
              alt={post.author?.name || 'User'}
            />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
              {(post.author?.name || 'U').charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold text-gray-900 truncate">
                {post.author?.name || 'Community Member'}
              </h3>
              {post.author?.role && (
                <Badge variant="secondary" className="text-xs">
                  {post.author.role}
                </Badge>
              )}
            </div>

            <div className="flex items-center space-x-2 text-sm text-gray-500">
              {post.author?.company && (
                <span className="truncate">{post.author.company}</span>
              )}
              <span>•</span>
              <time dateTime={post.publishedAt}>{timeAgo}</time>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Post Type Badge */}
          <Badge className={cn("text-xs", postTypeStyle.color)}>
            <span className="mr-1">{postTypeStyle.emoji}</span>
            {post.postType}
          </Badge>

          {/* More Options */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <FaEllipsisH className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Share post</DropdownMenuItem>
              <DropdownMenuItem>Copy link</DropdownMenuItem>
              {isOwner && (
                <>
                  <DropdownMenuItem>Edit post</DropdownMenuItem>
                  <DropdownMenuItem className="text-red-600">Delete post</DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Special Badges */}
      {(post.isPinned || post.isAnnouncement) && (
        <div className="flex space-x-2">
          {post.isPinned && (
            <Badge className="bg-blue-100 text-blue-800 border-blue-200">
              📌 Pinned
            </Badge>
          )}
          {post.isAnnouncement && (
            <Badge className="bg-red-100 text-red-800 border-red-200">
              📢 Announcement
            </Badge>
          )}
        </div>
      )}

      {/* Content */}
      <div className="space-y-3">
        <div className="prose prose-sm max-w-none">
          <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">
            {displayContent}
          </p>
          {shouldTruncate && (
            <Button
              variant="link"
              size="sm"
              className="p-0 h-auto text-blue-600 hover:text-blue-800"
              onClick={() => setShowFullContent(!showFullContent)}
            >
              {showFullContent ? 'Show less' : 'Show more'}
            </Button>
          )}
        </div>

        {/* Images */}
        {post.images && post.images.length > 0 && (
          <div className={cn(
            "grid gap-2 rounded-xl overflow-hidden",
            post.images.length === 1 && "grid-cols-1",
            post.images.length === 2 && "grid-cols-2",
            post.images.length > 2 && "grid-cols-2"
          )}>
            {post.images.slice(0, 4).map((image, index) => (
              <div key={index} className="relative aspect-video">
                <OptimizedImage
                  src={image}
                  alt={`Post image ${index + 1}`}
                  fill
                  className="object-cover rounded-lg"
                />
                {post.images!.length > 4 && index === 3 && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                    <span className="text-white font-semibold">
                      +{post.images!.length - 4} more
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                #{tag}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            className={cn(
              "flex items-center space-x-2 px-3 py-2 rounded-xl transition-all",
              liked ? "text-red-600 bg-red-50" : "text-gray-600 hover:bg-gray-50"
            )}
          >
            {liked ? <FaHeart className="h-4 w-4" /> : <FaRegHeart className="h-4 w-4" />}
            <span className="text-sm font-medium">
              {(post.likes || 0) + (liked ? 1 : 0)}
            </span>
          </Button>

          {post.allowComments !== false && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleComment}
              className="flex items-center space-x-2 px-3 py-2 rounded-xl text-gray-600 hover:bg-gray-50 transition-all"
            >
              <FaRegComment className="h-4 w-4" />
              <span className="text-sm font-medium">{post.commentCount || 0}</span>
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={handleShare}
            className="flex items-center space-x-2 px-3 py-2 rounded-xl text-gray-600 hover:bg-gray-50 transition-all"
          >
            <FaRegPaperPlane className="h-4 w-4" />
            <span className="text-sm font-medium">{post.shareCount || 0}</span>
          </Button>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleBookmark}
          className={cn(
            "p-2 rounded-xl transition-all",
            bookmarked ? "text-blue-600 bg-blue-50" : "text-gray-600 hover:bg-gray-50"
          )}
        >
          {bookmarked ? <FaBookmark className="h-4 w-4" /> : <FaRegBookmark className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
};
