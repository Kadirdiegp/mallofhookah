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
      // Products table
      products: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          name: string
          description: string
          price: number
          stock: number
          category_id: string
          images: string[]
          featured: boolean
          sku: string
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          name: string
          description: string
          price: number
          stock: number
          category_id: string
          images?: string[]
          featured?: boolean
          sku: string
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          name?: string
          description?: string
          price?: number
          stock?: number
          category_id?: string
          images?: string[]
          featured?: boolean
          sku?: string
        }
      }
      // Categories table
      categories: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          name: string
          description: string
          parent_id: string | null
          image_url: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          name: string
          description: string
          parent_id?: string | null
          image_url?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          name?: string
          description?: string
          parent_id?: string | null
          image_url?: string | null
        }
      }
      // Orders table
      orders: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          user_id: string
          status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
          total: number
          shipping_address: Json
          billing_address: Json
          payment_intent_id: string | null
          shipping_method: string
          shipping_cost: number
          tax: number
          discount_code: string | null
          discount_amount: number
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id: string
          status?: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
          total: number
          shipping_address: Json
          billing_address: Json
          payment_intent_id?: string | null
          shipping_method: string
          shipping_cost: number
          tax: number
          discount_code?: string | null
          discount_amount?: number
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id?: string
          status?: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
          total?: number
          shipping_address?: Json
          billing_address?: Json
          payment_intent_id?: string | null
          shipping_method?: string
          shipping_cost?: number
          tax?: number
          discount_code?: string | null
          discount_amount?: number
        }
      }
      // Order items table
      order_items: {
        Row: {
          id: string
          created_at: string
          order_id: string
          product_id: string
          quantity: number
          price: number
        }
        Insert: {
          id?: string
          created_at?: string
          order_id: string
          product_id: string
          quantity: number
          price: number
        }
        Update: {
          id?: string
          created_at?: string
          order_id?: string
          product_id?: string
          quantity?: number
          price?: number
        }
      }
      // User profiles table
      profiles: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          first_name: string | null
          last_name: string | null
          phone: string | null
          address: Json | null
          is_admin: boolean
        }
        Insert: {
          id: string
          created_at?: string
          updated_at?: string
          first_name?: string | null
          last_name?: string | null
          phone?: string | null
          address?: Json | null
          is_admin?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          first_name?: string | null
          last_name?: string | null
          phone?: string | null
          address?: Json | null
          is_admin?: boolean
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
