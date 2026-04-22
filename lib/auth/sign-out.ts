"use server";

import { AUTH_ROUTES } from "@/lib/auth/routes";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect(AUTH_ROUTES.SIGN_IN);
}
