'use client';

import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  WifiIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

interface LiveUpdateBadgeProps {
  /** Whether the connection is active */
  isConnected: boolean;
  /** Number of pending updates */
  pendingUpdates?: number;
  /** Whether to show detailed status */
  showDetails?: boolean;
  /** Whether to show reconnect button when disconnected */
  showReconnectButton?: boolean;
  /** Callback when reconnect is clicked */
  onReconnect?: () => void;
  /** Custom className */
  className?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Position variant */
  position?: 'inline' | 'floating';
}

export default function LiveUpdateBadge({
  isConnected,
  pendingUpdates = 0,
  showDetails = false,
  showReconnectButton = true,
  onReconnect,
  className,
  size = 'sm',
  position = 'inline',
}: LiveUpdateBadgeProps) {
  const [showPulse, setShowPulse] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null);

  // Trigger pulse animation when updates change
  useEffect(() => {
    if (pendingUpdates > 0) {
      setShowPulse(true);
      setLastUpdateTime(new Date());
      
      const timer = setTimeout(() => setShowPulse(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [pendingUpdates]);

  // Size configurations
  const sizeConfig = {
    sm: {
      badge: 'text-xs px-2 py-1',
      icon: 'w-3 h-3',
      button: 'h-6 px-2 text-xs',
    },
    md: {
      badge: 'text-sm px-3 py-1.5',
      icon: 'w-4 h-4',
      button: 'h-8 px-3 text-sm',
    },
    lg: {
      badge: 'text-base px-4 py-2',
      icon: 'w-5 h-5',
      button: 'h-10 px-4 text-base',
    },
  };

  const config = sizeConfig[size];

  // Status configurations
  const getStatusConfig = () => {
    if (!isConnected) {
      return {
        variant: 'destructive' as const,
        icon: ExclamationTriangleIcon,
        text: 'Disconnected',
        bgColor: 'bg-red-100',
        textColor: 'text-red-700',
        iconColor: 'text-red-600',
      };
    }

    if (pendingUpdates > 0) {
      return {
        variant: 'default' as const,
        icon: ArrowPathIcon,
        text: `${pendingUpdates} update${pendingUpdates > 1 ? 's' : ''}`,
        bgColor: 'bg-blue-100',
        textColor: 'text-blue-700',
        iconColor: 'text-blue-600',
      };
    }

    return {
      variant: 'secondary' as const,
      icon: CheckCircleIcon,
      text: 'Live',
      bgColor: 'bg-green-100',
      textColor: 'text-green-700',
      iconColor: 'text-green-600',
    };
  };

  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;

  // Format last update time
  const formatLastUpdate = () => {
    if (!lastUpdateTime) return null;
    
    const now = new Date();
    const diffMs = now.getTime() - lastUpdateTime.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);

    if (diffSeconds < 60) {
      return `${diffSeconds}s ago`;
    } else if (diffMinutes < 60) {
      return `${diffMinutes}m ago`;
    } else {
      return lastUpdateTime.toLocaleTimeString();
    }
  };

  const badgeContent = (
    <div className="flex items-center gap-1.5">
      <StatusIcon 
        className={cn(
          config.icon,
          statusConfig.iconColor,
          isConnected && 'animate-pulse',
          showPulse && 'animate-spin'
        )}
      />
      <span className="font-medium">
        {statusConfig.text}
      </span>
      {showDetails && lastUpdateTime && (
        <span className="opacity-75 text-xs">
          • {formatLastUpdate()}
        </span>
      )}
    </div>
  );

  if (position === 'floating') {
    return (
      <div 
        className={cn(
          'fixed bottom-4 right-4 z-50 flex items-center gap-2',
          'animate-in slide-in-from-bottom-2 duration-300',
          className
        )}
      >
        <Badge
          variant={statusConfig.variant}
          className={cn(
            config.badge,
            statusConfig.bgColor,
            statusConfig.textColor,
            'shadow-lg border',
            showPulse && 'animate-pulse'
          )}
        >
          {badgeContent}
        </Badge>

        {!isConnected && showReconnectButton && onReconnect && (
          <Button
            variant="outline"
            size="sm"
            onClick={onReconnect}
            className={cn(
              config.button,
              'shadow-lg bg-white hover:bg-gray-50'
            )}
          >
            <ArrowPathIcon className={cn(config.icon, 'mr-1')} />
            Reconnect
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Badge
        variant={statusConfig.variant}
        className={cn(
          config.badge,
          statusConfig.bgColor,
          statusConfig.textColor,
          showPulse && 'animate-pulse'
        )}
      >
        {badgeContent}
      </Badge>

      {!isConnected && showReconnectButton && onReconnect && (
        <Button
          variant="outline"
          size="sm"
          onClick={onReconnect}
          className={config.button}
        >
          <ArrowPathIcon className={cn(config.icon, 'mr-1')} />
          Reconnect
        </Button>
      )}
    </div>
  );
}

// Minimal version for status bar
export function LiveStatusIndicator({
  isConnected,
  className,
}: Pick<LiveUpdateBadgeProps, 'isConnected' | 'className'>) {
  return (
    <div className={cn('flex items-center gap-1', className)}>
      <div 
        className={cn(
          'w-2 h-2 rounded-full',
          isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
        )}
      />
      <span className="text-xs text-gray-600">
        {isConnected ? 'Live' : 'Offline'}
      </span>
    </div>
  );
}

// Export types for use in other components
export type { LiveUpdateBadgeProps };
