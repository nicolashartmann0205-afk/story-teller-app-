import type { Metadata } from "next";
import { selfReferencingCanonical } from "@/lib/seo/site-metadata";
import { db } from "@/lib/db";
import { scenes } from "@/lib/db/schema";
import { asc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import SceneEditor from "./scene-editor";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ storyId: string; sceneId: string }>;
}): Promise<Metadata> {
  const { storyId, sceneId } = await params;
  return selfReferencingCanonical(`/stories/${storyId}/scenes/${sceneId}`);
}

export default async function SceneEditorPage({
  params,
}: {
  params: Promise<{ storyId: string; sceneId: string }>;
}) {
  const { storyId, sceneId } = await params;

  const [scene] = await db
    .select()
    .from(scenes)
    .where(eq(scenes.id, sceneId))
    .limit(1);

  if (!scene) {
    notFound();
  }

  const storyScenes = await db
    .select({
      id: scenes.id,
      title: scenes.title,
      order: scenes.order,
    })
    .from(scenes)
    .where(eq(scenes.storyId, storyId))
    .orderBy(asc(scenes.order));

  return <SceneEditor scene={scene} storyId={storyId} allScenes={storyScenes} />;
}









