import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/cart';
import { Product } from '../types';

const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);

  const addToCart = useCartStore(state => state.addItem);

  useEffect(() => {
    if (!id) return;
    
    // Reset state when product ID changes
    setQuantity(1);
    setActiveImage(0);
    setIsLoading(true);
    
    // Mock fetch product - will be replaced with Supabase fetch
    setTimeout(() => {
      // Mock product data
      const mockProducts: Record<string, Product> = {
        '1': {
          id: '1',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          name: 'Premium Hookah Set',
          description: 'Complete hookah set with premium accessories. This elegant hookah set includes a high-quality glass base, premium stainless steel stem, silicone hose with washable mouthpiece, clay bowl, and tongs. Perfect for beginners and experienced hookah enthusiasts alike. The ergonomic design ensures a smooth smoking experience, while the sturdy build guarantees longevity. This set comes in an elegant gift box, making it perfect for a present.',
          price: 129.99,
          stock: 15,
          category_id: 'hookah',
          images: ['/images/products/hookah1-1.jpg', '/images/products/hookah1-2.jpg', '/images/products/hookah1-3.jpg'],
          featured: true,
          sku: 'HKH001'
        },
        '2': {
          id: '2',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          name: 'Vape Starter Kit',
          description: 'Everything you need to start vaping. This comprehensive starter kit includes a high-quality vape device, two coils, a USB charging cable, and a user manual. The device features adjustable wattage and airflow, allowing you to customize your vaping experience. With its sleek design and compact size, this kit is perfect for beginners who want a reliable and easy-to-use vaping solution.',
          price: 49.99,
          stock: 25,
          category_id: 'vapes',
          images: ['/images/products/vape1-1.jpg', '/images/products/vape1-2.jpg'],
          featured: true,
          sku: 'VPE001'
        },
        '3': {
          id: '3',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          name: 'Fruit Mix Tobacco',
          description: 'Premium fruit-flavored tobacco for hookah. This premium tobacco blend features a delicious mix of tropical fruits, creating a refreshing and aromatic smoking experience. Made from high-quality tobacco leaves and natural fruit extracts, this blend provides a smooth smoke with rich flavor. Each 250g package is sealed for freshness and comes with storage instructions to maintain optimal flavor.',
          price: 24.99,
          stock: 50,
          category_id: 'tobacco',
          images: ['/images/products/tobacco1-1.jpg'],
          featured: true,
          sku: 'TBC001'
        },
        '4': {
          id: '4',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          name: 'Hookah Cleaning Kit',
          description: 'Complete kit for cleaning and maintaining your hookah. This comprehensive cleaning kit includes specialized brushes for the stem and base, a dedicated bowl cleaner, pipe cleaners for the hose, and a premium cleaning solution that removes residue without damaging your hookah. Regular cleaning with this kit will extend the life of your hookah and ensure a consistently smooth smoking experience with pure flavor.',
          price: 19.99,
          stock: 30,
          category_id: 'accessories',
          images: ['/images/products/accessory1-1.jpg', '/images/products/accessory1-2.jpg'],
          featured: true,
          sku: 'ACC001'
        }
      };
      
      const foundProduct = mockProducts[id];
      
      if (foundProduct) {
        setProduct(foundProduct);
        
        // Find related products (same category)
        const related = Object.values(mockProducts)
          .filter(p => p.id !== id && p.category_id === foundProduct.category_id)
          .slice(0, 4);
        
        setRelatedProducts(related);
      } else {
        // Product not found, redirect to 404
        navigate('/not-found');
      }
      
      setIsLoading(false);
    }, 800);
  }, [id, navigate]);

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (isNaN(value) || value < 1) return;
    
    const maxStock = product?.stock || 1;
    setQuantity(Math.min(value, maxStock));
  };

  const handleAddToCart = () => {
    if (!product) return;
    
    addToCart({
      id: crypto.randomUUID(),
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: quantity,
      image: product.images[0] || ''
    });
  };

  const renderPlaceholderImage = () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-300">
      <span className="text-gray-500">Product Image</span>
    </div>
  );

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
          <p className="mb-8">The product you're looking for doesn't exist or has been removed.</p>
          <Link
            to="/products"
            className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-md font-medium transition-colors"
          >
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-light">
      <div className="container mx-auto px-4 py-12">
        {/* Breadcrumbs */}
        <nav className="flex mb-8 text-sm">
          <Link to="/" className="text-gray-500 hover:text-primary transition-colors">
            Home
          </Link>
          <span className="mx-2 text-gray-500">/</span>
          <Link 
            to={`/products/${product.category_id}`} 
            className="text-gray-500 hover:text-primary transition-colors"
          >
            {product.category_id.charAt(0).toUpperCase() + product.category_id.slice(1)}
          </Link>
          <span className="mx-2 text-gray-500">/</span>
          <span className="text-gray-700">{product.name}</span>
        </nav>

        {/* Product Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
          {/* Product Images */}
          <div>
            <div className="bg-white rounded-lg overflow-hidden shadow-md mb-4 h-80">
              {product.images.length > 0 ? (
                <img
                  src={product.images[activeImage]}
                  alt={product.name}
                  className="w-full h-full object-contain"
                />
              ) : (
                renderPlaceholderImage()
              )}
            </div>
            
            {/* Thumbnail Gallery */}
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    className={`border-2 rounded-md overflow-hidden h-20 ${
                      activeImage === index ? 'border-primary' : 'border-transparent'
                    }`}
                    onClick={() => setActiveImage(index)}
                  >
                    <img
                      src={image}
                      alt={`${product.name} - View ${index + 1}`}
                      className="w-full h-full object-contain"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
            <div className="flex items-center mb-4">
              <div className="flex items-center text-yellow-400 mr-2">
                {/* Placeholder stars - would be dynamic based on ratings */}
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                    />
                  </svg>
                ))}
              </div>
              <span className="text-gray-500">(12 reviews)</span>
            </div>
            
            <div className="text-2xl font-bold text-primary mb-4">
              ${product.price.toFixed(2)}
            </div>
            
            <p className="text-gray-700 mb-6">{product.description}</p>
            
            <div className="mb-6">
              <h3 className="font-semibold mb-2">SKU:</h3>
              <p className="text-gray-600">{product.sku}</p>
            </div>
            
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Availability:</h3>
              {product.stock > 0 ? (
                <p className={`${product.stock <= 5 ? 'text-orange-500' : 'text-green-600'}`}>
                  {product.stock <= 5 
                    ? `Only ${product.stock} left in stock - order soon!` 
                    : 'In Stock'}
                </p>
              ) : (
                <p className="text-red-500">Out of Stock</p>
              )}
            </div>
            
            {product.stock > 0 && (
              <div className="flex items-center mb-8">
                <div className="mr-4">
                  <label htmlFor="quantity" className="block font-semibold mb-2">
                    Quantity:
                  </label>
                  <div className="flex items-center">
                    <button
                      className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-l-md bg-gray-100 hover:bg-gray-200"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                    <input
                      type="number"
                      id="quantity"
                      value={quantity}
                      onChange={handleQuantityChange}
                      min="1"
                      max={product.stock}
                      className="w-14 h-10 text-center border-t border-b border-gray-300 focus:outline-none focus:ring-0 focus:border-gray-300"
                    />
                    <button
                      className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-r-md bg-gray-100 hover:bg-gray-200"
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
                
                <button
                  className="flex-grow bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-md font-medium transition-colors"
                  onClick={handleAddToCart}
                >
                  Add to Cart
                </button>
              </div>
            )}
            
            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center space-x-4">
                <a
                  href="#"
                  className="text-gray-500 hover:text-primary flex items-center transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Add to Wishlist
                </a>
                <a
                  href="#"
                  className="text-gray-500 hover:text-primary flex items-center transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                  </svg>
                  Share
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-8">Related Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <div key={relatedProduct.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  <Link to={`/product/${relatedProduct.id}`} className="block">
                    <div className="h-48 bg-gray-200">
                      {/* Image will be replaced with actual image */}
                      <div className="w-full h-full flex items-center justify-center bg-gray-300">
                        <span className="text-gray-500">{relatedProduct.name} Image</span>
                      </div>
                    </div>
                  </Link>
                  <div className="p-4">
                    <Link to={`/product/${relatedProduct.id}`} className="block">
                      <h3 className="text-lg font-bold mb-1 hover:text-primary transition-colors">
                        {relatedProduct.name}
                      </h3>
                    </Link>
                    <p className="text-gray-600 text-sm mb-2 line-clamp-2">{relatedProduct.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-primary">${relatedProduct.price.toFixed(2)}</span>
                      <Link
                        to={`/product/${relatedProduct.id}`}
                        className="bg-dark hover:bg-primary text-white px-3 py-1 rounded-md text-sm font-medium transition-colors"
                      >
                        View
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetailPage;
