import type { Metadata } from "next";
import { selfReferencingCanonical } from "@/lib/seo/site-metadata";
import StoryPageClient from "./story-page-client";

async function resolveRouteStoryId(
  params: Promise<{ storyId: string }> | { storyId: string }
): Promise<string> {
  try {
    const resolved = await Promise.resolve(params);
    const storyId =
      typeof resolved?.storyId === "string" ? resolved.storyId.trim() : "";
    return storyId.length > 0 ? storyId : "unknown";
  } catch (error) {
    console.error("[STORY_PAGE][PARAMS_RESOLUTION_FAILED]", error);
    return "unknown";
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ storyId: string }>;
}): Promise<Metadata> {
  try {
    const { storyId } = await Promise.resolve(params);
    if (!storyId || typeof storyId !== "string") {
      return selfReferencingCanonical("/stories");
    }
    return selfReferencingCanonical(`/stories/${encodeURIComponent(storyId)}`);
  } catch (error) {
    console.error("[STORY_PAGE][METADATA_FAILED]", error);
    return selfReferencingCanonical("/stories");
  }
}

export default async function StoryPage({
  params,
}: {
  params: Promise<{ storyId: string }>;
}) {
  const storyId = await resolveRouteStoryId(params);
  return <StoryPageClient storyId={storyId} />;
}
