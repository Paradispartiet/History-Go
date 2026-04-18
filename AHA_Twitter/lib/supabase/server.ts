import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/database";
import { getSupabaseEnv } from "@/lib/supabase/env";

type CookieOptions = Parameters<Awaited<ReturnType<typeof cookies>>["set"]>[2];

interface CookieToSet {
  name: string;
  value: string;
  options?: CookieOptions;
}

export async function createServerSupabaseClient() {
  const cookieStore = await cookies();
  const { url, anonKey } = getSupabaseEnv();

  return createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: CookieToSet[]) {
        cookiesToSet.forEach(({ name, value, options }) => {
          if (options) {
            cookieStore.set(name, value, options);
            return;
          }

          cookieStore.set(name, value);
        });
      },
    },
  });
}
