import { createClient } from "@supabase/supabase-js";

// The publishable key is public by design: row-level security protects every table.
// Env vars override these for other Supabase projects (see .env.example).
const url = import.meta.env["VITE_SUPABASE_URL"] ?? "https://zfnlftgwjwugxnymkuzi.supabase.co";
const key =
  import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"] ??
  "sb_publishable_zJC-Z7FWVhKrIIJdA3A7Jw_h2cp4uAL";

export const supabase = createClient(url, key, {
  // Implicit flow, so email confirmation links work even when opened on another device.
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
});
