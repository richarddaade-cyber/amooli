import { createClient } from '@supabase/supabase-js';

export function getSupabaseClient() {
  try {
    const customUrl = localStorage.getItem('preppulse_supabase_url');
    const customKey = localStorage.getItem('preppulse_supabase_anon_key');

    const url = customUrl?.trim() || import.meta.env.VITE_SUPABASE_URL || 'https://demo-test-platform.supabase.co';
    const key = customKey?.trim() || import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.demo-anon-key';

    return createClient(url, key);
  } catch (e) {
    return createClient(
      import.meta.env.VITE_SUPABASE_URL || 'https://demo-test-platform.supabase.co',
      import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.demo-anon-key'
    );
  }
}

export const supabase = getSupabaseClient();
