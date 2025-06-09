"use client";

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  MoreHorizontal,
  ThumbsUp,
  Laugh,
  Angry,
  Sad,
  Clock
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { communityComponents } from '@/lib/design/community-theme';

interface PostProps {
  post: {
    _id: string;
    content: string;
    author: {
      _id: string;
      name: string;
      image?: string;
      role?: string;
    };
    createdAt: string;
    reactions: {
      type: 'like' | 'love' | 'laugh' | 'angry' | 'sad';
      count: number;
      userReacted: boolean;
    }[];
    commentCount: number;
    shareCount: number;
    attachments?: {
      type: 'image' | 'video' | 'file';
      url: string;
      name: string;
    }[];
  };
  onReaction?: (postId: string, reactionType: string) => void;
  onComment?: (postId: string) => void;
  onShare?: (postId: string) => void;
  className?: string;
}

const reactionIcons = {
  like: ThumbsUp,
  love: Heart,
  laugh: Laugh,
  angry: Angry,
  sad: Sad,
};

const reactionColors = {
  like: 'text-blue-500',
  love: 'text-red-500',
  laugh: 'text-yellow-500',
  angry: 'text-red-600',
  sad: 'text-gray-500',
};

export default function Post({ 
  post, 
  onReaction, 
  onComment, 
  onShare, 
  className 
}: PostProps) {
  const [showReactions, setShowReactions] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleReaction = (reactionType: string) => {
    onReaction?.(post._id, reactionType);
    setShowReactions(false);
  };

  const totalReactions = post.reactions.reduce((sum, reaction) => sum + reaction.count, 0);
  const userReactions = post.reactions.filter(reaction => reaction.userReacted);

  // Truncate long content
  const shouldTruncate = post.content.length > 300;
  const displayContent = shouldTruncate && !isExpanded 
    ? post.content.slice(0, 300) + '...' 
    : post.content;

  return (
    <Card className={`${communityComponents.card.base} ${communityComponents.card.hover} ${className}`}>
      <CardContent className="p-6">
        {/* Post Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={post.author.image} alt={post.author.name} />
              <AvatarFallback>
                {post.author.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-medium text-sm">{post.author.name}</h4>
                {post.author.role && (
                  <Badge variant="secondary" className="text-xs">
                    {post.author.role}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Clock className="h-3 w-3" />
                <span>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
              </div>
            </div>
          </div>
          
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-600">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>

        {/* Post Content */}
        <div className="mb-4">
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
            {displayContent}
          </p>
          
          {shouldTruncate && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-gray-500 hover:text-black p-0 h-auto mt-2"
            >
              {isExpanded ? 'Show less' : 'Read more'}
            </Button>
          )}
        </div>

        {/* Attachments */}
        {post.attachments && post.attachments.length > 0 && (
          <div className="mb-4 space-y-2">
            {post.attachments.map((attachment, index) => (
              <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                {attachment.type === 'image' && (
                  <img 
                    src={attachment.url} 
                    alt={attachment.name}
                    className="w-full h-auto max-h-96 object-cover"
                  />
                )}
                {attachment.type === 'video' && (
                  <video 
                    src={attachment.url} 
                    controls
                    className="w-full h-auto max-h-96"
                  />
                )}
                {attachment.type === 'file' && (
                  <div className="p-3 bg-gray-50 flex items-center gap-2">
                    <div className="bg-gray-200 rounded p-2">
                      📄
                    </div>
                    <span className="text-sm font-medium">{attachment.name}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Reaction Summary */}
        {totalReactions > 0 && (
          <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-100">
            <div className="flex items-center gap-1">
              {post.reactions
                .filter(reaction => reaction.count > 0)
                .slice(0, 3)
                .map((reaction) => {
                  const Icon = reactionIcons[reaction.type];
                  return (
                    <div
                      key={reaction.type}
                      className={`w-5 h-5 rounded-full bg-white border flex items-center justify-center ${reactionColors[reaction.type]}`}
                    >
                      <Icon className="h-3 w-3" />
                    </div>
                  );
                })}
            </div>
            <span className="text-sm text-gray-500">
              {totalReactions} {totalReactions === 1 ? 'reaction' : 'reactions'}
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            {/* Reaction Button */}
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowReactions(!showReactions)}
                className={`flex items-center gap-2 ${
                  userReactions.length > 0 
                    ? 'text-blue-600 bg-blue-50 hover:bg-blue-100' 
                    : 'text-gray-500 hover:text-black hover:bg-gray-100'
                }`}
              >
                {userReactions.length > 0 ? (
                  (() => {
                    const Icon = reactionIcons[userReactions[0].type];
                    return <Icon className="h-4 w-4" />;
                  })()
                ) : (
                  <ThumbsUp className="h-4 w-4" />
                )}
                <span className="text-sm">
                  {userReactions.length > 0 ? 'Reacted' : 'React'}
                </span>
              </Button>

              {/* Reaction Picker */}
              {showReactions && (
                <div className="absolute bottom-full left-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg p-2 flex gap-1 z-10">
                  {Object.entries(reactionIcons).map(([type, Icon]) => (
                    <Button
                      key={type}
                      variant="ghost"
                      size="sm"
                      onClick={() => handleReaction(type)}
                      className={`p-2 hover:bg-gray-100 ${reactionColors[type as keyof typeof reactionColors]}`}
                    >
                      <Icon className="h-4 w-4" />
                    </Button>
                  ))}
                </div>
              )}
            </div>

            {/* Comment Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onComment?.(post._id)}
              className="flex items-center gap-2 text-gray-500 hover:text-black hover:bg-gray-100"
            >
              <MessageCircle className="h-4 w-4" />
              <span className="text-sm">
                {post.commentCount > 0 ? `${post.commentCount}` : 'Comment'}
              </span>
            </Button>

            {/* Share Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onShare?.(post._id)}
              className="flex items-center gap-2 text-gray-500 hover:text-black hover:bg-gray-100"
            >
              <Share2 className="h-4 w-4" />
              <span className="text-sm">
                {post.shareCount > 0 ? `${post.shareCount}` : 'Share'}
              </span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
