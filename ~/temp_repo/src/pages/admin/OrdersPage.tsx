import { useState } from 'react';

// Mock orders data
const mockOrders = [
  {
    id: 'ORD-9876',
    customer: {
      name: 'Emily Wilson',
      email: 'emily.wilson@example.com',
      id: 'cust-001'
    },
    date: '2023-08-15T14:32:00Z',
    total: 145.99,
    status: 'Pending',
    items: [
      { id: 'prod001', name: 'Premium Hookah - Gold Edition', quantity: 1, price: 149.99 }
    ],
    payment: 'Credit Card',
    shipping: 'Standard'
  },
  {
    id: 'ORD-9875',
    customer: {
      name: 'Michael Brown',
      email: 'michael.brown@example.com',
      id: 'cust-002'
    },
    date: '2023-08-14T10:15:00Z',
    total: 89.50,
    status: 'Processing',
    items: [
      { id: 'prod002', name: 'Mint Flavor Shisha - 250g', quantity: 2, price: 24.99 },
      { id: 'prod003', name: 'Natural Coconut Hookah Coals - 1kg', quantity: 1, price: 19.99 }
    ],
    payment: 'PayPal',
    shipping: 'Express'
  },
  {
    id: 'ORD-9874',
    customer: {
      name: 'Sophia Lee',
      email: 'sophia.lee@example.com',
      id: 'cust-003'
    },
    date: '2023-08-14T09:22:00Z',
    total: 210.75,
    status: 'Shipped',
    items: [
      { id: 'prod009', name: 'Compact Hookah - Travel Size', quantity: 1, price: 89.99 },
      { id: 'prod002', name: 'Mint Flavor Shisha - 250g', quantity: 1, price: 24.99 },
      { id: 'prod007', name: 'Apple Flavor Shisha - 250g', quantity: 1, price: 24.99 },
      { id: 'prod005', name: 'Premium Silicone Hose', quantity: 1, price: 29.99 },
      { id: 'prod006', name: 'Hookah Cleaning Brush Set', quantity: 1, price: 14.99 },
      { id: 'prod008', name: 'Hookah Bowl - Clay', quantity: 1, price: 12.99 }
    ],
    payment: 'Credit Card',
    shipping: 'Standard'
  },
  {
    id: 'ORD-9873',
    customer: {
      name: 'Daniel Martinez',
      email: 'daniel.martinez@example.com',
      id: 'cust-004'
    },
    date: '2023-08-13T16:45:00Z',
    total: 65.25,
    status: 'Delivered',
    items: [
      { id: 'prod007', name: 'Apple Flavor Shisha - 250g', quantity: 1, price: 24.99 },
      { id: 'prod008', name: 'Hookah Bowl - Clay', quantity: 2, price: 12.99 }
    ],
    payment: 'Credit Card',
    shipping: 'Standard'
  },
  {
    id: 'ORD-9872',
    customer: {
      name: 'Olivia Johnson',
      email: 'olivia.johnson@example.com',
      id: 'cust-005'
    },
    date: '2023-08-12T11:30:00Z',
    total: 120.00,
    status: 'Delivered',
    items: [
      { id: 'prod005', name: 'Premium Silicone Hose', quantity: 2, price: 29.99 },
      { id: 'prod002', name: 'Mint Flavor Shisha - 250g', quantity: 1, price: 24.99 },
      { id: 'prod003', name: 'Natural Coconut Hookah Coals - 1kg', quantity: 1, price: 19.99 }
    ],
    payment: 'PayPal',
    shipping: 'Express'
  },
  {
    id: 'ORD-9871',
    customer: {
      name: 'James Wilson',
      email: 'james.wilson@example.com',
      id: 'cust-006'
    },
    date: '2023-08-11T14:20:00Z',
    total: 174.97,
    status: 'Delivered',
    items: [
      { id: 'prod010', name: 'Premium Hookah - Silver Edition', quantity: 1, price: 139.99 },
      { id: 'prod006', name: 'Hookah Cleaning Brush Set', quantity: 1, price: 14.99 },
      { id: 'prod008', name: 'Hookah Bowl - Clay', quantity: 1, price: 12.99 }
    ],
    payment: 'Credit Card',
    shipping: 'Standard'
  },
  {
    id: 'ORD-9870',
    customer: {
      name: 'Emma Davis',
      email: 'emma.davis@example.com',
      id: 'cust-007'
    },
    date: '2023-08-10T09:15:00Z',
    total: 79.97,
    status: 'Delivered',
    items: [
      { id: 'prod002', name: 'Mint Flavor Shisha - 250g', quantity: 1, price: 24.99 },
      { id: 'prod007', name: 'Apple Flavor Shisha - 250g', quantity: 1, price: 24.99 },
      { id: 'prod003', name: 'Natural Coconut Hookah Coals - 1kg', quantity: 1, price: 19.99 }
    ],
    payment: 'PayPal',
    shipping: 'Standard'
  },
  {
    id: 'ORD-9869',
    customer: {
      name: 'Noah Thompson',
      email: 'noah.thompson@example.com',
      id: 'cust-008'
    },
    date: '2023-08-09T15:45:00Z',
    total: 224.95,
    status: 'Delivered',
    items: [
      { id: 'prod001', name: 'Premium Hookah - Gold Edition', quantity: 1, price: 149.99 },
      { id: 'prod002', name: 'Mint Flavor Shisha - 250g', quantity: 2, price: 24.99 },
      { id: 'prod003', name: 'Natural Coconut Hookah Coals - 1kg', quantity: 1, price: 19.99 }
    ],
    payment: 'Credit Card',
    shipping: 'Express'
  }
];

