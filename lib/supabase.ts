
import { createClient } from '@supabase/supabase-js';

/**
 * Supabase Configuration for ClassFit Varna
 */
const getEnv = (key: string) => {
  try {
    // @ts-ignore
    return import.meta.env?.[key] || "";
  } catch {
    return "";
  }
};

// Use provided keys as primary, fallback to environment variables
const supabaseUrl = "https://loapkgdmfatmxmstjawz.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvYXBrZ2RtZmF0bXhtc3RqYXd6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjMzMTgyMCwiZXhwIjoyMDgxOTA3ODIwfQ.uXNyzMwcjTwhAbwSfNUeUciFt4bqbp9SaIyr_ZaZdqQ";

// Fallback logic for production environment variables
const finalUrl = getEnv('VITE_SUPABASE_URL') || supabaseUrl;
const finalKey = getEnv('VITE_SUPABASE_ANON_KEY') || supabaseAnonKey;

export const isSupabaseConfigured = Boolean(
  finalUrl && 
  finalUrl.startsWith('https://') && 
  finalKey
);

export const supabase = isSupabaseConfigured
  ? createClient(finalUrl, finalKey)
  : null as any;

if (!isSupabaseConfigured) {
  console.warn("Supabase not configured. Running in Demo Mode.");
}
