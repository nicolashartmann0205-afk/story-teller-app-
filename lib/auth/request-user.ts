import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export type RequestUser = {
  id: string;
  email?: string | null;
  user_metadata?: {
    display_name?: string | null;
  };
};

export async function getRequestUser(): Promise<{
  user: RequestUser | null;
  source: "supabase" | "middleware-header" | "none";
  error: Error | null;
}> {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (user && !error) {
    return {
      user: {
        id: user.id,
        email: user.email,
        user_metadata: {
          display_name:
            typeof user.user_metadata?.display_name === "string"
              ? user.user_metadata.display_name
              : null,
        },
      },
      source: "supabase",
      error: null,
    };
  }

  const headerList = await headers();
  const fallbackUserId = headerList.get("x-auth-user-id");
  if (fallbackUserId) {
    return {
      user: {
        id: fallbackUserId,
        email: headerList.get("x-auth-user-email"),
      },
      source: "middleware-header",
      error: null,
    };
  }

  return {
    user: null,
    source: "none",
    error: error ?? new Error("Unauthorized"),
  };
}
