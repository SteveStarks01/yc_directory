'use client';

import React, { memo, useMemo } from 'react';
import { FixedSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';

interface VirtualizedListProps<T> {
  items: T[];
  itemHeight: number;
  renderItem: (props: { index: number; style: React.CSSProperties; data: T[] }) => React.ReactElement;
  className?: string;
  height?: number;
  width?: string | number;
  overscanCount?: number;
  onScroll?: (props: { scrollDirection: 'forward' | 'backward'; scrollOffset: number; scrollUpdateWasRequested: boolean }) => void;
}

function VirtualizedList<T>({
  items,
  itemHeight,
  renderItem,
  className = '',
  height = 400,
  width = '100%',
  overscanCount = 5,
  onScroll,
}: VirtualizedListProps<T>) {
  // Memoize the item data to prevent unnecessary re-renders
  const itemData = useMemo(() => items, [items]);

  // Memoized item renderer
  const ItemRenderer = memo(({ index, style }: { index: number; style: React.CSSProperties }) => {
    return renderItem({ index, style, data: itemData });
  });

  ItemRenderer.displayName = 'VirtualizedListItem';

  if (items.length === 0) {
    return (
      <div className={`flex items-center justify-center h-32 text-gray-500 ${className}`}>
        No items to display
      </div>
    );
  }

  return (
    <div className={className} style={{ height, width }}>
      <AutoSizer>
        {({ height: autoHeight, width: autoWidth }) => (
          <List
            height={autoHeight}
            width={autoWidth}
            itemCount={items.length}
            itemSize={itemHeight}
            itemData={itemData}
            overscanCount={overscanCount}
            onScroll={onScroll}
          >
            {ItemRenderer}
          </List>
        )}
      </AutoSizer>
    </div>
  );
}

export default memo(VirtualizedList) as <T>(props: VirtualizedListProps<T>) => React.ReactElement;
