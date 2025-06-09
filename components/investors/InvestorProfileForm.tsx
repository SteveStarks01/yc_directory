'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { 
  InvestorProfileFormData, 
  InvestorType, 
  InvestmentStage, 
  InvestorIndustry,
  GeographicFocus,
  ValueAdd,
  validateInvestorProfileData,
  getInvestorTypeLabel,
  getInvestmentStageLabel
} from '@/lib/investors';

interface InvestorProfileFormProps {
  initialData?: Partial<InvestorProfileFormData>;
  isEditing?: boolean;
  onSuccess?: () => void;
}

const investorTypes: InvestorType[] = [
  'angel', 'vc', 'corporate-vc', 'pe', 'family-office', 
  'accelerator', 'government', 'crowdfunding', 'other'
];

const investmentStages: InvestmentStage[] = [
  'pre-seed', 'seed', 'series-a', 'series-b', 'series-c-plus', 'growth', 'late-stage'
];

const industries: InvestorIndustry[] = [
  'ai-ml', 'b2b-software', 'consumer', 'developer-tools', 'ecommerce',
  'education', 'enterprise', 'fintech', 'gaming', 'healthcare',
  'hardware', 'infrastructure', 'marketplace', 'media', 'mobile',
  'real-estate', 'robotics', 'saas', 'social', 'transportation', 'other'
];

const geographicFocus: GeographicFocus[] = [
  'north-america', 'us', 'canada', 'europe', 'uk', 'asia-pacific',
  'china', 'india', 'southeast-asia', 'latin-america', 'middle-east', 'africa', 'global'
];

const valueAddOptions: ValueAdd[] = [
  'strategic-guidance', 'business-development', 'customer-introductions',
  'talent-acquisition', 'technical-expertise', 'marketing-pr',
  'fundraising-support', 'international-expansion', 'regulatory-guidance',
  'board-participation', 'mentorship', 'network-access'
];

