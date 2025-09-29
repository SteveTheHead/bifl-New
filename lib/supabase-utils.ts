import { Database } from './supabase/types'
import type { SupabaseClient } from '@supabase/supabase-js'

// Temporary utility to handle Supabase type inference issues
// This allows builds to proceed while we fix the root type issue

export type TypedSupabaseClient = SupabaseClient<Database>

// Clean type assertion for Supabase operations
export function withTypedSupabase<T>(
  supabase: any,
  operation: (client: TypedSupabaseClient) => Promise<T>
): Promise<T> {
  return operation(supabase as TypedSupabaseClient)
}

// Shorthand for common operations
export const sb = {
  // Insert operation - using flexible string type for table names
  async insert(
    supabase: any,
    table: string,
    data: any[]
  ) {
    return await (supabase as TypedSupabaseClient)
      .from(table as any)
      .insert(data as any)
      .select()
  },

  // RPC operation
  async rpc<T extends keyof Database['public']['Functions']>(
    supabase: any,
    fn: T,
    params?: Database['public']['Functions'][T]['Args']
  ) {
    return await (supabase as TypedSupabaseClient).rpc(fn, params as any)
  },

  // Select operation - using flexible string type for table names
  select(
    supabase: any,
    table: string,
    select = '*'
  ) {
    return (supabase as TypedSupabaseClient)
      .from(table as any)
      .select(select)
  },

  // Update operation
  update(
    supabase: any,
    table: string,
    data: any
  ) {
    return ((supabase as any).from(table).update(data) as any)
  },

  // From operation for chaining
  from(
    supabase: any,
    table: string
  ) {
    return (supabase as TypedSupabaseClient)
      .from(table as any)
  }
}