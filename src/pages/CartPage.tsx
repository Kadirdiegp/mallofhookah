import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/cart';

const CartPage = () => {
  const navigate = useNavigate();
  const { items, removeItem, updateQuantity, clearCart, totalItems, totalPrice } = useCartStore();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const handleQuantityChange = (id: string, newQuantity: number) => {
    updateQuantity(id, newQuantity);
  };

  const handleRemoveItem = (id: string) => {
    removeItem(id);
  };

  const handleClearCart = () => {
    if (confirm('Are you sure you want to clear your cart?')) {
      clearCart();
    }
  };

  const handleCheckout = () => {
    setIsCheckingOut(true);
    // Simulate processing
    setTimeout(() => {
      navigate('/checkout');
    }, 800);
  };

  // Calculate subtotal, tax, and total
  const subtotal = totalPrice();
  const tax = subtotal * 0.07; // 7% tax rate
  const shipping = subtotal > 100 ? 0 : 10; // Free shipping over $100
  const total = subtotal + tax + shipping;

  return (
    <div className="bg-dark text-light min-h-screen py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Your Cart</h1>

        {items.length === 0 ? (
          <div className="bg-dark-card rounded-lg shadow-md p-8 text-center border border-gray-800">
            <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
            <p className="text-gray-400 mb-8">
              Looks like you haven't added any items to your cart yet.
            </p>
            <Link
              to="/products"
              className="bg-primary hover:bg-accent text-light px-6 py-3 rounded-md font-medium transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-dark-card rounded-lg shadow-md overflow-hidden border border-gray-800">
                <div className="p-6 border-b border-gray-800">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold">Shopping Cart ({totalItems()} items)</h2>
                    <button
                      onClick={handleClearCart}
                      className="text-gray-400 hover:text-primary transition-colors"
                    >
                      Clear Cart
                    </button>
                  </div>
                </div>

                <div className="divide-y divide-gray-800">
                  {items.map((item) => (
                    <div key={item.id} className="p-6 flex flex-col sm:flex-row gap-4">
                      <div className="sm:w-24 h-24 bg-dark flex-shrink-0">
                        <img
                          src={item.image || '/images/product-placeholder.jpg'}
                          alt={item.name}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="flex-grow">
                        <div className="flex flex-col sm:flex-row sm:justify-between">
                          <div>
                            <h3 className="font-bold text-lg mb-1">{item.name}</h3>
                            <p className="text-gray-400 text-sm">Product ID: {item.productId}</p>
                          </div>
                          <div className="text-right mt-2 sm:mt-0">
                            <p className="font-bold text-primary">${item.price.toFixed(2)}</p>
                            <p className="text-gray-400 text-sm">
                              ${(item.price * item.quantity).toFixed(2)} total
                            </p>
                          </div>
                        </div>
                        <div className="flex justify-between items-center mt-4">
                          <div className="flex items-center">
                            <button
                              onClick={() => handleQuantityChange(item.id, Math.max(1, item.quantity - 1))}
                              className="w-8 h-8 flex items-center justify-center bg-gray-800 hover:bg-gray-700 rounded-l-md"
                              disabled={item.quantity <= 1}
                            >
                              -
                            </button>
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 1)}
                              className="w-12 h-8 text-center bg-dark border-y border-gray-800 text-light"
                            />
                            <button
                              onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                              className="w-8 h-8 flex items-center justify-center bg-gray-800 hover:bg-gray-700 rounded-r-md"
                            >
                              +
                            </button>
                          </div>
                          <button
                            onClick={() => handleRemoveItem(item.id)}
                            className="text-gray-400 hover:text-primary transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-dark-card rounded-lg shadow-md p-6 sticky top-24 border border-gray-800">
                <h2 className="text-xl font-bold mb-6">Order Summary</h2>
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Shipping</span>
                    <span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Tax (7%)</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-gray-800 pt-4 flex justify-between font-bold">
                    <span>Total</span>
                    <span className="text-primary">${total.toFixed(2)}</span>
                  </div>
                </div>
                <button
                  onClick={handleCheckout}
                  disabled={isCheckingOut || items.length === 0}
                  className={`w-full py-3 rounded-md font-medium transition-colors ${
                    isCheckingOut
                      ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                      : 'bg-primary hover:bg-accent text-light'
                  }`}
                >
                  {isCheckingOut ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    'Proceed to Checkout'
                  )}
                </button>
                <div className="mt-6">
                  <h3 className="font-semibold mb-2">We Accept</h3>
                  <div className="flex space-x-2">
                    <div className="w-10 h-6 bg-gray-800 rounded"></div>
                    <div className="w-10 h-6 bg-gray-800 rounded"></div>
                    <div className="w-10 h-6 bg-gray-800 rounded"></div>
                    <div className="w-10 h-6 bg-gray-800 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
