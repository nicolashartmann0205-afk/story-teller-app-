import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getStyleGuide, getDictionaryEntries } from "../actions";
import { StyleGuideEditor } from "./style-guide-editor";

export default async function EditStyleGuidePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const guide = await getStyleGuide(id);

  if (!guide) {
    notFound();
  }

  const dictionary = await getDictionaryEntries(id);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <StyleGuideEditor guide={guide} initialDictionary={dictionary} />
    </div>
  );
}



