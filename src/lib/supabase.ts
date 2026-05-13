import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string) || 'https://dwosrwbutepaifdwiitl.supabase.co';
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR3b3Nyd2J1dGVwYWlmZHdpaXRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxNTQ3NTcsImV4cCI6MjA5MzczMDc1N30.r0JBp8eMdRzdgm4C9kqMG9icTcVbMJJDsAXaPoqPdPs';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
