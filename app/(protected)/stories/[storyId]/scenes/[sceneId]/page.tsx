import { db } from "@/lib/db";
import { scenes } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import SceneEditor from "./scene-editor";

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

  // We might also need other data like characters (archetypes) or structure beats
  // For now, let's just pass the scene data

  return <SceneEditor scene={scene} storyId={storyId} />;
}







