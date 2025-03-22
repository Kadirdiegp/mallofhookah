import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCartStore } from '../../store/cart';
import { useAuth } from '../../hooks/useAuth';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const totalItems = useCartStore(state => state.totalItems());
  const { user, signOut } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isUserMenuOpen && !target.closest('.user-menu-container')) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isUserMenuOpen]);

  // Get user display name or email
  const getUserDisplayName = () => {
    if (!user) return null;
    
    // Try to get display name from Google metadata
    const googleName = user.user_metadata?.full_name || 
                      user.user_metadata?.name ||
                      user.app_metadata?.provider === 'google' && user.email?.split('@')[0];
    
    return googleName || user.email?.split('@')[0] || 'User';
  };

  // Get user avatar if available
  const getUserAvatar = () => {
    if (!user) return null;
    
    return user.user_metadata?.avatar_url || 
           user.user_metadata?.picture ||
           null;
  };

  return (
    <header className="bg-dark-lighter text-light shadow-md w-full border-b border-gray-800">
      <div className="container mx-auto px-4 py-4 w-full max-w-full">
        <div className="flex flex-wrap items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <img src="/images/logo.png" alt="Mall of Hookah" className="h-12" />
          </Link>

          {/* Mobile Menu Button */}
          <button 
            className="lg:hidden p-2 rounded-md bg-black hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
            onClick={toggleMenu}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-6 w-6 text-white" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"} 
              />
            </svg>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            <Link to="/hookahs" className="text-light hover:text-primary transition-colors">
              Hookahs
            </Link>
            <Link to="/vapes" className="text-light hover:text-primary transition-colors">
              Vapes
            </Link>
            <Link to="/tobacco" className="text-light hover:text-primary transition-colors">
              Tobacco
            </Link>
            <Link to="/accessories" className="text-light hover:text-primary transition-colors">
              Accessories
            </Link>
          </nav>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="hidden lg:flex relative w-full max-w-xs ml-4">
            <input
              type="text"
              placeholder="Search products..."
              className="w-full rounded-lg border border-gray-600 bg-dark-card py-2 px-4 text-sm text-light focus:outline-none focus:ring-2 focus:ring-primary"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>
          </form>

          {/* Cart and Account */}
          <div className="hidden lg:flex items-center space-x-4 ml-4">
            <Link to="/cart" className="relative p-2 hover:text-primary transition-colors">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-xs flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>
            
            {/* User Menu */}
            {user ? (
              <div className="relative user-menu-container">
                <button 
                  onClick={toggleUserMenu}
                  className="flex items-center p-2 hover:text-primary transition-colors"
                >
                  {getUserAvatar() ? (
                    <img 
                      src={getUserAvatar()} 
                      alt="Profile" 
                      className="h-8 w-8 rounded-full object-cover border border-gray-600"
                    />
                  ) : (
                    <div className="flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      <span className="ml-2 text-sm font-medium">{getUserDisplayName()}</span>
                    </div>
                  )}
                </button>
                
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-dark-card rounded-md shadow-lg py-1 z-10 border border-gray-600">
                    {user.app_metadata?.provider === 'google' && (
                      <div className="px-4 py-2 border-b border-gray-600">
                        <p className="text-xs text-gray-400">Signed in with Google</p>
                        <p className="text-sm font-medium truncate">{user.email}</p>
                      </div>
                    )}
                    <Link 
                      to="/profile" 
                      className="block px-4 py-2 text-sm text-gray-300 hover:bg-dark-hover"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      Your Profile
                    </Link>
                    <Link 
                      to="/profile?tab=orders" 
                      className="block px-4 py-2 text-sm text-gray-300 hover:bg-dark-hover"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      Your Orders
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-dark-hover"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="p-2 hover:text-primary transition-colors">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden mt-2 py-3 border-t border-gray-800 text-white fixed top-[72px] left-0 right-0 bg-black z-50 max-h-[calc(100vh-72px)] overflow-y-auto">
            <div className="container mx-auto px-4">
              <nav className="flex flex-col">
                <Link 
                  to="/hookahs" 
                  className="text-white hover:text-primary transition-colors py-2"
                  onClick={toggleMenu}
                >
                  Hookahs
                </Link>
                <Link 
                  to="/vapes" 
                  className="text-white hover:text-primary transition-colors py-2"
                  onClick={toggleMenu}
                >
                  Vapes
                </Link>
                <Link 
                  to="/tobacco" 
                  className="text-white hover:text-primary transition-colors py-2"
                  onClick={toggleMenu}
                >
                  Tobacco
                </Link>
                <Link 
                  to="/accessories" 
                  className="text-white hover:text-primary transition-colors py-2"
                  onClick={toggleMenu}
                >
                  Accessories
                </Link>
              </nav>

              <form onSubmit={handleSearch} className="mt-4 relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  className="w-full rounded-lg border border-gray-700 bg-gray-900 py-2 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button
                  type="submit"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </button>
              </form>

              <div className="mt-4 flex flex-col">
                <Link 
                  to="/cart" 
                  className="text-white hover:text-primary transition-colors flex items-center py-2"
                  onClick={toggleMenu}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  <span className="text-white">Cart</span>
                  {totalItems > 0 && (
                    <span className="ml-2 h-5 w-5 rounded-full bg-primary text-xs flex items-center justify-center">
                      {totalItems}
                    </span>
                  )}
                </Link>
                
                {user ? (
                  <div className="flex flex-col mt-3 border-t border-gray-800 pt-3">
                    <div className="flex items-center text-white">
                      {getUserAvatar() ? (
                        <img 
                          src={getUserAvatar()} 
                          alt="Profile" 
                          className="h-6 w-6 rounded-full object-cover border border-gray-600 mr-2"
                        />
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 mr-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                      )}
                      <span className="text-white">{getUserDisplayName()}</span>
                    </div>
                    
                    <Link 
                      to="/profile" 
                      className="text-white hover:text-primary transition-colors pl-7 py-2"
                      onClick={toggleMenu}
                    >
                      Your Profile
                    </Link>
                    
                    <Link 
                      to="/profile?tab=orders" 
                      className="text-white hover:text-primary transition-colors pl-7 py-2"
                      onClick={toggleMenu}
                    >
                      Your Orders
                    </Link>
                    
                    <button
                      onClick={() => {
                        handleSignOut();
                        toggleMenu();
                      }}
                      className="text-left text-white hover:text-primary transition-colors pl-7 py-2"
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <Link 
                    to="/login" 
                    className="text-white hover:text-primary transition-colors flex items-center py-2 mt-2"
                    onClick={toggleMenu}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    <span>Sign In</span>
                  </Link>
                )}
              </div>
              
              <div className="mt-4 pb-4 border-t border-gray-800 pt-3">
                <button
                  onClick={toggleMenu}
                  className="w-full bg-primary hover:bg-primary/90 text-white py-2 rounded-md font-medium transition-colors"
                >
                  Close Menu
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
