import React, { useState, useEffect, useCallback } from 'react';
import { 
  Container, 
  Paper, 
  Typography, 
  Box, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Button, 
  IconButton, 
  Chip, 
  TextField, 
  InputAdornment, 
  CircularProgress, 
  Dialog, 
  DialogTitle, 
  DialogContent,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { format } from 'date-fns';
import { supabase } from '../../services/supabase';

interface DatabaseOrder {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  status: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  
  // Shipping address directly embedded
  shipping_name: string;
  shipping_street: string;
  shipping_apartment?: string;
  shipping_city: string;
  shipping_state: string;
  shipping_postal_code: string;
  shipping_country: string;
  shipping_phone?: string;
  
  // Billing address directly embedded
  billing_name: string;
  billing_street: string;
  billing_apartment?: string;
  billing_city: string;
  billing_state: string;
  billing_postal_code: string;
  billing_country: string;
  billing_phone?: string;
  
  // Financial info
  subtotal: number;
  tax: number;
  shipping_cost: number;
  discount: number;
  total_amount: number;
  currency: string;
  
  // Payment info
  payment_method: string;
  payment_status: string;
  
  // Shipping info
  shipping_method?: string;
  tracking_number?: string;
  shipping_carrier?: string;
  
  // Metadata
  notes?: string;
  admin_notes?: string;
}

interface OrderItem {
  id: string;
  order_id: string;
  product_id?: string;
  product_name: string;
  product_sku?: string;
  variant_name?: string;
  quantity: number;
  unit_price: number;
  discount: number;
  subtotal: number;
}

const OrdersPage = () => {
  const [orders, setOrders] = useState<DatabaseOrder[]>([]);
  const [orderItems, setOrderItems] = useState<{[key: string]: OrderItem[]}>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<DatabaseOrder | null>(null);
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);

  const formatAddress = (order: DatabaseOrder, type: 'shipping' | 'billing') => {
    const prefix = type === 'shipping' ? 'shipping' : 'billing';
    return {
      name: order[`${prefix}_name`],
      street: order[`${prefix}_street`],
      apartment: order[`${prefix}_apartment`],
      city: order[`${prefix}_city`],
      state: order[`${prefix}_state`],
      postal_code: order[`${prefix}_postal_code`],
      country: order[`${prefix}_country`],
      phone: order[`${prefix}_phone`]
    };
  };

  const copyAddressToClipboard = (order: DatabaseOrder, type: 'shipping' | 'billing') => {
    const addressObj = formatAddress(order, type);
    
    const formattedAddress = `${addressObj.name}\n${addressObj.street}${addressObj.apartment ? ', ' + addressObj.apartment : ''}\n${addressObj.city}, ${addressObj.state} ${addressObj.postal_code}\n${addressObj.country}${addressObj.phone ? '\nPhone: ' + addressObj.phone : ''}`;
    
    navigator.clipboard.writeText(formattedAddress);
    setCopiedAddress(`${order.id}_${type}`);
    
    setTimeout(() => {
      setCopiedAddress('');
    }, 2000);
  };

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // First try to use the admin function
      const { data: orders, error } = await supabase.rpc('admin_get_all_reseller_orders');

      // If that doesn't work, fall back to direct query
      if (error) {
        console.log('Falling back to direct query:', error);
        const { data, error: queryError } = await supabase
          .from('reseller_orders')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (queryError) {
          throw queryError;
        }
        
        if (data) {
          setOrders(data);
          calculateAndSetMetrics(data);
        }
      } else if (orders) {
        setOrders(orders);
        calculateAndSetMetrics(orders);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Failed to fetch orders. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchOrderItems = async (orderId: string) => {
    try {
      const { data, error } = await supabase
        .from('reseller_order_items')
        .select('*')
        .eq('order_id', orderId);

      if (error) {
        throw error;
      }

      if (data) {
        setOrderItems(prev => ({
          ...prev,
          [orderId]: data
        }));
      }
    } catch (error) {
      console.error(`Error fetching order items for order ${orderId}:`, error);
    }
  };

  const calculateAndSetMetrics = (orders: DatabaseOrder[]) => {
    const metrics = {
      totalOrders: orders.length,
      pendingOrders: orders.filter(order => order.status === 'pending_payment').length,
      completedOrders: orders.filter(order => order.status === 'completed').length,
      totalRevenue: orders.reduce((sum, order) => sum + order.total_amount, 0)
    };
    setMetrics(metrics);
  };

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy h:mm a');
    } catch (error) { 
      console.error('Error formatting date:', error);
      return dateString;
    }
  };

  const getStatusChipColor = (status: string): "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" => {
    const statusMap: Record<string, "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning"> = {
      'pending': 'warning',
      'processing': 'info',
      'shipped': 'primary',
      'delivered': 'success',
      'cancelled': 'error',
      'pending_payment': 'warning',
      'completed': 'success'
    };
    
    return statusMap[status.toLowerCase()] || 'default';
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const toggleOrderExpand = (orderId: string) => {
    if (expandedOrderId === orderId) {
      setExpandedOrderId(null);
    } else {
      setExpandedOrderId(orderId);
      if (!orderItems[orderId]) {
        fetchOrderItems(orderId);
      }
    }
  };

  const openOrderDialog = (order: DatabaseOrder) => {
    setSelectedOrder(order);
    setOrderDialogOpen(true);
  };

  const closeOrderDialog = () => {
    setSelectedOrder(null);
    setOrderDialogOpen(false);
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortField, setSortField] = useState('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [metrics, setMetrics] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalRevenue: 0
  });

  const filteredOrders = orders
    .filter(order => {
      const matchesSearch = 
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.user_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
        (order.customer_email?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
        order.payment_method.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || order.status.toLowerCase() === statusFilter.toLowerCase();
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      const sortValueA = a[sortField as keyof DatabaseOrder];
      const sortValueB = b[sortField as keyof DatabaseOrder];

      if (typeof sortValueA === 'string' && typeof sortValueB === 'string') {
        return sortDirection === 'asc' 
          ? sortValueA.localeCompare(sortValueB)
          : sortValueB.localeCompare(sortValueA);
      } else if (typeof sortValueA === 'number' && typeof sortValueB === 'number') {
        return sortDirection === 'asc' 
          ? sortValueA - sortValueB
          : sortValueB - sortValueA;
      }
      
      return 0;
    });

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Orders Management
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography color="textSecondary" gutterBottom>
              Total Orders
            </Typography>
            <Typography variant="h4">{metrics.totalOrders}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography color="textSecondary" gutterBottom>
              Pending Orders
            </Typography>
            <Typography variant="h4" color="warning.main">{metrics.pendingOrders}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography color="textSecondary" gutterBottom>
              Completed Orders
            </Typography>
            <Typography variant="h4" color="success.main">{metrics.completedOrders}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography color="textSecondary" gutterBottom>
              Total Revenue
            </Typography>
            <Typography variant="h4" color="primary.main">{formatCurrency(metrics.totalRevenue)}</Typography>
          </Paper>
        </Grid>
      </Grid>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Search Orders"
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Filter by Status</InputLabel>
              <Select
                value={statusFilter}
                label="Filter by Status"
                onChange={(e: SelectChangeEvent) => setStatusFilter(e.target.value as string)}
              >
                <MenuItem value="all">All Statuses</MenuItem>
                <MenuItem value="pending_payment">Pending Payment</MenuItem>
                <MenuItem value="processing">Processing</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={5} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              startIcon={<KeyboardArrowUpIcon />}
              onClick={() => fetchOrders()}
              disabled={loading}
            >
              Refresh
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {error && (
        <Paper sx={{ p: 2, mb: 3, bgcolor: 'error.light' }}>
          <Typography color="error">{error}</Typography>
        </Paper>
      )}

      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : filteredOrders.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="textSecondary">
              No orders found
            </Typography>
          </Box>
        ) : (
          <TableContainer sx={{ maxHeight: 'calc(100vh - 350px)' }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox"></TableCell>
                  <TableCell 
                    onClick={() => handleSort('id')}
                    sx={{ cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    Order ID
                    {sortField === 'id' && (
                      sortDirection === 'asc' ? <KeyboardArrowUpIcon fontSize="small" /> : <KeyboardArrowDownIcon fontSize="small" />
                    )}
                  </TableCell>
                  <TableCell 
                    onClick={() => handleSort('created_at')}
                    sx={{ cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    Date
                    {sortField === 'created_at' && (
                      sortDirection === 'asc' ? <KeyboardArrowUpIcon fontSize="small" /> : <KeyboardArrowDownIcon fontSize="small" />
                    )}
                  </TableCell>
                  <TableCell 
                    onClick={() => handleSort('user_id')}
                    sx={{ cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    Customer
                    {sortField === 'user_id' && (
                      sortDirection === 'asc' ? <KeyboardArrowUpIcon fontSize="small" /> : <KeyboardArrowDownIcon fontSize="small" />
                    )}
                  </TableCell>
                  <TableCell 
                    onClick={() => handleSort('status')}
                    sx={{ cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    Status
                    {sortField === 'status' && (
                      sortDirection === 'asc' ? <KeyboardArrowUpIcon fontSize="small" /> : <KeyboardArrowDownIcon fontSize="small" />
                    )}
                  </TableCell>
                  <TableCell 
                    onClick={() => handleSort('payment_method')}
                    sx={{ cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    Payment
                    {sortField === 'payment_method' && (
                      sortDirection === 'asc' ? <KeyboardArrowUpIcon fontSize="small" /> : <KeyboardArrowDownIcon fontSize="small" />
                    )}
                  </TableCell>
                  <TableCell 
                    onClick={() => handleSort('total_amount')}
                    sx={{ cursor: 'pointer', fontWeight: 'bold', textAlign: 'right' }}
                  >
                    Total
                    {sortField === 'total_amount' && (
                      sortDirection === 'asc' ? <KeyboardArrowUpIcon fontSize="small" /> : <KeyboardArrowDownIcon fontSize="small" />
                    )}
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredOrders.map((order) => (
                  <React.Fragment key={order.id}>
                    <TableRow 
                      hover 
                      onClick={() => {
                        toggleOrderExpand(order.id);
                      }}
                      sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
                    >
                      <TableCell padding="checkbox">
                        <IconButton size="small">
                          {expandedOrderId === order.id ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                        </IconButton>
                      </TableCell>
                      <TableCell>{order.id.slice(0, 8)}...</TableCell>
                      <TableCell>{formatDate(order.created_at)}</TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          {order.customer_name || 'Unknown'}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {order.customer_email || order.user_id.slice(0, 8) + '...'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={order.status} 
                          color={getStatusChipColor(order.status) as "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning"}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{order.payment_method}</TableCell>
                      <TableCell align="right">
                        {formatCurrency(order.total_amount)}
                        <Button
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            openOrderDialog(order);
                          }}
                          sx={{ ml: 1 }}
                        >
                          <LocalShippingIcon fontSize="small" />
                        </Button>
                      </TableCell>
                    </TableRow>
                    {expandedOrderId === order.id && (
                      <TableRow>
                        <TableCell colSpan={7}>
                          <Box sx={{ p: 2, bgcolor: 'background.paper' }}>
                            <Grid container spacing={2}>
                              <Grid item xs={12} md={6}>
                                <Paper sx={{ p: 2, mb: 2, bgcolor: 'grey.50' }}>
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                      Shipping Address
                                    </Typography>
                                    <IconButton 
                                      size="small" 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        copyAddressToClipboard(order, 'shipping');
                                      }}
                                      color={copiedAddress === `${order.id}_shipping` ? 'success' : 'default'}
                                    >
                                      <ContentCopyIcon fontSize="small" />
                                    </IconButton>
                                  </Box>
                                  <Typography variant="body1"><strong>{order.shipping_name}</strong></Typography>
                                  <Typography variant="body2">{order.shipping_street}</Typography>
                                  {order.shipping_apartment && (
                                    <Typography variant="body2">Apt: {order.shipping_apartment}</Typography>
                                  )}
                                  <Typography variant="body2">
                                    {order.shipping_city}, {order.shipping_state} {order.shipping_postal_code}
                                  </Typography>
                                  <Typography variant="body2">{order.shipping_country}</Typography>
                                  {order.shipping_phone && (
                                    <Typography variant="body2">Phone: {order.shipping_phone}</Typography>
                                  )}
                                </Paper>
                              </Grid>
                              <Grid item xs={12} md={6}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>Customer Info</Typography>
                                <Typography variant="body2"><strong>Name:</strong> {order.customer_name}</Typography>
                                <Typography variant="body2"><strong>Email:</strong> {order.customer_email}</Typography>
                                {order.customer_phone && (
                                  <Typography variant="body2"><strong>Phone:</strong> {order.customer_phone}</Typography>
                                )}
                                <Typography variant="body2"><strong>User ID:</strong> {order.user_id}</Typography>
                              </Grid>
                              <Grid item xs={12}>
                                <Typography variant="h6" gutterBottom>Order Items</Typography>
                                {orderItems[order.id] ? (
                                  <Table size="small">
                                    <TableHead>
                                      <TableRow>
                                        <TableCell>Product</TableCell>
                                        <TableCell>Quantity</TableCell>
                                        <TableCell>Price</TableCell>
                                        <TableCell>Total</TableCell>
                                      </TableRow>
                                    </TableHead>
                                    <TableBody>
                                      {orderItems[order.id].map((item) => (
                                        <TableRow key={item.id}>
                                          <TableCell>{item.product_name}</TableCell>
                                          <TableCell>{item.quantity}</TableCell>
                                          <TableCell>{formatCurrency(item.unit_price)}</TableCell>
                                          <TableCell>{formatCurrency(item.subtotal)}</TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                ) : (
                                  <CircularProgress size={24} />
                                )}
                              </Grid>
                            </Grid>
                          </Box>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Order Details Dialog */}
      <Dialog 
        open={orderDialogOpen} 
        onClose={closeOrderDialog}
        maxWidth="md"
        fullWidth
      >
        {selectedOrder && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h5" component="div">
                  Order #{selectedOrder.id.substring(0, 8)}
                </Typography>
                <Chip 
                  label={selectedOrder.status.toUpperCase()} 
                  color={getStatusChipColor(selectedOrder.status)}
                  sx={{ fontWeight: 'bold' }}
                />
              </Box>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>
                    <strong>Date:</strong> {new Date(selectedOrder.created_at).toLocaleString()}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                        Shipping Address
                      </Typography>
                      <IconButton 
                        size="small" 
                        onClick={() => copyAddressToClipboard(selectedOrder, 'shipping')}
                        color={copiedAddress === `${selectedOrder.id}_shipping` ? 'success' : 'default'}
                      >
                        <ContentCopyIcon fontSize="small" />
                      </IconButton>
                    </Box>
                    <Typography variant="body1"><strong>{selectedOrder.shipping_name}</strong></Typography>
                    <Typography variant="body2">{selectedOrder.shipping_street}</Typography>
                    {selectedOrder.shipping_apartment && (
                      <Typography variant="body2">Apt: {selectedOrder.shipping_apartment}</Typography>
                    )}
                    <Typography variant="body2">
                      {selectedOrder.shipping_city}, {selectedOrder.shipping_state} {selectedOrder.shipping_postal_code}
                    </Typography>
                    <Typography variant="body2">{selectedOrder.shipping_country}</Typography>
                    {selectedOrder.shipping_phone && (
                      <Typography variant="body2">Phone: {selectedOrder.shipping_phone}</Typography>
                    )}
                  </Paper>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                      Customer Information
                    </Typography>
                    <Typography variant="body2"><strong>Name:</strong> {selectedOrder.customer_name}</Typography>
                    <Typography variant="body2"><strong>Email:</strong> {selectedOrder.customer_email}</Typography>
                    {selectedOrder.customer_phone && (
                      <Typography variant="body2"><strong>Phone:</strong> {selectedOrder.customer_phone}</Typography>
                    )}
                    <Typography variant="body2"><strong>User ID:</strong> {selectedOrder.user_id}</Typography>
                  </Paper>
                </Grid>
                
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                    <Typography variant="h6">Order Details</Typography>
                    <Chip 
                      label={selectedOrder.status.toUpperCase()} 
                      color={getStatusChipColor(selectedOrder.status)}
                      size="small"
                    />
                  </Box>
                  <Typography variant="body2" sx={{ mt: 1 }}><strong>Payment Method:</strong> {selectedOrder.payment_method}</Typography>
                  <Typography variant="body2"><strong>Payment Status:</strong> {selectedOrder.payment_status}</Typography>
                  {selectedOrder.tracking_number && (
                    <Typography variant="body2"><strong>Tracking Number:</strong> {selectedOrder.tracking_number}</Typography>
                  )}
                  {selectedOrder.shipping_carrier && (
                    <Typography variant="body2"><strong>Shipping Carrier:</strong> {selectedOrder.shipping_carrier}</Typography>
                  )}
                </Grid>
              </Grid>
            </DialogContent>
          </>
        )}
      </Dialog>
    </Container>
  );
};

export default OrdersPage;
