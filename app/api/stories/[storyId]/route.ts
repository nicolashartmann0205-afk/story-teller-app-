import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { stories } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";

async function resolveStoryId(
  params: Promise<{ storyId: string }> | { storyId: string }
): Promise<string | null> {
  try {
    const resolved = await Promise.resolve(params);
    const storyId =
      typeof resolved?.storyId === "string" ? resolved.storyId.trim() : "";
    return storyId.length > 0 ? storyId : null;
  } catch {
    return null;
  }
}

async function getStoryViaPostgres(storyId: string, userId: string) {
  try {
    const [story] = await db
      .select()
      .from(stories)
      .where(and(eq(stories.id, storyId), eq(stories.userId, userId)))
      .limit(1);
    return story ?? null;
  } catch (error) {
    console.error("[STORIES_API][POSTGRES_FALLBACK_GET_FAILED]", error);
    return null;
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ storyId: string }> }
) {
  try {
    const storyId = await resolveStoryId(params);
    if (!storyId) {
      return NextResponse.json({ error: "Invalid story id" }, { status: 400 });
    }

    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: story, error: storyError } = await supabase
      .from("stories")
      .select("*")
      .eq("id", storyId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (storyError) {
      const fallbackStory = await getStoryViaPostgres(storyId, user.id);
      if (fallbackStory) {
        return NextResponse.json({ story: fallbackStory }, { status: 200 });
      }
      throw storyError;
    }

    if (!story) {
      const fallbackStory = await getStoryViaPostgres(storyId, user.id);
      if (fallbackStory) {
        return NextResponse.json({ story: fallbackStory }, { status: 200 });
      }
      return NextResponse.json({ error: "Story not found" }, { status: 404 });
    }

    return NextResponse.json({ story }, { status: 200 });
  } catch (error) {
    console.error("Error fetching story:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ storyId: string }> }
) {
  try {
    const storyId = await resolveStoryId(params);
    if (!storyId) {
      return NextResponse.json({ error: "Invalid story id" }, { status: 400 });
    }
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { data: existingStory, error: existingStoryError } = await supabase
      .from("stories")
      .select("id")
      .eq("id", storyId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (existingStoryError) {
      throw existingStoryError;
    }

    if (!existingStory) {
      return NextResponse.json(
        { error: "Story not found or access denied" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { title, description } = body;

    // Validate title if provided
    if (title !== undefined) {
      if (typeof title !== "string" || title.trim().length === 0) {
        return NextResponse.json(
          { error: "Title must be a non-empty string" },
          { status: 400 }
        );
      }
    }

    const updateData: {
      title?: string;
      description?: string | null;
      updated_at?: string;
    } = {
      updated_at: new Date().toISOString(),
    };

    if (title !== undefined) {
      updateData.title = title.trim();
    }

    if (description !== undefined) {
      updateData.description = description?.trim() || null;
    }

    const { data: updatedStory, error: updateError } = await supabase
      .from("stories")
      .update(updateData)
      .eq("id", storyId)
      .eq("user_id", user.id)
      .select("*")
      .maybeSingle();

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({ story: updatedStory });
  } catch (error) {
    console.error("Error updating story:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ storyId: string }> }
) {
  try {
    const storyId = await resolveStoryId(params);
    if (!storyId) {
      return NextResponse.json({ error: "Invalid story id" }, { status: 400 });
    }
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { data: existingStory, error: existingStoryError } = await supabase
      .from("stories")
      .select("id")
      .eq("id", storyId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (existingStoryError) {
      throw existingStoryError;
    }

    if (!existingStory) {
      return NextResponse.json(
        { error: "Story not found or access denied" },
        { status: 404 }
      );
    }

    const { error: deleteError } = await supabase
      .from("stories")
      .delete()
      .eq("id", storyId)
      .eq("user_id", user.id);

    if (deleteError) {
      throw deleteError;
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error deleting story:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

