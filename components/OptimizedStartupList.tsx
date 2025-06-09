'use client';

import React, { useState, useEffect, useCallback, memo } from 'react';
import { client } from '@/sanity/lib/client';
import { STARTUPS_CARD_QUERY, STARTUPS_COUNT_QUERY } from '@/sanity/lib/queries';
import StartupCard, { StartupTypeCard } from '@/components/StartupCard';
import VirtualizedList from '@/components/ui/VirtualizedList';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

interface OptimizedStartupListProps {
  searchQuery?: string;
  category?: string;
  initialStartups?: StartupTypeCard[];
  pageSize?: number;
  enableVirtualization?: boolean;
}

interface PaginationState {
  page: number;
  hasMore: boolean;
  loading: boolean;
  total: number;
}

const OptimizedStartupList = memo(({
  searchQuery = '',
  category = '',
  initialStartups = [],
  pageSize = 20,
  enableVirtualization = true,
}: OptimizedStartupListProps) => {
  const [startups, setStartups] = useState<StartupTypeCard[]>(initialStartups);
  const [pagination, setPagination] = useState<PaginationState>({
    page: 0,
    hasMore: true,
    loading: false,
    total: 0,
  });

  // Fetch startups with pagination
  const fetchStartups = useCallback(async (page: number, reset: boolean = false) => {
    if (pagination.loading) return;

    setPagination(prev => ({ ...prev, loading: true }));

    try {
      const start = page * pageSize;
      const end = start + pageSize;

      // Build search parameters
      const params: any = { start, end };
      if (searchQuery) {
        params.search = `*${searchQuery}*`;
      }

      // Fetch startups and count in parallel
      const [startupsResult, countResult] = await Promise.all([
        client.fetch(STARTUPS_CARD_QUERY, params),
        client.fetch(STARTUPS_COUNT_QUERY, searchQuery ? { search: `*${searchQuery}*` } : {}),
      ]);

      const newStartups = startupsResult || [];
      const total = countResult || 0;

      setStartups(prev => reset ? newStartups : [...prev, ...newStartups]);
      setPagination(prev => ({
        ...prev,
        page,
        hasMore: (page + 1) * pageSize < total,
        total,
        loading: false,
      }));
    } catch (error) {
      console.error('Error fetching startups:', error);
      setPagination(prev => ({ ...prev, loading: false }));
    }
  }, [searchQuery, pageSize, pagination.loading]);

  // Load more startups
  const loadMore = useCallback(() => {
    if (pagination.hasMore && !pagination.loading) {
      fetchStartups(pagination.page + 1);
    }
  }, [fetchStartups, pagination.hasMore, pagination.loading, pagination.page]);

  // Reset and fetch when search changes
  useEffect(() => {
    setStartups([]);
    setPagination({ page: 0, hasMore: true, loading: false, total: 0 });
    fetchStartups(0, true);
  }, [searchQuery, category]);

  // Virtualized item renderer
  const renderStartupItem = useCallback(({ index, style, data }: {
    index: number;
    style: React.CSSProperties;
    data: StartupTypeCard[];
  }) => {
    const startup = data[index];
    
    if (!startup) {
      return (
        <div style={style} className="p-4">
          <Skeleton className="h-64 w-full" />
        </div>
      );
    }

    return (
      <div style={style} className="p-2">
        <StartupCard post={startup} />
      </div>
    );
  }, []);

  // Loading skeleton
  const LoadingSkeleton = memo(() => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: pageSize }).map((_, index) => (
        <Skeleton key={index} className="h-64 w-full" />
      ))}
    </div>
  ));

  LoadingSkeleton.displayName = 'LoadingSkeleton';

  // Empty state
  if (!pagination.loading && startups.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 text-lg mb-4">
          {searchQuery ? 'No startups found matching your search.' : 'No startups available.'}
        </div>
        {searchQuery && (
          <p className="text-gray-400">
            Try adjusting your search terms or browse all startups.
          </p>
        )}
      </div>
    );
  }

  // Render virtualized list for large datasets
  if (enableVirtualization && startups.length > 50) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <p className="text-gray-600">
            Showing {startups.length} of {pagination.total} startups
          </p>
        </div>
        
        <VirtualizedList
          items={startups}
          itemHeight={280}
          renderItem={renderStartupItem}
          className="h-[800px] border rounded-lg"
          overscanCount={5}
        />

        {pagination.hasMore && (
          <div className="text-center">
            <Button
              onClick={loadMore}
              disabled={pagination.loading}
              variant="outline"
              size="lg"
            >
              {pagination.loading ? 'Loading...' : 'Load More'}
            </Button>
          </div>
        )}
      </div>
    );
  }

  // Render regular grid for smaller datasets
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-gray-600">
          {pagination.total > 0 && `Showing ${startups.length} of ${pagination.total} startups`}
        </p>
      </div>

      <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {startups.map((startup) => (
          <StartupCard key={startup._id} post={startup} />
        ))}
      </ul>

      {pagination.loading && <LoadingSkeleton />}

      {pagination.hasMore && !pagination.loading && (
        <div className="text-center">
          <Button
            onClick={loadMore}
            variant="outline"
            size="lg"
          >
            Load More Startups
          </Button>
        </div>
      )}
    </div>
  );
});

OptimizedStartupList.displayName = 'OptimizedStartupList';

export default OptimizedStartupList;
