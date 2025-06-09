'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';

interface CommunityCreationModalProps {
  startupId: string;
  startupTitle: string;
  children: React.ReactNode;
}

export function CommunityCreationModal({ startupId, startupTitle, children }: CommunityCreationModalProps) {
  const { user, isLoaded } = useUser();
  const { toast } = useToast();
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateCommunity = async () => {
    if (!isLoaded || !user) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to create a community',
        variant: 'destructive',
      });
      return;
    }

    setIsCreating(true);

    try {
      console.log('Automatically creating community for startup:', startupId);

      // Show immediate feedback
      toast({
        title: 'Creating Community...',
        description: `Setting up ${startupTitle} Community automatically.`,
      });

      // Use the automatic community creation workflow
      // Navigate to the community creation page which will handle automatic creation
      router.push(`/startup/${startupId}/community`);

    } catch (error) {
      console.error('Error navigating to community creation:', error);
      toast({
        title: 'Error',
        description: 'Failed to start community creation. Please try again.',
        variant: 'destructive',
      });
      setIsCreating(false);
    }
  };

  // Since we're using automatic creation, we don't need a modal anymore
  // Just trigger the creation directly when the button is clicked
  return (
    <div onClick={handleCreateCommunity}>
      {children}
    </div>
  );
}
