import { useEffect, useRef, useCallback, useState } from 'react';

/**
 * Infinite Scroll Hook
 *
 * Intersection Observer 기반 무한 스크롤
 */

interface UseInfiniteScrollOptions {
  threshold?: number;
  rootMargin?: string;
  enabled?: boolean;
}

export function useInfiniteScroll<T = any>(
  fetchMore: () => Promise<void>,
  options: UseInfiniteScrollOptions = {}
) {
  const { threshold = 0.5, rootMargin = '100px', enabled = true } = options;

  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const handleObserver = useCallback(
    async (entries: IntersectionObserverEntry[]) => {
      const target = entries[0];

      if (target.isIntersecting && enabled && hasMore && !isLoading) {
        setIsLoading(true);

        try {
          await fetchMore();
        } catch (error) {
          console.error('[InfiniteScroll] Error loading more:', error);
        } finally {
          setIsLoading(false);
        }
      }
    },
    [fetchMore, enabled, hasMore, isLoading]
  );

  useEffect(() => {
    if (!enabled) return;

    const element = loadMoreRef.current;
    if (!element) return;

    observerRef.current = new IntersectionObserver(handleObserver, {
      threshold,
      rootMargin,
    });

    observerRef.current.observe(element);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [handleObserver, threshold, rootMargin, enabled]);

  return {
    loadMoreRef,
    isLoading,
    hasMore,
    setHasMore,
  };
}

/**
 * Paginated Data Hook
 *
 * 페이지네이션 데이터 관리
 */
export function usePaginatedData<T>(
  fetchPage: (page: number) => Promise<{ items: T[]; hasMore: boolean }>,
  initialPage = 1
) {
  const [data, setData] = useState<T[]>([]);
  const [page, setPage] = useState(initialPage);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await fetchPage(page);

      setData((prev) => [...prev, ...result.items]);
      setHasMore(result.hasMore);
      setPage((prev) => prev + 1);
    } catch (err) {
      setError(err as Error);
      console.error('[PaginatedData] Error loading page:', err);
    } finally {
      setIsLoading(false);
    }
  }, [fetchPage, page, isLoading, hasMore]);

  const reset = useCallback(() => {
    setData([]);
    setPage(initialPage);
    setHasMore(true);
    setError(null);
  }, [initialPage]);

  return {
    data,
    loadMore,
    isLoading,
    hasMore,
    error,
    reset,
  };
}

/**
 * Infinite Scroll with Pagination
 *
 * 무한 스크롤 + 페이지네이션 통합
 */
export function useInfinitePagination<T>(
  fetchPage: (page: number) => Promise<{ items: T[]; hasMore: boolean }>,
  options: UseInfiniteScrollOptions = {}
) {
  const { data, loadMore, isLoading, hasMore, error, reset } = usePaginatedData(fetchPage);
  const { loadMoreRef } = useInfiniteScroll(loadMore, {
    ...options,
    enabled: !isLoading && hasMore,
  });

  return {
    data,
    loadMoreRef,
    isLoading,
    hasMore,
    error,
    reset,
  };
}
