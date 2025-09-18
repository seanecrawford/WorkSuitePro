import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kgzvjkuxhhanomuzjyfj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtnenZqa3V4aGhhbm9tdXpqeWZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1MTI5NzYsImV4cCI6MjA2MzA4ODk3Nn0.D0mZV1SFSUKeg5-NOqkLvhdPnamHBc1VqOCGfqFMwjw';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);