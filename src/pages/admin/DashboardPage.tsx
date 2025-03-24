import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/layout/AdminLayout';
import { supabase } from '../../services/supabase';

// Types
interface Product {
  id: string;
  name: string;
  stock: number;
  price: number;
  sku: string;
}

interface Order {
  id: string;
  user_id: string;
  customer_name?: string;
  total_amount: number;
  status: 'pending' | 'pending_payment' | 'processing' | 'shipped' | 'delivered' | 'canceled';
  created_at: string;
  payment_method: string;
  subtotal: number;
  tax: number;
  shipping: number;
}

interface SalesData {
  date: string;
  amount: number;
}

interface StatusBreakdown {
  status: string;
  count: number;
  color: string;
}

interface PaymentMethodBreakdown {
  method: string;
  count: number;
  color: string;
}

const DashboardPage: React.FC = () => {
  console.log('DashboardPage component rendered');
  const [loading, setLoading] = useState(false); 
  const [error, setError] = useState<string | null>(null);
  
  // Stats
  const [totalSales, setTotalSales] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [productsInStock, setProductsInStock] = useState(0);
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [pendingOrders, setPendingOrders] = useState(0);
  const [avgOrderValue, setAvgOrderValue] = useState(0);
  const [salesGrowth, setSalesGrowth] = useState(0);
  const [ordersGrowth, setOrdersGrowth] = useState(0);
  const [avgOrderGrowth, setAvgOrderGrowth] = useState(0);
  
  // Detailed data
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [salesOverview, setSalesOverview] = useState<SalesData[]>([]);
  const [statusBreakdown, setStatusBreakdown] = useState<StatusBreakdown[]>([]);
  const [paymentMethodBreakdown, setPaymentMethodBreakdown] = useState<PaymentMethodBreakdown[]>([]);
  
  // Active period for sales chart
  const [activePeriod, setActivePeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  // Format currency helper function
  const formatCurrency = (amount: number): string => {
    return `${amount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })} €`;
  };

  // Generate sales overview data from orders
  const generateSalesOverview = (orders: Order[]): SalesData[] => {
    // Get last 7 days
    const lastWeek: SalesData[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      const day = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      // Filter orders for this day
      const dayOrders = orders.filter(order => {
        const orderDate = new Date(order.created_at);
        return orderDate.getDate() === date.getDate() && 
               orderDate.getMonth() === date.getMonth() && 
               orderDate.getFullYear() === date.getFullYear();
      });
      
      // Calculate total amount for this day
      const amount = dayOrders.reduce(
        (sum, order) => sum + parseFloat(order.total_amount.toString()), 
        0
      );
      
      lastWeek.push({ date: day, amount });
    }
    
    return lastWeek;
  };

  // Generate order status breakdown
  const generateStatusBreakdown = (orders: Order[]): StatusBreakdown[] => {
    const statusCounts: Record<string, number> = {};
    
    // Count orders by status
    orders.forEach(order => {
      const status = order.status;
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });
    
    // Map to color and create array
    const statusColors: Record<string, string> = {
      pending: '#FBBF24', // amber
      pending_payment: '#FBBF24', // amber
      processing: '#3B82F6', // blue
      shipped: '#8B5CF6', // purple
      delivered: '#10B981', // green
      canceled: '#EF4444', // red
    };
    
    return Object.entries(statusCounts).map(([status, count]) => ({
      status,
      count,
      color: statusColors[status] || '#6B7280' // gray default
    }));
  };

  // Generate payment method breakdown
  const generatePaymentMethodBreakdown = (orders: Order[]): PaymentMethodBreakdown[] => {
    const methodCounts: Record<string, number> = {};
    
    // Count orders by payment method
    orders.forEach(order => {
      const method = order.payment_method || 'unknown';
      methodCounts[method] = (methodCounts[method] || 0) + 1;
    });
    
    // Map to color and create array
    const methodColors: Record<string, string> = {
      klarna: '#FFB3C7', // pink
      cash_on_delivery: '#A78BFA', // purple
      credit_card: '#34D399', // green
      paypal: '#3B82F6', // blue
      bank_transfer: '#F59E0B', // amber
    };
    
    return Object.entries(methodCounts).map(([method, count]) => ({
      method,
      count,
      color: methodColors[method] || '#6B7280' // gray default
    }));
  };

  // Fetch orders data with user information when possible
  const fetchOrders = useCallback(async () => {
    console.log('Fetching orders...');
    try {
      // Try to authenticate to get all orders
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      console.log('Current session:', sessionData?.session ? 'Authenticated' : 'No session');
      
      if (sessionError) {
        console.error('Session error:', sessionError);
      }
      
      if (!sessionData?.session) {
        console.warn('No authenticated session found. This may affect data retrieval due to RLS policies.');
        // Attempt to get the current user to see if there's any authentication
        const { data: userData } = await supabase.auth.getUser();
        console.log('User data:', userData?.user ? 'User found' : 'No user found');
      }
      
      // Fetch orders with all relevant fields
      console.log('Attempting to fetch orders...');
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select(`
          id, 
          user_id,
          created_at,
          status,
          total_amount,
          subtotal,
          tax,
          shipping,
          payment_method,
          customer_name,
          customer_email
        `)
        .order('created_at', { ascending: false });
      
      if (ordersError) {
        console.error('Supabase orders error:', ordersError);
        console.log('Error details:', ordersError.message, ordersError.details, ordersError.hint);
        
        // Check if this is a permissions error (RLS)
        if (ordersError.message.includes('permission') || ordersError.code === 'PGRST301') {
          console.error('This appears to be a Row Level Security (RLS) permissions issue.');
          setError('Unable to access orders due to permissions. Please ensure you are logged in as an admin.');
        } else {
          setError(`Error loading orders: ${ordersError.message}`);
        }
        throw ordersError;
      }
      
      if (orders && orders.length > 0) {
        console.log(`Found ${orders.length} orders`);
        console.log('First order sample:', orders[0]);
        
        // Calculate total sales
        const total = orders.reduce(
          (sum, order) => sum + parseFloat(order.total_amount?.toString() || '0'), 
          0
        );
        setTotalSales(total);
        setSalesGrowth(4.7); // Placeholder value
        
        // Set total orders
        setTotalOrders(orders.length);
        setOrdersGrowth(12.3); // Placeholder value
        
        // Get pending orders
        const pending = orders.filter(
          order => order.status === 'pending' || order.status === 'pending_payment'
        ).length;
        setPendingOrders(pending);
        
        // Set recent orders (last 5)
        const recent = orders.slice(0, 5);
        setRecentOrders(recent);
        
        // Calculate average order value
        const avgValue = total / orders.length;
        setAvgOrderValue(avgValue);
        setAvgOrderGrowth(2.1); // Placeholder value
        
        // Generate sales overview data
        const overview = generateSalesOverview(orders);
        setSalesOverview(overview);
        
        // Generate status breakdown
        const statusData = generateStatusBreakdown(orders);
        setStatusBreakdown(statusData);
        
        // Generate payment method breakdown
        const paymentData = generatePaymentMethodBreakdown(orders);
        setPaymentMethodBreakdown(paymentData);
      } else {
        console.warn('No orders found in database.');
        console.log('Debug: Query result was empty. Please check if the orders table exists and contains data.');
        
        // Check for any actual RLS issues by testing if we can access the orders table structure
        try {
          console.log('Testing orders table access...');
          const { data: tableExists, error: tableError } = await supabase
            .from('orders')
            .select('id')
            .limit(1);
          
          if (tableError) {
            console.error('Orders table access error:', tableError);
            setError(`Cannot access orders table: ${tableError.message}`);
          } else {
            console.log('Orders table access result:', tableExists);
            setError('No orders found. The orders table exists but contains no data.');
          }
        } catch (err) {
          console.error('Error testing orders table access:', err);
        }
        
        // Check if we can query other tables to test access
        try {
          console.log('Testing product table access...');
          const { data: productCount, error: productError } = await supabase
            .from('products')
            .select('count()', { count: 'exact' })
            .single();
          
          if (productError) {
            console.error('Product table access error:', productError);
          } else {
            console.log('Product count result:', productCount);
          }
        } catch (err) {
          console.error('Error testing product access:', err);
        }
        
        setTotalSales(0);
        setTotalOrders(0);
        setPendingOrders(0);
        setRecentOrders([]);
        setSalesOverview([]);
        setAvgOrderValue(0);
        setSalesGrowth(0);
        setOrdersGrowth(0);
        setAvgOrderGrowth(0);
        setStatusBreakdown([]);
        setPaymentMethodBreakdown([]);
      }
    } catch (error: unknown) {
      console.error('Error in fetchOrders:', error);
      if (error instanceof Error) {
        setError(`Error loading orders: ${error.message}`);
      } else {
        setError('Unknown error occurred while fetching orders');
      }
      throw error;
    }
  }, []);

  // Fetch products data
  const fetchProducts = useCallback(async () => {
    console.log('Fetching products...');
    const { data: products, error } = await supabase
      .from('products')
      .select('id, name, stock, price, sku');
    
    if (error) {
      console.error('Supabase products error:', error);
      throw error;
    }
    
    if (products && products.length > 0) {
      console.log(`Found ${products.length} products`);
      setProductsInStock(products.length);
      
      const lowStock = products.filter(product => product.stock < 6);
      setLowStockProducts(lowStock);
    } else {
      console.warn('No products found in database.');
      setProductsInStock(0);
      setLowStockProducts([]);
    }
  }, []);

  // Add real-time subscription to orders
  useEffect(() => {
    // Initial data fetch
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        await fetchProducts().catch(error => {
          console.error('Failed to fetch products:', error);
          setError('Error loading product data');
        });
        
        await fetchOrders().catch(error => {
          console.error('Failed to fetch orders:', error);
          setError('Error loading order data');
        });
      } catch (error) {
        console.error('Dashboard data loading error:', error);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
    
    // Set up real-time subscription for orders
    const ordersSubscription = supabase
      .channel('orders-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        (payload) => {
          console.log('Real-time order update received:', payload);
          // Refresh orders data when changes occur
          fetchOrders().catch(error => {
            console.error('Failed to fetch orders after real-time update:', error);
          });
        }
      )
      .subscribe((status) => {
        console.log('Orders subscription status:', status);
      });
    
    // Cleanup subscription on component unmount
    return () => {
      ordersSubscription.unsubscribe();
    };
  }, [fetchOrders, fetchProducts]);

  // Handle period change for sales chart
  const handlePeriodChange = (period: 'daily' | 'weekly' | 'monthly') => {
    setActivePeriod(period);
  };

  // Get status color based on order status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500';
      case 'pending_payment':
        return 'bg-yellow-500';
      case 'processing':
        return 'bg-blue-500';
      case 'shipped':
        return 'bg-purple-500';
      case 'delivered':
        return 'bg-green-500';
      case 'canceled':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const renderDashboardContent = () => {
    return (
      <div className="p-6 bg-gray-900 text-white">
        {error && (
          <div className="bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded relative mb-6">
            <strong className="font-bold mr-2">Error:</strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg p-6 shadow">
            <h2 className="text-lg font-semibold mb-2">Total Sales</h2>
            <p className="text-2xl font-bold mb-2">{formatCurrency(totalSales)}</p>
            <div className={`flex items-center ${salesGrowth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              <span className="text-sm">
                {salesGrowth >= 0 ? '+' : ''}{salesGrowth}%
              </span>
              <span className="ml-2 text-xs text-gray-400">Compared to previous period</span>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6 shadow">
            <h2 className="text-lg font-semibold mb-2">Total Orders</h2>
            <p className="text-2xl font-bold mb-2">{totalOrders}</p>
            <div className={`flex items-center ${ordersGrowth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              <span className="text-sm">
                {ordersGrowth >= 0 ? '+' : ''}{ordersGrowth}%
              </span>
              <span className="ml-2 text-xs text-gray-400">Compared to previous period</span>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6 shadow">
            <h2 className="text-lg font-semibold mb-2">Average Order Value</h2>
            <p className="text-2xl font-bold mb-2">{formatCurrency(avgOrderValue)}</p>
            <div className={`flex items-center ${avgOrderGrowth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              <span className="text-sm">
                {avgOrderGrowth >= 0 ? '+' : ''}{avgOrderGrowth}%
              </span>
              <span className="ml-2 text-xs text-gray-400">Compared to previous period</span>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 bg-gray-800 rounded-lg p-6 shadow">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold">Sales Overview</h2>
              <div className="inline-flex bg-gray-700 rounded-md overflow-hidden">
                <button 
                  onClick={() => handlePeriodChange('daily')} 
                  className={`px-3 py-1 text-sm ${activePeriod === 'daily' ? 'bg-primary text-white' : 'text-gray-300'}`}
                >
                  Daily
                </button>
                <button 
                  onClick={() => handlePeriodChange('weekly')} 
                  className={`px-3 py-1 text-sm ${activePeriod === 'weekly' ? 'bg-primary text-white' : 'text-gray-300'}`}
                >
                  Weekly
                </button>
                <button 
                  onClick={() => handlePeriodChange('monthly')} 
                  className={`px-3 py-1 text-sm ${activePeriod === 'monthly' ? 'bg-primary text-white' : 'text-gray-300'}`}
                >
                  Monthly
                </button>
              </div>
            </div>
            
            <div className="overflow-hidden">
              <div className="relative h-64 mb-3">
                {salesOverview.map((item, index) => {
                  // Calculate the max amount to scale the chart
                  const maxAmount = Math.max(...salesOverview.map(i => i.amount));
                  
                  // Calculate the height percentage
                  const heightPercentage = maxAmount === 0 ? 0 : (item.amount / maxAmount) * 100;
                  
                  return (
                    <div key={index} className="absolute bottom-0 flex flex-col items-center" style={{ 
                      left: `${index * (100 / (salesOverview.length - 1))}%`,
                      width: `${100 / salesOverview.length}%`
                    }}>
                      <div 
                        className="w-3/4 bg-blue-500 rounded-t"
                        style={{ height: `${heightPercentage}%` }}
                      ></div>
                      <div className="mt-2 text-xs text-gray-400">{item.date}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6 shadow">
            <h2 className="text-lg font-semibold mb-6">Store Statistics</h2>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-400">Products in stock</span>
                  <span className="text-sm font-medium">{productsInStock}</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-400">Low stock products</span>
                  <span className="text-sm font-medium">{lowStockProducts.length}</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '25%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-400">Pending orders</span>
                  <span className="text-sm font-medium">{pendingOrders}</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div className="bg-orange-500 h-2 rounded-full" style={{ width: '40%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Order Status Breakdown */}
          <div className="bg-gray-800 rounded-lg p-6 shadow">
            <h2 className="text-lg font-semibold mb-6">Order Status Breakdown</h2>
            
            {statusBreakdown.length > 0 ? (
              <div className="space-y-4">
                {statusBreakdown.map((item, index) => (
                  <div key={index}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm capitalize">{item.status.replace('_', ' ')}</span>
                      <span className="text-sm font-medium">{item.count} orders</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-3">
                      <div 
                        className="h-3 rounded-full" 
                        style={{ 
                          width: `${(item.count / totalOrders) * 100}%`,
                          backgroundColor: item.color 
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-500 text-center py-4">No order data available</div>
            )}
          </div>
          
          {/* Payment Method Breakdown */}
          <div className="bg-gray-800 rounded-lg p-6 shadow">
            <h2 className="text-lg font-semibold mb-6">Payment Methods</h2>
            
            {paymentMethodBreakdown.length > 0 ? (
              <div className="grid grid-cols-1 gap-3">
                {paymentMethodBreakdown.map((item, index) => (
                  <div key={index} className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-2" 
                      style={{ backgroundColor: item.color }}
                    ></div>
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm capitalize">{item.method.replace('_', ' ')}</span>
                        <span className="text-sm font-medium">{Math.round((item.count / totalOrders) * 100)}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full" 
                          style={{ 
                            width: `${(item.count / totalOrders) * 100}%`,
                            backgroundColor: item.color 
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-500 text-center py-4">No payment method data available</div>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gray-800 rounded-lg p-6 shadow">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold">Recent Orders</h2>
              <Link to="/admin/orders" className="text-primary text-sm hover:underline">
                View all
              </Link>
            </div>
            
            {recentOrders.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      <th className="pb-3">Order ID</th>
                      <th className="pb-3">Date</th>
                      <th className="pb-3">Amount</th>
                      <th className="pb-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {recentOrders.map((order) => (
                      <tr key={order.id} className="text-sm">
                        <td className="py-3">#{order.id.slice(0, 8)}</td>
                        <td className="py-3">{
                          new Date(order.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })
                        }</td>
                        <td className="py-3">{formatCurrency(parseFloat(order.total_amount.toString()))}</td>
                        <td className="py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)} bg-opacity-20`}>
                            {order.status.replace('_', ' ')}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-gray-500 text-center py-4">No recent orders found</div>
            )}
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6 shadow">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold">Low Stock Products</h2>
              <Link to="/admin/products" className="text-primary text-sm hover:underline">
                View all
              </Link>
            </div>
            
            {lowStockProducts.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      <th className="pb-3">Product</th>
                      <th className="pb-3">SKU</th>
                      <th className="pb-3">Stock</th>
                      <th className="pb-3">Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {lowStockProducts.map((product) => (
                      <tr key={product.id} className="text-sm">
                        <td className="py-3">{product.name}</td>
                        <td className="py-3">{product.sku}</td>
                        <td className="py-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            product.stock === 0 
                              ? 'bg-red-500 bg-opacity-20 text-red-500' 
                              : 'bg-yellow-500 bg-opacity-20 text-yellow-500'
                          }`}>
                            {product.stock} left
                          </span>
                        </td>
                        <td className="py-3">{formatCurrency(product.price)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-gray-500 text-center py-4">No low stock products</div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <AdminLayout>
      {loading ? (
        <div className="flex items-center justify-center h-full py-24">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        renderDashboardContent()
      )}
    </AdminLayout>
  );
};

export default DashboardPage;
