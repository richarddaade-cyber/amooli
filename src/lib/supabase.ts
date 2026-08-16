import { createClient } from '@supabase/supabase-js';

// Environment variables or fallback defaults for Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://demo-test-platform.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.demo-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
