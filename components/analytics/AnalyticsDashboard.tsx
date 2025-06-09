'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  ChartBarIcon,
  CpuChipIcon,
  LightBulbIcon,
  ArrowTrendingUpIcon,
  UsersIcon,
  BuildingOfficeIcon,
  RocketLaunchIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

interface AnalyticsData {
  overview: {
    totalUsers: number;
    activeUsers: number;
    totalStartups: number;
    totalInvestors: number;
    totalInteractions: number;
    totalConnections: number;
  };
  growth: {
    newUsersThisWeek: number;
    newStartupsThisWeek: number;
    newInvestorsThisWeek: number;
    interactionsThisWeek: number;
  };
  engagement: {
    averageSessionDuration: number;
    conversionRate: number;
    bounceRate: number;
    topInteractionTypes: Array<{
      type: string;
      count: number;
    }>;
  };
}

interface TrendingData {
  trendingStartups: Array<{
    _id: string;
    name: string;
    tagline: string;
    industry: string;
    stage: string;
    profileViews: number;
  }>;
  trendingInvestors: Array<{
    _id: string;
    firmName: string;
    title: string;
    investorType: string;
    profileViews: number;
  }>;
  hotIndustries: Array<{
    industry: string;
    count: number;
    recentGrowth: number;
    totalFunding: number;
  }>;
}

export default function AnalyticsDashboard() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [trendingData, setTrendingData] = useState<TrendingData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchAnalyticsData();
    fetchTrendingData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      const response = await fetch('/api/analytics?type=platform');
      if (response.ok) {
        const data = await response.json();
        setAnalyticsData(data.data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const fetchTrendingData = async () => {
    try {
      const response = await fetch('/api/analytics?type=trending');
      if (response.ok) {
        const data = await response.json();
        setTrendingData(data.data);
      }
    } catch (error) {
      console.error('Error fetching trending data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}m ${remainingSeconds}s`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            AI-powered insights and platform analytics
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <SparklesIcon className="h-5 w-5 text-primary" />
          <Badge variant="secondary">AI-Powered</Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="trending">Trending</TabsTrigger>
          <TabsTrigger value="ai-insights">AI Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {analyticsData && (
            <>
              {/* Key Metrics */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                    <UsersIcon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatNumber(analyticsData.overview.totalUsers)}</div>
                    <p className="text-xs text-muted-foreground">
                      +{analyticsData.growth.newUsersThisWeek} this week
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Startups</CardTitle>
                    <RocketLaunchIcon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatNumber(analyticsData.overview.totalStartups)}</div>
                    <p className="text-xs text-muted-foreground">
                      +{analyticsData.growth.newStartupsThisWeek} this week
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Investors</CardTitle>
                    <BuildingOfficeIcon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatNumber(analyticsData.overview.totalInvestors)}</div>
                    <p className="text-xs text-muted-foreground">
                      +{analyticsData.growth.newInvestorsThisWeek} this week
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Connections</CardTitle>
                    <ArrowTrendingUpIcon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatNumber(analyticsData.overview.totalConnections)}</div>
                    <p className="text-xs text-muted-foreground">
                      {formatNumber(analyticsData.overview.totalInteractions)} total interactions
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Growth Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Weekly Growth</CardTitle>
                  <CardDescription>New registrations and activity this week</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">New Users</span>
                      <span className="text-sm text-muted-foreground">{analyticsData.growth.newUsersThisWeek}</span>
                    </div>
                    <Progress value={(analyticsData.growth.newUsersThisWeek / analyticsData.overview.totalUsers) * 100} />
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">New Startups</span>
                      <span className="text-sm text-muted-foreground">{analyticsData.growth.newStartupsThisWeek}</span>
                    </div>
                    <Progress value={(analyticsData.growth.newStartupsThisWeek / analyticsData.overview.totalStartups) * 100} />
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">New Investors</span>
                      <span className="text-sm text-muted-foreground">{analyticsData.growth.newInvestorsThisWeek}</span>
                    </div>
                    <Progress value={(analyticsData.growth.newInvestorsThisWeek / analyticsData.overview.totalInvestors) * 100} />
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="engagement" className="space-y-4">
          {analyticsData && (
            <>
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader>
                    <CardTitle>Session Duration</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {formatDuration(analyticsData.engagement.averageSessionDuration)}
                    </div>
                    <p className="text-xs text-muted-foreground">Average per session</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Conversion Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {(analyticsData.engagement.conversionRate * 100).toFixed(1)}%
                    </div>
                    <p className="text-xs text-muted-foreground">Users taking action</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Bounce Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {(analyticsData.engagement.bounceRate * 100).toFixed(1)}%
                    </div>
                    <p className="text-xs text-muted-foreground">Single page visits</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Top Interactions</CardTitle>
                  <CardDescription>Most popular user activities</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analyticsData.engagement.topInteractionTypes.slice(0, 5).map((interaction, index) => (
                      <div key={interaction.type} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">{index + 1}</Badge>
                          <span className="text-sm font-medium capitalize">
                            {interaction.type.replace('-', ' ')}
                          </span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {formatNumber(interaction.count)}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="trending" className="space-y-4">
          {trendingData && (
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Trending Startups</CardTitle>
                  <CardDescription>Most viewed startup profiles</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {trendingData.trendingStartups.slice(0, 5).map((startup, index) => (
                      <div key={startup._id} className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline">{index + 1}</Badge>
                            <span className="font-medium">{startup.name}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">{startup.tagline}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="secondary" className="text-xs">{startup.industry}</Badge>
                            <Badge variant="outline" className="text-xs">{startup.stage}</Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">{formatNumber(startup.profileViews)}</div>
                          <div className="text-xs text-muted-foreground">views</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Hot Industries</CardTitle>
                  <CardDescription>Fastest growing sectors</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {trendingData.hotIndustries.slice(0, 5).map((industry, index) => (
                      <div key={industry.industry} className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline">{index + 1}</Badge>
                            <span className="font-medium capitalize">
                              {industry.industry.replace('-', ' ')}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {industry.count} startups • +{industry.recentGrowth} this month
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">
                            ${formatNumber(industry.totalFunding)}
                          </div>
                          <div className="text-xs text-muted-foreground">funding</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="ai-insights" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CpuChipIcon className="h-5 w-5" />
                  <span>AI Matching Engine</span>
                </CardTitle>
                <CardDescription>Intelligent startup-investor matching</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Matching Accuracy</span>
                    <Badge variant="secondary">87%</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Matches Generated</span>
                    <span className="text-sm font-medium">1,247</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Successful Connections</span>
                    <span className="text-sm font-medium">342</span>
                  </div>
                  <Button variant="outline" className="w-full">
                    View Matching Analytics
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <LightBulbIcon className="h-5 w-5" />
                  <span>Smart Recommendations</span>
                </CardTitle>
                <CardDescription>Personalized content and connections</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Click-through Rate</span>
                    <Badge variant="secondary">23.4%</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Recommendations Served</span>
                    <span className="text-sm font-medium">8,932</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">User Satisfaction</span>
                    <span className="text-sm font-medium">4.2/5</span>
                  </div>
                  <Button variant="outline" className="w-full">
                    View Recommendation Analytics
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>AI Performance Metrics</CardTitle>
              <CardDescription>Real-time AI system performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">98.7%</div>
                  <p className="text-xs text-muted-foreground">System Uptime</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">127ms</div>
                  <p className="text-xs text-muted-foreground">Avg Response Time</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">15.2K</div>
                  <p className="text-xs text-muted-foreground">AI Predictions Today</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
