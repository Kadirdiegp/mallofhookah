import { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { useCartStore } from '../store/cart';
import { Product, FilterOptions } from '../types';

const ProductListPage = () => {
  const { category } = useParams<{ category: string }>();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';
  
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    categories: category ? [category] : undefined,
    minPrice: undefined,
    maxPrice: undefined,
    sortBy: 'newest',
    searchQuery: searchQuery || undefined,
  });

  const addToCart = useCartStore(state => state.addItem);

  useEffect(() => {
    // Update filter when category changes
    setFilterOptions(prev => ({
      ...prev,
      categories: category ? [category] : undefined,
      searchQuery: searchQuery || undefined,
    }));
  }, [category, searchQuery]);

  useEffect(() => {
    // Mock data for now - will be replaced with Supabase fetch
    setIsLoading(true);
    
    setTimeout(() => {
      // Simulate fetching data based on filters
      const mockProducts: Product[] = [
        {
          id: '1',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          name: 'Premium Hookah Set',
          description: 'Complete hookah set with premium accessories.',
          price: 129.99,
          stock: 15,
          category_id: 'hookah',
          images: ['/images/products/hookah1.jpg'],
          featured: true,
          sku: 'HKH001'
        },
        {
          id: '2',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          name: 'Vape Starter Kit',
          description: 'Everything you need to start vaping.',
          price: 49.99,
          stock: 25,
          category_id: 'vapes',
          images: ['/images/products/vape1.jpg'],
          featured: true,
          sku: 'VPE001'
        },
        {
          id: '3',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          name: 'Fruit Mix Tobacco',
          description: 'Premium fruit-flavored tobacco for hookah.',
          price: 24.99,
          stock: 50,
          category_id: 'tobacco',
          images: ['/images/products/tobacco1.jpg'],
          featured: true,
          sku: 'TBC001'
        },
        {
          id: '4',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          name: 'Hookah Cleaning Kit',
          description: 'Complete kit for cleaning and maintaining your hookah.',
          price: 19.99,
          stock: 30,
          category_id: 'accessories',
          images: ['/images/products/accessory1.jpg'],
          featured: true,
          sku: 'ACC001'
        },
        {
          id: '5',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          name: 'Glass Hookah',
          description: 'Elegant glass hookah with LED lighting.',
          price: 89.99,
          stock: 10,
          category_id: 'hookah',
          images: ['/images/products/hookah2.jpg'],
          featured: false,
          sku: 'HKH002'
        },
        {
          id: '6',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          name: 'Disposable Vape Pen',
          description: 'Convenient disposable vape pen with flavor options.',
          price: 9.99,
          stock: 100,
          category_id: 'vapes',
          images: ['/images/products/vape2.jpg'],
          featured: false,
          sku: 'VPE002'
        },
        {
          id: '7',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          name: 'Mint Tobacco',
          description: 'Refreshing mint-flavored hookah tobacco.',
          price: 22.99,
          stock: 45,
          category_id: 'tobacco',
          images: ['/images/products/tobacco2.jpg'],
          featured: false,
          sku: 'TBC002'
        },
        {
          id: '8',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          name: 'Hookah Hose Set',
          description: 'Set of premium silicone hookah hoses.',
          price: 29.99,
          stock: 20,
          category_id: 'accessories',
          images: ['/images/products/accessory2.jpg'],
          featured: false,
          sku: 'ACC002'
        }
      ];

      let filteredProducts = [...mockProducts];
      
      // Apply category filter
      if (filterOptions.categories && filterOptions.categories.length > 0) {
        filteredProducts = filteredProducts.filter(product => 
          filterOptions.categories?.includes(product.category_id)
        );
      }
      
      // Apply price filter
      if (filterOptions.minPrice !== undefined) {
        filteredProducts = filteredProducts.filter(product => 
          product.price >= (filterOptions.minPrice || 0)
        );
      }
      if (filterOptions.maxPrice !== undefined) {
        filteredProducts = filteredProducts.filter(product => 
          product.price <= (filterOptions.maxPrice || Infinity)
        );
      }
      
      // Apply search filter
      if (filterOptions.searchQuery) {
        const query = filterOptions.searchQuery.toLowerCase();
        filteredProducts = filteredProducts.filter(product => 
          product.name.toLowerCase().includes(query) || 
          product.description.toLowerCase().includes(query)
        );
      }
      
      // Apply sorting
      if (filterOptions.sortBy) {
        switch (filterOptions.sortBy) {
          case 'price_asc':
            filteredProducts.sort((a, b) => a.price - b.price);
            break;
          case 'price_desc':
            filteredProducts.sort((a, b) => b.price - a.price);
            break;
          case 'newest':
            filteredProducts.sort((a, b) => 
              new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            );
            break;
          // Popularity sorting would require additional data in a real implementation
          default:
            break;
        }
      }
      
      setProducts(filteredProducts);
      setIsLoading(false);
    }, 800);
  }, [filterOptions]);

  const handleAddToCart = (product: Product) => {
    addToCart({
      id: crypto.randomUUID(),
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.images[0] || ''
    });
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterOptions(prev => ({
      ...prev,
      sortBy: e.target.value as FilterOptions['sortBy']
    }));
  };

  const handlePriceFilterChange = (min?: number, max?: number) => {
    setFilterOptions(prev => ({
      ...prev,
      minPrice: min,
      maxPrice: max
    }));
  };

  const getCategoryTitle = () => {
    if (!category) return 'All Products';
    
    const categoryMap: Record<string, string> = {
      'hookah': 'Hookahs',
      'vapes': 'Vapes & E-Cigarettes',
      'tobacco': 'Tobacco & Flavors',
      'accessories': 'Accessories'
    };
    
    return categoryMap[category] || 'Products';
  };

  return (
    <div className="bg-light min-h-screen py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">{getCategoryTitle()}</h1>
          {searchQuery && (
            <p className="text-gray-600 mt-2">
              Search results for: <span className="font-medium">"{searchQuery}"</span>
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="font-bold text-xl mb-4">Filters</h2>
              
              {/* Price Range */}
              <div className="mb-6">
                <h3 className="font-semibold mb-3">Price Range</h3>
                <div className="space-y-2">
                  <button 
                    className={`block w-full text-left px-3 py-2 rounded-md ${
                      !filterOptions.minPrice && !filterOptions.maxPrice 
                        ? 'bg-primary/10 text-primary' 
                        : 'hover:bg-gray-100'
                    }`}
                    onClick={() => handlePriceFilterChange(undefined, undefined)}
                  >
                    All Prices
                  </button>
                  <button 
                    className={`block w-full text-left px-3 py-2 rounded-md ${
                      filterOptions.maxPrice === 25 
                        ? 'bg-primary/10 text-primary' 
                        : 'hover:bg-gray-100'
                    }`}
                    onClick={() => handlePriceFilterChange(0, 25)}
                  >
                    Under $25
                  </button>
                  <button 
                    className={`block w-full text-left px-3 py-2 rounded-md ${
                      filterOptions.minPrice === 25 && filterOptions.maxPrice === 50 
                        ? 'bg-primary/10 text-primary' 
                        : 'hover:bg-gray-100'
                    }`}
                    onClick={() => handlePriceFilterChange(25, 50)}
                  >
                    $25 to $50
                  </button>
                  <button 
                    className={`block w-full text-left px-3 py-2 rounded-md ${
                      filterOptions.minPrice === 50 && filterOptions.maxPrice === 100 
                        ? 'bg-primary/10 text-primary' 
                        : 'hover:bg-gray-100'
                    }`}
                    onClick={() => handlePriceFilterChange(50, 100)}
                  >
                    $50 to $100
                  </button>
                  <button 
                    className={`block w-full text-left px-3 py-2 rounded-md ${
                      filterOptions.minPrice === 100 
                        ? 'bg-primary/10 text-primary' 
                        : 'hover:bg-gray-100'
                    }`}
                    onClick={() => handlePriceFilterChange(100, undefined)}
                  >
                    $100 & Above
                  </button>
                </div>
              </div>
              
              {/* Categories (only show if not already filtered by category) */}
              {!category && (
                <div className="mb-6">
                  <h3 className="font-semibold mb-3">Categories</h3>
                  <div className="space-y-2">
                    <Link 
                      to="/products/hookah"
                      className="block w-full text-left px-3 py-2 rounded-md hover:bg-gray-100"
                    >
                      Hookahs
                    </Link>
                    <Link 
                      to="/products/vapes"
                      className="block w-full text-left px-3 py-2 rounded-md hover:bg-gray-100"
                    >
                      Vapes & E-Cigarettes
                    </Link>
                    <Link 
                      to="/products/tobacco"
                      className="block w-full text-left px-3 py-2 rounded-md hover:bg-gray-100"
                    >
                      Tobacco & Flavors
                    </Link>
                    <Link 
                      to="/products/accessories"
                      className="block w-full text-left px-3 py-2 rounded-md hover:bg-gray-100"
                    >
                      Accessories
                    </Link>
                  </div>
                </div>
              )}
              
              {/* Clear Filters Button */}
              <button 
                className="w-full py-2 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
                onClick={() => {
                  setFilterOptions({
                    categories: category ? [category] : undefined,
                    minPrice: undefined,
                    maxPrice: undefined,
                    sortBy: 'newest',
                    searchQuery: searchQuery || undefined,
                  });
                }}
              >
                Clear Filters
              </button>
            </div>
          </div>
          
          {/* Products */}
          <div className="lg:col-span-3">
            {/* Sort & Results Count */}
            <div className="flex flex-wrap items-center justify-between mb-6">
              <p className="text-gray-600">
                {isLoading ? 'Loading products...' : `${products.length} products found`}
              </p>
              <div className="flex items-center">
                <label htmlFor="sort" className="mr-2 text-gray-600">Sort by:</label>
                <select
                  id="sort"
                  className="border border-gray-300 rounded-md p-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary"
                  value={filterOptions.sortBy}
                  onChange={handleSortChange}
                >
                  <option value="newest">Newest</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                </select>
              </div>
            </div>
            
            {/* Products Grid */}
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : products.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <h3 className="text-xl font-bold mb-2">No products found</h3>
                <p className="text-gray-600 mb-6">
                  We couldn't find any products matching your criteria.
                </p>
                <button 
                  className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-md font-medium transition-colors"
                  onClick={() => {
                    setFilterOptions({
                      categories: category ? [category] : undefined,
                      minPrice: undefined,
                      maxPrice: undefined,
                      sortBy: 'newest',
                      searchQuery: undefined,
                    });
                  }}
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                    <Link to={`/product/${product.id}`} className="block">
                      <div className="h-48 bg-gray-200">
                        {/* Image will be replaced with actual image */}
                        <div className="w-full h-full flex items-center justify-center bg-gray-300">
                          <span className="text-gray-500">{product.name} Image</span>
                        </div>
                      </div>
                    </Link>
                    <div className="p-4">
                      <Link to={`/product/${product.id}`} className="block">
                        <h3 className="text-lg font-bold mb-1 hover:text-primary transition-colors">
                          {product.name}
                        </h3>
                      </Link>
                      <p className="text-gray-600 text-sm mb-2 line-clamp-2">{product.description}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-primary">${product.price.toFixed(2)}</span>
                        <div className="flex space-x-2">
                          <Link
                            to={`/product/${product.id}`}
                            className="p-2 text-gray-500 hover:text-primary rounded-md transition-colors"
                            title="View Details"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                              <path
                                fillRule="evenodd"
                                d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </Link>
                          <button
                            className="p-2 text-gray-500 hover:text-primary rounded-md transition-colors"
                            title="Add to Cart"
                            onClick={() => handleAddToCart(product)}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      {product.stock <= 5 && (
                        <p className="text-sm text-red-500 mt-2">
                          Only {product.stock} left in stock!
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductListPage;
