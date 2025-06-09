'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import {
  UserPlusIcon,
  BanknotesIcon,
  CalendarIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { 
  ConnectionRequestFormData,
  ConnectionType,
  MeetingType,
  Urgency,
  validateConnectionRequestData
} from '@/lib/investors';

interface ConnectionRequestFormProps {
  recipientId: string;
  recipientName: string;
  recipientType: 'investor' | 'startup';
  relatedStartupId?: string;
  relatedPitchId?: string;
  relatedEventId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const connectionTypes: ConnectionType[] = [
  'investment', 'partnership', 'mentorship', 'advisory', 
  'customer', 'networking', 'collaboration', 'other'
];

const meetingTypes: MeetingType[] = [
  'video-call', 'phone-call', 'in-person', 'coffee-chat', 'email', 'no-preference'
];

const urgencyLevels: Urgency[] = ['high', 'medium', 'low'];

const investmentTimeframes = [
  'immediate', '1-month', '3-months', '6-months', 'future'
];

const dueDiligenceRequirements = [
  'financials', 'customer-refs', 'technical', 'legal', 
  'market', 'background', 'ip', 'competitive'
];

export default function ConnectionRequestForm({
  recipientId,
  recipientName,
  recipientType,
  relatedStartupId,
  relatedPitchId,
  relatedEventId,
  onSuccess,
  onCancel
}: ConnectionRequestFormProps) {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState<ConnectionRequestFormData>({
    recipient: recipientId,
    connectionType: recipientType === 'investor' ? 'investment' : 'partnership',
    relatedStartup: relatedStartupId,
    relatedPitch: relatedPitchId,
    relatedEvent: relatedEventId,
    subject: '',
    message: '',
    proposedMeetingType: 'video-call',
    urgency: 'medium',
    investmentDetails: {
      interestedInLeading: false,
      timeframe: '3-months',
      dueDiligenceRequirements: [],
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session?.user?.id) {
      toast.error('You must be logged in to send connection requests');
      return;
    }

    const validation = validateConnectionRequestData(formData);
    if (!validation.isValid) {
      toast.error(validation.errors[0]);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/connection-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to send connection request');
      }

      toast.success('Connection request sent successfully!');
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error sending connection request:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to send connection request');
    } finally {
      setIsLoading(false);
    }
  };

  const formatLabel = (value: string) => {
    return value.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const toggleDueDiligenceRequirement = (requirement: string) => {
    setFormData(prev => ({
      ...prev,
      investmentDetails: {
        ...prev.investmentDetails!,
        dueDiligenceRequirements: prev.investmentDetails!.dueDiligenceRequirements.includes(requirement)
          ? prev.investmentDetails!.dueDiligenceRequirements.filter(r => r !== requirement)
          : [...prev.investmentDetails!.dueDiligenceRequirements, requirement]
      }
    }));
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <UserPlusIcon className="h-6 w-6 text-blue-500" />
          <CardTitle>Connect with {recipientName}</CardTitle>
        </div>
        <CardDescription>
          Send a connection request to start a conversation
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Connection Type */}
          <div className="space-y-2">
            <Label htmlFor="connectionType">Connection Type *</Label>
            <Select 
              value={formData.connectionType} 
              onValueChange={(value: ConnectionType) => 
                setFormData(prev => ({ ...prev, connectionType: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {connectionTypes.map(type => (
                  <SelectItem key={type} value={type}>
                    {formatLabel(type)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Subject and Message */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject *</Label>
              <Input
                id="subject"
                value={formData.subject}
                onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="Brief subject line for your request"
                maxLength={100}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message *</Label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Personalized message explaining why you want to connect..."
                rows={5}
                maxLength={1000}
              />
              <p className="text-xs text-gray-500">
                {formData.message.length}/1000 characters
              </p>
            </div>
          </div>

          {/* Meeting Preferences */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="proposedMeetingType">Preferred Meeting Type</Label>
              <Select 
                value={formData.proposedMeetingType} 
                onValueChange={(value: MeetingType) => 
                  setFormData(prev => ({ ...prev, proposedMeetingType: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {meetingTypes.map(type => (
                    <SelectItem key={type} value={type}>
                      {formatLabel(type)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="urgency">Urgency</Label>
              <Select 
                value={formData.urgency} 
                onValueChange={(value: Urgency) => 
                  setFormData(prev => ({ ...prev, urgency: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">
                    <div className="flex items-center space-x-2">
                      <ClockIcon className="h-4 w-4 text-red-500" />
                      <span>High - Time Sensitive</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="medium">
                    <div className="flex items-center space-x-2">
                      <ClockIcon className="h-4 w-4 text-yellow-500" />
                      <span>Medium - Within 2 Weeks</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="low">
                    <div className="flex items-center space-x-2">
                      <ClockIcon className="h-4 w-4 text-green-500" />
                      <span>Low - No Rush</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Investment-Specific Details */}
          {formData.connectionType === 'investment' && (
            <>
              <Separator />
              <div className="space-y-6">
                <div className="flex items-center space-x-2">
                  <BanknotesIcon className="h-5 w-5 text-green-500" />
                  <h3 className="text-lg font-medium">Investment Details</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="potentialAmount">Potential Investment Amount ($)</Label>
                    <Input
                      id="potentialAmount"
                      type="number"
                      min="0"
                      value={formData.investmentDetails?.potentialAmount || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        investmentDetails: {
                          ...prev.investmentDetails!,
                          potentialAmount: parseInt(e.target.value) || undefined
                        }
                      }))}
                      placeholder="0"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="timeframe">Investment Timeframe</Label>
                    <Select 
                      value={formData.investmentDetails?.timeframe} 
                      onValueChange={(value) => 
                        setFormData(prev => ({
                          ...prev,
                          investmentDetails: {
                            ...prev.investmentDetails!,
                            timeframe: value as any
                          }
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {investmentTimeframes.map(timeframe => (
                          <SelectItem key={timeframe} value={timeframe}>
                            {formatLabel(timeframe)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="interestedInLeading"
                    checked={formData.investmentDetails?.interestedInLeading}
                    onCheckedChange={(checked) => 
                      setFormData(prev => ({
                        ...prev,
                        investmentDetails: {
                          ...prev.investmentDetails!,
                          interestedInLeading: checked as boolean
                        }
                      }))
                    }
                  />
                  <Label htmlFor="interestedInLeading">
                    I'm interested in leading this round
                  </Label>
                </div>

                <div className="space-y-3">
                  <Label>Due Diligence Requirements</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {dueDiligenceRequirements.map(requirement => (
                      <div key={requirement} className="flex items-center space-x-2">
                        <Checkbox
                          id={requirement}
                          checked={formData.investmentDetails?.dueDiligenceRequirements.includes(requirement)}
                          onCheckedChange={() => toggleDueDiligenceRequirement(requirement)}
                        />
                        <Label htmlFor={requirement} className="text-sm">
                          {formatLabel(requirement)}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Sending...' : 'Send Connection Request'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
