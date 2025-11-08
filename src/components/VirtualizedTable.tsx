import { useRef, useMemo, useState, useEffect } from 'react';
// @ts-ignore - react-window types issue
import { FixedSizeList as List } from 'react-window';

interface VirtualizedTableProps<T> {
  data: T[];
  rowHeight?: number;
  renderRow: (item: T, index: number) => React.ReactNode;
  threshold?: number; // Number of items before virtualizing
}

/**
 * Virtualized table component for large datasets
 * Only virtualizes if data length exceeds threshold
 */
export default function VirtualizedTable<T>({
  data,
  rowHeight = 80,
  renderRow,
  threshold = 100,
}: VirtualizedTableProps<T>) {
  const listRef = useRef<List>(null);

  // Only use virtualization for large datasets
  const shouldVirtualize = useMemo(() => {
    return data.length > threshold;
  }, [data.length, threshold]);

  if (!shouldVirtualize) {
    // Render normally for small datasets
    return <>{data.map((item, index) => renderRow(item, index))}</>;
  }

  // Use virtualization for large datasets
  const containerHeight = Math.min(data.length * rowHeight, 600);

  return (
    <div style={{ height: `${containerHeight}px`, width: '100%' }}>
      <List
        ref={listRef}
        height={containerHeight}
        itemCount={data.length}
        itemSize={rowHeight}
        width="100%"
        overscanCount={5}
      >
        {({ index, style }: { index: number; style: React.CSSProperties }) => (
          <div style={style}>
            {renderRow(data[index], index)}
          </div>
        )}
      </List>
    </div>
  );
}

/**
 * Performance optimization hooks and utilities
 */

/**
 * Debounce hook for search/filter operations
 */
export function useDebouncedValue<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Memoize expensive computations
 */
export function useMemoizedComputation<T, R>(
  data: T[],
  compute: (data: T[]) => R,
  dependencies: any[] = []
): R {
  return useMemo(() => compute(data), [data, ...dependencies]);
}
