'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import {
  Heart,
  Banknote,
  Users,
  FileText,
} from '@heroicons/react/24/outline';
import { 
  InvestmentInterestFormData,
  InterestLevel,
  InvestmentStageInterest,
  ReasonForInterest,
  InterestSource,
  InterestVisibility,
  validateInvestmentInterestData,
  getInterestLevelLabel,
  getInterestLevelColor
} from '@/lib/investors';

interface InvestmentInterestFormProps {
  startupId: string;
  startupName: string;
  pitchId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const interestLevels: InterestLevel[] = ['very-high', 'high', 'medium', 'low', 'watching'];

const investmentStages: InvestmentStageInterest[] = ['current', 'next', 'future', 'any'];

const reasonsForInterest: ReasonForInterest[] = [
  'strong-team', 'large-market', 'innovative-product', 'proven-traction',
  'competitive-advantage', 'scalable-model', 'industry-expertise', 'strategic-fit',
  'network-synergies', 'tech-innovation', 'market-timing', 'financial-performance'
];

const interestSources: InterestSource[] = [
  'platform', 'pitch-event', 'demo-day', 'referral', 'cold-outreach',
  'warm-intro', 'conference', 'social-media', 'other'
];

export default function InvestmentInterestForm({
  startupId,
  startupName,
  pitchId,
  onSuccess,
  onCancel
}: InvestmentInterestFormProps) {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState<InvestmentInterestFormData>({
    startup: startupId,
    pitch: pitchId,
    interestLevel: 'medium',
    investmentStage: 'current',
    potentialInvestmentAmount: 0,
    leadInterest: false,
    reasonsForInterest: [],
    notes: '',
    concerns: '',
    source: 'platform',
    visibility: 'private',
    allowStartupContact: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session?.user?.id) {
      toast.error('You must be logged in to express investment interest');
      return;
    }

    const validation = validateInvestmentInterestData(formData);
    if (!validation.isValid) {
      toast.error(validation.errors[0]);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/investment-interests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to express investment interest');
      }

      toast.success('Investment interest expressed successfully!');
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error expressing investment interest:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to express investment interest');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleReasonForInterest = (reason: ReasonForInterest) => {
    setFormData(prev => ({
      ...prev,
      reasonsForInterest: prev.reasonsForInterest?.includes(reason)
        ? prev.reasonsForInterest.filter(r => r !== reason)
        : [...(prev.reasonsForInterest || []), reason]
    }));
  };

  const formatReasonLabel = (reason: string) => {
    return reason.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatSourceLabel = (source: string) => {
    return source.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <HeartIcon className="h-6 w-6 text-red-500" />
          <CardTitle>Express Investment Interest</CardTitle>
        </div>
        <CardDescription>
          Express your interest in investing in <strong>{startupName}</strong>
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Interest Level */}
          <div className="space-y-3">
            <Label>Interest Level *</Label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {interestLevels.map(level => (
                <Button
                  key={level}
                  type="button"
                  variant={formData.interestLevel === level ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFormData(prev => ({ ...prev, interestLevel: level }))}
                  className={`justify-center ${
                    formData.interestLevel === level 
                      ? getInterestLevelColor(level).replace('text-', 'bg-').replace('bg-', 'bg-') + ' text-white'
                      : ''
                  }`}
                >
                  {getInterestLevelLabel(level)}
                </Button>
              ))}
            </div>
          </div>

          {/* Investment Stage & Amount */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="investmentStage">Investment Stage *</Label>
              <Select 
                value={formData.investmentStage} 
                onValueChange={(value: InvestmentStageInterest) => 
                  setFormData(prev => ({ ...prev, investmentStage: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current">Current Round</SelectItem>
                  <SelectItem value="next">Next Round</SelectItem>
                  <SelectItem value="future">Future Rounds</SelectItem>
                  <SelectItem value="any">Any Round</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="potentialInvestmentAmount">Potential Investment Amount ($)</Label>
              <div className="relative">
                <BanknotesIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="potentialInvestmentAmount"
                  type="number"
                  min="0"
                  value={formData.potentialInvestmentAmount}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    potentialInvestmentAmount: parseInt(e.target.value) || 0 
                  }))}
                  placeholder="0"
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* Lead Interest */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="leadInterest"
              checked={formData.leadInterest}
              onCheckedChange={(checked) => 
                setFormData(prev => ({ ...prev, leadInterest: checked as boolean }))
              }
            />
            <Label htmlFor="leadInterest" className="flex items-center space-x-2">
              <UserGroupIcon className="h-4 w-4" />
              <span>I'm interested in leading this round</span>
            </Label>
          </div>

          <Separator />

          {/* Reasons for Interest */}
          <div className="space-y-3">
            <Label>Reasons for Interest</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {reasonsForInterest.map(reason => (
                <Badge
                  key={reason}
                  variant={formData.reasonsForInterest?.includes(reason) ? "default" : "outline"}
                  className="cursor-pointer justify-center py-2"
                  onClick={() => toggleReasonForInterest(reason)}
                >
                  {formatReasonLabel(reason)}
                </Badge>
              ))}
            </div>
          </div>

          {/* Notes and Concerns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="notes">Investment Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="What excites you about this opportunity?"
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="concerns">Questions or Concerns</Label>
              <Textarea
                id="concerns"
                value={formData.concerns}
                onChange={(e) => setFormData(prev => ({ ...prev, concerns: e.target.value }))}
                placeholder="Any questions or areas you'd like to explore?"
                rows={4}
              />
            </div>
          </div>

          <Separator />

          {/* Source and Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="source">How did you discover this startup?</Label>
              <Select 
                value={formData.source} 
                onValueChange={(value: InterestSource) => 
                  setFormData(prev => ({ ...prev, source: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {interestSources.map(source => (
                    <SelectItem key={source} value={source}>
                      {formatSourceLabel(source)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="visibility">Visibility</Label>
              <Select 
                value={formData.visibility} 
                onValueChange={(value: InterestVisibility) => 
                  setFormData(prev => ({ ...prev, visibility: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="private">Private (only you can see)</SelectItem>
                  <SelectItem value="startup-visible">Visible to startup</SelectItem>
                  <SelectItem value="public">Public interest</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Contact Permission */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="allowStartupContact"
              checked={formData.allowStartupContact}
              onCheckedChange={(checked) => 
                setFormData(prev => ({ ...prev, allowStartupContact: checked as boolean }))
              }
            />
            <Label htmlFor="allowStartupContact" className="flex items-center space-x-2">
              <DocumentTextIcon className="h-4 w-4" />
              <span>Allow the startup to contact me about this interest</span>
            </Label>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Expressing Interest...' : 'Express Interest'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
