export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// BIFL-specific database types matching your complete schema
export interface Database {
  public: {
    Tables: {
      products: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          excerpt: string | null
          brand_id: string | null
          category_id: string | null
          primary_material_id: string | null
          price_range_id: string | null
          durability_score: number | null
          repairability_score: number | null
          sustainability_score: number | null
          social_score: number | null
          warranty_score: number | null
          bifl_total_score: number | null
          star_rating: number | null
          price: number | null
          dimensions: string | null
          weight: string | null
          lifespan_expectation: number | null
          warranty_years: number | null
          featured_image_url: string | null
          gallery_images: Json
          affiliate_link: string | null
          manufacturer_link: string | null
          pros: Json
          cons: Json
          pros_cons: Json
          key_features: Json
          verdict_summary: string | null
          verdict_bullets: Json
          durability_notes: string | null
          repairability_notes: string | null
          sustainability_notes: string | null
          social_notes: string | null
          warranty_notes: string | null
          general_notes: string | null
          country_of_origin: string | null
          manufacturing_notes: string | null
          use_case: string | null
          optimized_product_description: string | null
          care_and_maintenance: Json
          faq_1_q: string | null
          faq_1_a: string | null
          faq_2_q: string | null
          faq_2_a: string | null
          faq_3_q: string | null
          faq_3_a: string | null
          faq_4_q: string | null
          faq_4_a: string | null
          faq_5_q: string | null
          faq_5_a: string | null
          pro_1: string | null
          pro_2: string | null
          pro_3: string | null
          pro_4: string | null
          con_1: string | null
          con_2: string | null
          con_3: string | null
          con_4: string | null
          wordpress_id: number | null
          wordpress_meta: Json
          is_featured: boolean
          status: string
          view_count: number
          review_count: number
          average_rating: number | null
          meta_title: string | null
          meta_description: string | null
          bifl_certification: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          excerpt?: string | null
          brand_id?: string | null
          category_id?: string | null
          primary_material_id?: string | null
          price_range_id?: string | null
          durability_score?: number | null
          repairability_score?: number | null
          sustainability_score?: number | null
          social_score?: number | null
          warranty_score?: number | null
          bifl_total_score?: number | null
          star_rating?: number | null
          price?: number | null
          dimensions?: string | null
          weight?: string | null
          lifespan_expectation?: number | null
          warranty_years?: number | null
          featured_image_url?: string | null
          gallery_images?: Json
          affiliate_link?: string | null
          manufacturer_link?: string | null
          pros?: Json
          cons?: Json
          pros_cons?: Json
          key_features?: Json
          verdict_summary?: string | null
          verdict_bullets?: Json
          durability_notes?: string | null
          repairability_notes?: string | null
          sustainability_notes?: string | null
          social_notes?: string | null
          warranty_notes?: string | null
          general_notes?: string | null
          country_of_origin?: string | null
          manufacturing_notes?: string | null
          use_case?: string | null
          optimized_product_description?: string | null
          care_and_maintenance?: Json
          faq_1_q?: string | null
          faq_1_a?: string | null
          faq_2_q?: string | null
          faq_2_a?: string | null
          faq_3_q?: string | null
          faq_3_a?: string | null
          faq_4_q?: string | null
          faq_4_a?: string | null
          faq_5_q?: string | null
          faq_5_a?: string | null
          pro_1?: string | null
          pro_2?: string | null
          pro_3?: string | null
          pro_4?: string | null
          con_1?: string | null
          con_2?: string | null
          con_3?: string | null
          con_4?: string | null
          wordpress_id?: number | null
          wordpress_meta?: Json
          is_featured?: boolean
          status?: string
          view_count?: number
          review_count?: number
          average_rating?: number | null
          meta_title?: string | null
          meta_description?: string | null
          bifl_certification?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          excerpt?: string | null
          brand_id?: string | null
          category_id?: string | null
          primary_material_id?: string | null
          price_range_id?: string | null
          durability_score?: number | null
          repairability_score?: number | null
          sustainability_score?: number | null
          social_score?: number | null
          warranty_score?: number | null
          bifl_total_score?: number | null
          star_rating?: number | null
          price?: number | null
          dimensions?: string | null
          weight?: string | null
          lifespan_expectation?: number | null
          warranty_years?: number | null
          featured_image_url?: string | null
          gallery_images?: Json
          affiliate_link?: string | null
          manufacturer_link?: string | null
          pros?: Json
          cons?: Json
          pros_cons?: Json
          key_features?: Json
          verdict_summary?: string | null
          verdict_bullets?: Json
          durability_notes?: string | null
          repairability_notes?: string | null
          sustainability_notes?: string | null
          social_notes?: string | null
          warranty_notes?: string | null
          general_notes?: string | null
          country_of_origin?: string | null
          manufacturing_notes?: string | null
          use_case?: string | null
          optimized_product_description?: string | null
          care_and_maintenance?: Json
          faq_1_q?: string | null
          faq_1_a?: string | null
          faq_2_q?: string | null
          faq_2_a?: string | null
          faq_3_q?: string | null
          faq_3_a?: string | null
          faq_4_q?: string | null
          faq_4_a?: string | null
          faq_5_q?: string | null
          faq_5_a?: string | null
          pro_1?: string | null
          pro_2?: string | null
          pro_3?: string | null
          pro_4?: string | null
          con_1?: string | null
          con_2?: string | null
          con_3?: string | null
          con_4?: string | null
          wordpress_id?: number | null
          wordpress_meta?: Json
          is_featured?: boolean
          status?: string
          view_count?: number
          review_count?: number
          average_rating?: number | null
          meta_title?: string | null
          meta_description?: string | null
          bifl_certification?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }
      brands: {
        Row: {
          id: string
          name: string
          slug: string
          website: string | null
          description: string | null
          country: string | null
          founded_year: number | null
          warranty_info: string | null
          reputation_score: number | null
          logo_url: string | null
          is_featured: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          website?: string | null
          description?: string | null
          country?: string | null
          founded_year?: number | null
          warranty_info?: string | null
          reputation_score?: number | null
          logo_url?: string | null
          is_featured?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          website?: string | null
          description?: string | null
          country?: string | null
          founded_year?: number | null
          warranty_info?: string | null
          reputation_score?: number | null
          logo_url?: string | null
          is_featured?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          parent_id: string | null
          description: string | null
          icon_url: string | null
          display_order: number
          is_featured: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          parent_id?: string | null
          description?: string | null
          icon_url?: string | null
          display_order?: number
          is_featured?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          parent_id?: string | null
          description?: string | null
          icon_url?: string | null
          display_order?: number
          is_featured?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      materials: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          sustainability_rating: number | null
          durability_factor: number | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          sustainability_rating?: number | null
          durability_factor?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          sustainability_rating?: number | null
          durability_factor?: number | null
          created_at?: string
        }
      }
      price_ranges: {
        Row: {
          id: string
          name: string
          slug: string
          min_price: number | null
          max_price: number | null
          description: string | null
          display_order: number
        }
        Insert: {
          id?: string
          name: string
          slug: string
          min_price?: number | null
          max_price?: number | null
          description?: string | null
          display_order?: number
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          min_price?: number | null
          max_price?: number | null
          description?: string | null
          display_order?: number
        }
      }
      certifications: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          icon_url: string | null
          issuing_body: string | null
          criteria: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          icon_url?: string | null
          issuing_body?: string | null
          criteria?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          icon_url?: string | null
          issuing_body?: string | null
          criteria?: string | null
          created_at?: string
        }
      }
      tags: {
        Row: {
          id: string
          name: string
          slug: string
          category: string | null
          usage_count: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          category?: string | null
          usage_count?: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          category?: string | null
          usage_count?: number
          created_at?: string
        }
      }
      reviews: {
        Row: {
          id: string
          product_id: string
          user_email: string
          user_name: string | null
          overall_rating: number
          durability_rating: number | null
          repairability_rating: number | null
          warranty_rating: number | null
          social_rating: number | null
          title: string | null
          content: string | null
          pros: Json
          cons: Json
          years_owned: number | null
          still_works: boolean | null
          would_buy_again: boolean | null
          verified_purchase: boolean
          images: Json
          status: string
          helpful_count: number
          reported_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          product_id: string
          user_email: string
          user_name?: string | null
          overall_rating: number
          durability_rating?: number | null
          repairability_rating?: number | null
          warranty_rating?: number | null
          social_rating?: number | null
          title?: string | null
          content?: string | null
          pros?: Json
          cons?: Json
          years_owned?: number | null
          still_works?: boolean | null
          would_buy_again?: boolean | null
          verified_purchase?: boolean
          images?: Json
          status?: string
          helpful_count?: number
          reported_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          user_email?: string
          user_name?: string | null
          overall_rating?: number
          durability_rating?: number | null
          repairability_rating?: number | null
          warranty_rating?: number | null
          social_rating?: number | null
          title?: string | null
          content?: string | null
          pros?: Json
          cons?: Json
          years_owned?: number | null
          still_works?: boolean | null
          would_buy_again?: boolean | null
          verified_purchase?: boolean
          images?: Json
          status?: string
          helpful_count?: number
          reported_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      vendors: {
        Row: {
          id: string
          name: string
          slug: string
          website: string | null
          affiliate_program: boolean
          commission_rate: number | null
          shipping_info: string | null
          return_policy: string | null
          reputation_score: number | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          website?: string | null
          affiliate_program?: boolean
          commission_rate?: number | null
          shipping_info?: string | null
          return_policy?: string | null
          reputation_score?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          website?: string | null
          affiliate_program?: boolean
          commission_rate?: number | null
          shipping_info?: string | null
          return_policy?: string | null
          reputation_score?: number | null
          created_at?: string
        }
      }
      product_vendors: {
        Row: {
          id: string
          product_id: string
          vendor_id: string
          product_url: string | null
          current_price: number | null
          is_available: boolean
          last_checked: string
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          vendor_id: string
          product_url?: string | null
          current_price?: number | null
          is_available?: boolean
          last_checked?: string
          created_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          vendor_id?: string
          product_url?: string | null
          current_price?: number | null
          is_available?: boolean
          last_checked?: string
          created_at?: string
        }
      }
      product_materials: {
        Row: {
          product_id: string
          material_id: string
          is_primary: boolean
          percentage: number | null
        }
        Insert: {
          product_id: string
          material_id: string
          is_primary?: boolean
          percentage?: number | null
        }
        Update: {
          product_id?: string
          material_id?: string
          is_primary?: boolean
          percentage?: number | null
        }
      }
      product_tags: {
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
      product_certifications: {
        Row: {
          product_id: string
          certification_id: string
          certified_date: string | null
          expiry_date: string | null
        }
        Insert: {
          product_id: string
          certification_id: string
          certified_date?: string | null
          expiry_date?: string | null
        }
        Update: {
          product_id?: string
          certification_id?: string
          certified_date?: string | null
          expiry_date?: string | null
        }
      }
      product_faqs: {
        Row: {
          id: string
          product_id: string
          question: string
          answer: string
          display_order: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          product_id: string
          question: string
          answer: string
          display_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          question?: string
          answer?: string
          display_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      admin_users: {
        Row: {
          id: string
          email: string
          password_hash: string
          name: string
          role: string
          is_active: boolean
          last_login: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          password_hash: string
          name: string
          role: string
          is_active?: boolean
          last_login?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          password_hash?: string
          name?: string
          role?: string
          is_active?: boolean
          last_login?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      _admin_setup: {
        Row: {
          id: string
          setup_complete: boolean
          created_at: string
        }
        Insert: {
          id?: string
          setup_complete: boolean
          created_at?: string
        }
        Update: {
          id?: string
          setup_complete?: boolean
          created_at?: string
        }
      }
    }
    Views: {
      products_with_taxonomy: {
        Row: {
          id: string | null
          name: string | null
          slug: string | null
          description: string | null
          brand_name: string | null
          brand_slug: string | null
          category_name: string | null
          category_slug: string | null
          material_name: string | null
          price_range_name: string | null
          durability_score: number | null
          repairability_score: number | null
          warranty_score: number | null
          sustainability_score: number | null
          social_score: number | null
          bifl_total_score: number | null
          featured_image_url: string | null
          price: number | null
          lifespan_expectation: number | null
          tag_names: string[] | null
          certification_names: string[] | null
          created_at: string | null
        }
      }
      featured_products: {
        Row: {
          id: string | null
          name: string | null
          slug: string | null
          brand_name: string | null
          brand_slug: string | null
          category_name: string | null
          category_slug: string | null
          material_name: string | null
          price_range_name: string | null
          bifl_total_score: number | null
          featured_image_url: string | null
          created_at: string | null
        }
      }
      user_recently_viewed: {
        Row: {
          id: string
          user_email: string
          product_id: string
          viewed_at: string
        }
        Insert: {
          id?: string
          user_email: string
          product_id: string
          viewed_at?: string
        }
        Update: {
          id?: string
          user_email?: string
          product_id?: string
          viewed_at?: string
        }
      }
      user_favorites: {
        Row: {
          id: string
          user_email: string
          product_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_email: string
          product_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_email?: string
          product_id?: string
          created_at?: string
        }
      }
    }
    Functions: {
      calculate_bifl_score: {
        Args: {
          dur_score: number
          rep_score: number
          sus_score: number
          soc_score: number
          war_score: number
        }
        Returns: number
      }
      exec_sql: {
        Args: {
          sql: string
        }
        Returns: undefined
      }
      create_admin_users_table: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      create_admin_users_table_if_not_exists: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      increment_helpful_count: {
        Args: {
          review_id: string
        }
        Returns: undefined
      }
      increment_report_count: {
        Args: {
          review_id: string
        }
        Returns: undefined
      }
    }
    Enums: {
      user_role: 'free' | 'premium' | 'admin'
      review_status: 'pending' | 'approved' | 'rejected' | 'spam'
      product_status: 'draft' | 'published' | 'archived'
      tag_category: 'feature' | 'use-case' | 'material' | 'style' | 'quality' | 'warranty' | 'origin'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}