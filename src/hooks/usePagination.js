import { useState, useCallback, useMemo } from 'react';

export function usePagination(items = [], pageSize = 20) {
  const [currentPage, setCurrentPage] = useState(1);

  const paginationData = useMemo(() => {
    const totalPages = Math.ceil(items.length / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const currentItems = items.slice(startIndex, endIndex);

    return {
      currentItems,
      currentPage,
      totalPages,
      hasNextPage: currentPage < totalPages,
      hasPrevPage: currentPage > 1,
      totalItems: items.length,
    };
  }, [items, currentPage, pageSize]);

  const goToPage = useCallback((page) => {
    const totalPages = Math.ceil(items.length / pageSize);
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  }, [items.length, pageSize]);

  const nextPage = useCallback(() => {
    if (paginationData.hasNextPage) {
      setCurrentPage((p) => p + 1);
    }
  }, [paginationData.hasNextPage]);

  const prevPage = useCallback(() => {
    if (paginationData.hasPrevPage) {
      setCurrentPage((p) => p - 1);
    }
  }, [paginationData.hasPrevPage]);

  const reset = useCallback(() => {
    setCurrentPage(1);
  }, []);

  return {
    ...paginationData,
    goToPage,
    nextPage,
    prevPage,
    reset,
  };
}
