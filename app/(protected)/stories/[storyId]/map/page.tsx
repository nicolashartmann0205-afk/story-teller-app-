import { getStoryMapData } from "./actions";
import { StoryMapClient } from "./story-map-client";
import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{
    storyId: string;
  }>;
}

export default async function StoryMapPage({ params }: PageProps) {
  const { storyId } = await params;
  
  try {
    const data = await getStoryMapData(storyId);

    // Ensure compatible types for client component
    const serializedScenes = data.scenes.map(scene => ({
      ...scene,
      duration: scene.duration ? scene.duration.toString() : "10.0",
      tension: scene.tension ?? 5,
      description: scene.description ?? undefined,
    }));

    const serializedMap = {
      ...data.map,
      activeFilters: (data.map.activeFilters as any[]) ?? [],
      zoomLevel: data.map.zoomLevel ? data.map.zoomLevel.toString() : "1.0",
      currentView: (data.map.currentView as "timeline" | "arc" | "characters") || "timeline",
      structureOverlayVisible: data.map.structureOverlayVisible ?? undefined,
    };

    return (
      <div className="h-[calc(100vh-4rem)] flex flex-col">
        <StoryMapClient 
          initialScenes={serializedScenes}
          initialMap={serializedMap}
          storyId={storyId}
        />
      </div>
    );
  } catch (error) {
    console.error("Error loading story map:", error);
    redirect("/stories");
  }
}
