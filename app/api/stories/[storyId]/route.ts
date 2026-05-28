import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { stories } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

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

    const [story] = await db
      .select()
      .from(stories)
      .where(and(eq(stories.id, storyId), eq(stories.userId, user.id)))
      .limit(1);

    if (!story) {
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

    // Verify ownership by checking if the story belongs to the user
    const [existingStory] = await db
      .select()
      .from(stories)
      .where(and(eq(stories.id, storyId), eq(stories.userId, user.id)))
      .limit(1);

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

    // Update only the provided fields
    const updateData: { title?: string; description?: string | null; updatedAt?: Date } = {
      updatedAt: new Date(),
    };

    if (title !== undefined) {
      updateData.title = title.trim();
    }

    if (description !== undefined) {
      updateData.description = description?.trim() || null;
    }

    const [updatedStory] = await db
      .update(stories)
      .set(updateData)
      .where(and(eq(stories.id, storyId), eq(stories.userId, user.id)))
      .returning();

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

    // Verify ownership by checking if the story belongs to the user
    const [existingStory] = await db
      .select()
      .from(stories)
      .where(and(eq(stories.id, storyId), eq(stories.userId, user.id)))
      .limit(1);

    if (!existingStory) {
      return NextResponse.json(
        { error: "Story not found or access denied" },
        { status: 404 }
      );
    }

    // Delete the story
    await db
      .delete(stories)
      .where(and(eq(stories.id, storyId), eq(stories.userId, user.id)));

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error deleting story:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

