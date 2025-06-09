'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Separator } from '@/components/ui/separator';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from '@heroicons/react/24/outline';
import { 
  InvestorType, 
  InvestmentStage, 
  InvestorIndustry,
  GeographicFocus,
  getInvestorTypeLabel,
  getInvestmentStageLabel
} from '@/lib/investors';

interface InvestorSearchFilters {
  search: string;
  investorType: string;
  stage: string;
  industry: string;
  geography: string;
  minAmount: number;
  maxAmount: number;
  leadOnly: boolean;
  verified: boolean;
}

interface InvestorSearchProps {
  onFiltersChange: (filters: InvestorSearchFilters) => void;
  isLoading?: boolean;
  totalResults?: number;
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

const checkSizeRanges = [
  { label: 'Under $25K', min: 0, max: 25000 },
  { label: '$25K - $100K', min: 25000, max: 100000 },
  { label: '$100K - $500K', min: 100000, max: 500000 },
  { label: '$500K - $1M', min: 500000, max: 1000000 },
  { label: '$1M - $5M', min: 1000000, max: 5000000 },
  { label: '$5M+', min: 5000000, max: 0 },
];

export default function InvestorSearch({ 
  onFiltersChange, 
  isLoading = false,
  totalResults = 0 
}: InvestorSearchProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  
  const [filters, setFilters] = useState<InvestorSearchFilters>({
    search: searchParams.get('search') || '',
    investorType: searchParams.get('investorType') || '',
    stage: searchParams.get('stage') || '',
    industry: searchParams.get('industry') || '',
    geography: searchParams.get('geography') || '',
    minAmount: parseInt(searchParams.get('minAmount') || '0'),
    maxAmount: parseInt(searchParams.get('maxAmount') || '0'),
    leadOnly: searchParams.get('leadOnly') === 'true',
    verified: searchParams.get('verified') === 'true',
  });

  const updateFilters = useCallback((newFilters: Partial<InvestorSearchFilters>) => {
    try {
      const updatedFilters = { ...filters, ...newFilters };
      setFilters(updatedFilters);
      onFiltersChange(updatedFilters);

      // Update URL params
      const params = new URLSearchParams();
      Object.entries(updatedFilters).forEach(([key, value]) => {
        if (value && value !== '' && value !== 0 && value !== false) {
          params.set(key, value.toString());
        }
      });

      const newUrl = params.toString() ? `?${params.toString()}` : '';
      router.push(newUrl, { scroll: false });
    } catch (error) {
      console.error('Error updating filters:', error);
    }
  }, [filters, onFiltersChange, router]);

  const clearFilters = () => {
    const clearedFilters: InvestorSearchFilters = {
      search: '',
      investorType: '',
      stage: '',
      industry: '',
      geography: '',
      minAmount: 0,
      maxAmount: 0,
      leadOnly: false,
      verified: false,
    };
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
    router.push('', { scroll: false });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.investorType) count++;
    if (filters.stage) count++;
    if (filters.industry) count++;
    if (filters.geography) count++;
    if (filters.minAmount > 0 || filters.maxAmount > 0) count++;
    if (filters.leadOnly) count++;
    if (filters.verified) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <Input
          placeholder="Search investors by name, firm, or bio..."
          value={filters.search}
          onChange={(e) => updateFilters({ search: e.target.value })}
          className="pl-10 pr-4 py-3 text-lg"
        />
      </div>

      {/* Filter Toggle & Results Count */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            className="flex items-center space-x-2"
          >
            <FunnelIcon className="h-4 w-4" />
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-1">
                {activeFiltersCount}
              </Badge>
            )}
            {isFiltersOpen ? (
              <ChevronUpIcon className="h-4 w-4" />
            ) : (
              <ChevronDownIcon className="h-4 w-4" />
            )}
          </Button>

          {activeFiltersCount > 0 && (
            <Button variant="ghost" onClick={clearFilters} size="sm">
              <XMarkIcon className="h-4 w-4 mr-1" />
              Clear filters
            </Button>
          )}
        </div>

        <div className="text-sm text-gray-600">
          {isLoading ? (
            'Searching...'
          ) : (
            `${totalResults.toLocaleString()} investor${totalResults !== 1 ? 's' : ''} found`
          )}
        </div>
      </div>

