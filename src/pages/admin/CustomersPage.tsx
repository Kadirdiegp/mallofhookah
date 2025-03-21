import { useState } from 'react';

// Mock customers data
const mockCustomers = [
  {
    id: 'cust-001',
    name: 'Emily Wilson',
    email: 'emily.wilson@example.com',
    joinDate: '2023-03-15',
    orders: 5,
    totalSpent: 345.99,
    status: 'Active',
    location: 'New York, NY'
  },
  {
    id: 'cust-002',
    name: 'Michael Brown',
    email: 'michael.brown@example.com',
    joinDate: '2023-02-20',
    orders: 3,
    totalSpent: 189.50,
    status: 'Active',
    location: 'Los Angeles, CA'
  },
  {
    id: 'cust-003',
    name: 'Sophia Lee',
    email: 'sophia.lee@example.com',
    joinDate: '2023-04-10',
    orders: 2,
    totalSpent: 210.75,
    status: 'Active',
    location: 'Chicago, IL'
  },
  {
    id: 'cust-004',
    name: 'Daniel Martinez',
    email: 'daniel.martinez@example.com',
    joinDate: '2023-01-05',
    orders: 7,
    totalSpent: 465.25,
    status: 'Active',
    location: 'Miami, FL'
  },
  {
    id: 'cust-005',
    name: 'Olivia Johnson',
    email: 'olivia.johnson@example.com',
    joinDate: '2023-05-12',
    orders: 1,
    totalSpent: 120.00,
    status: 'Active',
    location: 'Austin, TX'
  },
  {
    id: 'cust-006',
    name: 'James Wilson',
    email: 'james.wilson@example.com',
    joinDate: '2023-06-18',
    orders: 4,
    totalSpent: 310.97,
    status: 'Inactive',
    location: 'Seattle, WA'
  },
  {
    id: 'cust-007',
    name: 'Emma Davis',
    email: 'emma.davis@example.com',
    joinDate: '2023-02-28',
    orders: 6,
    totalSpent: 429.87,
    status: 'Active',
    location: 'Denver, CO'
  },
  {
    id: 'cust-008',
    name: 'Noah Thompson',
    email: 'noah.thompson@example.com',
    joinDate: '2023-07-09',
    orders: 2,
    totalSpent: 224.95,
    status: 'Active',
    location: 'Boston, MA'
  }
];

const CustomersPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('name');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  
  // Filter and sort customers
  const filteredCustomers = mockCustomers
    .filter(customer => {
      // By search query
      const matchesSearch = 
        customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.location.toLowerCase().includes(searchQuery.toLowerCase());
      
      // By status
      const matchesStatus = statusFilter === 'All' || customer.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'orders':
          return b.orders - a.orders;
        case 'spent':
          return b.totalSpent - a.totalSpent;
        case 'date':
          return new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime();
        default:
          return 0;
      }
    });
  
  // Get selected customer
  const selectedCustomer = selectedCustomerId 
    ? mockCustomers.find(customer => customer.id === selectedCustomerId)
    : null;
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };
  
  return (
    <div className="bg-light min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Customers Management</h1>
          <button className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-md transition-colors">
            Export Customers
          </button>
        </div>
        
        {/* Filter and Search Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                Search Customers
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  id="search"
                  className="pl-10 w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Search by name, email, or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                id="status"
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="sortBy" className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <select
                id="sortBy"
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="name">Name (A-Z)</option>
                <option value="orders">Most Orders</option>
                <option value="spent">Highest Spent</option>
                <option value="date">Newest Customers</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Customers Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Join Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Orders
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Spent
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCustomers.map((customer) => (
                  <tr 
                    key={customer.id} 
                    className={`hover:bg-gray-50 ${selectedCustomerId === customer.id ? 'bg-blue-50' : ''}`}
                    onClick={() => setSelectedCustomerId(selectedCustomerId === customer.id ? null : customer.id)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium">
                            {customer.name.charAt(0)}
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                          <div className="text-sm text-gray-500">{customer.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {customer.location}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(customer.joinDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {customer.orders}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${customer.totalSpent.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${customer.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {customer.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button 
                        className="text-primary hover:text-primary/80 mr-3"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCustomerId(customer.id);
                        }}
                      >
                        View
                      </button>
                      <button 
                        className="text-gray-600 hover:text-gray-900"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Logic to send email
                          console.log(`Send email to ${customer.email}`);
                        }}
                      >
                        Email
                      </button>
                    </td>
                  </tr>
                ))}
                
                {filteredCustomers.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="text-gray-500">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                        <h3 className="mt-2 text-lg font-medium text-gray-900">No customers found</h3>
                        <p className="mt-1 text-sm text-gray-500">
                          Try adjusting your search or filter to find what you're looking for.
                        </p>
                        <button
                          className="mt-4 text-primary hover:text-primary/80 font-medium"
                          onClick={() => {
                            setSearchQuery('');
                            setStatusFilter('All');
                          }}
                        >
                          Clear all filters
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredCustomers.length}</span> of{' '}
                  <span className="font-medium">{filteredCustomers.length}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                    <span className="sr-only">Previous</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                  <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-primary text-sm font-medium text-white">
                    1
                  </button>
                  <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                    <span className="sr-only">Next</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>
        
        {/* Customer Details (visible when a customer is selected) */}
        {selectedCustomer && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">Customer Profile: {selectedCustomer.name}</h2>
                <button 
                  className="text-gray-500 hover:text-gray-700"
                  onClick={() => setSelectedCustomerId(null)}
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="md:col-span-1">
                  <div className="flex flex-col items-center justify-center p-4">
                    <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-3xl font-medium mb-4">
                      {selectedCustomer.name.charAt(0)}
                    </div>
                    <h3 className="text-lg font-medium">{selectedCustomer.name}</h3>
                    <p className="text-gray-600">{selectedCustomer.email}</p>
                    <div className="mt-4">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${selectedCustomer.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {selectedCustomer.status}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="md:col-span-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Customer Information</h3>
                      <p className="text-gray-600">ID: {selectedCustomer.id}</p>
                      <p className="text-gray-600">Location: {selectedCustomer.location}</p>
                      <p className="text-gray-600">Joined: {formatDate(selectedCustomer.joinDate)}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Purchase Information</h3>
                      <p className="text-gray-600">Total Orders: {selectedCustomer.orders}</p>
                      <p className="text-gray-600">Total Spent: ${selectedCustomer.totalSpent.toFixed(2)}</p>
                      <p className="text-gray-600">Average Order Value: ${(selectedCustomer.totalSpent / selectedCustomer.orders).toFixed(2)}</p>
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Customer Actions</h3>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <button className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors">
                        View Order History
                      </button>
                      <button className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors">
                        Send Email
                      </button>
                      <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
                        View Notes
                      </button>
                    </div>
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

export default CustomersPage;