const OrdersPage = () => {
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateSort, setDateSort] = useState('desc');
  
  // Filter and sort orders
  const filteredOrders = mockOrders
    .filter(order => {
      // By search query (order ID or customer name/email)
      const matchesSearch = 
        order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customer.email.toLowerCase().includes(searchQuery.toLowerCase());
      
      // By status
      const matchesStatus = statusFilter === 'All' || order.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return dateSort === 'desc' ? dateB - dateA : dateA - dateB;
    });
  
  // Get the selected order
  const selectedOrder = selectedOrderId 
    ? mockOrders.find(order => order.id === selectedOrderId) 
    : null;
  
  // Helper to get status color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  // Update order status
  const handleUpdateStatus = (orderId: string, newStatus: string) => {
    // In a real app, this would call an API to update the status
    console.log(`Updating order ${orderId} status to ${newStatus}`);
    setSelectedOrderId(null);
  };

  return (
    <div className="bg-light min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Orders Management</h1>
          <button className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-md transition-colors">
            Export Orders
          </button>
        </div>
        
        {/* Filter and Search Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                Search Orders
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
                  placeholder="Search by order ID or customer..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                Order Status
              </label>
              <select
                id="status"
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="All">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Processing">Processing</option>
                <option value="Shipped">Shipped</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="dateSort" className="block text-sm font-medium text-gray-700 mb-2">
                Date Sort
              </label>
              <select
                id="dateSort"
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                value={dateSort}
                onChange={(e) => setDateSort(e.target.value)}
              >
                <option value="desc">Newest First</option>
                <option value="asc">Oldest First</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Orders Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
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
                {filteredOrders.map((order) => (
                  <tr 
                    key={order.id} 
                    className={`hover:bg-gray-50 ${selectedOrderId === order.id ? 'bg-blue-50' : ''}`}
                    onClick={() => setSelectedOrderId(selectedOrderId === order.id ? null : order.id)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {order.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{order.customer.name}</div>
                      <div className="text-xs text-gray-500">{order.customer.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(order.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${order.total.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button 
                        className="text-primary hover:text-primary/80 mr-3"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedOrderId(order.id);
                        }}
                      >
                        View
                      </button>
                      <button 
                        className="text-gray-600 hover:text-gray-900"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Print or download invoice
                          console.log(`Print invoice for order ${order.id}`);
                        }}
                      >
                        Invoice
                      </button>
                    </td>
                  </tr>
                ))}
                
                {filteredOrders.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="text-gray-500">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                        <h3 className="mt-2 text-lg font-medium text-gray-900">No orders found</h3>
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
            <div className="flex-1 flex justify-between sm:hidden">
              <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                Previous
              </button>
              <button className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredOrders.length}</span> of{' '}
                  <span className="font-medium">{filteredOrders.length}</span> results
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
        
        {/* Order Details (visible when an order is selected) */}
        {selectedOrder && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">Order Details: {selectedOrder.id}</h2>
                <button 
                  className="text-gray-500 hover:text-gray-700"
                  onClick={() => setSelectedOrderId(null)}
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Customer Information</h3>
                  <p className="font-medium">{selectedOrder.customer.name}</p>
                  <p className="text-gray-600">{selectedOrder.customer.email}</p>
                  <p className="text-gray-600">Customer ID: {selectedOrder.customer.id}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Order Information</h3>
                  <p className="text-gray-600">Date: {formatDate(selectedOrder.date)}</p>
                  <p className="text-gray-600">Payment Method: {selectedOrder.payment}</p>
                  <p className="text-gray-600">Shipping Method: {selectedOrder.shipping}</p>
                  <div className="mt-2">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedOrder.status)}`}>
                      {selectedOrder.status}
                    </span>
                  </div>
                </div>
              </div>
              
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-4">Order Items</h3>
              <div className="overflow-x-auto mb-6">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quantity
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {selectedOrder.items.map((item, index) => (
                      <tr key={`${item.id}-${index}`}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{item.name}</div>
                          <div className="text-xs text-gray-500">ID: {item.id}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ${item.price.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.quantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${(item.price * item.quantity).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td colSpan={3} className="px-6 py-4 text-sm font-medium text-gray-900 text-right">
                        Subtotal:
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        ${selectedOrder.total.toFixed(2)}
                      </td>
                    </tr>
                    {/* You could add shipping, tax, etc. rows here */}
                    <tr>
                      <td colSpan={3} className="px-6 py-4 text-base font-bold text-gray-900 text-right">
                        Total:
                      </td>
                      <td className="px-6 py-4 text-base font-bold text-gray-900">
                        ${selectedOrder.total.toFixed(2)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 mt-6 pt-6 border-t border-gray-200">
                <div className="sm:flex-1">
                  <label htmlFor="updateStatus" className="block text-sm font-medium text-gray-700 mb-2">
                    Update Order Status
                  </label>
                  <div className="flex">
                    <select
                      id="updateStatus"
                      className="flex-1 p-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-primary"
                      defaultValue={selectedOrder.status}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                    <button
                      className="px-4 py-2 bg-primary text-white rounded-r-md hover:bg-primary/90 transition-colors"
                      onClick={() => {
                        const select = document.getElementById('updateStatus') as HTMLSelectElement;
                        handleUpdateStatus(selectedOrder.id, select.value);
                      }}
                    >
                      Update
                    </button>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <button className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors">
                    Print Invoice
                  </button>
                  <button className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition-colors">
                    Send Notification
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
