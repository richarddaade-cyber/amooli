import { createClient } from '@supabase/supabase-js';

// Authoritative Programmatic Supabase Connection Credentials
export const HARDCODED_SUPABASE_URL = 'https://qnhfezttdqygbdowjjui.supabase.co';
export const HARDCODED_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFuaGZlenR0ZHF5Z2Jkb3dqanVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY4Mjg5OTEsImV4cCI6MjEwMjQwNDk5MX0.W8iik5UCGxzL_982oeLPxDowuGpDlo4sPg6NmermPlQ';

export function getSupabaseClient() {
  try {
    const customUrl = localStorage.getItem('preppulse_supabase_url');
    const customKey = localStorage.getItem('preppulse_supabase_anon_key');

    const url =
      customUrl && customUrl.trim() && !customUrl.includes('demo-test-platform')
        ? customUrl.trim()
        : import.meta.env.VITE_SUPABASE_URL || HARDCODED_SUPABASE_URL;

    const key =
      customKey && customKey.trim() && !customKey.includes('demo-anon-key')
        ? customKey.trim()
        : import.meta.env.VITE_SUPABASE_ANON_KEY || HARDCODED_SUPABASE_ANON_KEY;

    return createClient(url, key);
  } catch (e) {
    return createClient(HARDCODED_SUPABASE_URL, HARDCODED_SUPABASE_ANON_KEY);
  }
}

export const supabase = getSupabaseClient();
