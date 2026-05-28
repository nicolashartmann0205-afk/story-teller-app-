"use client";

import { useParams } from "next/navigation";
import StoryPageClient from "./story-page-client";

export default function StoryPage() {
  const params = useParams<{ storyId?: string | string[] }>();
  const rawStoryId = params?.storyId;
  const storyId = Array.isArray(rawStoryId) ? rawStoryId[0] : rawStoryId;
  return <StoryPageClient storyId={storyId} />;
}
