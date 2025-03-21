import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSearchProducts } from '../hooks/useProducts';
import ProductCard from '../components/products/ProductCard';
import { Product } from '../types/supabase';

const SearchPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') || '';
  
  const { 
    data: products = [], 
    isLoading, 
    error 
  } = useSearchProducts(searchQuery);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="spinner"></div>
        <p className="mt-4 text-gray-600">Searching for products...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-20 text-center text-red-600">
        <p>Error searching products: {(error as Error).message}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">
        Search Results for "{searchQuery}"
      </h1>
      
      <div className="mb-8">
        <p className="text-gray-700">
          {products.length} {products.length === 1 ? 'product' : 'products'} found
        </p>
      </div>

      {products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product: Product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">No products found</h2>
          <p className="text-gray-600">
            We couldn't find any products matching "{searchQuery}".
          </p>
          <p className="text-gray-600 mt-2">
            Try using different keywords or browse our categories.
          </p>
        </div>
      )}
    </div>
  );
};

export default SearchPage;
