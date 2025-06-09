"use client";

import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Copy, 
  Share2, 
  Twitter, 
  Facebook, 
  Linkedin, 
  Mail,
  MessageCircle,
  Check
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
  communityId: string;
  postContent?: string;
  postAuthor?: string;
}

export default function ShareModal({
  isOpen,
  onClose,
  postId,
  communityId,
  postContent,
  postAuthor
}: ShareModalProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  
  const postUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/community/${communityId}/post/${postId}`;
  const shareText = `Check out this post by ${postAuthor || 'a community member'}: ${postContent?.slice(0, 100)}${postContent && postContent.length > 100 ? '...' : ''}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(postUrl);
      setCopied(true);
      
      // Track the share
      await fetch(`/api/communities/${communityId}/posts/${postId}/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ shareType: 'link' }),
      });

      toast({
        title: "Link copied!",
        description: "Post URL has been copied to your clipboard.",
      });

      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Could not copy link to clipboard.",
        variant: "destructive",
      });
    }
  };

  const handleSocialShare = async (platform: string, url: string) => {
    try {
      // Track the share
      await fetch(`/api/communities/${communityId}/posts/${postId}/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ shareType: platform }),
      });

      // Open share URL
      window.open(url, '_blank', 'width=600,height=400');
      
      toast({
        title: "Shared successfully!",
        description: `Post shared on ${platform}.`,
      });
    } catch (error) {
      toast({
        title: "Share failed",
        description: `Could not share on ${platform}.`,
        variant: "destructive",
      });
    }
  };

  const shareOptions = [
    {
      name: 'Twitter',
      icon: Twitter,
      color: 'hover:bg-blue-50 hover:text-blue-600',
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(postUrl)}`,
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      color: 'hover:bg-blue-50 hover:text-blue-700',
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(postUrl)}`,
    },
    {
      name: 'Facebook',
      icon: Facebook,
      color: 'hover:bg-blue-50 hover:text-blue-800',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`,
    },
    {
      name: 'Email',
      icon: Mail,
      color: 'hover:bg-gray-50 hover:text-gray-700',
      url: `mailto:?subject=${encodeURIComponent(`Check out this post`)}&body=${encodeURIComponent(`${shareText}\n\n${postUrl}`)}`,
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-blue-600" />
            Share Post
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Copy Link Section */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-900">Copy Link</h4>
            <div className="flex gap-2">
              <Input
                value={postUrl}
                readOnly
                className="flex-1 text-sm bg-gray-50"
              />
              <Button
                onClick={handleCopyLink}
                variant="outline"
                size="sm"
                className={cn(
                  "px-3 transition-all duration-200",
                  copied && "bg-green-50 border-green-200 text-green-700"
                )}
              >
                {copied ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Social Share Options */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-900">Share on Social Media</h4>
            <div className="grid grid-cols-2 gap-2">
              {shareOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <Button
                    key={option.name}
                    variant="outline"
                    onClick={() => handleSocialShare(option.name.toLowerCase(), option.url)}
                    className={cn(
                      "flex items-center gap-2 justify-start p-3 h-auto transition-all duration-200",
                      option.color
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm">{option.name}</span>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Post Preview */}
          {postContent && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-900">Post Preview</h4>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-700 line-clamp-3">
                  {postContent}
                </p>
                {postAuthor && (
                  <p className="text-xs text-gray-500 mt-2">
                    by {postAuthor}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
