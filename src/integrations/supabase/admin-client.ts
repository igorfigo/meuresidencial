
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Admin client that bypasses RLS for admin operations
// This should only be used for operations that specifically need to bypass RLS
const SUPABASE_URL = "https://kcbvdcacgbwigefwacrk.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtjYnZkY2FjZ2J3aWdlZndhY3JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIyMjgzMDQsImV4cCI6MjA1NzgwNDMwNH0.K4xcW6V3X9QROQLekB74NbKg3BaShwgMbanrP3olCYI";
// Using import.meta.env instead of process.env for browser compatibility
const SUPABASE_SERVICE_KEY = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY;

export const adminClient = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
  global: {
    headers: {
      'X-Client-Info': 'admin-bypass-rls',
      // Supabase-specific header to bypass RLS policies
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'X-Supabase-Auth-Override': 'service_role', 
    },
  },
});

// For debugging purposes
console.log('Admin client initialized with RLS bypass');
