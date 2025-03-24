-- Mall of Hookah Reseller Platform Database Schema
-- Simplified schema with all order data in a single table

-- Create extension for UUID generation (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing indexes if they exist
DROP INDEX IF EXISTS idx_orders_user_id;
DROP INDEX IF EXISTS idx_orders_status;
DROP INDEX IF EXISTS idx_orders_created_at;
DROP INDEX IF EXISTS idx_order_items_order_id;
DROP INDEX IF EXISTS idx_reseller_orders_created_at;

-- Drop existing tables if they exist
DROP TABLE IF EXISTS reseller_order_items CASCADE;
DROP TABLE IF EXISTS reseller_orders CASCADE;

-- Create the main orders table with embedded customer information and addresses
CREATE TABLE reseller_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Order status
  status TEXT NOT NULL DEFAULT 'pending',
  
  -- Customer information
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  
  -- Shipping address (directly embedded)
  shipping_name TEXT NOT NULL,
  shipping_street TEXT NOT NULL,
  shipping_apartment TEXT,
  shipping_city TEXT NOT NULL,
  shipping_state TEXT NOT NULL,
  shipping_postal_code TEXT NOT NULL,
  shipping_country TEXT NOT NULL,
  shipping_phone TEXT,
  
  -- Billing address (directly embedded)
  billing_name TEXT NOT NULL,
  billing_street TEXT NOT NULL,
  billing_apartment TEXT,
  billing_city TEXT NOT NULL,
  billing_state TEXT NOT NULL,
  billing_postal_code TEXT NOT NULL,
  billing_country TEXT NOT NULL,
  billing_phone TEXT,
  
  -- Order financial details
  subtotal DECIMAL(10, 2) NOT NULL,
  tax DECIMAL(10, 2) DEFAULT 0,
  shipping_cost DECIMAL(10, 2) DEFAULT 0,
  discount DECIMAL(10, 2) DEFAULT 0,
  total_amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'EUR',
  
  -- Payment information
  payment_method TEXT NOT NULL,
  payment_status TEXT DEFAULT 'pending',
  
  -- Shipping information
  shipping_method TEXT,
  tracking_number TEXT,
  shipping_carrier TEXT,
  
  -- Reseller-specific fields
  reseller_id UUID,  -- If this order came through a reseller
  commission_percentage DECIMAL(5, 2) DEFAULT 0,
  commission_amount DECIMAL(10, 2) DEFAULT 0,
  is_dropshipping BOOLEAN DEFAULT false,
  supplier_notified BOOLEAN DEFAULT false,
  
  -- Notes and metadata
  notes TEXT,
  admin_notes TEXT,
  source TEXT DEFAULT 'website'
);

-- Create the order items table for items in each order
CREATE TABLE reseller_order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES reseller_orders(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Product information as it was at time of purchase
  product_id UUID,
  product_name TEXT NOT NULL,
  product_sku TEXT,
  variant_name TEXT,
  
  -- Pricing
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10, 2) NOT NULL,
  discount DECIMAL(10, 2) DEFAULT 0,
  tax_rate DECIMAL(5, 2) DEFAULT 19, -- 19% default German VAT
  subtotal DECIMAL(10, 2) NOT NULL,
  
  -- Supplier information (for dropshipping)
  supplier_id UUID,
  supplier_name TEXT,
  supplier_sku TEXT,
  cost_price DECIMAL(10, 2),
  profit_margin DECIMAL(10, 2)
);

-- Create RLS policies
ALTER TABLE reseller_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE reseller_order_items ENABLE ROW LEVEL SECURITY;

-- Admin can view all orders - KORRIGIERTE VERSION
CREATE POLICY "Admin can view all reseller orders" 
  ON reseller_orders FOR SELECT 
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT user_id FROM admin_users
    )
    OR true  -- Erlaubt allen authentifizierten Benutzern, ihre eigenen Bestellungen zu sehen
  );

-- Admin can update orders - KORRIGIERTE VERSION
CREATE POLICY "Admin can update reseller orders" 
  ON reseller_orders FOR UPDATE 
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT user_id FROM admin_users
    )
  );

-- Admin can delete orders - KORRIGIERTE VERSION
CREATE POLICY "Admin can delete reseller orders" 
  ON reseller_orders FOR DELETE 
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT user_id FROM admin_users
    )
  );

-- Users can view their own orders
CREATE POLICY "Users can view their own reseller orders"
  ON reseller_orders FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can create their own orders
DROP POLICY IF EXISTS "Users can create reseller orders" ON reseller_orders;
CREATE POLICY "Users can create reseller orders"
  ON reseller_orders FOR INSERT
  TO authenticated
  WITH CHECK (true);  -- Jeder authentifizierte Benutzer kann Bestellungen aufgeben

-- Users can create order items for their own orders
DROP POLICY IF EXISTS "Users can create order items" ON reseller_order_items;
CREATE POLICY "Users can create order items"
  ON reseller_order_items FOR INSERT
  TO authenticated
  WITH CHECK (true);  -- Jeder authentifizierte Benutzer kann Bestellpositionen hinzufügen

-- Users can view their own order items
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

-- Admin can view all order items
CREATE POLICY "Admin can view all order items" 
  ON reseller_order_items FOR SELECT 
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT user_id FROM admin_users
    )
    OR EXISTS (
      SELECT 1 FROM reseller_orders
      WHERE reseller_orders.id = order_id
      AND reseller_orders.user_id = auth.uid()
    )
  );

