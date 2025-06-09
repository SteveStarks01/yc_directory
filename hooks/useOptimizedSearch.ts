'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useDebounce } from 'use-debounce';

interface UseOptimizedSearchOptions {
  debounceMs?: number;
  minSearchLength?: number;
  maxResults?: number;
  cacheResults?: boolean;
}

interface SearchResult<T> {
  results: T[];
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  totalCount: number;
}

interface SearchCache<T> {
  [key: string]: {
    results: T[];
    timestamp: number;
    totalCount: number;
  };
}

export function useOptimizedSearch<T>(
  searchFunction: (query: string, options?: any) => Promise<{ results: T[]; totalCount: number }>,
  options: UseOptimizedSearchOptions = {}
) {
  const {
    debounceMs = 300,
    minSearchLength = 2,
    maxResults = 20,
    cacheResults = true,
  } = options;

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [cache, setCache] = useState<SearchCache<T>>({});

  // Debounce the search query
  const [debouncedQuery] = useDebounce(query, debounceMs);

  // Cache key generation
  const getCacheKey = useCallback((searchQuery: string) => {
    return `search_${searchQuery.toLowerCase().trim()}`;
  }, []);

  // Check if cache is valid (5 minutes)
  const isCacheValid = useCallback((timestamp: number) => {
    return Date.now() - timestamp < 5 * 60 * 1000; // 5 minutes
  }, []);

  // Get cached results
  const getCachedResults = useCallback((searchQuery: string) => {
    if (!cacheResults) return null;
    
    const cacheKey = getCacheKey(searchQuery);
    const cached = cache[cacheKey];
    
    if (cached && isCacheValid(cached.timestamp)) {
      return cached;
    }
    
    return null;
  }, [cache, cacheResults, getCacheKey, isCacheValid]);

  // Set cached results
  const setCachedResults = useCallback((searchQuery: string, searchResults: T[], count: number) => {
    if (!cacheResults) return;
    
    const cacheKey = getCacheKey(searchQuery);
    setCache(prev => ({
      ...prev,
      [cacheKey]: {
        results: searchResults,
        timestamp: Date.now(),
        totalCount: count,
      },
    }));
  }, [cacheResults, getCacheKey]);

  // Perform search
  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery || searchQuery.length < minSearchLength) {
      setResults([]);
      setTotalCount(0);
      setError(null);
      return;
    }

    // Check cache first
    const cached = getCachedResults(searchQuery);
    if (cached) {
      setResults(cached.results);
      setTotalCount(cached.totalCount);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { results: searchResults, totalCount: count } = await searchFunction(searchQuery, {
        limit: maxResults,
      });

      setResults(searchResults);
      setTotalCount(count);
      setCachedResults(searchQuery, searchResults, count);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
      setResults([]);
      setTotalCount(0);
    } finally {
      setIsLoading(false);
    }
  }, [searchFunction, minSearchLength, maxResults, getCachedResults, setCachedResults]);

  // Effect to trigger search when debounced query changes
  useEffect(() => {
    performSearch(debouncedQuery);
  }, [debouncedQuery, performSearch]);

  // Clear search
  const clearSearch = useCallback(() => {
    setQuery('');
    setResults([]);
    setTotalCount(0);
    setError(null);
  }, []);

  // Clear cache
  const clearCache = useCallback(() => {
    setCache({});
  }, []);

  // Memoized search result
  const searchResult: SearchResult<T> = useMemo(() => ({
    results,
    isLoading,
    error,
    hasMore: results.length < totalCount,
    totalCount,
  }), [results, isLoading, error, totalCount]);

  return {
    query,
    setQuery,
    searchResult,
    clearSearch,
    clearCache,
    isSearching: query.length >= minSearchLength,
  };
}
