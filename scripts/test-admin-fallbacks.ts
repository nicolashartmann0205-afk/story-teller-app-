/**
 * Smoke-test admin Supabase fallbacks (uses .env.local).
 * Usage: pnpm exec tsx scripts/test-admin-fallbacks.ts
 */
import { config } from "dotenv";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";
import { isPoolingUrlLikelyBroken } from "../lib/db/pooling-url-health";

config({ path: resolve(process.cwd(), ".env") });
config({ path: resolve(process.cwd(), ".env.local") });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

async function main() {
  console.log("poolingBroken:", isPoolingUrlLikelyBroken());
  console.log("hasServiceRole:", Boolean(serviceKey));

  if (!url || !anon) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or ANON_KEY");
    process.exit(1);
  }

  const client = serviceKey
    ? createClient(url, serviceKey, { auth: { persistSession: false } })
    : createClient(url, anon);

  const { count: feedbackCount, error: fbErr } = await client
    .from("feedback_submissions")
    .select("*", { count: "exact", head: true });
  console.log("feedback_submissions count:", feedbackCount, fbErr?.message ?? "ok");

  const { data: blogRows, error: blogErr } = await client
    .from("blog_posts")
    .select("slug, seo_title, meta_description, canonical_url")
    .limit(3);
  console.log("blog_posts sample:", blogRows?.length ?? 0, blogErr?.message ?? "ok");

  const { count: usersCount, error: usersErr } = await client
    .from("users")
    .select("*", { count: "exact", head: true });
  console.log("users count (no JWT — expect RLS block):", usersCount, usersErr?.message ?? "ok");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
