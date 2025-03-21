import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// Mock data for the dashboard
const mockSummary = {
  totalSales: 12875.45,
  totalOrders: 156,
  totalCustomers: 89,
  productsInStock: 132,
  lowStockProducts: 8,
  pendingOrders: 12
};

const mockRecentOrders = [
  { id: 'ORD-9876', customer: 'Emily Wilson', date: '2023-08-15', total: 145.99, status: 'Pending' },
  { id: 'ORD-9875', customer: 'Michael Brown', date: '2023-08-14', total: 89.50, status: 'Processing' },
  { id: 'ORD-9874', customer: 'Sophia Lee', date: '2023-08-14', total: 210.75, status: 'Shipped' },
  { id: 'ORD-9873', customer: 'Daniel Martinez', date: '2023-08-13', total: 65.25, status: 'Delivered' },
  { id: 'ORD-9872', customer: 'Olivia Johnson', date: '2023-08-12', total: 120.00, status: 'Delivered' }
];

const mockSalesData = [
  { date: 'Aug 9', sales: 780 },
  { date: 'Aug 10', sales: 890 },
  { date: 'Aug 11', sales: 1200 },
  { date: 'Aug 12', sales: 1500 },
  { date: 'Aug 13', sales: 1100 },
  { date: 'Aug 14', sales: 1300 },
  { date: 'Aug 15', sales: 1450 }
];

const DashboardPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7days');
  
  // Simulate loading data
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
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

  return (
    <div className="bg-light min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <div className="flex items-center space-x-4">
            <select
              className="bg-white border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </select>
            <button className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-md transition-colors">
              Generate Report
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md h-36">
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="h-10 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-gray-500 text-sm font-medium mb-2">Total Sales</h3>
                <div className="flex justify-between items-end">
                  <p className="text-2xl font-bold">${mockSummary.totalSales.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  <span className="text-green-600 text-sm font-medium">+12.5%</span>
                </div>
                <p className="text-gray-600 text-sm mt-2">Compared to previous period</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-gray-500 text-sm font-medium mb-2">Total Orders</h3>
                <div className="flex justify-between items-end">
                  <p className="text-2xl font-bold">{mockSummary.totalOrders}</p>
                  <span className="text-green-600 text-sm font-medium">+8.2%</span>
                </div>
                <p className="text-gray-600 text-sm mt-2">Compared to previous period</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-gray-500 text-sm font-medium mb-2">Total Customers</h3>
                <div className="flex justify-between items-end">
                  <p className="text-2xl font-bold">{mockSummary.totalCustomers}</p>
                  <span className="text-green-600 text-sm font-medium">+5.1%</span>
                </div>
                <p className="text-gray-600 text-sm mt-2">Compared to previous period</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-gray-500 text-sm font-medium mb-2">Products in Stock</h3>
                <div className="flex justify-between items-end">
                  <p className="text-2xl font-bold">{mockSummary.productsInStock}</p>
                  <Link to="/admin/products" className="text-primary text-sm font-medium">View all</Link>
                </div>
                <p className="text-gray-600 text-sm mt-2">{mockSummary.lowStockProducts} products low on stock</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-gray-500 text-sm font-medium mb-2">Pending Orders</h3>
                <div className="flex justify-between items-end">
                  <p className="text-2xl font-bold">{mockSummary.pendingOrders}</p>
                  <Link to="/admin/orders" className="text-primary text-sm font-medium">View all</Link>
                </div>
                <p className="text-gray-600 text-sm mt-2">Needs attention</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-gray-500 text-sm font-medium mb-2">Average Order Value</h3>
                <div className="flex justify-between items-end">
                  <p className="text-2xl font-bold">
                    ${(mockSummary.totalSales / mockSummary.totalOrders).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <span className="text-red-600 text-sm font-medium">-2.3%</span>
                </div>
                <p className="text-gray-600 text-sm mt-2">Compared to previous period</p>
              </div>
            </div>
            
            {/* Sales Chart */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold">Sales Overview</h2>
                <div className="flex space-x-2">
                  <button className="px-3 py-1 text-sm bg-primary/10 text-primary rounded-md">Daily</button>
                  <button className="px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded-md">Weekly</button>
                  <button className="px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded-md">Monthly</button>
                </div>
              </div>
              
              <div className="h-80 flex items-end space-x-6 pb-6 mt-6">
                {mockSalesData.map((day, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div 
                      className="w-full bg-primary/80 rounded-t-md hover:bg-primary transition-colors cursor-pointer relative group"
                      style={{ height: `${(day.sales / 1500) * 100}%` }}
                    >
                      <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                        ${day.sales}
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">{day.date}</p>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Recent Orders Table */}
            <div className="bg-white rounded-lg shadow-md mb-8">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold">Recent Orders</h2>
                  <Link to="/admin/orders" className="text-primary hover:text-primary/80 text-sm font-medium">
                    View All Orders
                  </Link>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                      <th className="py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                      <th className="py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {mockRecentOrders.map(order => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="py-4 px-6 text-sm font-medium">{order.id}</td>
                        <td className="py-4 px-6 text-sm">{order.customer}</td>
                        <td className="py-4 px-6 text-sm">{new Date(order.date).toLocaleDateString()}</td>
                        <td className="py-4 px-6 text-sm">${order.total.toFixed(2)}</td>
                        <td className="py-4 px-6 text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-sm">
                          <button className="text-primary hover:text-primary/80 font-medium">View Details</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
                <div className="grid grid-cols-2 gap-4">
                  <Link 
                    to="/admin/products/new" 
                    className="flex flex-col items-center p-4 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    <svg className="w-6 h-6 text-gray-700 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span className="text-sm font-medium">Add Product</span>
                  </Link>
                  <Link 
                    to="/admin/orders" 
                    className="flex flex-col items-center p-4 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    <svg className="w-6 h-6 text-gray-700 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <span className="text-sm font-medium">Process Orders</span>
                  </Link>
                  <Link 
                    to="/admin/products" 
                    className="flex flex-col items-center p-4 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    <svg className="w-6 h-6 text-gray-700 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    <span className="text-sm font-medium">Update Inventory</span>
                  </Link>
                  <Link 
                    to="/admin/customers" 
                    className="flex flex-col items-center p-4 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    <svg className="w-6 h-6 text-gray-700 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <span className="text-sm font-medium">View Customers</span>
                  </Link>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-lg font-semibold mb-4">Low Stock Products</h2>
                <ul className="divide-y divide-gray-200">
                  <li className="py-3 flex justify-between items-center">
                    <div>
                      <p className="font-medium">Hookah Coal - Premium Quality</p>
                      <p className="text-sm text-red-600">Only 3 left in stock</p>
                    </div>
                    <button className="text-primary text-sm font-medium">Restock</button>
                  </li>
                  <li className="py-3 flex justify-between items-center">
                    <div>
                      <p className="font-medium">Glass Hookah Base - Large</p>
                      <p className="text-sm text-red-600">Only 2 left in stock</p>
                    </div>
                    <button className="text-primary text-sm font-medium">Restock</button>
                  </li>
                  <li className="py-3 flex justify-between items-center">
                    <div>
                      <p className="font-medium">Premium Shisha Flavor - Mint</p>
                      <p className="text-sm text-yellow-600">Only 5 left in stock</p>
                    </div>
                    <button className="text-primary text-sm font-medium">Restock</button>
                  </li>
                  <li className="py-3 flex justify-between items-center">
                    <div>
                      <p className="font-medium">Hookah Hose - Silicone</p>
                      <p className="text-sm text-yellow-600">Only 4 left in stock</p>
                    </div>
                    <button className="text-primary text-sm font-medium">Restock</button>
                  </li>
                </ul>
                <div className="mt-4 text-center">
                  <Link to="/admin/inventory" className="text-primary text-sm font-medium">
                    View All Low Stock Items ({mockSummary.lowStockProducts})
                  </Link>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
