'use client';

import React, { useState, useCallback, memo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, X } from 'lucide-react';
import { useOptimizedSearch } from '@/hooks/useOptimizedSearch';
import { client } from '@/sanity/lib/client';
import { STARTUPS_CARD_QUERY } from '@/sanity/lib/queries';
import { StartupTypeCard } from '@/components/StartupCard';

interface OptimizedSearchFormProps {
  onSearchResults?: (results: StartupTypeCard[], query: string) => void;
  placeholder?: string;
  showSuggestions?: boolean;
  className?: string;
}

const OptimizedSearchForm = memo(({
  onSearchResults,
  placeholder = "Search startups, categories, or founders...",
  showSuggestions = true,
  className = "",
}: OptimizedSearchFormProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isFocused, setIsFocused] = useState(false);

  // Search function for the optimized search hook
  const searchFunction = useCallback(async (query: string) => {
    const params = {
      start: 0,
      end: 10, // Limit suggestions to 10 items
      search: `*${query}*`,
    };

    const results = await client.fetch(STARTUPS_CARD_QUERY, params);
    return {
      results: results || [],
      totalCount: results?.length || 0,
    };
  }, []);

  // Use optimized search hook
  const {
    query,
    setQuery,
    searchResult,
    clearSearch,
    isSearching,
  } = useOptimizedSearch(searchFunction, {
    debounceMs: 300,
    minSearchLength: 2,
    maxResults: 10,
    cacheResults: true,
  });

  // Handle form submission
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) return;

    // Update URL with search query
    const params = new URLSearchParams(searchParams.toString());
    params.set('query', query.trim());
    router.push(`/?${params.toString()}`);

    // Call callback with results
    if (onSearchResults && searchResult.results.length > 0) {
      onSearchResults(searchResult.results, query);
    }

    // Clear focus and suggestions
    setIsFocused(false);
  }, [query, searchParams, router, onSearchResults, searchResult.results]);

  // Handle suggestion click
  const handleSuggestionClick = useCallback((startup: StartupTypeCard) => {
    router.push(`/startup/${startup._id}`);
    setIsFocused(false);
    setQuery('');
  }, [router, setQuery]);

  // Handle clear search
  const handleClear = useCallback(() => {
    clearSearch();
    setIsFocused(false);
    
    // Clear URL params
    const params = new URLSearchParams(searchParams.toString());
    params.delete('query');
    const newUrl = params.toString() ? `/?${params.toString()}` : '/';
    router.push(newUrl);
  }, [clearSearch, searchParams, router]);

  // Initialize query from URL params
  React.useEffect(() => {
    const urlQuery = searchParams.get('query');
    if (urlQuery && urlQuery !== query) {
      setQuery(urlQuery);
    }
  }, [searchParams, query, setQuery]);

  return (
    <div className={`relative ${className}`}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
            placeholder={placeholder}
            className="pl-10 pr-20 h-12 text-base"
            autoComplete="off"
          />
          
          {/* Clear button */}
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-12 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          
          {/* Search button */}
          <Button
            type="submit"
            size="sm"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-10"
            disabled={!query.trim()}
          >
            Search
          </Button>
        </div>
      </form>

      {/* Search suggestions */}
      {showSuggestions && isFocused && isSearching && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {searchResult.isLoading && (
            <div className="p-4 text-center text-gray-500">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2">Searching...</p>
            </div>
          )}

          {searchResult.error && (
            <div className="p-4 text-center text-red-500">
              <p>Error: {searchResult.error}</p>
            </div>
          )}

          {!searchResult.isLoading && !searchResult.error && searchResult.results.length === 0 && (
            <div className="p-4 text-center text-gray-500">
              <p>No results found for "{query}"</p>
            </div>
          )}

          {!searchResult.isLoading && searchResult.results.length > 0 && (
            <div className="py-2">
              <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b">
                Suggestions ({searchResult.results.length})
              </div>
              {searchResult.results.map((startup) => (
                <button
                  key={startup._id}
                  onClick={() => handleSuggestionClick(startup)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                        {startup.title.charAt(0).toUpperCase()}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {startup.title}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        by {startup.authorName} • {startup.category}
                      </p>
                    </div>
                    <div className="flex-shrink-0 text-xs text-gray-400">
                      {startup.views} views
                    </div>
                  </div>
                </button>
              ))}
              
              {searchResult.hasMore && (
                <div className="px-4 py-2 text-center border-t">
                  <button
                    onClick={handleSubmit}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    View all results for "{query}"
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
});

OptimizedSearchForm.displayName = 'OptimizedSearchForm';

export default OptimizedSearchForm;
