import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../services/supabase';

// Typen für Bestellungen und Benutzer
interface Order {
  id: string;
  date: string;
  total: number;
  status: string;
  items: number;
}

interface User {
  id: string;
  email?: string;
}

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    apt?: string; 
  };
}

// Data types for JSON fields
interface OrderDataJson {
  items?: Array<{productId: string; price: number; quantity: number}>;
  total?: number;
  subtotal?: number;
  paymentMethod?: string;
  deliveryMethod?: string;
  orderStatus?: string;
}

// Funktion zum Laden der Bestellungen aus der Datenbank
const loadOrdersFromDatabase = async (
  user: User | null, 
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>, 
  setLoadingOrders: React.Dispatch<React.SetStateAction<boolean>>
) => {
  if (!user) return;
  
  setLoadingOrders(true);
  try {
    // Bestellungen nur aus der reseller_orders Tabelle laden
    const { data: resellerOrdersData, error: resellerOrdersError } = await supabase
      .from('reseller_orders')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
      
    if (resellerOrdersError) {
      console.error('Fehler beim Laden der Bestellungen aus "reseller_orders":', resellerOrdersError);
      setOrders([]);
      setLoadingOrders(false);
      return;
    }

    if (!resellerOrdersData || resellerOrdersData.length === 0) {
      setOrders([]);
      setLoadingOrders(false);
      return;
    }
    
    // Umwandlung der Bestelldaten in das Format, das das UI erwartet
    const formattedOrders = resellerOrdersData?.map(order => {
      // Versuche, den Gesamtbetrag aus verschiedenen Quellen zu bekommen
      let totalAmount = 0;
      
      if (order.total_amount) {
        // Direkt aus dem total_amount Feld
        totalAmount = Number(order.total_amount);
      } else if (order.subtotal) {
        // Aus dem subtotal Feld
        totalAmount = Number(order.subtotal);
      } else if (order.data && typeof order.data === 'object') {
        // Aus dem JSON data Feld
        const data = order.data as OrderDataJson;
        if (data.total) {
          totalAmount = Number(data.total);
        } else if (data.subtotal) {
          totalAmount = Number(data.subtotal);
        }
      }
      
      return {
        id: order.id,
        date: order.created_at,
        total: totalAmount,
        status: order.status || 'Processing',
        items: order.data && typeof order.data === 'object' 
          ? ((order.data as OrderDataJson).items || []).length
          : 1
      };
    }) || [];
    
    setOrders(formattedOrders.length > 0 ? formattedOrders : []);
  } catch (err) {
    console.error('Unerwarteter Fehler beim Laden der Bestellungen:', err);
    setOrders([]);
  } finally {
    setLoadingOrders(false);
  }
};

const ProfilePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading, signOut } = useAuth();
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      navigate('/login', { state: { from: location.pathname } });
    }
  }, [user, loading, navigate, location]);

  // Get tab from URL query params
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab && ['profile', 'orders', 'security'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [location]);

  const [activeTab, setActiveTab] = useState('profile');
  
  // Initialize profile with user data from auth
  const [profile, setProfile] = useState<UserProfile>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: '',
      apt: '', 
    }
  });
  
  const [originalProfile, setOriginalProfile] = useState<UserProfile>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: '',
      apt: '', 
    }
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // For password change
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  // Load orders data
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  
  useEffect(() => {
    loadOrdersFromDatabase(user, setOrders, setLoadingOrders);
  }, [user]);

  // Populate profile from user data when available
  useEffect(() => {
    if (user) {
      // Default state for new values
      const defaultState = {
        firstName: '',
        lastName: '',
        email: user.email || '',
        phone: '',
        address: {
          street: '',
          city: '',
          state: '',
          postalCode: '',
          country: '',
          apt: '', 
        }
      };
      
      // Extract user metadata if available
      const metadata = user.user_metadata || {};
      
      // Split full name into first and last name if available
      let firstName = '';
      let lastName = '';
      
      if (metadata.full_name) {
        const nameParts = metadata.full_name.split(' ');
        firstName = nameParts[0] || '';
        lastName = nameParts.slice(1).join(' ') || '';
      } else if (metadata.name) {
        // Google OAuth might provide name directly
        const nameParts = metadata.name.split(' ');
        firstName = nameParts[0] || '';
        lastName = nameParts.slice(1).join(' ') || '';
      }
      
      // If we have no name information yet, try to use email
      if (!firstName && !lastName && user.email) {
        firstName = user.email.split('@')[0] || '';
      }
      
      // Update profile state with user data
      setProfile({
        ...defaultState,
        firstName,
        lastName,
        email: user.email || '',
        phone: metadata.phone || '',
        address: {
          street: metadata.address_street || '',
          city: metadata.address_city || '',
          state: metadata.address_state || '',
          postalCode: metadata.address_postal_code || '',
          country: metadata.address_country || '',
          apt: metadata.address_apt || '', 
        }
      });
      
      // Store original profile for reset functionality
      setOriginalProfile({
        ...defaultState,
        firstName,
        lastName,
        email: user.email || '',
        phone: metadata.phone || '',
        address: {
          street: metadata.address_street || '',
          city: metadata.address_city || '',
          state: metadata.address_state || '',
          postalCode: metadata.address_postal_code || '',
          country: metadata.address_country || '',
          apt: metadata.address_apt || '', 
        }
      });
    }
  }, [user]);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setProfile(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof UserProfile] as object,
          [child]: value
        }
      }));
    } else {
      setProfile(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    
    try {
      // In a real app, you would save the profile to the backend here
      // For now, we'll just simulate an API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update the user's metadata if using Supabase
      if (user && supabase) {
        // 1. First update user metadata
        const { error: userError } = await supabase.auth.updateUser({
          data: {
            full_name: `${profile.firstName} ${profile.lastName}`,
            phone: profile.phone,
            // Save all address fields as individual properties in metadata
            address_street: profile.address.street,
            address_city: profile.address.city,
            address_state: profile.address.state,
            address_postal_code: profile.address.postalCode,
            address_country: profile.address.country,
            address_apt: profile.address.apt, 
          }
        });
        
        if (userError) {
          throw userError;
        }
      }
      
      setIsEditing(false);
      
      // Show success message
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');
    
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    
    setIsSaving(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In a real app, you would change the password with your auth provider here
    
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordSuccess('Password has been changed successfully');
    setIsSaving(false);
  };

  const handleLogout = () => {
    signOut();
    navigate('/login');
  };

  const handleCancelEdit = () => {
    setProfile(originalProfile);
    setIsEditing(false);
  };

  // If still loading, show a loading indicator
  if (loading || !user) {
    return (
      <div className="bg-black text-white min-h-screen py-12">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black text-white min-h-screen py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8 text-white">Your Account</h1>
        
        {/* Profile Tabs */}
        <div className="mb-8 border-b border-gray-800">
          <div className="flex flex-wrap -mb-px">
            <button
              className={`mr-8 py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'profile'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
              onClick={() => {
                setActiveTab('profile');
                navigate('/profile');
              }}
            >
              Profile
            </button>
            <button
              className={`mr-8 py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'orders'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
              onClick={() => {
                setActiveTab('orders');
                navigate('/profile?tab=orders');
              }}
            >
              Orders
            </button>
            <button
              className={`mr-8 py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'security'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
              onClick={() => {
                setActiveTab('security');
                navigate('/profile?tab=security');
              }}
            >
              Security
            </button>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="bg-black rounded-lg shadow-md border border-gray-800 p-6">
          {activeTab === 'profile' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Profile Information</h2>
                {!isEditing ? (
                  <button
                    className="text-primary hover:text-primary/80 font-medium"
                    onClick={() => setIsEditing(true)}
                  >
                    Edit Profile
                  </button>
                ) : (
                  <div className="flex space-x-4">
                    <button
                      className="text-gray-600 hover:text-gray-800 font-medium"
                      onClick={handleCancelEdit}
                      disabled={isSaving}
                    >
                      Cancel
                    </button>
                    <button
                      className="text-primary hover:text-primary/80 font-medium disabled:opacity-50"
                      onClick={handleSaveProfile}
                      disabled={isSaving}
                    >
                      {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                )}
              </div>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-gray-700 font-medium mb-2 text-white">
                      First Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={profile.firstName}
                        onChange={handleProfileChange}
                        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    ) : (
                      <p className="p-3 bg-gray-50 rounded-md text-gray-700">{profile.firstName}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-gray-700 font-medium mb-2 text-white">
                      Last Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={profile.lastName}
                        onChange={handleProfileChange}
                        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    ) : (
                      <p className="p-3 bg-gray-50 rounded-md text-gray-700">{profile.lastName}</p>
                    )}
                  </div>
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-gray-700 font-medium mb-2 text-white">
                    Email Address
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={profile.email}
                      onChange={handleProfileChange}
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      disabled={user?.app_metadata?.provider === 'google'} 
                    />
                  ) : (
                    <p className="p-3 bg-gray-50 rounded-md text-gray-700">{profile.email}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="phone" className="block text-gray-700 font-medium mb-2 text-white">
                    Phone Number
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={profile.phone}
                      onChange={handleProfileChange}
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  ) : (
                    <p className="p-3 bg-gray-50 rounded-md text-gray-700">{profile.phone || 'Not provided'}</p>
                  )}
                </div>
                
                <div>
                  <h3 className="font-semibold text-lg mb-4 text-white">Address Information</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="street" className="block text-gray-700 font-medium mb-2 text-white">
                        Street Address
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          id="street"
                          name="address.street"
                          value={profile.address.street}
                          onChange={handleProfileChange}
                          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      ) : (
                        <p className="p-3 bg-gray-50 rounded-md text-gray-700">
                          {profile.address.street || 'Not provided'}
                        </p>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="city" className="block text-gray-700 font-medium mb-2 text-white">
                          City
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            id="city"
                            name="address.city"
                            value={profile.address.city}
                            onChange={handleProfileChange}
                            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                        ) : (
                          <p className="p-3 bg-gray-50 rounded-md text-gray-700">
                            {profile.address.city || 'Not provided'}
                          </p>
                        )}
                      </div>
                      <div>
                        <label htmlFor="state" className="block text-gray-700 font-medium mb-2 text-white">
                          State
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            id="state"
                            name="address.state"
                            value={profile.address.state}
                            onChange={handleProfileChange}
                            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                        ) : (
                          <p className="p-3 bg-gray-50 rounded-md text-gray-700">
                            {profile.address.state || 'Not provided'}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="postalCode" className="block text-gray-700 font-medium mb-2 text-white">
                          Postal Code
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            id="postalCode"
                            name="address.postalCode"
                            value={profile.address.postalCode}
                            onChange={handleProfileChange}
                            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                        ) : (
                          <p className="p-3 bg-gray-50 rounded-md text-gray-700">
                            {profile.address.postalCode || 'Not provided'}
                          </p>
                        )}
                      </div>
                      <div>
                        <label htmlFor="country" className="block text-gray-700 font-medium mb-2 text-white">
                          Country
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            id="country"
                            name="address.country"
                            value={profile.address.country}
                            onChange={handleProfileChange}
                            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                        ) : (
                          <p className="p-3 bg-gray-50 rounded-md text-gray-700">
                            {profile.address.country || 'Not provided'}
                          </p>
                        )}
                      </div>
                    </div>
                    <div>
                      <label htmlFor="apt" className="block text-gray-700 font-medium mb-2 text-white">
                        Apartment
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          id="apt"
                          name="address.apt"
                          value={profile.address.apt}
                          onChange={handleProfileChange}
                          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      ) : (
                        <p className="p-3 bg-gray-50 rounded-md text-gray-700">
                          {profile.address.apt || 'Not provided'}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'orders' && (
            <div>
              <h2 className="text-xl font-bold mb-6 text-white">Order History</h2>
              
              {loadingOrders ? (
                <div className="text-center py-8">
                  <p className="text-gray-400 mb-4">Loading orders...</p>
                </div>
              ) : (
                orders.length > 0 ? (
                  <>
                    {/* Desktop-Ansicht - nur auf größeren Bildschirmen anzeigen */}
                    <div className="hidden md:block overflow-x-auto -mx-6">
                      <table className="min-w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-gray-700">
                            <th className="py-3 px-4 font-semibold text-white whitespace-nowrap">Order ID</th>
                            <th className="py-3 px-4 font-semibold text-white whitespace-nowrap">Date</th>
                            <th className="py-3 px-4 font-semibold text-white whitespace-nowrap">Items</th>
                            <th className="py-3 px-4 font-semibold text-white whitespace-nowrap">Total</th>
                            <th className="py-3 px-4 font-semibold text-white whitespace-nowrap">Status</th>
                            <th className="py-3 px-4 font-semibold text-white whitespace-nowrap">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {orders.map(order => (
                            <tr key={order.id} className="border-b border-gray-700 hover:bg-gray-800">
                              <td className="py-4 px-4 font-medium text-gray-400 max-w-[120px] truncate">{order.id}</td>
                              <td className="py-4 px-4 text-gray-400 whitespace-nowrap">{new Date(order.date).toLocaleDateString()}</td>
                              <td className="py-4 px-4 text-gray-400 text-center">{order.items}</td>
                              <td className="py-4 px-4 text-gray-400 whitespace-nowrap">${order.total.toFixed(2)}</td>
                              <td className="py-4 px-4">
                                <span className="px-2 py-1 bg-green-900 text-green-400 rounded-full text-xs font-medium whitespace-nowrap">
                                  {order.status}
                                </span>
                              </td>
                              <td className="py-4 px-4">
                                <button 
                                  className="text-primary hover:text-primary/80 font-medium text-sm whitespace-nowrap"
                                  onClick={() => {
                                    // Navigate with state to ensure order ID is properly passed
                                    console.log("Navigating to order details for ID:", order.id);
                                    navigate(`/order-success/${order.id}`);
                                  }}
                                >
                                  View Details
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile-Ansicht - nur auf kleinen Bildschirmen anzeigen */}
                    <div className="md:hidden space-y-4">
                      {orders.map(order => (
                        <div key={order.id} className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <p className="text-xs text-gray-400 mb-1">Order Date</p>
                              <p className="text-sm text-white">{new Date(order.date).toLocaleDateString()}</p>
                            </div>
                            <span className="px-2 py-1 bg-green-900 text-green-400 rounded-full text-xs font-medium">
                              {order.status}
                            </span>
                          </div>
                          
                          <div className="mb-3">
                            <p className="text-xs text-gray-400 mb-1">Order ID</p>
                            <p className="text-sm text-white break-all">{order.id}</p>
                          </div>
                          
                          <div className="flex justify-between mb-4">
                            <div>
                              <p className="text-xs text-gray-400 mb-1">Items</p>
                              <p className="text-sm text-white">{order.items}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-400 mb-1">Total</p>
                              <p className="text-sm text-white font-medium">${order.total.toFixed(2)}</p>
                            </div>
                          </div>
                          
                          <div className="flex justify-between mt-3">
                            <span className="text-xs text-gray-500">
                              {new Date(order.date).toLocaleDateString()}
                            </span>
                            <button 
                              className="text-primary hover:text-primary/80 text-sm font-medium"
                              onClick={() => {
                                // Navigate with state to ensure order ID is properly passed
                                console.log("Navigating to order details for ID:", order.id);
                                navigate(`/order-success/${order.id}`);
                              }}
                            >
                              View Details
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-400 mb-4">You have no orders yet.</p>
                    <button
                      className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-md font-medium transition-colors"
                      onClick={() => navigate('/products')}
                    >
                      Browse Products
                    </button>
                  </div>
                )
              )}
            </div>
          )}
          
          {activeTab === 'security' && (
            <div>
              <h2 className="text-xl font-bold mb-6 text-white">Security Settings</h2>
              
              {/* Skip password change for OAuth users */}
              {user?.app_metadata?.provider === 'google' ? (
                <>
                  <div className="p-4 bg-gray-800 border border-gray-700 text-blue-400 rounded-md mb-6 break-words">
                    <p className="text-sm sm:text-base">You're signed in with Google. Password management is handled through your Google account.</p>
                  </div>

                  <div className="mb-6">
                    <h4 className="font-medium mb-2 text-white">Connected Accounts</h4>
                    <div className="flex items-center p-3 border border-gray-700 rounded-md bg-gray-800 flex-wrap gap-2">
                      <svg className="h-6 w-6 text-blue-500 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        <path d="M1 1h22v22H1z" fill="none" />
                      </svg>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium text-white truncate">Google</div>
                        <div className="text-xs text-gray-400 truncate max-w-[200px]">{user.email}</div>
                      </div>
                      <div className="px-2 py-1 bg-green-900 text-green-400 rounded text-xs flex-shrink-0">
                        Connected
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div>
                  <h3 className="font-semibold text-lg mb-4 text-white">Change Password</h3>
                  
                  {passwordSuccess && (
                    <div className="mb-4 p-3 bg-green-900 border border-green-700 text-green-400 rounded-md">
                      {passwordSuccess}
                    </div>
                  )}
                  
                  {passwordError && (
                    <div className="mb-4 p-3 bg-red-900 border border-red-700 text-red-400 rounded-md">
                      {passwordError}
                    </div>
                  )}
                  
                  <form className="space-y-4" onSubmit={handlePasswordChange}>
                    <div>
                      <label htmlFor="currentPassword" className="block text-white font-medium mb-2">
                        Current Password
                      </label>
                      <input
                        type="password"
                        id="currentPassword"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        required
                        className="w-full p-3 border border-gray-700 bg-gray-800 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="newPassword" className="block text-white font-medium mb-2">
                        New Password
                      </label>
                      <input
                        type="password"
                        id="newPassword"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        className="w-full p-3 border border-gray-700 bg-gray-800 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        minLength={8}
                      />
                      <p className="mt-1 text-sm text-gray-400">
                        Password must be at least 8 characters long
                      </p>
                    </div>
                    
                    <div>
                      <label htmlFor="confirmPassword" className="block text-white font-medium mb-2">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        id="confirmPassword"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="w-full p-3 border border-gray-700 bg-gray-800 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    
                    <div>
                      <button
                        type="submit"
                        disabled={isSaving}
                        className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-md font-medium transition-colors disabled:opacity-50"
                      >
                        {isSaving ? 'Updating...' : 'Update Password'}
                      </button>
                    </div>
                  </form>
                </div>
              )}
              
              <div className="mt-8 pt-6 border-t border-gray-700">
                <h3 className="font-semibold text-lg mb-4 text-white">Account Security</h3>
                
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium mb-2 text-white">Delete Account</h4>
                    <p className="text-gray-400 text-sm mb-4">
                      Once you delete your account, there is no going back. This action cannot be undone.
                    </p>
                    <button
                      className="w-full sm:w-auto px-4 py-2 bg-red-900 text-red-400 rounded-md hover:bg-red-800 transition-colors"
                      onClick={() => {
                        // In a real app, you would show a confirmation dialog here
                        alert('This feature is not implemented in this demo.');
                      }}
                    >
                      Delete Account
                    </button>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2 text-white">Logout</h4>
                    <p className="text-gray-400 text-sm mb-4">
                      Sign out from your current session.
                    </p>
                    <button
                      className="w-full sm:w-auto px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition-colors"
                      onClick={handleLogout}
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