export default function InvestorProfileForm({ 
  initialData, 
  isEditing = false, 
  onSuccess 
}: InvestorProfileFormProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState<InvestorProfileFormData>({
    investorType: initialData?.investorType || 'angel',
    firmName: initialData?.firmName || '',
    title: initialData?.title || '',
    bio: initialData?.bio || '',
    investmentStages: initialData?.investmentStages || [],
    preferredIndustries: initialData?.preferredIndustries || [],
    geographicFocus: initialData?.geographicFocus || [],
    minInvestmentAmount: initialData?.minInvestmentAmount || 0,
    maxInvestmentAmount: initialData?.maxInvestmentAmount || 0,
    typicalCheckSize: initialData?.typicalCheckSize || 0,
    investmentsPerYear: initialData?.investmentsPerYear || 0,
    leadInvestments: initialData?.leadInvestments || false,
    followOnInvestments: initialData?.followOnInvestments || true,
    investmentPhilosophy: initialData?.investmentPhilosophy || '',
    valueAdd: initialData?.valueAdd || [],
    portfolioSize: initialData?.portfolioSize || 0,
    contactPreferences: initialData?.contactPreferences || {
      acceptsColdOutreach: true,
      preferredContactMethod: 'email',
      responseTime: '2-3d',
    },
    accredited: initialData?.accredited || false,
    activelyInvesting: initialData?.activelyInvesting !== false,
    visibility: initialData?.visibility || 'community',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session?.user?.id) {
      toast.error('You must be logged in to create an investor profile');
      return;
    }

    const validation = validateInvestorProfileData(formData);
    if (!validation.isValid) {
      toast.error(validation.errors[0]);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/investors', {
        method: isEditing ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save investor profile');
      }

      const result = await response.json();
      
      toast.success(
        isEditing 
          ? 'Investor profile updated successfully!' 
          : 'Investor profile created successfully!'
      );
      
      if (onSuccess) {
        onSuccess();
      } else {
        router.push(`/investors/${session.user.id}`);
      }
    } catch (error) {
      console.error('Error saving investor profile:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save investor profile');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleArrayItem = <T,>(array: T[], item: T): T[] => {
    return array.includes(item) 
      ? array.filter(i => i !== item)
      : [...array, item];
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>
            Tell us about yourself and your investment background
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="investorType">Investor Type *</Label>
              <Select 
                value={formData.investorType} 
                onValueChange={(value: InvestorType) => 
                  setFormData(prev => ({ ...prev, investorType: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select investor type" />
                </SelectTrigger>
                <SelectContent>
                  {investorTypes.map(type => (
                    <SelectItem key={type} value={type}>
                      {getInvestorTypeLabel(type)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="firmName">Firm/Organization Name</Label>
              <Input
                id="firmName"
                value={formData.firmName}
                onChange={(e) => setFormData(prev => ({ ...prev, firmName: e.target.value }))}
                placeholder="e.g., Acme Ventures"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Title/Position</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Partner, Managing Director"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="portfolioSize">Portfolio Size</Label>
              <Input
                id="portfolioSize"
                type="number"
                min="0"
                value={formData.portfolioSize}
                onChange={(e) => setFormData(prev => ({ ...prev, portfolioSize: parseInt(e.target.value) || 0 }))}
                placeholder="Number of portfolio companies"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
              placeholder="Brief description of your investment background and experience..."
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      {/* Investment Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Investment Preferences</CardTitle>
          <CardDescription>
            Define your investment criteria and preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label>Investment Stages *</Label>
            <div className="flex flex-wrap gap-2">
              {investmentStages.map(stage => (
                <Badge
                  key={stage}
                  variant={formData.investmentStages.includes(stage) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setFormData(prev => ({
                    ...prev,
                    investmentStages: toggleArrayItem(prev.investmentStages, stage)
                  }))}
                >
                  {getInvestmentStageLabel(stage)}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <Label>Preferred Industries *</Label>
            <div className="flex flex-wrap gap-2">
              {industries.map(industry => (
                <Badge
                  key={industry}
                  variant={formData.preferredIndustries.includes(industry) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setFormData(prev => ({
                    ...prev,
                    preferredIndustries: toggleArrayItem(prev.preferredIndustries, industry)
                  }))}
                >
                  {industry.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <Label>Geographic Focus</Label>
            <div className="flex flex-wrap gap-2">
              {geographicFocus.map(geo => (
                <Badge
                  key={geo}
                  variant={formData.geographicFocus?.includes(geo) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setFormData(prev => ({
                    ...prev,
                    geographicFocus: toggleArrayItem(prev.geographicFocus || [], geo)
                  }))}
                >
                  {geo.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </Badge>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="minInvestmentAmount">Min Investment ($)</Label>
              <Input
                id="minInvestmentAmount"
                type="number"
                min="0"
                value={formData.minInvestmentAmount}
                onChange={(e) => setFormData(prev => ({ ...prev, minInvestmentAmount: parseInt(e.target.value) || 0 }))}
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxInvestmentAmount">Max Investment ($)</Label>
              <Input
                id="maxInvestmentAmount"
                type="number"
                min="0"
                value={formData.maxInvestmentAmount}
                onChange={(e) => setFormData(prev => ({ ...prev, maxInvestmentAmount: parseInt(e.target.value) || 0 }))}
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="typicalCheckSize">Typical Check Size ($)</Label>
              <Input
                id="typicalCheckSize"
                type="number"
                min="0"
                value={formData.typicalCheckSize}
                onChange={(e) => setFormData(prev => ({ ...prev, typicalCheckSize: parseInt(e.target.value) || 0 }))}
                placeholder="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="investmentsPerYear">Investments Per Year</Label>
              <Input
                id="investmentsPerYear"
                type="number"
                min="0"
                value={formData.investmentsPerYear}
                onChange={(e) => setFormData(prev => ({ ...prev, investmentsPerYear: parseInt(e.target.value) || 0 }))}
                placeholder="0"
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="leadInvestments"
                  checked={formData.leadInvestments}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, leadInvestments: checked as boolean }))
                  }
                />
                <Label htmlFor="leadInvestments">I lead investment rounds</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="followOnInvestments"
                  checked={formData.followOnInvestments}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, followOnInvestments: checked as boolean }))
                  }
                />
                <Label htmlFor="followOnInvestments">I make follow-on investments</Label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Value Add & Philosophy */}
      <Card>
        <CardHeader>
          <CardTitle>Value Add & Investment Philosophy</CardTitle>
          <CardDescription>
            How do you add value beyond capital?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label>Value Add</Label>
            <div className="flex flex-wrap gap-2">
              {valueAddOptions.map(value => (
                <Badge
                  key={value}
                  variant={formData.valueAdd?.includes(value) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setFormData(prev => ({
                    ...prev,
                    valueAdd: toggleArrayItem(prev.valueAdd || [], value)
                  }))}
                >
                  {value.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="investmentPhilosophy">Investment Philosophy</Label>
            <Textarea
              id="investmentPhilosophy"
              value={formData.investmentPhilosophy}
              onChange={(e) => setFormData(prev => ({ ...prev, investmentPhilosophy: e.target.value }))}
              placeholder="Describe your approach to investing and what you look for in startups..."
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      {/* Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Settings</CardTitle>
          <CardDescription>
            Configure your profile visibility and status
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="visibility">Profile Visibility</Label>
              <Select 
                value={formData.visibility} 
                onValueChange={(value) => 
                  setFormData(prev => ({ ...prev, visibility: value as any }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="community">Community Only</SelectItem>
                  <SelectItem value="verified-startups">Verified Startups Only</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="accredited"
                  checked={formData.accredited}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, accredited: checked as boolean }))
                  }
                />
                <Label htmlFor="accredited">I am an accredited investor</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="activelyInvesting"
                  checked={formData.activelyInvesting}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, activelyInvesting: checked as boolean }))
                  }
                />
                <Label htmlFor="activelyInvesting">I am actively making new investments</Label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button type="submit" disabled={isLoading} size="lg">
          {isLoading ? 'Saving...' : isEditing ? 'Update Profile' : 'Create Profile'}
        </Button>
      </div>
    </form>
  );
}
