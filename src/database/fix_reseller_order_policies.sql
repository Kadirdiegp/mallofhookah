-- Fix for reseller_orders RLS policies
-- This script will drop the existing problematic policies and create new ones

-- Drop existing policies
DROP POLICY IF EXISTS "Admin can view all reseller orders" ON reseller_orders;
DROP POLICY IF EXISTS "Admin can update reseller orders" ON reseller_orders;
DROP POLICY IF EXISTS "Admin can delete reseller orders" ON reseller_orders;
DROP POLICY IF EXISTS "Users can view their own reseller orders" ON reseller_orders;
DROP POLICY IF EXISTS "Users can create reseller orders" ON reseller_orders;

-- Enable RLS
ALTER TABLE reseller_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE reseller_order_items ENABLE ROW LEVEL SECURITY;

-- Create fixed policies
-- Users can view their own orders - This is the most important policy
CREATE POLICY "Users can view their own reseller orders"
  ON reseller_orders FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can create their own orders
CREATE POLICY "Users can create reseller orders"
  ON reseller_orders FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Order items policies
DROP POLICY IF EXISTS "Users can view their own order items" ON reseller_order_items;
DROP POLICY IF EXISTS "Admin can view all order items" ON reseller_order_items;
DROP POLICY IF EXISTS "Admin can update order items" ON reseller_order_items;
DROP POLICY IF EXISTS "Users can create order items" ON reseller_order_items;

-- Create fixed policies for order items
CREATE POLICY "Users can view their own order items"
  ON reseller_order_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM reseller_orders
      WHERE reseller_orders.id = order_id
      AND reseller_orders.user_id = auth.uid()
    )
  );

-- Users can create order items
CREATE POLICY "Users can create order items"
  ON reseller_order_items FOR INSERT
  TO authenticated
  WITH CHECK (true);
