import { useQuery } from '@tanstack/react-query';
import { productService } from '../services/productService';

// Hook for getting all products
export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: () => productService.getAllProducts(),
  });
}

// Hook for getting featured products
export function useFeaturedProducts() {
  return useQuery({
    queryKey: ['products', 'featured'],
    queryFn: () => productService.getFeaturedProducts(),
  });
}

// Hook for getting products by category
export function useProductsByCategory(categorySlug: string) {
  return useQuery({
    queryKey: ['products', 'category', categorySlug],
    queryFn: () => productService.getProductsByCategory(categorySlug),
    enabled: !!categorySlug,
  });
}

// Hook for getting a product by slug
export function useProductBySlug(slug: string) {
  return useQuery({
    queryKey: ['product', slug],
    queryFn: () => productService.getProductBySlug(slug),
    enabled: !!slug,
  });
}

// Hook for searching products
export function useSearchProducts(query: string) {
  return useQuery({
    queryKey: ['products', 'search', query],
    queryFn: () => productService.searchProducts(query),
    enabled: query.length > 2, // Only search if query is at least 3 characters
  });
}
