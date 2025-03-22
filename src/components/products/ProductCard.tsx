import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../../types/supabase';
import { useCartStore } from '../../store/cart';
import { v4 as uuidv4 } from 'uuid';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { name, price, images, id, discount_price } = product;
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
    <div className="group relative bg-dark-card rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg border border-gray-800">
      {/* Product Image */}
      <Link to={`/product/${id}`} className="block relative h-48 overflow-hidden">
        <img 
          src={imageUrl}
          alt={name}
          className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
        />
      </Link>
      
      {/* Product Tags */}
      {hasDiscount && (
        <div className="absolute top-2 right-2 bg-primary text-white px-2 py-1 text-xs font-bold rounded">
          Sale
        </div>
      )}
      
      {/* Product Details */}
      <div className="p-4">
        <Link to={`/product/${id}`} className="block">
          <h3 className="text-light font-medium text-lg mb-1 transition-colors duration-300 group-hover:text-white">
            {name}
          </h3>
        </Link>
        
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center">
            {hasDiscount ? (
              <>
                <span className="text-white font-bold">${displayPrice.toFixed(2)}</span>
                <span className="text-gray-400 line-through ml-2 text-sm">${price.toFixed(2)}</span>
              </>
            ) : (
              <span className="text-white font-bold">${price.toFixed(2)}</span>
            )}
          </div>
          
          <button 
            onClick={handleAddToCart}
            className="bg-primary hover:bg-accent text-white px-3 py-1 rounded-full text-sm transition-colors duration-300"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
