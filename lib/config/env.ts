/**
 * Centralized environment variable configuration
 * Validates and provides consistent access to all environment variables
 */

// Supabase configuration
export const supabaseConfig = {
  // Public variables (available in browser)
  publicUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  publicAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,

  // Non-public variables (server-side only, for Edge Runtime)
  url: process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
  anonKey: process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
};

// Database configuration
export const databaseConfig = {
  poolingUrl: process.env.POOLING_DATABASE_URL,
  url: process.env.DATABASE_URL,
};

// App URL configuration (for redirects and API calls)
function getAppUrlFromEnv(): string {
  // Prefer NEXT_PUBLIC_APP_URL if set (should include protocol)
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }
  
  // VERCEL_URL doesn't include protocol, add it
  if (process.env.VERCEL_URL) {
    const vercelUrl = process.env.VERCEL_URL;
    // Check if it's localhost or already has protocol
    if (vercelUrl.startsWith("http://") || vercelUrl.startsWith("https://")) {
      return vercelUrl;
    }
    // Use https for Vercel deployments, http for localhost
    return vercelUrl.includes("localhost") || vercelUrl.includes("127.0.0.1")
      ? `http://${vercelUrl}`
      : `https://${vercelUrl}`;
  }
  
  // Default to localhost
  return "http://localhost:3000";
}

export const appConfig = {
  url: getAppUrlFromEnv(),
};

// Validate Supabase configuration
function validateSupabaseConfig() {
  // For client-side: require public variables
  if (typeof window !== "undefined") {
    if (!supabaseConfig.publicUrl) {
      throw new Error("NEXT_PUBLIC_SUPABASE_URL is required");
    }
    if (!supabaseConfig.publicAnonKey) {
      throw new Error("NEXT_PUBLIC_SUPABASE_ANON_KEY is required");
    }
  }

  // For server-side (including Edge Runtime): prefer non-public variables but allow public as fallback
  if (!supabaseConfig.url) {
    throw new Error(
      "SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL is required"
    );
  }
  if (!supabaseConfig.anonKey) {
    throw new Error(
      "SUPABASE_ANON_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY is required"
    );
  }
}

// Validate database configuration (only when needed)
export function validateDatabaseConfig() {
  if (!databaseConfig.poolingUrl && !databaseConfig.url) {
    throw new Error(
      "POOLING_DATABASE_URL or DATABASE_URL is required"
    );
  }
}

// Validate on module load (server-side only)
if (typeof window === "undefined") {
  validateSupabaseConfig();
}

// Export getters for validated values
export function getSupabaseUrl(): string {
  if (typeof window !== "undefined") {
    if (!supabaseConfig.publicUrl) {
      throw new Error("NEXT_PUBLIC_SUPABASE_URL is required");
    }
    return supabaseConfig.publicUrl;
  }
  if (!supabaseConfig.url) {
    throw new Error("SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL is required");
  }
  return supabaseConfig.url;
}

export function getSupabaseAnonKey(): string {
  if (typeof window !== "undefined") {
    if (!supabaseConfig.publicAnonKey) {
      throw new Error("NEXT_PUBLIC_SUPABASE_ANON_KEY is required");
    }
    return supabaseConfig.publicAnonKey;
  }
  if (!supabaseConfig.anonKey) {
    throw new Error(
      "SUPABASE_ANON_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY is required"
    );
  }
  return supabaseConfig.anonKey;
}

export function getDatabaseUrl(): string {
  validateDatabaseConfig();
  return databaseConfig.poolingUrl || databaseConfig.url!;
}

export function getAppUrl(): string {
  return appConfig.url;
}

