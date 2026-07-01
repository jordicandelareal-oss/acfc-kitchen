import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Variables de entorno de Supabase no configuradas. Revisa .env');
}

export const supabase = createClient(
  supabaseUrl || 'https://aosweyggyalowhogjatz.supabase.co',
  supabaseAnonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFvc3dleWdneWFsb3dob2dqYXR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI4NjQzOTUsImV4cCI6MjA5ODQ0MDM5NX0.od5Zg10H_EflslfXYksolRAu81nFi2zd0vZRXDeqrcs'
);
