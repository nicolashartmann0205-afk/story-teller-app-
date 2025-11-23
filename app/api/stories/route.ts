import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { stories } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { generateStory } from "@/lib/ai/story-generator";

export async function GET() {
  try {
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

    const userStories = await db
      .select()
      .from(stories)
      .where(eq(stories.userId, user.id))
      .orderBy(desc(stories.createdAt));

    return NextResponse.json({ stories: userStories });
  } catch (error) {
    console.error("Error fetching stories:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
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

    const body = await request.json();
    const { title, description } = body;

    if (!title || typeof title !== "string" || title.trim().length === 0) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    // Generate full story content using Gemini AI
    let generatedStory = description?.trim() || "";
    try {
      generatedStory = await generateStory(title, description || "");
    } catch (aiError) {
      console.error("Error generating story via API, falling back to description:", aiError);
      // Fallback to original description if AI fails
    }

    const [newStory] = await db
      .insert(stories)
      .values({
        userId: user.id,
        title: title.trim(),
        description: generatedStory,
      })
      .returning();

    return NextResponse.json({ story: newStory }, { status: 201 });
  } catch (error) {
    console.error("Error creating story:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

