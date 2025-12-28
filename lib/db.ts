
/**
 * Neon + Netlify Configuration
 * Unlike Supabase, Neon is accessed via Netlify Functions (Serverless).
 * This file checks if the environment is ready for API calls.
 */

const getEnv = (key: string) => {
  try {
    // @ts-ignore
    return import.meta.env?.[key] || "";
  } catch {
    return "";
  }
};

// Netlify sites typically use an environment variable to toggle production features
// or a specific API URL for Netlify Functions.
export const API_URL = getEnv('VITE_API_URL') || '/.netlify/functions';

// Check if we are in a configured environment
export const isDatabaseConfigured = Boolean(getEnv('VITE_DATABASE_CONNECTED') === 'true');

/**
 * Standard fetch wrapper for Netlify Functions
 */
export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  if (!isDatabaseConfigured) {
    throw new Error("Database not configured. Using local state.");
  }
  
  const response = await fetch(`${API_URL}/${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'API Error' }));
    throw new Error(error.message || 'Request failed');
  }
  
  return response.json();
};
