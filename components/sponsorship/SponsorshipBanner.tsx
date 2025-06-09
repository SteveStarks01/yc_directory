'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLinkIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface Sponsorship {
  _id: string;
  title: string;
  description?: string;
  sponsorshipType: string;
  placement: {
    position: string;
    size: string;
    priority: number;
  };
  creativeAssets: {
    bannerImage?: any;
    logo?: any;
    clickUrl?: string;
    altText?: string;
    callToAction?: string;
    sponsoredContentText?: string;
  };
  targeting: {
    userRoles?: string[];
    industries?: string[];
    stages?: string[];
    geographies?: string[];
  };
  campaign: {
    startDate: string;
    endDate: string;
    budget: number;
    impressionGoal?: number;
    clickGoal?: number;
  };
  performance: {
    impressions: number;
    clicks: number;
    conversions: number;
    ctr?: number;
  };
  sponsor: {
    _id: string;
    companyName: string;
    logo?: any;
    website?: string;
    sponsorshipTier: string;
  };
  status: string;
}

interface SponsorshipBannerProps {
  placement: 'header-banner' | 'sidebar-banner' | 'footer-banner' | 'in-content-banner';
  userRole?: string;
  userIndustry?: string;
  userStage?: string;
  userGeography?: string;
  className?: string;
}

