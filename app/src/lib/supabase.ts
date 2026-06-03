import { createClient } from "@supabase/supabase-js";

function cleanEnvValue(value: unknown) {
  return String(value ?? "")
    .trim()
    .replace(/^['"]|['"]$/g, "")
    .trim();
}

function normalizeSupabaseUrl(value: unknown) {
  const rawUrl = cleanEnvValue(value);

  if (!rawUrl) {
    throw new Error("Missing VITE_SUPABASE_URL");
  }

  if (/^postgres(?:ql)?:\/\//i.test(rawUrl)) {
    throw new Error(
      "VITE_SUPABASE_URL must be the Supabase API URL, not a database connection string.",
    );
  }

  const withoutRestPath = rawUrl.replace(/\/+$/g, "").replace(/\/rest\/v1$/i, "");
  let parsedUrl: URL;

  try {
    parsedUrl = new URL(withoutRestPath);
  } catch {
    throw new Error("VITE_SUPABASE_URL must be a valid URL like https://project-ref.supabase.co");
  }

  if (parsedUrl.protocol !== "https:" || !parsedUrl.hostname.endsWith(".supabase.co")) {
    throw new Error("VITE_SUPABASE_URL must use the format https://project-ref.supabase.co");
  }

  parsedUrl.pathname = "";
  parsedUrl.search = "";
  parsedUrl.hash = "";

  return parsedUrl.toString().replace(/\/$/, "");
}

const supabaseUrl = normalizeSupabaseUrl(import.meta.env.VITE_SUPABASE_URL);
const supabaseAnonKey = cleanEnvValue(import.meta.env.VITE_SUPABASE_ANON_KEY);

if (!supabaseAnonKey) {
  throw new Error("Missing VITE_SUPABASE_ANON_KEY");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
