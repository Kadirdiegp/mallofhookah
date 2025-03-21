import { supabase } from './supabase';
import { Product } from '../types/supabase';

export const productService = {
  // Get all products
  getAllProducts: async (): Promise<Product[]> => {
    const { data, error } = await supabase
      .from('products')
      .select('*');
    
    if (error) throw error;
    return data || [];
  },

  // Get featured products
  getFeaturedProducts: async (): Promise<Product[]> => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('featured', true)
      .limit(6);
    
    if (error) throw error;
    return data || [];
  },

  // Get products by category slug (e.g., 'hookahs', 'vapes', 'tobacco', 'accessories')
  getProductsByCategory: async (categorySlug: string): Promise<Product[]> => {
    // First get the category ID
    const { data: categoryData, error: categoryError } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', categorySlug)
      .single();
    
    if (categoryError) throw categoryError;
    
    if (!categoryData) {
      throw new Error(`Category with slug ${categorySlug} not found`);
    }
    
    // Then get products with that category ID
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('category_id', categoryData.id);
    
    if (error) throw error;
    return data || [];
  },

  // Get a single product by slug
  getProductBySlug: async (slug: string): Promise<Product> => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('slug', slug)
      .single();
    
    if (error) throw error;
    if (!data) throw new Error(`Product with slug ${slug} not found`);
    
    return data;
  },

  // Search products by name or description
  searchProducts: async (query: string): Promise<Product[]> => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .or(`name.ilike.%${query}%,description.ilike.%${query}%`);
    
    if (error) throw error;
    return data || [];
  }
};
