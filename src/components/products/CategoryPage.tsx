import React, { useState } from 'react';
import { useProductsByCategory } from '../../hooks/useProducts';
import ProductCard from './ProductCard';
import { Product } from '../../types/supabase';

interface CategoryPageProps {
  categorySlug: string;
  categoryName: string;
  categoryDescription?: string;
  bannerImage?: string;
}

const CategoryPage: React.FC<CategoryPageProps> = ({
  categorySlug,
  categoryName,
  categoryDescription = '',
  bannerImage = '/images/category-banner.jpg'
}) => {
  const [sortOption, setSortOption] = useState<string>('name-asc');
  
  // Fetch products for this category
  const { 
    data: products = [], 
    isLoading, 
    error 
  } = useProductsByCategory(categorySlug);

  // Sort products based on selected option
  const sortedProducts = [...products].sort((a, b) => {
    switch (sortOption) {
      case 'price-asc':
        return a.price - b.price;
      case 'price-desc':
        return b.price - a.price;
      case 'name-desc':
        return b.name.localeCompare(a.name);
      case 'name-asc':
      default:
        return a.name.localeCompare(b.name);
    }
  });

  if (isLoading) {
    return (
      <div className="py-20 text-center">
        <div className="spinner"></div>
        <p className="mt-4 text-gray-600">Loading {categoryName}...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-20 text-center text-red-600">
        <p>Error loading products: {(error as Error).message}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Category Banner */}
      <div className="relative w-full h-64 mb-8 rounded-lg overflow-hidden">
        <img 
          src={bannerImage} 
          alt={categoryName} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <h1 className="text-4xl text-white font-bold">{categoryName}</h1>
        </div>
      </div>

      {/* Category Description */}
      {categoryDescription && (
        <div className="mb-8 text-center">
          <p className="text-white">{categoryDescription}</p>
        </div>
      )}

      {/* Sort Controls */}
      <div className="flex justify-between items-center mb-6">
        <p className="text-white">
          {sortedProducts.length} {sortedProducts.length === 1 ? 'product' : 'products'} found
        </p>
        <div className="flex items-center">
          <label htmlFor="sort" className="mr-2 text-white">Sort by:</label>
          <select
            id="sort"
            className="border rounded-md px-3 py-1 bg-dark-card text-white border-gray-700"
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
          >
            <option value="name-asc">Name (A-Z)</option>
            <option value="name-desc">Name (Z-A)</option>
            <option value="price-asc">Price (Low to High)</option>
            <option value="price-desc">Price (High to Low)</option>
          </select>
        </div>
      </div>

      {/* Products Grid */}
      {sortedProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {sortedProducts.map((product: Product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-white">No products found in this category.</p>
        </div>
      )}
    </div>
  );
};

export default CategoryPage;
