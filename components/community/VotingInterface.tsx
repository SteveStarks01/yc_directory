'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { 
  StarIcon,
  HandThumbUpIcon,
  HandThumbDownIcon,
  TrophyIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

interface VotingTarget {
  _id: string;
  name?: string;
  title?: string;
  userId?: string;
  firmName?: string;
  logo?: any;
  profileImage?: any;
  industry?: string;
  stage?: string;
  tagline?: string;
}

interface Vote {
  _id: string;
  voteType: string;
  category: string;
  voteValue: number;
  maxVoteValue: number;
  comment?: string;
  weight: number;
  confidence: number;
  votedAt: string;
  voter: {
    userId: string;
    role: string;
  };
}

interface VotingStats {
  totalVotes: number;
  averageRating: number;
  weightedAverage: number;
  ratingDistribution: {
    [key: string]: number;
  };
}

interface VotingInterfaceProps {
  targetType: 'startup' | 'founder' | 'pitch' | 'event' | 'resource' | 'investor';
  targetId: string;
  target: VotingTarget;
  voteType: string;
  category: string;
  currentUserId?: string;
  allowVoting?: boolean;
  showStats?: boolean;
  maxVoteValue?: number;
}

export default function VotingInterface({
  targetType,
  targetId,
  target,
  voteType,
  category,
  currentUserId,
  allowVoting = true,
  showStats = true,
  maxVoteValue = 5,
}: VotingInterfaceProps) {
  const [userVote, setUserVote] = useState<Vote | null>(null);
  const [votingStats, setVotingStats] = useState<VotingStats | null>(null);
  const [selectedRating, setSelectedRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);

  useEffect(() => {
    if (currentUserId) {
      fetchUserVote();
    }
    if (showStats) {
      fetchVotingStats();
    }
  }, [targetId, voteType, currentUserId]);

  const fetchUserVote = async () => {
    try {
      const response = await fetch(
        `/api/community-votes?targetType=${targetType}&targetId=${targetId}&voteType=${voteType}&userId=${currentUserId}`
      );
      if (response.ok) {
        const data = await response.json();
        if (data.votes && data.votes.length > 0) {
          const vote = data.votes[0];
          setUserVote(vote);
          setSelectedRating(vote.voteValue);
          setComment(vote.comment || '');
          setHasVoted(true);
        }
      }
    } catch (error) {
      console.error('Error fetching user vote:', error);
    }
  };

  const fetchVotingStats = async () => {
    try {
      const response = await fetch(
        `/api/community-votes?targetType=${targetType}&targetId=${targetId}&voteType=${voteType}&aggregated=true`
      );
      if (response.ok) {
        const data = await response.json();
        if (data.aggregatedResults && data.aggregatedResults.length > 0) {
          setVotingStats(data.aggregatedResults[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching voting stats:', error);
    }
  };

  const submitVote = async () => {
    if (!selectedRating || isSubmitting) return;

    try {
      setIsSubmitting(true);
      const voteData = {
        voteType,
        category,
        targetType,
        [`target${targetType.charAt(0).toUpperCase() + targetType.slice(1)}`]: targetId,
        voteValue: selectedRating,
        maxVoteValue,
        comment: comment.trim() || undefined,
      };

      const response = await fetch('/api/community-votes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(voteData),
      });

      if (response.ok) {
        const newVote = await response.json();
        setUserVote(newVote);
        setHasVoted(true);
        
        // Refresh stats
        if (showStats) {
          fetchVotingStats();
        }
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to submit vote');
      }
    } catch (error) {
      console.error('Error submitting vote:', error);
      alert('Failed to submit vote');
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateVote = async () => {
    if (!userVote || !selectedRating || isSubmitting) return;

    try {
      setIsSubmitting(true);
      const updateData = {
        voteId: userVote._id,
        voteValue: selectedRating,
        comment: comment.trim() || undefined,
      };

      const response = await fetch('/api/community-votes', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        const updatedVote = await response.json();
        setUserVote(updatedVote);
        
        // Refresh stats
        if (showStats) {
          fetchVotingStats();
        }
      }
    } catch (error) {
      console.error('Error updating vote:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = (interactive = false) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={!interactive || !allowVoting}
            onClick={() => interactive && setSelectedRating(star)}
            className={`${
              interactive && allowVoting ? 'cursor-pointer hover:scale-110' : 'cursor-default'
            } transition-transform`}
          >
            {star <= selectedRating ? (
              <StarIconSolid className="h-6 w-6 text-yellow-400" />
            ) : (
              <StarIcon className="h-6 w-6 text-gray-300" />
            )}
          </button>
        ))}
        {selectedRating > 0 && (
          <span className="ml-2 text-sm text-muted-foreground">
            {selectedRating}/{maxVoteValue}
          </span>
        )}
      </div>
    );
  };

  const getVoteTypeIcon = () => {
    switch (voteType) {
      case 'community-award':
        return <TrophyIcon className="h-5 w-5" />;
      case 'most-innovative':
        return <SparklesIcon className="h-5 w-5" />;
      default:
        return <StarIcon className="h-5 w-5" />;
    }
  };

  const getVoteTypeTitle = () => {
    return voteType.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const getTargetDisplayName = () => {
    return target.name || target.title || target.userId || target.firmName || 'Unknown';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-2">
          {getVoteTypeIcon()}
          <CardTitle className="text-lg">{getVoteTypeTitle()}</CardTitle>
          <Badge variant="outline">{category}</Badge>
        </div>
        <CardDescription>
          Rate {getTargetDisplayName()} for {getVoteTypeTitle().toLowerCase()}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Voting Stats */}
        {showStats && votingStats && (
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary">
                  {votingStats.totalVotes}
                </div>
                <div className="text-xs text-muted-foreground">Total Votes</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">
                  {votingStats.averageRating?.toFixed(1) || '0.0'}
                </div>
                <div className="text-xs text-muted-foreground">Average Rating</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">
                  {votingStats.weightedAverage?.toFixed(1) || '0.0'}
                </div>
                <div className="text-xs text-muted-foreground">Weighted Average</div>
              </div>
              <div>
                <div className="flex justify-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <StarIconSolid
                      key={star}
                      className={`h-4 w-4 ${
                        star <= Math.round(votingStats.weightedAverage || 0)
                          ? 'text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <div className="text-xs text-muted-foreground">Community Rating</div>
              </div>
            </div>

            {/* Rating Distribution */}
            <div className="mt-4 space-y-2">
              <h4 className="text-sm font-medium">Rating Distribution</h4>
              {[5, 4, 3, 2, 1].map((rating) => (
                <div key={rating} className="flex items-center space-x-2">
                  <span className="text-sm w-8">{rating}★</span>
                  <Progress
                    value={
                      votingStats.totalVotes > 0
                        ? ((votingStats.ratingDistribution[rating] || 0) / votingStats.totalVotes) * 100
                        : 0
                    }
                    className="flex-1 h-2"
                  />
                  <span className="text-sm text-muted-foreground w-8">
                    {votingStats.ratingDistribution[rating] || 0}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* User Voting Interface */}
        {allowVoting && currentUserId && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Your Rating</label>
              {renderStars(true)}
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Comment (Optional)
              </label>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your thoughts about this rating..."
                className="min-h-[80px]"
                maxLength={1000}
              />
              <div className="text-xs text-muted-foreground mt-1">
                {comment.length}/1000 characters
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {hasVoted ? 'Update your vote' : 'Submit your vote'}
              </div>
              <Button
                onClick={hasVoted ? updateVote : submitVote}
                disabled={!selectedRating || isSubmitting}
                className="min-w-[100px]"
              >
                {isSubmitting ? 'Submitting...' : hasVoted ? 'Update Vote' : 'Submit Vote'}
              </Button>
            </div>

            {hasVoted && userVote && (
              <div className="text-xs text-muted-foreground">
                You voted on {new Date(userVote.votedAt).toLocaleDateString()}
                {userVote.weight !== 1 && (
                  <span> • Vote weight: {userVote.weight.toFixed(1)}x</span>
                )}
              </div>
            )}
          </div>
        )}

        {/* Login prompt for non-authenticated users */}
        {allowVoting && !currentUserId && (
          <div className="text-center py-4">
            <p className="text-muted-foreground mb-2">
              Sign in to vote and share your opinion
            </p>
            <Button variant="outline" size="sm">
              Sign In to Vote
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