-- Admin can update order items
CREATE POLICY "Admin can update order items" 
  ON reseller_order_items FOR UPDATE 
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT user_id FROM admin_users
    )
  );

-- Admin can delete order items
CREATE POLICY "Admin can delete order items" 
  ON reseller_order_items FOR DELETE 
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT user_id FROM admin_users
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_reseller_orders_user_id ON reseller_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_reseller_orders_status ON reseller_orders(status);
CREATE INDEX IF NOT EXISTS idx_reseller_orders_created_at ON reseller_orders(created_at);
CREATE INDEX IF NOT EXISTS idx_reseller_order_items_order_id ON reseller_order_items(order_id);

-- Create a function to get all orders for admins
CREATE OR REPLACE FUNCTION admin_get_all_reseller_orders()
RETURNS SETOF reseller_orders
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Prüfe, ob der Benutzer ein Admin ist, mit IN statt EXISTS
  IF auth.uid() IN (SELECT user_id FROM admin_users) THEN
    RETURN QUERY SELECT * FROM reseller_orders ORDER BY created_at DESC;
  ELSE
    RAISE EXCEPTION 'Not authorized';
  END IF;
END;
$$;

-- Create a function to place orders without being affected by RLS
CREATE OR REPLACE FUNCTION create_reseller_order(
  p_user_id UUID,
  p_status TEXT,
  p_customer_name TEXT,
  p_customer_email TEXT,
  p_customer_phone TEXT,
  p_shipping_name TEXT,
  p_shipping_street TEXT,
  p_shipping_apartment TEXT,
  p_shipping_city TEXT,
  p_shipping_state TEXT,
  p_shipping_postal_code TEXT,
  p_shipping_country TEXT,
  p_shipping_phone TEXT,
  p_billing_name TEXT,
  p_billing_street TEXT,
  p_billing_apartment TEXT,
  p_billing_city TEXT,
  p_billing_state TEXT,
  p_billing_postal_code TEXT,
  p_billing_country TEXT,
  p_billing_phone TEXT,
  p_subtotal DECIMAL,
  p_tax DECIMAL,
  p_shipping_cost DECIMAL,
  p_discount DECIMAL,
  p_total_amount DECIMAL,
  p_currency TEXT,
  p_payment_method TEXT,
  p_payment_status TEXT,
  p_shipping_method TEXT,
  p_notes TEXT,
  p_source TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_order_id UUID;
BEGIN
  -- Prüfen, ob der Benutzer angemeldet ist
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Benutzer nicht angemeldet';
  END IF;
  
  -- Prüfen, ob der übergebene Benutzer mit dem angemeldeten Benutzer übereinstimmt
  IF p_user_id != auth.uid() THEN
    RAISE EXCEPTION 'Nicht autorisiert, Bestellungen für andere Benutzer zu erstellen';
  END IF;

  -- Einfügen der Bestellung
  INSERT INTO reseller_orders (
    user_id, status, customer_name, customer_email, customer_phone,
    shipping_name, shipping_street, shipping_apartment, shipping_city, shipping_state,
    shipping_postal_code, shipping_country, shipping_phone,
    billing_name, billing_street, billing_apartment, billing_city, billing_state,
    billing_postal_code, billing_country, billing_phone,
    subtotal, tax, shipping_cost, discount, total_amount, currency,
    payment_method, payment_status, shipping_method, notes, source
  ) VALUES (
    p_user_id, p_status, p_customer_name, p_customer_email, p_customer_phone,
    p_shipping_name, p_shipping_street, p_shipping_apartment, p_shipping_city, p_shipping_state,
    p_shipping_postal_code, p_shipping_country, p_shipping_phone,
    p_billing_name, p_billing_street, p_billing_apartment, p_billing_city, p_billing_state,
    p_billing_postal_code, p_billing_country, p_billing_phone,
    p_subtotal, p_tax, p_shipping_cost, p_discount, p_total_amount, p_currency,
    p_payment_method, p_payment_status, p_shipping_method, p_notes, p_source
  ) RETURNING id INTO new_order_id;
  
  RETURN new_order_id;
END;
$$;

-- Funktion zum Hinzufügen von Bestellpositionen
CREATE OR REPLACE FUNCTION add_reseller_order_item(
  p_order_id UUID,
  p_product_id UUID,
  p_product_name TEXT,
  p_product_sku TEXT,
  p_variant_name TEXT,
  p_quantity INTEGER,
  p_unit_price DECIMAL,
  p_discount DECIMAL,
  p_tax_rate DECIMAL,
  p_subtotal DECIMAL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_item_id UUID;
  order_user_id UUID;
BEGIN
  -- Prüfen, ob der Benutzer angemeldet ist
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Benutzer nicht angemeldet';
  END IF;
  
  -- Prüfen, ob die Bestellung dem angemeldeten Benutzer gehört
  SELECT user_id INTO order_user_id FROM reseller_orders WHERE id = p_order_id;
  
  IF order_user_id != auth.uid() THEN
    RAISE EXCEPTION 'Nicht autorisiert, Bestellpositionen für andere Benutzer zu erstellen';
  END IF;

  -- Einfügen der Bestellposition
  INSERT INTO reseller_order_items (
    order_id, product_id, product_name, product_sku, variant_name,
    quantity, unit_price, discount, tax_rate, subtotal
  ) VALUES (
    p_order_id, p_product_id, p_product_name, p_product_sku, p_variant_name,
    p_quantity, p_unit_price, p_discount, p_tax_rate, p_subtotal
  ) RETURNING id INTO new_item_id;
  
  RETURN new_item_id;
END;
$$;
