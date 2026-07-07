import { Database } from './supabase/types'
import type { SupabaseClient } from '@supabase/supabase-js'

// Temporary utility to handle Supabase type inference issues
// This allows builds to proceed while we fix the root type issue

export type TypedSupabaseClient = SupabaseClient<Database>

/** Table or view names in the public schema (from the generated Database types). */
type Relation = keyof (Database['public']['Tables'] & Database['public']['Views']) & string

// Clean type assertion for Supabase operations
export function withTypedSupabase<T>(
  supabase: any,
  operation: (client: TypedSupabaseClient) => Promise<T>
): Promise<T> {
  return operation(supabase as TypedSupabaseClient)
}

// Shorthand for common operations
export const sb = {
  // Insert operation. Table names are checked against the generated schema;
  // results are intentionally untyped (callers narrow with their own shapes).
  async insert(
    supabase: any,
    table: Relation,
    data: any[]
  ): Promise<{ data: any; error: any }> {
    return await (supabase as any)
      .from(table)
      .insert(data)
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

  // Select operation. Same deal as insert: name-checked, loosely typed.
  select(
    supabase: any,
    table: Relation,
    select = '*'
  ): any {
    return (supabase as any)
      .from(table)
      .select(select)
  },

  // Update operation
  update(
    supabase: any,
    table: Relation,
    data: any
  ) {
    return ((supabase as any).from(table).update(data) as any)
  },

  // From operation for chaining. Same deal as select: name-checked, loosely typed.
  from(
    supabase: any,
    table: Relation
  ): any {
    return (supabase as any)
      .from(table)
  }
}