      {/* Filters Panel */}
      <Collapsible open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
        <CollapsibleContent>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Filter Investors</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Investor Type & Stage */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Investor Type</Label>
                  <Select 
                    value={filters.investorType} 
                    onValueChange={(value) => updateFilters({ investorType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All types</SelectItem>
                      {investorTypes.map(type => (
                        <SelectItem key={type} value={type}>
                          {getInvestorTypeLabel(type)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Investment Stage</Label>
                  <Select 
                    value={filters.stage} 
                    onValueChange={(value) => updateFilters({ stage: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All stages" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All stages</SelectItem>
                      {investmentStages.map(stage => (
                        <SelectItem key={stage} value={stage}>
                          {getInvestmentStageLabel(stage)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Industry & Geography */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Industry Focus</Label>
                  <Select 
                    value={filters.industry} 
                    onValueChange={(value) => updateFilters({ industry: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All industries" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All industries</SelectItem>
                      {industries.map(industry => (
                        <SelectItem key={industry} value={industry}>
                          {industry.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Geographic Focus</Label>
                  <Select 
                    value={filters.geography} 
                    onValueChange={(value) => updateFilters({ geography: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All regions" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All regions</SelectItem>
                      {geographicFocus.map(geo => (
                        <SelectItem key={geo} value={geo}>
                          {geo.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              {/* Check Size Range */}
              <div className="space-y-3">
                <Label>Typical Check Size</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {checkSizeRanges.map((range, index) => (
                    <Button
                      key={index}
                      variant={
                        filters.minAmount === range.min && filters.maxAmount === range.max
                          ? "default"
                          : "outline"
                      }
                      size="sm"
                      onClick={() => updateFilters({ 
                        minAmount: range.min, 
                        maxAmount: range.max 
                      })}
                      className="justify-start"
                    >
                      {range.label}
                    </Button>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Special Filters */}
              <div className="space-y-4">
                <Label>Special Criteria</Label>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="leadOnly"
                      checked={filters.leadOnly}
                      onCheckedChange={(checked) => 
                        updateFilters({ leadOnly: checked as boolean })
                      }
                    />
                    <Label htmlFor="leadOnly" className="text-sm">
                      Lead investors only
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="verified"
                      checked={filters.verified}
                      onCheckedChange={(checked) => 
                        updateFilters({ verified: checked as boolean })
                      }
                    />
                    <Label htmlFor="verified" className="text-sm">
                      Verified investors only
                    </Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.search && (
            <Badge variant="secondary" className="flex items-center space-x-1">
              <span>Search: {filters.search}</span>
              <button
                onClick={() => updateFilters({ search: '' })}
                className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
              >
                <XMarkIcon className="h-3 w-3" />
              </button>
            </Badge>
          )}
          
          {filters.investorType && (
            <Badge variant="secondary" className="flex items-center space-x-1">
              <span>{getInvestorTypeLabel(filters.investorType as InvestorType)}</span>
              <button
                onClick={() => updateFilters({ investorType: '' })}
                className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
              >
                <XMarkIcon className="h-3 w-3" />
              </button>
            </Badge>
          )}

          {filters.stage && (
            <Badge variant="secondary" className="flex items-center space-x-1">
              <span>{getInvestmentStageLabel(filters.stage as InvestmentStage)}</span>
              <button
                onClick={() => updateFilters({ stage: '' })}
                className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
              >
                <XMarkIcon className="h-3 w-3" />
              </button>
            </Badge>
          )}

          {filters.industry && (
            <Badge variant="secondary" className="flex items-center space-x-1">
              <span>{filters.industry.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
              <button
                onClick={() => updateFilters({ industry: '' })}
                className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
              >
                <XMarkIcon className="h-3 w-3" />
              </button>
            </Badge>
          )}

          {filters.leadOnly && (
            <Badge variant="secondary" className="flex items-center space-x-1">
              <span>Lead investors</span>
              <button
                onClick={() => updateFilters({ leadOnly: false })}
                className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
              >
                <XMarkIcon className="h-3 w-3" />
              </button>
            </Badge>
          )}

          {filters.verified && (
            <Badge variant="secondary" className="flex items-center space-x-1">
              <span>Verified</span>
              <button
                onClick={() => updateFilters({ verified: false })}
                className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
              >
                <XMarkIcon className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
