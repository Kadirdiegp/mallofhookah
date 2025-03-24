import { supabase } from '../services/supabase';

/**
 * Utility to detect address information from reseller_orders table
 * 
 * With the new schema, addresses are directly embedded in the orders table.
 * This utility now retrieves address data from the most recent order.
 */
export async function detectAddressTableColumns() {
  console.log('Detecting address information from reseller_orders...');
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    console.error('No authenticated user found');
    return null;
  }

  try {
    // Instead of checking address columns, we look for the last order with address data
    const { data: latestOrder, error } = await supabase
      .from('reseller_orders')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1);
    
    if (error) {
      console.error('Error fetching latest order:', error);
      return {
        tableStructure: 'embedded_in_orders',
        message: 'Addresses are now embedded in orders table',
        error: error.message
      };
    }
    
    if (latestOrder && latestOrder.length > 0) {
      const order = latestOrder[0];
      
      // Check if we have shipping address fields in the order
      const hasShippingAddress = 
        order.shipping_name && 
        order.shipping_street && 
        order.shipping_city && 
        order.shipping_postal_code;
      
      console.log('Address data found in latest order:', hasShippingAddress);
      
      return {
        tableStructure: 'embedded_in_orders',
        hasShippingAddress,
        lastOrderId: order.id,
        shippingInfo: {
          name: order.shipping_name,
          street: order.shipping_street,
          apartment: order.shipping_apartment,
          city: order.shipping_city,
          state: order.shipping_state,
          postalCode: order.shipping_postal_code,
          country: order.shipping_country,
          phone: order.shipping_phone
        }
      };
    } else {
      console.log('No orders found for user, no address data available');
      return {
        tableStructure: 'embedded_in_orders',
        hasShippingAddress: false,
        message: 'No previous orders found with address data'
      };
    }
  } catch (e) {
    console.error('Error in detectAddressTableColumns:', e);
    return {
      tableStructure: 'error',
      message: e instanceof Error ? e.message : 'Unknown error',
      error: e
    };
  }
}
