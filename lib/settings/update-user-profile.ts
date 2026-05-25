import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { withPostgresOrSupabase } from "@/lib/db/postgres-or-supabase";
import { updateUserProfileViaSupabase } from "@/lib/db/supabase-fallback";

export async function updateUserProfile(
  userId: string,
  fields: { displayName: string; bio: string }
): Promise<void> {
  return withPostgresOrSupabase(
    async () => {
      await db
        .update(users)
        .set({
          displayName: fields.displayName,
          bio: fields.bio,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId));
    },
    () => updateUserProfileViaSupabase(userId, fields)
  );
}
