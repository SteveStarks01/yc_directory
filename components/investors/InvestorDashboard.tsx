'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import {
  BanknotesIcon,
  HeartIcon,
  UserGroupIcon,
  ChartBarIcon,
  EyeIcon,
  HandshakeIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { formatInvestmentAmount, getInterestLevelColor, getInterestLevelLabel } from '@/lib/investors';

interface InvestmentInterest {
  _id: string;
  interestLevel: string;
  investmentStage: string;
  potentialInvestmentAmount?: number;
  status: string;
  dueDiligenceStatus: string;
  createdAt: string;
  startup: {
    _id: string;
    name: string;
    slug: { current: string };
    logo?: any;
    industry: string;
    stage: string;
  };
}

interface ConnectionRequest {
  _id: string;
  connectionType: string;
  subject: string;
  status: string;
  urgency: string;
  createdAt: string;
  requester?: {
    _id: string;
    userId: string;
    role: string;
    profileImage?: any;
  };
  recipient?: {
    _id: string;
    userId: string;
    role: string;
    profileImage?: any;
  };
  relatedStartup?: {
    _id: string;
    name: string;
    slug: { current: string };
  };
}

interface InvestorStats {
  totalInterests: number;
  activeInterests: number;
  completedInvestments: number;
  totalConnectionRequests: number;
  pendingRequests: number;
  acceptedConnections: number;
  profileViews: number;
}

