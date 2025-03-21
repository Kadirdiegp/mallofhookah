import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
  };
}

// Mock user data - would come from authentication context in a real app
const mockUserProfile: UserProfile = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  phone: '(555) 123-4567',
  address: {
    street: '123 Main St',
    city: 'Anytown',
    state: 'CA',
    postalCode: '12345',
    country: 'USA'
  }
};

const mockOrders = [
  {
    id: 'ORD-1234',
    date: '2023-07-15',
    total: 129.99,
    status: 'Delivered',
    items: 3
  },
  {
    id: 'ORD-5678',
    date: '2023-06-20',
    total: 89.95,
    status: 'Delivered',
    items: 2
  },
  {
    id: 'ORD-9012',
    date: '2023-05-10',
    total: 54.50,
    status: 'Delivered',
    items: 1
  }
];

const ProfilePage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [profile, setProfile] = useState<UserProfile>(mockUserProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // For password change
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

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
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In a real app, you would save the profile to the backend here
    setIsEditing(false);
    setIsSaving(false);
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');
    
    // Basic validation
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }
    
    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters long');
      return;
    }
    
    setIsSaving(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In a real app, you would verify the current password and update it
    setPasswordSuccess('Your password has been updated successfully');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setIsSaving(false);
  };

  const handleLogout = () => {
    // In a real app, you would clear the authentication state here
    navigate('/login');
  };

  return (
    <div className="bg-light min-h-screen py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">My Account</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-12 w-12 bg-primary text-white rounded-full flex items-center justify-center text-xl font-bold">
                    {profile.firstName.charAt(0)}{profile.lastName.charAt(0)}
                  </div>
                  <div className="ml-4">
                    <h2 className="text-lg font-semibold">{profile.firstName} {profile.lastName}</h2>
                    <p className="text-gray-600 text-sm">{profile.email}</p>
                  </div>
                </div>
              </div>
              
              <nav className="p-4">
                <ul className="space-y-2">
                  <li>
                    <button
                      className={`w-full text-left px-4 py-2 rounded-md transition-colors ${
                        activeTab === 'profile' ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-gray-100'
                      }`}
                      onClick={() => setActiveTab('profile')}
                    >
                      Profile Information
                    </button>
                  </li>
                  <li>
                    <button
                      className={`w-full text-left px-4 py-2 rounded-md transition-colors ${
                        activeTab === 'orders' ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-gray-100'
                      }`}
                      onClick={() => setActiveTab('orders')}
                    >
                      Order History
                    </button>
                  </li>
                  <li>
                    <button
                      className={`w-full text-left px-4 py-2 rounded-md transition-colors ${
                        activeTab === 'security' ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-gray-100'
                      }`}
                      onClick={() => setActiveTab('security')}
                    >
                      Security
                    </button>
                  </li>
                  <li>
                    <button
                      className="w-full text-left px-4 py-2 rounded-md hover:bg-gray-100 transition-colors text-red-600 hover:text-red-700"
                      onClick={handleLogout}
                    >
                      Logout
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-md p-6">
              {activeTab === 'profile' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold">Profile Information</h2>
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
                          onClick={() => {
                            setIsEditing(false);
                            setProfile(mockUserProfile); // Reset to original data
                          }}
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="firstName" className="block text-gray-700 font-medium mb-2">
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
                          <p className="p-3 bg-gray-50 rounded-md">{profile.firstName}</p>
                        )}
                      </div>
                      <div>
                        <label htmlFor="lastName" className="block text-gray-700 font-medium mb-2">
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
                          <p className="p-3 bg-gray-50 rounded-md">{profile.lastName}</p>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
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
                        />
                      ) : (
                        <p className="p-3 bg-gray-50 rounded-md">{profile.email}</p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="phone" className="block text-gray-700 font-medium mb-2">
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
                        <p className="p-3 bg-gray-50 rounded-md">{profile.phone}</p>
                      )}
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-lg mb-4">Address Information</h3>
                      
                      <div className="space-y-4">
                        <div>
                          <label htmlFor="street" className="block text-gray-700 font-medium mb-2">
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
                            <p className="p-3 bg-gray-50 rounded-md">{profile.address.street}</p>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="city" className="block text-gray-700 font-medium mb-2">
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
                              <p className="p-3 bg-gray-50 rounded-md">{profile.address.city}</p>
                            )}
                          </div>
                          <div>
                            <label htmlFor="state" className="block text-gray-700 font-medium mb-2">
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
                              <p className="p-3 bg-gray-50 rounded-md">{profile.address.state}</p>
                            )}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="postalCode" className="block text-gray-700 font-medium mb-2">
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
                              <p className="p-3 bg-gray-50 rounded-md">{profile.address.postalCode}</p>
                            )}
                          </div>
                          <div>
                            <label htmlFor="country" className="block text-gray-700 font-medium mb-2">
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
                              <p className="p-3 bg-gray-50 rounded-md">{profile.address.country}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'orders' && (
                <div>
                  <h2 className="text-xl font-bold mb-6">Order History</h2>
                  
                  {mockOrders.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="py-3 px-4 font-semibold text-gray-700">Order ID</th>
                            <th className="py-3 px-4 font-semibold text-gray-700">Date</th>
                            <th className="py-3 px-4 font-semibold text-gray-700">Items</th>
                            <th className="py-3 px-4 font-semibold text-gray-700">Total</th>
                            <th className="py-3 px-4 font-semibold text-gray-700">Status</th>
                            <th className="py-3 px-4 font-semibold text-gray-700">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {mockOrders.map(order => (
                            <tr key={order.id} className="border-b border-gray-200 hover:bg-gray-50">
                              <td className="py-4 px-4 font-medium">{order.id}</td>
                              <td className="py-4 px-4">{new Date(order.date).toLocaleDateString()}</td>
                              <td className="py-4 px-4">{order.items}</td>
                              <td className="py-4 px-4">${order.total.toFixed(2)}</td>
                              <td className="py-4 px-4">
                                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                                  {order.status}
                                </span>
                              </td>
                              <td className="py-4 px-4">
                                <button className="text-primary hover:text-primary/80 font-medium text-sm">
                                  View Details
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500 mb-4">You have no orders yet.</p>
                      <button
                        className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-md font-medium transition-colors"
                        onClick={() => navigate('/products')}
                      >
                        Browse Products
                      </button>
                    </div>
                  )}
                </div>
              )}
              
              {activeTab === 'security' && (
                <div>
                  <h2 className="text-xl font-bold mb-6">Security Settings</h2>
                  
                  <div className="max-w-md">
                    <h3 className="font-semibold text-lg mb-4">Change Password</h3>
                    
                    {passwordSuccess && (
                      <div className="mb-4 p-3 bg-green-100 border border-green-200 text-green-700 rounded-md">
                        {passwordSuccess}
                      </div>
                    )}
                    
                    {passwordError && (
                      <div className="mb-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded-md">
                        {passwordError}
                      </div>
                    )}
                    
                    <form className="space-y-4" onSubmit={handlePasswordChange}>
                      <div>
                        <label htmlFor="currentPassword" className="block text-gray-700 font-medium mb-2">
                          Current Password
                        </label>
                        <input
                          type="password"
                          id="currentPassword"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          required
                          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="newPassword" className="block text-gray-700 font-medium mb-2">
                          New Password
                        </label>
                        <input
                          type="password"
                          id="newPassword"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          required
                          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                          minLength={8}
                        />
                        <p className="mt-1 text-sm text-gray-500">
                          Password must be at least 8 characters long
                        </p>
                      </div>
                      
                      <div>
                        <label htmlFor="confirmPassword" className="block text-gray-700 font-medium mb-2">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          id="confirmPassword"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      
                      <div>
                        <button
                          type="submit"
                          disabled={isSaving}
                          className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-md font-medium transition-colors disabled:opacity-50"
                        >
                          {isSaving ? 'Updating...' : 'Update Password'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
