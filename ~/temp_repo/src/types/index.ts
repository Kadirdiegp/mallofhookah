import { Database } from './supabase';

// Product type
export type Product = Database['public']['Tables']['products']['Row'];
export type ProductInsert = Database['public']['Tables']['products']['Insert'];
export type ProductUpdate = Database['public']['Tables']['products']['Update'];

// Category type
export type Category = Database['public']['Tables']['categories']['Row'];
export type CategoryInsert = Database['public']['Tables']['categories']['Insert'];
export type CategoryUpdate = Database['public']['Tables']['categories']['Update'];

// Order type
export type Order = Database['public']['Tables']['orders']['Row'];
export type OrderInsert = Database['public']['Tables']['orders']['Insert'];
export type OrderUpdate = Database['public']['Tables']['orders']['Update'];

// Order item type
export type OrderItem = Database['public']['Tables']['order_items']['Row'];
export type OrderItemInsert = Database['public']['Tables']['order_items']['Insert'];
export type OrderItemUpdate = Database['public']['Tables']['order_items']['Update'];

// User profile type - auskommentieren, da profiles nicht in der Datenbank existiert
// export type Profile = Database['public']['Tables']['profiles']['Row'];
// export type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
// export type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

// Stattdessen einen benutzerdefinierten Typ verwenden
export type Profile = {
  id: string;
  user_id: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  email?: string;
  created_at?: string;
  updated_at?: string;
};

// Shopping cart item
export type CartItem = {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
};

// Shipping address
export type ShippingAddress = {
  id?: string | number; // ID für die Beziehung zur orders-Tabelle
  firstName: string;
  lastName: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
};

// Order status
export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

// Filter options
export type FilterOptions = {
  categories?: string[];
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'popularity';
  searchQuery?: string;
};