export default function InvestorDashboard() {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [interests, setInterests] = useState<InvestmentInterest[]>([]);
  const [connectionRequests, setConnectionRequests] = useState<ConnectionRequest[]>([]);
  const [stats, setStats] = useState<InvestorStats>({
    totalInterests: 0,
    activeInterests: 0,
    completedInvestments: 0,
    totalConnectionRequests: 0,
    pendingRequests: 0,
    acceptedConnections: 0,
    profileViews: 0,
  });

  useEffect(() => {
    if (session?.user?.id) {
      fetchDashboardData();
    }
  }, [session]);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      
      const [interestsResponse, connectionsResponse] = await Promise.all([
        fetch(`/api/investment-interests?userId=${session?.user?.id}`),
        fetch(`/api/connection-requests?userId=${session?.user?.id}`),
      ]);

      if (interestsResponse.ok) {
        const interestsData = await interestsResponse.json();
        setInterests(interestsData.interests || []);
        
        // Calculate stats from interests
        const totalInterests = interestsData.interests?.length || 0;
        const activeInterests = interestsData.interests?.filter(
          (i: InvestmentInterest) => ['interested', 'evaluating', 'negotiating'].includes(i.status)
        ).length || 0;
        const completedInvestments = interestsData.interests?.filter(
          (i: InvestmentInterest) => i.status === 'invested'
        ).length || 0;

        setStats(prev => ({
          ...prev,
          totalInterests,
          activeInterests,
          completedInvestments,
        }));
      }

      if (connectionsResponse.ok) {
        const connectionsData = await connectionsResponse.json();
        setConnectionRequests(connectionsData.requests || []);
        
        // Calculate connection stats
        const totalConnectionRequests = connectionsData.requests?.length || 0;
        const pendingRequests = connectionsData.requests?.filter(
          (r: ConnectionRequest) => r.status === 'pending'
        ).length || 0;
        const acceptedConnections = connectionsData.requests?.filter(
          (r: ConnectionRequest) => r.status === 'accepted'
        ).length || 0;

        setStats(prev => ({
          ...prev,
          totalConnectionRequests,
          pendingRequests,
          acceptedConnections,
        }));
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted':
      case 'invested':
        return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
      case 'declined':
      case 'passed':
        return <XCircleIcon className="h-4 w-4 text-red-500" />;
      case 'pending':
      case 'interested':
        return <ClockIcon className="h-4 w-4 text-yellow-500" />;
      default:
        return <ClockIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high':
        return 'text-red-600 bg-red-50';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50';
      case 'low':
        return 'text-green-600 bg-green-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Investment Interests</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalInterests}</p>
              </div>
              <HeartIcon className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Deals</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeInterests}</p>
              </div>
              <ChartBarIcon className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed Investments</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completedInvestments}</p>
              </div>
              <BanknotesIcon className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Connections</p>
                <p className="text-2xl font-bold text-gray-900">{stats.acceptedConnections}</p>
              </div>
              <UserGroupIcon className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="interests" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="interests">Investment Interests</TabsTrigger>
          <TabsTrigger value="connections">Connection Requests</TabsTrigger>
        </TabsList>

        <TabsContent value="interests" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Investment Pipeline</CardTitle>
                  <CardDescription>
                    Track your investment interests and deal flow
                  </CardDescription>
                </div>
                <Button asChild>
                  <Link href="/startups">
                    Discover Startups
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {interests.length === 0 ? (
                <div className="text-center py-8">
                  <HeartIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No investment interests yet
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Start exploring startups and express your investment interest
                  </p>
                  <Button asChild>
                    <Link href="/startups">
                      Browse Startups
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {interests.map((interest) => (
                    <div key={interest._id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <Link 
                              href={`/startups/${interest.startup.slug.current}`}
                              className="font-semibold text-gray-900 hover:text-blue-600"
                            >
                              {interest.startup.name}
                            </Link>
                            <Badge variant="outline" className="text-xs">
                              {interest.startup.industry}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {interest.startup.stage}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <div className="flex items-center space-x-1">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getInterestLevelColor(interest.interestLevel)}`}>
                                {getInterestLevelLabel(interest.interestLevel as any)}
                              </span>
                            </div>
                            
                            {interest.potentialInvestmentAmount && (
                              <div className="flex items-center space-x-1">
                                <BanknotesIcon className="h-4 w-4" />
                                <span>{formatInvestmentAmount(interest.potentialInvestmentAmount)}</span>
                              </div>
                            )}
                            
                            <div className="flex items-center space-x-1">
                              {getStatusIcon(interest.status)}
                              <span className="capitalize">{interest.status.replace('-', ' ')}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <p className="text-xs text-gray-500">
                            {new Date(interest.createdAt).toLocaleDateString()}
                          </p>
                          <Badge variant="secondary" className="text-xs mt-1">
                            {interest.dueDiligenceStatus.replace('-', ' ')}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="connections" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Connection Requests</CardTitle>
                  <CardDescription>
                    Manage your incoming and outgoing connection requests
                  </CardDescription>
                </div>
                {stats.pendingRequests > 0 && (
                  <Badge variant="secondary">
                    {stats.pendingRequests} pending
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {connectionRequests.length === 0 ? (
                <div className="text-center py-8">
                  <UserGroupIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No connection requests
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Start connecting with startups and other investors
                  </p>
                  <Button asChild>
                    <Link href="/investors">
                      Browse Investors
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {connectionRequests.map((request) => (
                    <div key={request._id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="font-semibold text-gray-900">
                              {request.subject}
                            </h3>
                            <Badge variant="outline" className="text-xs">
                              {request.connectionType.replace('-', ' ')}
                            </Badge>
                            <Badge className={`text-xs ${getUrgencyColor(request.urgency)}`}>
                              {request.urgency}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <div className="flex items-center space-x-1">
                              {getStatusIcon(request.status)}
                              <span className="capitalize">{request.status}</span>
                            </div>
                            
                            {request.relatedStartup && (
                              <div>
                                Related to: <Link 
                                  href={`/startups/${request.relatedStartup.slug.current}`}
                                  className="text-blue-600 hover:underline"
                                >
                                  {request.relatedStartup.name}
                                </Link>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <p className="text-xs text-gray-500">
                            {new Date(request.createdAt).toLocaleDateString()}
                          </p>
                          {request.status === 'pending' && (
                            <div className="flex space-x-2 mt-2">
                              <Button size="sm" variant="outline">
                                View
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
