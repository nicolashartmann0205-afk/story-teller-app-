import { notFound } from "next/navigation";
import { getReviewData } from "./actions";
import { ReviewProvider } from "./review-context";
import { ReviewDashboard } from "./review-dashboard";

export default async function ReviewPage({
  params,
}: {
  params: Promise<{ storyId: string }>;
}) {
  const { storyId } = await params;
  
  try {
      const { story, scenes } = await getReviewData(storyId);

      return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black py-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <ReviewProvider storyId={storyId} story={story} scenes={scenes}>
                <ReviewDashboard />
            </ReviewProvider>
          </div>
        </div>
      );
  } catch (e) {
      console.error(e);
      notFound();
  }
}








