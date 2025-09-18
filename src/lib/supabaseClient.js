import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kgzvjkuxhhanomuzjyfj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtnenZqa3V4aGhhbm9tdXpqeWZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1MTI5NzYsImV4cCI6MjA2MzA4ODk3Nn0.D0mZV1SFSUKeg5-NOqkLvhdPnamHBc1VqOCGfqFMwjw';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Supabase URL or Anon Key is missing. Please check your environment variables or configuration.");
  throw new Error("Supabase URL or Anon Key is missing.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: localStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

export const checkSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase.rpc('get_all_table_names_excluding_system');

    if (error) {
      console.error('Supabase connection check failed (RPC get_all_table_names_excluding_system error):', error);
      return { status: 'error', error: error.message };
    }
    console.log('Supabase connection check successful. Tables found (sample):', data ? data.slice(0,3) : 'No data');
    return { status: 'connected', data: data };
  } catch (e) {
    console.error('Supabase connection check failed (exception):', e);
    return { status: 'error', error: e.message };
  }
};