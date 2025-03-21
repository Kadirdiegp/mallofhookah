import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../../types/supabase';
import { useCartStore } from '../../store/cart';
import { v4 as uuidv4 } from 'uuid';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { name, price, images, slug, discount_price } = product;
  const imageUrl = images && images.length > 0 ? images[0] : '/images/placeholder.jpg';
  const { addItem } = useCartStore();
  
  const hasDiscount = discount_price !== null && discount_price < price;
  const displayPrice = hasDiscount ? discount_price : price;

  const handleAddToCart = () => {
    addItem({
      id: uuidv4(),
      productId: product.id,
      name: product.name,
      price: displayPrice,
      quantity: 1,
      image: imageUrl
    });
  };

  return (
    <div className="group relative bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg">
      {/* Product Image */}
      <Link to={`/product/${slug}`} className="block relative h-48 overflow-hidden">
        <img 
          src={imageUrl}
          alt={name}
          className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
        />
      </Link>
      
      {/* Product Tags */}
      {hasDiscount && (
        <div className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 text-xs font-bold rounded">
          Sale
        </div>
      )}
      
      {/* Product Details */}
      <div className="p-4">
        <Link to={`/product/${slug}`} className="block">
          <h3 className="text-gray-900 font-medium text-lg mb-1 transition-colors duration-300 group-hover:text-primary">
            {name}
          </h3>
        </Link>
        
        <div className="flex items-center mt-1">
          {hasDiscount ? (
            <>
              <span className="text-red-600 font-semibold">${displayPrice.toFixed(2)}</span>
              <span className="ml-2 text-gray-500 text-sm line-through">${price.toFixed(2)}</span>
            </>
          ) : (
            <span className="text-gray-900 font-semibold">${displayPrice.toFixed(2)}</span>
          )}
        </div>
        
        {/* Add to Cart Button */}
        <button 
          onClick={handleAddToCart}
          className="mt-4 w-full bg-primary text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-300 hover:bg-primary-dark"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
