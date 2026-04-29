import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const rawUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

const supabaseUrl = rawUrl?.trim().replace(/\/+$/, "");
const supabaseAnonKey = rawKey?.trim();

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (
  supabaseAnonKey &&
  !supabaseAnonKey.startsWith("eyJ") &&
  !supabaseAnonKey.startsWith("sb_publishable_")
) {
  // Loud warning so a wrong key (e.g. a secret or service_role) doesn't fail silently.
  // eslint-disable-next-line no-console
  console.error(
    "[supabase] VITE_SUPABASE_ANON_KEY does not look like an anon/publishable key. " +
      "Use the 'anon public' key from Supabase → Project Settings → API. " +
      "Never use a 'service_role' or 'sb_secret_' key in the browser.",
  );
}

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;
