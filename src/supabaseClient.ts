import { createClient, SupabaseClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  dotenv.config();
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error(
      "SUPABASE_URL and SUPABASE_ANON_KEY must be set in environment variables"
    );
  }
  if (!client) {
    client = createClient(url, key);
  }
  return client;
}
