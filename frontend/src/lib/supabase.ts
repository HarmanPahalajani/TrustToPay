import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || "https://hhairrdsjiucrmbpafqg.supabase.co";
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY || "sb_publishable_YjhHG2sEGPzzL5BxPzXI5Q_q2RGnNmB";

export const isSupabaseConfigured = Boolean(
  !import.meta.env.VITEST &&
  supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.startsWith("http") &&
    !supabaseUrl.includes("placeholder"),
);

// Fallback mock client for local development / testing without live Supabase credentials
function createFallbackSupabaseClient(): SupabaseClient {
  return createClient(
    supabaseUrl || "https://placeholder-project.supabase.co",
    supabaseAnonKey || "placeholder-anon-key-for-local-dev-and-testing",
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    },
  );
}

export const supabase: SupabaseClient = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: "pkce",
      },
    })
  : createFallbackSupabaseClient();
