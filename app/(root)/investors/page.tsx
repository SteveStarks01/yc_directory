'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import InvestorSearch from '@/components/investors/InvestorSearch';
import InvestorCard from '@/components/investors/InvestorCard';
import ConnectionRequestForm from '@/components/investors/ConnectionRequestForm';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  BanknotesIcon,
  Users,
  BarChart3,
  Plus,
} from 'lucide-react';
import { InvestorSummary } from '@/lib/investors';

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

interface InvestorStats {
  totalInvestors: number;
  verifiedInvestors: number;
  averageCheckSize: number;
  leadInvestors: number;
}

export default function InvestorsPage() {
  const { data: session } = useSession();
  const [investors, setInvestors] = useState<InvestorSummary[]>([]);
  const [stats, setStats] = useState<InvestorStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 20,
    offset: 0,
    hasMore: false,
  });
  const [filters, setFilters] = useState<InvestorSearchFilters>({
    search: '',
    investorType: '',
    stage: '',
    industry: '',
    geography: '',
    minAmount: 0,
    maxAmount: 0,
    leadOnly: false,
    verified: false,
  });
  
  // Connection request dialog state
  const [connectionDialog, setConnectionDialog] = useState<{
    isOpen: boolean;
    investorId: string;
    investorName: string;
  }>({
    isOpen: false,
    investorId: '',
    investorName: '',
  });

  const fetchInvestors = useCallback(async (newFilters: InvestorSearchFilters, offset = 0) => {
    try {
      if (offset === 0) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      const params = new URLSearchParams();
      Object.entries(newFilters).forEach(([key, value]) => {
        if (value && value !== '' && value !== 0 && value !== false) {
          params.set(key, value.toString());
        }
      });
      params.set('limit', pagination.limit.toString());
      params.set('offset', offset.toString());

      const response = await fetch(`/api/investors?${params.toString()}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to fetch investors`);
      }

      const data = await response.json();

      if (offset === 0) {
        setInvestors(data.investors || []);
      } else {
        setInvestors(prev => [...prev, ...(data.investors || [])]);
      }

      setPagination(data.pagination || {
        total: 0,
        limit: 20,
        offset: 0,
        hasMore: false,
      });
    } catch (error) {
      console.error('Error fetching investors:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to load investors');

      // Set empty state on error
      if (offset === 0) {
        setInvestors([]);
        setPagination({
          total: 0,
          limit: 20,
          offset: 0,
          hasMore: false,
        });
      }
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [pagination.limit]);

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch('/api/investors?stats=true');
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      } else {
        console.warn('Failed to fetch investor stats:', response.status);
        // Set default stats to prevent UI errors
        setStats({
          totalInvestors: 0,
          verifiedInvestors: 0,
          averageCheckSize: 0,
          leadInvestors: 0,
        });
      }
    } catch (error) {
      console.error('Error fetching investor stats:', error);
      // Set default stats to prevent UI errors
      setStats({
        totalInvestors: 0,
        verifiedInvestors: 0,
        averageCheckSize: 0,
        leadInvestors: 0,
      });
    }
  }, []);

  useEffect(() => {
    fetchInvestors(filters);
    fetchStats();
  }, []);

  const handleFiltersChange = (newFilters: InvestorSearchFilters) => {
    setFilters(newFilters);
    fetchInvestors(newFilters, 0);
  };

  const handleLoadMore = () => {
    if (pagination.hasMore && !isLoadingMore) {
      fetchInvestors(filters, pagination.offset + pagination.limit);
    }
  };

  const handleConnect = async (investorId: string) => {
    const investor = investors.find(i => i._id === investorId);
    if (investor) {
      setConnectionDialog({
        isOpen: true,
        investorId,
        investorName: investor.user.userId,
      });
    }
  };

  const handleConnectionSuccess = () => {
    setConnectionDialog({ isOpen: false, investorId: '', investorName: '' });
    toast.success('Connection request sent successfully!');
  };

  const formatAmount = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}K`;
    } else {
      return `$${amount.toLocaleString()}`;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Investors</h1>
          <p className="text-gray-600 mt-2">
            Connect with investors who are actively funding startups
          </p>
        </div>
        
        {session?.user?.id && (
          <Button asChild>
            <Link href="/investors/profile/create">
              <PlusIcon className="h-4 w-4 mr-2" />
              Create Investor Profile
            </Link>
          </Button>
        )}
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Investors</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalInvestors}</p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Verified Investors</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.verifiedInvestors}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Average Check Size</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.averageCheckSize ? formatAmount(stats.averageCheckSize) : 'N/A'}
                  </p>
                </div>
                <BanknotesIcon className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Lead Investors</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.leadInvestors}</p>
                </div>
                <UserGroupIcon className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search and Filters */}
      <InvestorSearch
        onFiltersChange={handleFiltersChange}
        isLoading={isLoading}
        totalResults={pagination.total}
      />

      <Separator />

      {/* Results */}
      <div className="space-y-6">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="animate-pulse space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
                      <div className="space-y-2 flex-1">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                    </div>
                    <div className="flex space-x-2">
                      <div className="h-6 bg-gray-200 rounded w-16"></div>
                      <div className="h-6 bg-gray-200 rounded w-20"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : investors.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <UserGroupIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No investors found
              </h3>
              <p className="text-gray-600 mb-6">
                Try adjusting your search criteria or browse all investors
              </p>
              <Button onClick={() => handleFiltersChange({
                search: '',
                investorType: '',
                stage: '',
                industry: '',
                geography: '',
                minAmount: 0,
                maxAmount: 0,
                leadOnly: false,
                verified: false,
              })}>
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {investors.map((investor) => (
                <InvestorCard
                  key={investor._id}
                  investor={investor}
                  onConnect={handleConnect}
                />
              ))}
            </div>

            {pagination.hasMore && (
              <div className="text-center">
                <Button
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                  variant="outline"
                  size="lg"
                >
                  {isLoadingMore ? 'Loading...' : 'Load More Investors'}
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Connection Request Dialog */}
      <Dialog 
        open={connectionDialog.isOpen} 
        onOpenChange={(open) => setConnectionDialog(prev => ({ ...prev, isOpen: open }))}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Connect with {connectionDialog.investorName}</DialogTitle>
            <DialogDescription>
              Send a personalized connection request to start a conversation
            </DialogDescription>
          </DialogHeader>
          
          <ConnectionRequestForm
            recipientId={connectionDialog.investorId}
            recipientName={connectionDialog.investorName}
            recipientType="investor"
            onSuccess={handleConnectionSuccess}
            onCancel={() => setConnectionDialog({ isOpen: false, investorId: '', investorName: '' })}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
