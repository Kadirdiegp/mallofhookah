import { useState } from 'react';
import { Link } from 'react-router-dom';

// Mock product data
const mockProducts = [
  {
    id: 'prod001',
    name: 'Premium Hookah - Gold Edition',
    category: 'Hookahs',
    price: 149.99,
    stock: 12,
    featured: true,
    imageUrl: 'https://placehold.co/100x100',
  },
  {
    id: 'prod002',
    name: 'Mint Flavor Shisha - 250g',
    category: 'Shisha',
    price: 24.99,
    stock: 35,
    featured: true,
    imageUrl: 'https://placehold.co/100x100',
  },
  {
    id: 'prod003',
    name: 'Natural Coconut Hookah Coals - 1kg',
    category: 'Accessories',
    price: 19.99,
    stock: 3,
    featured: false,
    imageUrl: 'https://placehold.co/100x100',
  },
  {
    id: 'prod004',
    name: 'Glass Hookah Base - Blue',
    category: 'Parts',
    price: 34.99,
    stock: 8,
    featured: false,
    imageUrl: 'https://placehold.co/100x100',
  },
  {
    id: 'prod005',
    name: 'Premium Silicone Hose',
    category: 'Parts',
    price: 29.99,
    stock: 17,
    featured: true,
    imageUrl: 'https://placehold.co/100x100',
  },
  {
    id: 'prod006',
    name: 'Hookah Cleaning Brush Set',
    category: 'Accessories',
    price: 14.99,
    stock: 22,
    featured: false,
    imageUrl: 'https://placehold.co/100x100',
  },
  {
    id: 'prod007',
    name: 'Apple Flavor Shisha - 250g',
    category: 'Shisha',
    price: 24.99,
    stock: 28,
    featured: true,
    imageUrl: 'https://placehold.co/100x100',
  },
  {
    id: 'prod008',
    name: 'Hookah Bowl - Clay',
    category: 'Parts',
    price: 12.99,
    stock: 42,
    featured: false,
    imageUrl: 'https://placehold.co/100x100',
  },
  {
    id: 'prod009',
    name: 'Compact Hookah - Travel Size',
    category: 'Hookahs',
    price: 89.99,
    stock: 5,
    featured: true,
    imageUrl: 'https://placehold.co/100x100',
  },
  {
    id: 'prod010',
    name: 'Premium Hookah - Silver Edition',
    category: 'Hookahs',
    price: 139.99,
    stock: 9,
    featured: false,
    imageUrl: 'https://placehold.co/100x100',
  },
];

// Mock categories for filter
const mockCategories = [
  'All Categories',
  'Hookahs',
  'Shisha',
  'Parts',
  'Accessories',
];

const ProductsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [sortBy, setSortBy] = useState('name');
  const [showLowStock, setShowLowStock] = useState(false);
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [isAllSelected, setIsAllSelected] = useState(false);
  
  // Filter and sort products
  const filteredProducts = mockProducts.filter(product => {
    // By search query
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    // By category
    const matchesCategory = selectedCategory === 'All Categories' || product.category === selectedCategory;
    
    // By stock
    const matchesStock = !showLowStock || product.stock <= 10;
    
    // By featured
    const matchesFeatured = !showFeaturedOnly || product.featured;
    
    return matchesSearch && matchesCategory && matchesStock && matchesFeatured;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'price-asc':
        return a.price - b.price;
      case 'price-desc':
        return b.price - a.price;
      case 'stock':
        return a.stock - b.stock;
      default:
        return 0;
    }
  });
  
  // Handle select all
  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(filteredProducts.map(p => p.id));
    }
    setIsAllSelected(!isAllSelected);
  };
  
  // Handle single select
  const handleSelectProduct = (productId: string) => {
    if (selectedProducts.includes(productId)) {
      setSelectedProducts(selectedProducts.filter(id => id !== productId));
    } else {
      setSelectedProducts([...selectedProducts, productId]);
    }
  };
  
  // Get stock status
  const getStockStatus = (stock: number) => {
    if (stock <= 0) return { label: 'Out of Stock', color: 'bg-red-100 text-red-800' };
    if (stock <= 5) return { label: 'Very Low', color: 'bg-red-100 text-red-800' };
    if (stock <= 10) return { label: 'Low', color: 'bg-yellow-100 text-yellow-800' };
    return { label: 'In Stock', color: 'bg-green-100 text-green-800' };
  };

  return (
    <div className="bg-light min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Products Management</h1>
          <Link 
            to="/admin/products/new" 
            className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-md transition-colors flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add New Product
          </Link>
        </div>
        
        {/* Filter and Search Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                Search Products
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  id="search"
                  className="pl-10 w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Search by name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                id="category"
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {mockCategories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="sortBy" className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <select
                id="sortBy"
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="name">Name (A-Z)</option>
                <option value="price-asc">Price (Low to High)</option>
                <option value="price-desc">Price (High to Low)</option>
                <option value="stock">Stock (Low to High)</option>
              </select>
            </div>
            
            <div className="flex flex-col justify-end">
              <div className="flex items-center mb-2">
                <input
                  type="checkbox"
                  id="lowStock"
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  checked={showLowStock}
                  onChange={() => setShowLowStock(!showLowStock)}
                />
                <label htmlFor="lowStock" className="ml-2 block text-sm text-gray-700">
                  Show Low Stock Only
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="featured"
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  checked={showFeaturedOnly}
                  onChange={() => setShowFeaturedOnly(!showFeaturedOnly)}
                />
                <label htmlFor="featured" className="ml-2 block text-sm text-gray-700">
                  Show Featured Only
                </label>
              </div>
            </div>
          </div>
        </div>
        
        {/* Bulk Actions */}
        {selectedProducts.length > 0 && (
          <div className="bg-gray-100 border border-gray-200 rounded-md p-4 mb-4 flex items-center justify-between">
            <div>
              <span className="font-medium">{selectedProducts.length} products selected</span>
            </div>
            <div className="flex space-x-4">
              <button className="text-gray-700 hover:text-gray-900 font-medium">
                Update Stock
              </button>
              <button className="text-gray-700 hover:text-gray-900 font-medium">
                Toggle Featured
              </button>
              <button className="text-red-600 hover:text-red-800 font-medium">
                Delete
              </button>
            </div>
          </div>
        )}
        
        {/* Products Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                        checked={isAllSelected}
                        onChange={handleSelectAll}
                      />
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Featured
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts.map((product) => {
                  const stockStatus = getStockStatus(product.stock);
                  
                  return (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                            checked={selectedProducts.includes(product.id)}
                            onChange={() => handleSelectProduct(product.id)}
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <img className="h-10 w-10 rounded-md object-cover" src={product.imageUrl} alt={product.name} />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{product.name}</div>
                            <div className="text-xs text-gray-500">ID: {product.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{product.category}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">${product.price.toFixed(2)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className={`px-2 py-1 text-xs rounded-full ${stockStatus.color}`}>
                            {stockStatus.label}
                          </span>
                          <span className="ml-2 text-sm text-gray-500">{product.stock} units</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {product.featured ? (
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">Featured</span>
                          ) : (
                            <span className="text-gray-500">-</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex space-x-3">
                          <button className="text-indigo-600 hover:text-indigo-900">Edit</button>
                          <button className="text-red-600 hover:text-red-900">Delete</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                
                {filteredProducts.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="text-gray-500">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                        <h3 className="mt-2 text-lg font-medium text-gray-900">No products found</h3>
                        <p className="mt-1 text-sm text-gray-500">
                          Try adjusting your search or filter to find what you're looking for.
                        </p>
                        <button
                          className="mt-4 text-primary hover:text-primary/80 font-medium"
                          onClick={() => {
                            setSearchQuery('');
                            setSelectedCategory('All Categories');
                            setShowLowStock(false);
                            setShowFeaturedOnly(false);
                          }}
                        >
                          Clear all filters
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                Previous
              </button>
              <button className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">1</span> to <span className="font-medium">10</span> of{' '}
                  <span className="font-medium">{filteredProducts.length}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                    <span className="sr-only">Previous</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                  <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-primary text-sm font-medium text-white">
                    1
                  </button>
                  <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                    2
                  </button>
                  <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                    3
                  </button>
                  <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                    ...
                  </span>
                  <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                    10
                  </button>
                  <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                    <span className="sr-only">Next</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
