'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import {
  Banknote,
  Building2,
  MapPin,
  CheckCircle,
  Eye,
  Users,
  Star,
} from 'lucide-react';
import { 
  InvestorSummary, 
  formatInvestmentAmount, 
  getInvestorTypeLabel,
  getInvestmentStageLabel,
  getInvestorUrl 
} from '@/lib/investors';

interface InvestorCardProps {
  investor: InvestorSummary;
  showMatchScore?: boolean;
  matchScore?: number;
  onConnect?: (investorId: string) => void;
  className?: string;
}

export default function InvestorCard({ 
  investor, 
  showMatchScore = false, 
  matchScore = 0,
  onConnect,
  className = "" 
}: InvestorCardProps) {
  const { data: session } = useSession();
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    if (!session?.user?.id) {
      toast.error('Please log in to connect with investors');
      return;
    }

    if (onConnect) {
      setIsConnecting(true);
      try {
        await onConnect(investor._id);
      } finally {
        setIsConnecting(false);
      }
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50';
    if (score >= 40) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <Card className={`group hover:shadow-lg transition-all duration-200 ${className}`}>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12">
              <AvatarImage 
                src={investor.profileImage?.asset?.url} 
                alt={investor.user.userId}
              />
              <AvatarFallback className="bg-blue-100 text-blue-600">
                {getInitials(investor.user.userId)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <Link 
                  href={getInvestorUrl(investor)}
                  className="font-semibold text-gray-900 hover:text-blue-600 transition-colors truncate"
                >
                  {investor.user.userId}
                </Link>
                {investor.verified && (
                  <CheckBadgeIcon className="h-5 w-5 text-blue-500 flex-shrink-0" />
                )}
              </div>
              
              {investor.title && (
                <p className="text-sm text-gray-600 truncate">{investor.title}</p>
              )}
              
              {investor.firmName && (
                <div className="flex items-center space-x-1 mt-1">
                  <BuildingOfficeIcon className="h-4 w-4 text-gray-400" />
                  <p className="text-sm text-gray-600 truncate">{investor.firmName}</p>
                </div>
              )}
            </div>
          </div>

          {showMatchScore && matchScore > 0 && (
            <div className={`px-2 py-1 rounded-full text-xs font-medium ${getMatchScoreColor(matchScore)}`}>
              {matchScore}% match
            </div>
          )}
        </div>

        {investor.firmLogo && (
          <div className="mt-3">
            <Image
              src={investor.firmLogo.asset.url}
              alt={investor.firmName || 'Firm logo'}
              width={120}
              height={40}
              className="object-contain"
            />
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Investor Type & Location */}
        <div className="flex items-center justify-between">
          <Badge variant="secondary" className="text-xs">
            {getInvestorTypeLabel(investor.investorType)}
          </Badge>
          
          {investor.user.location && (
            <div className="flex items-center space-x-1 text-sm text-gray-500">
              <MapPinIcon className="h-4 w-4" />
              <span className="truncate">{investor.user.location}</span>
            </div>
          )}
        </div>

        {/* Bio */}
        {investor.bio && (
          <p className="text-sm text-gray-600 line-clamp-3">
            {investor.bio}
          </p>
        )}

        {/* Investment Stages */}
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Investment Stages
          </h4>
          <div className="flex flex-wrap gap-1">
            {investor.investmentStages.slice(0, 3).map(stage => (
              <Badge key={stage} variant="outline" className="text-xs">
                {getInvestmentStageLabel(stage)}
              </Badge>
            ))}
            {investor.investmentStages.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{investor.investmentStages.length - 3} more
              </Badge>
            )}
          </div>
        </div>

        {/* Preferred Industries */}
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Industries
          </h4>
          <div className="flex flex-wrap gap-1">
            {investor.preferredIndustries.slice(0, 3).map(industry => (
              <Badge key={industry} variant="outline" className="text-xs">
                {industry.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </Badge>
            ))}
            {investor.preferredIndustries.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{investor.preferredIndustries.length - 3} more
              </Badge>
            )}
          </div>
        </div>

        {/* Investment Details */}
        <div className="grid grid-cols-2 gap-4 pt-2">
          {investor.typicalCheckSize && investor.typicalCheckSize > 0 && (
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1">
                <BanknotesIcon className="h-4 w-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-900">
                  {formatInvestmentAmount(investor.typicalCheckSize)}
                </span>
              </div>
              <p className="text-xs text-gray-500">Typical Check</p>
            </div>
          )}

          {investor.leadInvestments && (
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1">
                <StarIcon className="h-4 w-4 text-yellow-500" />
                <span className="text-sm font-medium text-gray-900">Lead</span>
              </div>
              <p className="text-xs text-gray-500">Investor</p>
            </div>
          )}
        </div>

        {/* Value Add */}
        {investor.valueAdd && investor.valueAdd.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Value Add
            </h4>
            <div className="flex flex-wrap gap-1">
              {investor.valueAdd.slice(0, 2).map(value => (
                <Badge key={value} variant="outline" className="text-xs">
                  {value.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </Badge>
              ))}
              {investor.valueAdd.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{investor.valueAdd.length - 2} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Recent Investments */}
        {investor.recentInvestments && investor.recentInvestments.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Notable Investments
            </h4>
            <div className="space-y-1">
              {investor.recentInvestments.slice(0, 2).map((investment, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 truncate">
                    {investment.companyName}
                  </span>
                  <Badge 
                    variant={investment.outcome === 'ipo' ? 'default' : 'secondary'} 
                    className="text-xs"
                  >
                    {investment.outcome.toUpperCase()}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>

      <Separator />

      <CardFooter className="pt-4">
        <div className="flex items-center justify-between w-full">
          {/* Stats */}
          <div className="flex items-center space-x-4 text-xs text-gray-500">
            <div className="flex items-center space-x-1">
              <EyeIcon className="h-4 w-4" />
              <span>{investor.profileViews}</span>
            </div>
            <div className="flex items-center space-x-1">
              <UserGroupIcon className="h-4 w-4" />
              <span>{investor.connectionsAccepted}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={getInvestorUrl(investor)}>
                View Profile
              </Link>
            </Button>
            
            {session?.user?.id && session.user.id !== investor.user.userId && (
              <Button 
                size="sm" 
                onClick={handleConnect}
                disabled={isConnecting}
              >
                {isConnecting ? 'Connecting...' : 'Connect'}
              </Button>
            )}
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
