'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useTwitterCharacterCount } from '@/hooks/useCharacterCount';
import { useTypingIndicator, useWebSocketConnection } from '@/hooks/useRealtime';
import PostTypeSelector, { PostType, getPostTypePlaceholder } from './ui/PostTypeSelector';
import { LiveStatusIndicator } from './realtime/LiveUpdateBadge';
import {
  PaperAirplaneIcon,
  XMarkIcon,
  PhotoIcon,
  TagIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface CommunityPostFormProps {
  communityId: string;
  onPostCreated: () => void;
  onCancel: () => void;
}

export default function CommunityPostForm({
  communityId,
  onPostCreated,
  onCancel
}: CommunityPostFormProps) {
  const [content, setContent] = useState('');
  const [postType, setPostType] = useState<PostType>('text');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Character count management with 280 character limit
  const characterCount = useTwitterCharacterCount(content);

  // Real-time features
  const { isConnected } = useWebSocketConnection();
  const { startTyping, stopTyping } = useTypingIndicator(null); // Will be updated when we have postId

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim()) && tags.length < 5) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter some content for your post',
        variant: 'destructive',
      });
      return;
    }

    if (characterCount.isOverLimit) {
      toast({
        title: 'Content too long',
        description: `Your post is ${Math.abs(characterCount.remaining)} characters over the 280 character limit`,
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/communities/${communityId}/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: [
            {
              _type: 'block',
              _key: 'content',
              style: 'normal',
              children: [
                {
                  _type: 'span',
                  _key: 'span',
                  text: content.trim(),
                  marks: [],
                },
              ],
            },
          ],
          postType,
          tags,
          // Add metadata for enhanced post types
          metadata: {
            characterCount: characterCount.count,
            postTypeSelected: postType,
          },
        }),
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Your post has been created!',
        });
        setContent('');
        setPostType('text');
        setTags([]);
        onPostCreated();
      } else {
        const error = await response.json();
        toast({
          title: 'Error',
          description: error.error || 'Failed to create post',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Form Header with Real-time Status */}
      <div className="flex items-center justify-between pb-2 border-b border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900">Create New Post</h3>
        <LiveStatusIndicator isConnected={isConnected} />
      </div>

      {/* Enhanced Post Type Selection */}
      <PostTypeSelector
        value={postType}
        onValueChange={setPostType}
        disabled={isSubmitting}
        showDescription={true}
      />

      {/* Content Input */}
      <div>
        <Textarea
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            // Trigger typing indicator when user starts typing
            if (e.target.value.length > 0) {
              startTyping();
            } else {
              stopTyping();
            }
          }}
          onBlur={stopTyping}
          placeholder={getPostTypePlaceholder(postType)}
          className={`min-h-[120px] resize-none transition-colors ${
            characterCount.isOverLimit ? 'border-red-500 focus:border-red-500' : ''
          }`}
          maxLength={280}
        />
        <div className="flex justify-between items-center mt-2">
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
            {/* Character count with visual feedback */}
            <span className={`text-xs font-medium ${characterCount.colorClass}`}>
              {characterCount.count}/280
            </span>
            {/* Visual progress indicator */}
            <div className="w-8 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-200 ${
                  characterCount.isOverLimit
                    ? 'bg-red-500'
                    : characterCount.isDanger
                    ? 'bg-red-400'
                    : characterCount.isWarning
                    ? 'bg-yellow-400'
                    : 'bg-green-400'
                }`}
                style={{
                  width: `${Math.min(characterCount.percentage, 100)}%`
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tags Input */}
      <div>
        <label className="text-sm font-medium text-gray-700 mb-2 block">
          Tags (optional)
        </label>
        <div className="flex flex-wrap gap-2 mb-2">
          {tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="flex items-center gap-1">
              <TagIcon className="w-3 h-3" />
              {tag}
              <button
                type="button"
                onClick={() => handleRemoveTag(tag)}
                className="ml-1 hover:text-red-500"
              >
                <XMarkIcon className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
        {tags.length < 5 && (
          <div className="flex gap-2">
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
              placeholder="Add a tag..."
              className="flex-1 px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              maxLength={20}
            />
            <Button
              type="button"
              onClick={handleAddTag}
              variant="outline"
              size="sm"
              disabled={!newTag.trim()}
            >
              Add
            </Button>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button
          type="button"
          onClick={onCancel}
          variant="outline"
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting || !content.trim() || characterCount.isOverLimit}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Posting...
            </>
          ) : (
            <>
              <PaperAirplaneIcon className="w-4 h-4 mr-2" />
              Post
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
