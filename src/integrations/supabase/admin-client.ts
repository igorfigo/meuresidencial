
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Admin client that bypasses RLS for admin operations
// This should only be used for operations that specifically need to bypass RLS
const SUPABASE_URL = "https://kcbvdcacgbwigefwacrk.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtjYnZkY2FjZ2J3aWdlZndhY3JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIyMjgzMDQsImV4cCI6MjA1NzgwNDMwNH0.K4xcW6V3X9QROQLekB74NbKg3BaShwgMbanrP3olCYI";
// Using import.meta.env instead of process.env for browser compatibility
const SUPABASE_SERVICE_KEY = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY;

// Create client with service role key to bypass RLS
export const adminClient = createClient<Database>(
  SUPABASE_URL, 
  SUPABASE_SERVICE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
    global: {
      headers: {
        'X-Client-Info': 'admin-client-bypass-rls',
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`, // Explicitly add the Authorization header
      },
    },
  }
);

// For debugging purposes
console.log('Admin client initialized with service role key:', SUPABASE_SERVICE_KEY === SUPABASE_ANON_KEY ? 'Using ANON KEY (fallback)' : 'Using SERVICE KEY');
