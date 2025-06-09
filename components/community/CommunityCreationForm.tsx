"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Loader2, Users, Globe, Lock } from 'lucide-react';

interface Startup {
  _id: string;
  title?: string;
  name?: string;
  description?: string;
  image?: string;
}

interface CommunityCreationFormProps {
  startup: Startup;
}

export default function CommunityCreationForm({ startup }: CommunityCreationFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);

  // Get startup name from either title or name field
  const startupName = startup.title || startup.name || 'Startup';

  const [formData, setFormData] = useState({
    name: `${startupName} Community`,
    description: `Official community for ${startupName}. Connect with users, share updates, and discuss everything related to ${startupName}.`,
    isPublic: true,
    allowGuestPosts: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);

    try {
      const response = await fetch('/api/communities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startupId: startup._id,
          name: formData.name.trim(),
          description: formData.description.trim(),
          isPublic: formData.isPublic,
          allowGuestPosts: formData.allowGuestPosts,
        }),
      });

      if (response.ok) {
        const community = await response.json();
        
        toast({
          title: 'Success!',
          description: 'Community created successfully.',
        });

        // Redirect to the new community
        router.push(`/community/${community.slug.current}`);
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create community');
      }
    } catch (error) {
      console.error('Error creating community:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create community',
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="size-5" />
          Community Details
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Community Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Community Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter community name"
              required
              maxLength={100}
            />
          </div>

          {/* Community Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe what this community is about"
              rows={4}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground">
              {formData.description.length}/500 characters
            </p>
          </div>

          {/* Community Settings */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Community Settings</h3>
            
            {/* Public/Private */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {formData.isPublic ? (
                  <Globe className="size-4 text-green-600" />
                ) : (
                  <Lock className="size-4 text-orange-600" />
                )}
                <div>
                  <Label htmlFor="isPublic">Public Community</Label>
                  <p className="text-xs text-muted-foreground">
                    {formData.isPublic 
                      ? 'Anyone can view and join this community'
                      : 'Only invited members can view this community'
                    }
                  </p>
                </div>
              </div>
              <Switch
                id="isPublic"
                checked={formData.isPublic}
                onCheckedChange={(checked) => handleInputChange('isPublic', checked)}
              />
            </div>

            {/* Guest Posts */}
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="allowGuestPosts">Allow Guest Posts</Label>
                <p className="text-xs text-muted-foreground">
                  Let community members create posts, not just founders
                </p>
              </div>
              <Switch
                id="allowGuestPosts"
                checked={formData.allowGuestPosts}
                onCheckedChange={(checked) => handleInputChange('allowGuestPosts', checked)}
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isCreating || !formData.name.trim()}
              className="flex-1"
            >
              {isCreating ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" />
                  Creating Community...
                </>
              ) : (
                'Create Community'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
