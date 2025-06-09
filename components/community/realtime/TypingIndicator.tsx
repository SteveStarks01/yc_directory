'use client';

import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface TypingUser {
  userId: string;
  role?: string;
  name?: string;
  avatar?: string;
}

interface TypingIndicatorProps {
  /** List of users currently typing */
  typingUsers: string[];
  /** User data for displaying names/avatars */
  userData?: Record<string, TypingUser>;
  /** Maximum number of users to show before truncating */
  maxVisible?: number;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Whether to show avatars */
  showAvatars?: boolean;
  /** Whether to animate the indicator */
  animate?: boolean;
  /** Custom className */
  className?: string;
}

export default function TypingIndicator({
  typingUsers,
  userData = {},
  maxVisible = 3,
  size = 'sm',
  showAvatars = true,
  animate = true,
  className,
}: TypingIndicatorProps) {
  if (typingUsers.length === 0) {
    return null;
  }

  const visibleUsers = typingUsers.slice(0, maxVisible);
  const hiddenCount = Math.max(0, typingUsers.length - maxVisible);

  // Size configurations
  const sizeConfig = {
    sm: {
      avatar: 'w-4 h-4',
      text: 'text-xs',
      dot: 'w-1 h-1',
      spacing: 'gap-1',
    },
    md: {
      avatar: 'w-5 h-5',
      text: 'text-sm',
      dot: 'w-1.5 h-1.5',
      spacing: 'gap-1.5',
    },
    lg: {
      avatar: 'w-6 h-6',
      text: 'text-base',
      dot: 'w-2 h-2',
      spacing: 'gap-2',
    },
  };

  const config = sizeConfig[size];

  // Generate typing text
  const getTypingText = () => {
    const userNames = visibleUsers.map(userId => {
      const user = userData[userId];
      return user?.name || user?.role || 'Someone';
    });

    if (typingUsers.length === 1) {
      return `${userNames[0]} is typing`;
    } else if (typingUsers.length === 2) {
      return `${userNames[0]} and ${userNames[1]} are typing`;
    } else if (typingUsers.length === 3) {
      return `${userNames[0]}, ${userNames[1]}, and ${userNames[2]} are typing`;
    } else {
      return `${userNames.slice(0, 2).join(', ')} and ${hiddenCount + 1} others are typing`;
    }
  };

  // Animated dots component
  const AnimatedDots = () => (
    <div className={cn('flex items-center', config.spacing)}>
      {[0, 1, 2].map((index) => (
        <div
          key={index}
          className={cn(
            'rounded-full bg-gray-400',
            config.dot,
            animate && 'animate-pulse'
          )}
          style={{
            animationDelay: animate ? `${index * 0.2}s` : undefined,
            animationDuration: animate ? '1.4s' : undefined,
          }}
        />
      ))}
    </div>
  );

  return (
    <div 
      className={cn(
        'flex items-center bg-gray-50 rounded-lg px-3 py-2 border border-gray-200',
        'transition-all duration-300 ease-in-out',
        animate && 'animate-in slide-in-from-bottom-2',
        config.spacing,
        className
      )}
      role="status"
      aria-live="polite"
      aria-label={getTypingText()}
    >
      {/* User avatars */}
      {showAvatars && visibleUsers.length > 0 && (
        <div className={cn('flex items-center', config.spacing)}>
          {visibleUsers.map((userId, index) => {
            const user = userData[userId];
            return (
              <Avatar 
                key={userId}
                className={cn(
                  config.avatar,
                  'border border-white shadow-sm',
                  index > 0 && '-ml-1'
                )}
              >
                <AvatarImage 
                  src={user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.role || userId}`}
                  alt={user?.name || user?.role || 'User'}
                />
                <AvatarFallback className="text-xs">
                  {(user?.name || user?.role || 'U').charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            );
          })}
          
          {/* Hidden users indicator */}
          {hiddenCount > 0 && (
            <div 
              className={cn(
                'flex items-center justify-center rounded-full bg-gray-300 text-gray-600 font-medium -ml-1',
                config.avatar,
                config.text
              )}
              title={`${hiddenCount} more user${hiddenCount > 1 ? 's' : ''} typing`}
            >
              +{hiddenCount}
            </div>
          )}
        </div>
      )}

      {/* Typing text */}
      <span className={cn('text-gray-600 font-medium', config.text)}>
        {getTypingText()}
      </span>

      {/* Animated dots */}
      <AnimatedDots />
    </div>
  );
}

// Compact version for inline use
export function CompactTypingIndicator({
  typingUsers,
  userData = {},
  className,
}: Pick<TypingIndicatorProps, 'typingUsers' | 'userData' | 'className'>) {
  if (typingUsers.length === 0) {
    return null;
  }

  return (
    <div 
      className={cn(
        'flex items-center gap-1 text-xs text-gray-500',
        className
      )}
    >
      <div className="flex gap-0.5">
        {[0, 1, 2].map((index) => (
          <div
            key={index}
            className="w-1 h-1 rounded-full bg-gray-400 animate-pulse"
            style={{
              animationDelay: `${index * 0.2}s`,
              animationDuration: '1.4s',
            }}
          />
        ))}
      </div>
      <span>
        {typingUsers.length === 1 ? 'Someone is typing' : `${typingUsers.length} people typing`}
      </span>
    </div>
  );
}

// Export types for use in other components
export type { TypingIndicatorProps, TypingUser };
