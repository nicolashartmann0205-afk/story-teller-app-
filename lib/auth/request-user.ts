import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export type RequestUser = {
  id: string;
  email?: string | null;
  user_metadata?: {
    display_name?: string | null;
  };
};

async function userFromMiddlewareHeaders(): Promise<RequestUser | null> {
  const headerList = await headers();
  const fallbackUserId = headerList.get("x-auth-user-id");
  if (!fallbackUserId) {
    return null;
  }
  return {
    id: fallbackUserId,
    email: headerList.get("x-auth-user-email"),
  };
}

export async function getRequestUser(): Promise<{
  user: RequestUser | null;
  source: "supabase" | "middleware-header" | "none";
  error: Error | null;
}> {
  try {
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

    const fromHeaders = await userFromMiddlewareHeaders();
    if (fromHeaders) {
      return {
        user: fromHeaders,
        source: "middleware-header",
        error: null,
      };
    }

    return {
      user: null,
      source: "none",
      error: error ?? new Error("Unauthorized"),
    };
  } catch (error) {
    console.error("getRequestUser failed", error);
    const fromHeaders = await userFromMiddlewareHeaders();
    if (fromHeaders) {
      return {
        user: fromHeaders,
        source: "middleware-header",
        error: null,
      };
    }
    return {
      user: null,
      source: "none",
      error: error instanceof Error ? error : new Error("Auth check failed"),
    };
  }
}
