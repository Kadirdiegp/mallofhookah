import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// This will be replaced with actual data from Supabase
import { Product } from '../types';

const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Mock data for now - will be replaced with Supabase fetch
    setTimeout(() => {
      setFeaturedProducts([
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
        }
      ]);
      setIsLoading(false);
    }, 1000);
  }, []);

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative overflow-hidden w-full bg-black py-0">
        {/* Background accent shapes */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -right-20 top-1/4 h-64 w-64 rounded-full bg-primary opacity-20 blur-xl"></div>
          <div className="absolute left-1/4 bottom-0 h-96 w-96 rounded-full bg-primary opacity-10 blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 py-16 md:py-24 relative z-10 w-full max-w-full">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            {/* Text content - left side */}
            <div className="w-full md:w-1/2 text-white">
              <h1 className="text-6xl md:text-7xl lg:text-8xl font-black tracking-tight mb-6 leading-none">
                <span className="text-white">MALL </span>
                <span className="text-white">of </span>
                <span className="text-primary">HOOKAH</span>
              </h1>
              <p className="text-xl mb-8 max-w-xl">
                Explore our collection of high-quality hookah pipes, vaping devices, premium tobacco, and accessories.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  to="/products"
                  className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-md font-medium transition-colors"
                >
                  Shop Now
                </Link>
                <Link
                  to="/products/featured"
                  className="bg-transparent hover:bg-white/10 text-white border border-white px-6 py-3 rounded-md font-medium transition-colors"
                >
                  Featured Products
                </Link>
              </div>
            </div>
            
            {/* Hero image - right side */}
            <div className="w-full md:w-1/2 relative">
              <div className="relative pb-[100%]"> 
                {/* 
                  Note: Place your hero image at /public/images/hero-hookah.jpg 
                  or update this path to match where you store your images 
                */}
                <img 
                  src="/images/hero-hookah.jpg" 
                  alt="Premium hookah products" 
                  className="absolute inset-0 w-full h-full object-cover rounded-lg"
                />
                {/* Decorative element */}
                <div className="absolute -bottom-5 -right-5 w-24 h-24 bg-primary rounded-full mix-blend-multiply blur-sm opacity-70"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-white w-full">
        <div className="container mx-auto px-4 w-full max-w-full">
          <h2 className="text-3xl font-bold text-center mb-12 text-black">Shop by Category</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Hookah Category */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:scale-105">
              <div className="h-48 bg-gray-200">
                {/* Image will be replaced with actual image */}
                <div className="w-full h-full flex items-center justify-center bg-gray-300">
                  <span className="text-gray-500">Hookah Image</span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">Hookahs</h3>
                <p className="text-gray-600 mb-4">
                  Premium hookah pipes and complete sets for the perfect smoking experience.
                </p>
                <Link
                  to="/products/hookah"
                  className="text-red-500 hover:text-red-700 font-medium inline-flex items-center"
                >
                  Shop Hookahs
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 ml-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </Link>
              </div>
            </div>

            {/* Vapes Category */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:scale-105">
              <div className="h-48 bg-gray-200">
                {/* Image will be replaced with actual image */}
                <div className="w-full h-full flex items-center justify-center bg-gray-300">
                  <span className="text-gray-500">Vape Image</span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">Vapes</h3>
                <p className="text-gray-600 mb-4">
                  Quality vaping devices, starter kits, and advanced mods for every vaper.
                </p>
                <Link
                  to="/products/vapes"
                  className="text-red-500 hover:text-red-700 font-medium inline-flex items-center"
                >
                  Shop Vapes
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 ml-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </Link>
              </div>
            </div>

            {/* Tobacco Category */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:scale-105">
              <div className="h-48 bg-gray-200">
                {/* Image will be replaced with actual image */}
                <div className="w-full h-full flex items-center justify-center bg-gray-300">
                  <span className="text-gray-500">Tobacco Image</span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">Tobacco</h3>
                <p className="text-gray-600 mb-4">
                  Premium tobacco blends in various flavors for the perfect hookah experience.
                </p>
                <Link
                  to="/products/tobacco"
                  className="text-red-500 hover:text-red-700 font-medium inline-flex items-center"
                >
                  Shop Tobacco
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 ml-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </Link>
              </div>
            </div>

            {/* Accessories Category */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:scale-105">
              <div className="h-48 bg-gray-200">
                {/* Image will be replaced with actual image */}
                <div className="w-full h-full flex items-center justify-center bg-gray-300">
                  <span className="text-gray-500">Accessories Image</span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">Accessories</h3>
                <p className="text-gray-600 mb-4">
                  Essential accessories for hookah and vape maintenance and enhancement.
                </p>
                <Link
                  to="/products/accessories"
                  className="text-red-500 hover:text-red-700 font-medium inline-flex items-center"
                >
                  Shop Accessories
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 ml-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16 bg-gray-50 w-full">
        <div className="container mx-auto px-4 w-full max-w-full">
          <h2 className="text-3xl font-bold text-center mb-12 text-black">Featured Products</h2>
          
          {isLoading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredProducts.map((product) => (
                <div key={product.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                  <div className="h-48 bg-gray-200">
                    {/* Image will be replaced with actual image */}
                    <div className="w-full h-full flex items-center justify-center bg-gray-300">
                      <span className="text-gray-500">{product.name} Image</span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-bold mb-2">{product.name}</h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">{product.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-bold text-red-500">${product.price.toFixed(2)}</span>
                      <Link
                        to={`/product/${product.id}`}
                        className="bg-red-500 hover:bg-red-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="mt-12 text-center">
            <Link
              to="/products/featured"
              className="bg-red-500 hover:bg-red-700 text-white px-6 py-3 rounded-md font-medium transition-colors"
            >
              View All Featured
            </Link>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Subscribe to Our Newsletter</h2>
            <p className="text-gray-600 mb-8">
              Stay updated with our latest products, offers, and hookah tips.
            </p>
            <form className="flex flex-col md:flex-row gap-4">
              <input
                type="email"
                placeholder="Your email address"
                className="flex-grow px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
                required
              />
              <button
                type="submit"
                className="bg-red-500 hover:bg-red-700 text-white px-6 py-3 rounded-md font-medium transition-colors whitespace-nowrap"
              >
                Subscribe
              </button>
            </form>
            <p className="text-gray-500 text-sm mt-4">
              We respect your privacy. Unsubscribe at any time.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
