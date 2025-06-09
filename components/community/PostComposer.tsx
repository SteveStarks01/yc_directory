"use client";

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useUser } from '@clerk/nextjs';
import { 
  ImageIcon, 
  VideoIcon, 
  LinkIcon, 
  SmileIcon, 
  SendIcon,
  X,
  Upload
} from 'lucide-react';
import { communityColors, communityComponents } from '@/lib/design/community-theme';

interface PostComposerProps {
  communityId: string;
  onPostCreated?: (post: any) => void;
  placeholder?: string;
  className?: string;
}

export default function PostComposer({ 
  communityId, 
  onPostCreated, 
  placeholder = "What's happening in your startup journey?",
  className 
}: PostComposerProps) {
  const { user } = useUser();
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim() && attachments.length === 0) return;

    setIsSubmitting(true);

    try {
      // For now, we'll send JSON data without file attachments
      // TODO: Implement file upload functionality later
      const postData = {
        content: content.trim(),
        postType: 'text',
        images: [], // TODO: Handle file uploads
        tags: [], // TODO: Extract hashtags from content
      };

      const response = await fetch(`/api/communities/${communityId}/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create post');
      }

      const newPost = await response.json();

      // Reset form
      setContent('');
      setAttachments([]);

      // Notify parent component
      onPostCreated?.(newPost);

    } catch (error) {
      console.error('Error creating post:', error);
      // TODO: Show error toast
      alert(`Failed to create post: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachments(prev => [...prev, ...files].slice(0, 4)); // Max 4 files
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const insertEmoji = (emoji: string) => {
    setContent(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const commonEmojis = ['👍', '❤️', '😊', '🎉', '🚀', '💡', '🔥', '👏'];

  if (!user) {
    return (
      <Card className={`${communityComponents.card.base} ${className}`}>
        <CardContent className="p-6 text-center">
          <p className="text-gray-500">Please sign in to create posts</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm ${className}`}>
      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* User Info */}
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12 ring-2 ring-gray-100">
              <AvatarImage src={user.imageUrl} alt={user.fullName || ''} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                {user.fullName?.charAt(0) || user.emailAddresses[0]?.emailAddress.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-gray-900">{user.fullName}</p>
              <Badge variant="secondary" className="text-xs bg-blue-50 text-blue-700">
                Community Member
              </Badge>
            </div>
          </div>

          {/* Content Input */}
          <div className="space-y-3">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={placeholder}
              className="min-h-[120px] resize-none border-0 bg-gray-50 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder:text-gray-500"
              maxLength={2000}
            />

            {/* Character Count */}
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-400">{content.length}/2000</span>
              {content.length > 1800 && (
                <span className="text-orange-500 font-medium">
                  {2000 - content.length} remaining
                </span>
              )}
            </div>
          </div>

          {/* Attachments Preview */}
          {attachments.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {attachments.map((file, index) => (
                <div key={index} className="relative group">
                  <div className="bg-gray-100 rounded-lg p-3 flex items-center gap-2">
                    {file.type.startsWith('image/') ? (
                      <ImageIcon className="h-4 w-4 text-gray-500" />
                    ) : file.type.startsWith('video/') ? (
                      <VideoIcon className="h-4 w-4 text-gray-500" />
                    ) : (
                      <LinkIcon className="h-4 w-4 text-gray-500" />
                    )}
                    <span className="text-sm truncate">{file.name}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeAttachment(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Emoji Picker */}
          {showEmojiPicker && (
            <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xl animate-in slide-in-from-top-2 duration-200">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Quick reactions</h4>
              <div className="grid grid-cols-8 gap-2">
                {commonEmojis.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    className="text-xl hover:bg-gray-100 rounded-xl p-2 transition-all duration-200 hover:scale-110"
                    onClick={() => insertEmoji(emoji)}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="flex items-center gap-1">
              {/* Image Upload - Temporarily disabled */}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled
                className="text-gray-300 cursor-not-allowed rounded-xl"
                title="File uploads coming soon"
              >
                <ImageIcon className="h-5 w-5" />
              </Button>

              {/* Video Upload - Temporarily disabled */}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled
                className="text-gray-300 cursor-not-allowed rounded-xl"
                title="Video uploads coming soon"
              >
                <VideoIcon className="h-5 w-5" />
              </Button>

              {/* Emoji Picker */}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="text-gray-500 hover:text-yellow-600 hover:bg-yellow-50 rounded-xl transition-all duration-200"
              >
                <SmileIcon className="h-5 w-5" />
              </Button>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={!content.trim() || isSubmitting}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-300 text-white rounded-xl px-6 py-2 font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {isSubmitting ? (
                <>
                  <Upload className="h-4 w-4 animate-spin mr-2" />
                  Posting...
                </>
              ) : (
                <>
                  <SendIcon className="h-4 w-4 mr-2" />
                  Post
                </>
              )}
            </Button>
          </div>
        </form>

        {/* Hidden File Inputs */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFileSelect}
        />
        <input
          ref={videoInputRef}
          type="file"
          accept="video/*"
          className="hidden"
          onChange={handleFileSelect}
        />
      </div>
    </div>
  );
}
