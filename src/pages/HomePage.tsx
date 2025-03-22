import { Link } from 'react-router-dom';
import { useFeaturedProducts } from '../hooks/useProducts';

const HomePage = () => {
  // Use React Query to fetch featured products
  const { data: featuredProducts, isLoading, error } = useFeaturedProducts();
  
  // Categories for the category section
  const categories = [
    { name: 'Hookahs', image: '/images/Images:Categories/Shihsa.jpg', slug: 'hookahs' },
    { name: 'Tobacco', image: '/images/Images:Categories/tobacco.jpg', slug: 'tobacco' },
    { name: 'Accessories', image: '/images/Images:Categories/acessories.jpg', slug: 'accessories' },
    { name: 'Vapes', image: '/images/Images:Categories/vapes.jpg', slug: 'vapes' },
  ];

  // Hero section rendering
  const renderHero = () => (
    <div className="relative w-full h-[80vh] bg-dark">
      {/* Hero image as background */}
      <div 
        className="absolute inset-0 bg-center bg-cover bg-no-repeat opacity-50"
        style={{ backgroundImage: 'url(/images/hero-hookah.jpg)' }}
      ></div>
      
      {/* Content overlay */}
      <div className="relative h-full flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
          <span className="text-light">MALL of</span>{' '}
          <span className="text-primary">HOOKAH</span>
        </h1>
        <p className="text-light text-lg md:text-xl max-w-2xl mb-8">
          Premium hookahs, flavor-rich tobacco, and top-quality vapes. 
          Experience luxury smoking products with nationwide shipping.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link 
            to="/products" 
            className="px-8 py-3 bg-primary text-light font-semibold rounded-md hover:bg-accent transition-colors"
          >
            Shop Now
          </Link>
          <Link 
            to="/products/featured" 
            className="px-8 py-3 bg-transparent border border-light text-light font-semibold rounded-md hover:bg-dark-hover transition-colors"
          >
            View Featured
          </Link>
        </div>
      </div>
    </div>
  );

  // Featured products section
  const renderFeaturedProducts = () => (
    <section className="py-16 px-4 bg-dark-lighter">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold mb-2 text-light">Featured Products</h2>
        <p className="text-gray-400 mb-8">Check out our most popular items</p>
        
        {isLoading ? (
          <div className="flex justify-center text-light">
            <p>Loading products...</p>
          </div>
        ) : error ? (
          <div className="text-accent">
            <p>Error loading products. Please try again later.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProducts?.map((product) => (
              <div key={product.id} className="bg-dark-card rounded-lg shadow-md overflow-hidden border border-gray-800">
                <div className="h-64 bg-dark">
                  <img 
                    src={product.images?.[0] || '/images/product-placeholder.jpg'} 
                    alt={product.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-light">{product.name}</h3>
                  <p className="text-gray-400 text-sm mb-2">{product.category_id}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-primary font-bold">${product.price.toFixed(2)}</span>
                    <Link 
                      to={`/product/${product.id}`}
                      className="px-4 py-2 bg-primary text-light rounded-md text-sm hover:bg-accent transition-colors"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="text-center mt-10">
          <Link 
            to="/hookahs" 
            className="inline-block px-6 py-3 bg-primary text-light font-medium rounded-md hover:bg-accent transition-colors"
          >
            View All Products
          </Link>
        </div>
      </div>
    </section>
  );

  // Categories Section
  const renderCategories = () => (
    <section className="py-16 bg-dark w-full">
      <div className="container mx-auto px-4 w-full max-w-full">
        <h2 className="text-3xl font-bold text-center mb-12 text-light">Shop by Category</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {categories.map((category) => (
            <div key={category.slug} className="bg-dark-card rounded-lg shadow-md overflow-hidden transition-transform hover:scale-105 border border-gray-800">
              <div className="h-48 bg-dark">
                <img 
                  src={category.image} 
                  alt={category.name} 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2 text-light">{category.name}</h3>
                <p className="text-gray-400 mb-4">
                  Premium {category.name.toLowerCase()} for the perfect smoking experience.
                </p>
                <Link
                  to={`/${category.slug}`}
                  className="text-primary hover:text-accent font-medium inline-flex items-center"
                >
                  Shop {category.name}
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
          ))}
        </div>
      </div>
    </section>
  );

  // Newsletter Section
  const renderNewsletter = () => (
    <section className="py-16 bg-dark">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4 text-black">Subscribe to Our Newsletter</h2>
          <p className="text-gray-400 mb-8">
            Stay updated with our latest products, offers, and hookah tips.
          </p>
          <form className="flex flex-col md:flex-row gap-4">
            <input
              type="email"
              placeholder="Your email address"
              className="flex-grow px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
            <button
              type="submit"
              className="bg-primary hover:bg-accent text-light px-6 py-3 rounded-md font-medium transition-colors whitespace-nowrap"
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
  );

  return (
    <div>
      {renderHero()}
      {renderCategories()}
      {renderFeaturedProducts()}
      {renderNewsletter()}
    </div>
  );
};

export default HomePage;
