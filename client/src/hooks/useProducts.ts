import { useState, useEffect, useCallback } from 'react';
import { Product, ProductFilters } from '../types';
import { api } from '../lib/api';

export function useProducts(filters?: ProductFilters) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getProducts(filters);
      setProducts(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to load products');
    } finally {
      setIsLoading(false);
    }
  }, [
    filters?.categoryId,
    filters?.categorySlug,
    filters?.subcategoryId,
    filters?.search,
    filters?.minPrice,
    filters?.maxPrice,
    filters?.minRating,
    filters?.inStockOnly,
    filters?.sortBy,
  ]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return { products, isLoading, error, refetch: fetchProducts };
}