export default function SponsorshipBanner({
  placement,
  userRole = 'user',
  userIndustry,
  userStage,
  userGeography,
  className = '',
}: SponsorshipBannerProps) {
  const [sponsorships, setSponsorships] = useState<Sponsorship[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSponsorships();
  }, [placement, userRole, userIndustry, userStage, userGeography]);

  useEffect(() => {
    // Auto-rotate sponsorships if multiple are available
    if (sponsorships.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % sponsorships.length);
      }, 10000); // Rotate every 10 seconds

      return () => clearInterval(interval);
    }
  }, [sponsorships.length]);

  const fetchSponsorships = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        placement,
        status: 'active',
        limit: '5',
      });

      // Add targeting parameters if available
      if (userRole) params.append('userRole', userRole);
      if (userIndustry) params.append('industry', userIndustry);
      if (userStage) params.append('stage', userStage);
      if (userGeography) params.append('geography', userGeography);

      const response = await fetch(`/api/sponsorships?${params}`);
      if (response.ok) {
        const data = await response.json();
        setSponsorships(data.sponsorships || []);
      }
    } catch (error) {
      console.error('Error fetching sponsorships:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClick = async (sponsorship: Sponsorship) => {
    // Track click
    try {
      await fetch('/api/sponsorships/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sponsorshipId: sponsorship._id,
          action: 'click',
          metadata: {
            placement,
            userRole,
            userIndustry,
            userStage,
            userGeography,
          },
        }),
      });
    } catch (error) {
      console.error('Error tracking click:', error);
    }

    // Open link
    if (sponsorship.creativeAssets.clickUrl) {
      window.open(sponsorship.creativeAssets.clickUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleImpression = async (sponsorship: Sponsorship) => {
    // Track impression
    try {
      await fetch('/api/sponsorships/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sponsorshipId: sponsorship._id,
          action: 'impression',
          metadata: {
            placement,
            userRole,
            userIndustry,
            userStage,
            userGeography,
          },
        }),
      });
    } catch (error) {
      console.error('Error tracking impression:', error);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    // Store dismissal in localStorage to remember user preference
    localStorage.setItem(`sponsorship-dismissed-${placement}`, 'true');
  };

  // Check if user has dismissed this placement
  useEffect(() => {
    const dismissed = localStorage.getItem(`sponsorship-dismissed-${placement}`);
    if (dismissed === 'true') {
      setIsVisible(false);
    }
  }, [placement]);

  // Track impression when sponsorship becomes visible
  useEffect(() => {
    if (sponsorships.length > 0 && isVisible) {
      const currentSponsorship = sponsorships[currentIndex];
      if (currentSponsorship) {
        handleImpression(currentSponsorship);
      }
    }
  }, [currentIndex, sponsorships, isVisible]);

  if (isLoading || !isVisible || sponsorships.length === 0) {
    return null;
  }

  const currentSponsorship = sponsorships[currentIndex];
  if (!currentSponsorship) return null;

  const getSizeClasses = () => {
    switch (currentSponsorship.placement.size) {
      case 'small':
        return 'h-[100px] max-w-[300px]';
      case 'medium':
        return 'h-[90px] max-w-[728px]';
      case 'large':
        return 'h-[250px] max-w-[970px]';
      case 'square':
        return 'h-[300px] w-[300px]';
      default:
        return 'h-[90px] max-w-[728px]';
    }
  };

  const getPlacementClasses = () => {
    switch (placement) {
      case 'header-banner':
        return 'mx-auto my-2';
      case 'sidebar-banner':
        return 'mb-4';
      case 'footer-banner':
        return 'mx-auto my-4';
      case 'in-content-banner':
        return 'my-6 mx-auto';
      default:
        return '';
    }
  };

  return (
    <div className={`relative ${getPlacementClasses()} ${className}`}>
      <Card className={`${getSizeClasses()} overflow-hidden cursor-pointer hover:shadow-lg transition-shadow`}>
        <CardContent className="p-0 h-full relative">
          {/* Sponsored label */}
          <div className="absolute top-2 left-2 z-10">
            <Badge variant="secondary" className="text-xs">
              Sponsored
            </Badge>
          </div>

          {/* Dismiss button */}
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-2 right-2 z-10 h-6 w-6 p-0 hover:bg-black/20"
            onClick={(e) => {
              e.stopPropagation();
              handleDismiss();
            }}
          >
            <XMarkIcon className="h-4 w-4" />
          </Button>

          {/* Sponsorship content */}
          <div
            className="h-full w-full flex items-center justify-center bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900"
            onClick={() => handleClick(currentSponsorship)}
          >
            {currentSponsorship.creativeAssets.bannerImage ? (
              <div className="relative h-full w-full">
                <Image
                  src={currentSponsorship.creativeAssets.bannerImage.asset?.url || ''}
                  alt={currentSponsorship.creativeAssets.altText || currentSponsorship.title}
                  fill
                  className="object-cover"
                />
                {/* Overlay content */}
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                  <div className="text-center text-white p-4">
                    <h3 className="font-bold text-lg mb-2">{currentSponsorship.title}</h3>
                    {currentSponsorship.creativeAssets.callToAction && (
                      <Button variant="secondary" size="sm">
                        {currentSponsorship.creativeAssets.callToAction}
                        <ExternalLinkIcon className="ml-2 h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center p-4 h-full flex flex-col justify-center">
                {/* Sponsor logo */}
                {currentSponsorship.sponsor.logo && (
                  <div className="mb-3">
                    <Image
                      src={currentSponsorship.sponsor.logo.asset?.url || ''}
                      alt={currentSponsorship.sponsor.companyName}
                      width={120}
                      height={40}
                      className="mx-auto object-contain"
                    />
                  </div>
                )}

                {/* Sponsorship title */}
                <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-gray-100">
                  {currentSponsorship.title}
                </h3>

                {/* Description */}
                {currentSponsorship.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                    {currentSponsorship.description}
                  </p>
                )}

                {/* Sponsored content text */}
                {currentSponsorship.creativeAssets.sponsoredContentText && (
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 line-clamp-3">
                    {currentSponsorship.creativeAssets.sponsoredContentText}
                  </p>
                )}

                {/* Call to action */}
                {currentSponsorship.creativeAssets.callToAction && (
                  <Button variant="default" size="sm" className="mt-auto">
                    {currentSponsorship.creativeAssets.callToAction}
                    <ExternalLinkIcon className="ml-2 h-4 w-4" />
                  </Button>
                )}

                {/* Sponsor tier badge */}
                <div className="mt-2">
                  <Badge 
                    variant={currentSponsorship.sponsor.sponsorshipTier === 'platinum' ? 'default' : 'outline'}
                    className="text-xs"
                  >
                    {currentSponsorship.sponsor.sponsorshipTier} sponsor
                  </Badge>
                </div>
              </div>
            )}
          </div>

          {/* Multiple sponsorships indicator */}
          {sponsorships.length > 1 && (
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
              {sponsorships.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index === currentIndex ? 'bg-primary' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Performance tracking (hidden) */}
      <div className="sr-only">
        Sponsorship: {currentSponsorship.title} by {currentSponsorship.sponsor.companyName}
        Impressions: {currentSponsorship.performance.impressions}
        Clicks: {currentSponsorship.performance.clicks}
        CTR: {currentSponsorship.performance.ctr?.toFixed(2)}%
      </div>
    </div>
  );
}
