export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      // Categories table
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          image_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      
      // Products table
      products: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          name: string
          slug: string
          description: string | null
          price: number
          discount_price: number | null
          stock: number
          category_id: string
          images: string[] | null
          featured: boolean | null
          sku: string | null
          weight: number | null
          dimensions: Json | null
          metadata: Json | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          name: string
          slug: string
          description?: string | null
          price: number
          discount_price?: number | null
          stock?: number
          category_id: string
          images?: string[] | null
          featured?: boolean | null
          sku?: string | null
          weight?: number | null
          dimensions?: Json | null
          metadata?: Json | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          name?: string
          slug?: string
          description?: string | null
          price?: number
          discount_price?: number | null
          stock?: number
          category_id?: string
          images?: string[] | null
          featured?: boolean | null
          sku?: string | null
          weight?: number | null
          dimensions?: Json | null
          metadata?: Json | null
        }
      }
      
      // Product Tags table
      product_tags: {
        Row: {
          id: string
          name: string
          slug: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          created_at?: string
        }
      }
      
      // Product to Tags junction table
      product_to_tags: {
        Row: {
          product_id: string
          tag_id: string
        }
        Insert: {
          product_id: string
          tag_id: string
        }
        Update: {
          product_id?: string
          tag_id?: string
        }
      }
      
      // Addresses table
      addresses: {
        Row: {
          id: string
          user_id: string
          first_name: string
          last_name: string
          street_address: string
          apartment: string | null
          city: string
          state: string
          postal_code: string
          country: string
          phone: string
          is_default_shipping: boolean | null
          is_default_billing: boolean | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          first_name: string
          last_name: string
          street_address: string
          apartment?: string | null
          city: string
          state: string
          postal_code: string
          country?: string
          phone: string
          is_default_shipping?: boolean | null
          is_default_billing?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          first_name?: string
          last_name?: string
          street_address?: string
          apartment?: string | null
          city?: string
          state?: string
          postal_code?: string
          country?: string
          phone?: string
          is_default_shipping?: boolean | null
          is_default_billing?: boolean | null
          created_at?: string
          updated_at?: string
        }
      }
      
      // Orders table
      orders: {
        Row: {
          id: string
          user_id: string
          status: string
          shipping_address_id: string
          billing_address_id: string
          subtotal: number
          shipping_cost: number
          tax_amount: number
          discount_amount: number
          total_amount: number
          payment_method: string | null
          payment_status: string | null
          tracking_number: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          status?: string
          shipping_address_id: string
          billing_address_id: string
          subtotal: number
          shipping_cost?: number
          tax_amount?: number
          discount_amount?: number
          total_amount: number
          payment_method?: string | null
          payment_status?: string | null
          tracking_number?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          status?: string
          shipping_address_id?: string
          billing_address_id?: string
          subtotal?: number
          shipping_cost?: number
          tax_amount?: number
          discount_amount?: number
          total_amount?: number
          payment_method?: string | null
          payment_status?: string | null
          tracking_number?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      
      // Order Items table
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string
          quantity: number
          price_per_unit: number
          total_price: number
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          product_id: string
          quantity: number
          price_per_unit: number
          total_price: number
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string
          quantity?: number
          price_per_unit?: number
          total_price?: number
          created_at?: string
        }
      }
      
      // Reviews table
      reviews: {
        Row: {
          id: string
          product_id: string
          user_id: string
          rating: number
          title: string | null
          comment: string | null
          is_verified_purchase: boolean | null
          is_approved: boolean | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          product_id: string
          user_id: string
          rating: number
          title?: string | null
          comment?: string | null
          is_verified_purchase?: boolean | null
          is_approved?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          user_id?: string
          rating?: number
          title?: string | null
          comment?: string | null
          is_verified_purchase?: boolean | null
          is_approved?: boolean | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

export type Product = Database['public']['Tables']['products']['Row']
export type Category = Database['public']['Tables']['categories']['Row']
export type ProductTag = Database['public']['Tables']['product_tags']['Row']
export type Order = Database['public']['Tables']['orders']['Row']
export type OrderItem = Database['public']['Tables']['order_items']['Row']
export type Address = Database['public']['Tables']['addresses']['Row']
export type Review = Database['public']['Tables']['reviews']['Row']
