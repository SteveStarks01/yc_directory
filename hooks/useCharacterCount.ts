import { useState, useEffect, useMemo } from 'react';

interface CharacterCountConfig {
  /** Maximum character limit */
  maxLength: number;
  /** Warning threshold (percentage of max) */
  warningThreshold?: number;
  /** Danger threshold (percentage of max) */
  dangerThreshold?: number;
  /** Whether to count Unicode characters properly */
  countUnicode?: boolean;
}

interface CharacterCountResult {
  /** Current character count */
  count: number;
  /** Remaining characters */
  remaining: number;
  /** Whether at or over the limit */
  isOverLimit: boolean;
  /** Whether in warning zone */
  isWarning: boolean;
  /** Whether in danger zone */
  isDanger: boolean;
  /** Percentage of limit used */
  percentage: number;
  /** CSS color class for display */
  colorClass: string;
  /** Validation message if any */
  message?: string;
}

/**
 * Custom hook for managing character count with visual feedback
 * Provides real-time character counting with warning states
 */
export function useCharacterCount(
  text: string,
  config: CharacterCountConfig
): CharacterCountResult {
  const {
    maxLength,
    warningThreshold = 85,
    dangerThreshold = 95,
    countUnicode = true,
  } = config;

  // Calculate character count (Unicode-aware if enabled)
  const count = useMemo(() => {
    if (!text) return 0;
    
    if (countUnicode) {
      // Use Array.from to properly count Unicode characters
      return Array.from(text).length;
    } else {
      // Simple string length
      return text.length;
    }
  }, [text, countUnicode]);

  // Calculate derived values
  const remaining = maxLength - count;
  const isOverLimit = count > maxLength;
  const percentage = (count / maxLength) * 100;
  
  // Warning and danger thresholds
  const isWarning = percentage >= warningThreshold && percentage < dangerThreshold;
  const isDanger = percentage >= dangerThreshold;

  // Color class for styling
  const colorClass = useMemo(() => {
    if (isOverLimit) return 'text-red-600';
    if (isDanger) return 'text-red-500';
    if (isWarning) return 'text-yellow-600';
    return 'text-gray-500';
  }, [isOverLimit, isDanger, isWarning]);

  // Validation message
  const message = useMemo(() => {
    if (isOverLimit) {
      return `Content is ${Math.abs(remaining)} characters over the limit`;
    }
    if (isDanger) {
      return `Approaching character limit (${remaining} remaining)`;
    }
    if (isWarning) {
      return `${remaining} characters remaining`;
    }
    return undefined;
  }, [isOverLimit, isDanger, isWarning, remaining]);

  return {
    count,
    remaining,
    isOverLimit,
    isWarning,
    isDanger,
    percentage,
    colorClass,
    message,
  };
}

/**
 * Hook specifically for Twitter-style 280 character posts
 */
export function useTwitterCharacterCount(text: string) {
  return useCharacterCount(text, {
    maxLength: 280,
    warningThreshold: 80,
    dangerThreshold: 90,
    countUnicode: true,
  });
}

/**
 * Hook for comment character counting (shorter limit)
 */
export function useCommentCharacterCount(text: string) {
  return useCharacterCount(text, {
    maxLength: 500,
    warningThreshold: 85,
    dangerThreshold: 95,
    countUnicode: true,
  });
}

export default useCharacterCount;
