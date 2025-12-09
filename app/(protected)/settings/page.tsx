import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import ProfileForm from "./profile-form";

async function updateProfileAction(previousState: { error?: string; success?: string } | null | void, formData: FormData) {
  "use server";

  const displayName = formData.get("displayName") as string;
  const bio = formData.get("bio") as string;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  try {
    await db.update(users)
      .set({
        displayName,
        bio,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));

    return { success: "Profile updated successfully" };
  } catch (error) {
    console.error("Error updating profile:", error);
    return { error: "Failed to update profile" };
  }
}

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/sign-in");
  }

  // Fetch user profile from DB
  const [userProfile] = await db.select().from(users).where(eq(users.id, user.id)).limit(1);

  // If profile doesn't exist in public table yet (e.g. old user), create it or just use auth data
  // For now, we'll assume we can display what we have. 
  // In a real sync scenario, we'd want to ensure the record exists.
  // Let's handle the null case gracefully in the form.

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white dark:bg-zinc-900 shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6 border-b border-zinc-200 dark:border-zinc-800">
            <h3 className="text-lg font-medium leading-6 text-zinc-900 dark:text-zinc-100">
              Profile Settings
            </h3>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Manage your public profile and account settings.
            </p>
          </div>
          
          <div className="px-4 py-5 sm:p-6">
            <ProfileForm 
              user={user} 
              profile={userProfile} 
              updateProfileAction={updateProfileAction} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}

