"use client";

import { useTransition } from "react";
import Link from "next/link";
import { MoreVertical, Copy, Trash2, Edit2 } from "lucide-react";
import { deleteStyleGuide, duplicateStyleGuide } from "./actions";
import { InferSelectModel } from "drizzle-orm";
import { styleGuides } from "@/lib/db/schema";

type StyleGuide = InferSelectModel<typeof styleGuides>;

interface StyleGuideListProps {
  initialGuides: StyleGuide[];
}

export function StyleGuideList({ initialGuides }: StyleGuideListProps) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {initialGuides.map((guide) => (
        <StyleGuideCard key={guide.id} guide={guide} />
      ))}
      {initialGuides.length === 0 && (
        <div className="col-span-full py-12 text-center text-zinc-500 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
          No style guides yet. Create one to get started!
        </div>
      )}
    </div>
  );
}

function StyleGuideCard({ guide }: { guide: StyleGuide }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this style guide?")) {
      startTransition(async () => {
        await deleteStyleGuide(guide.id);
      });
    }
  };

  const handleDuplicate = () => {
    startTransition(async () => {
      await duplicateStyleGuide(guide.id);
    });
  };

  return (
    <div className="group relative bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 hover:shadow-lg transition-all duration-200">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-semibold text-lg mb-1">{guide.name}</h3>
          <p className="text-xs text-zinc-500">
            Updated {new Date(guide.updatedAt).toLocaleDateString()}
          </p>
        </div>
        <div className="flex gap-1">
           <button
             onClick={handleDuplicate}
             disabled={isPending}
             className="p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
             title="Duplicate"
           >
             <Copy className="w-4 h-4" />
           </button>
           <button
             onClick={handleDelete}
             disabled={isPending}
             className="p-2 text-zinc-400 hover:text-red-600 transition-colors"
             title="Delete"
           >
             <Trash2 className="w-4 h-4" />
           </button>
        </div>
      </div>

      <div className="space-y-3 mb-6">
        <div className="flex items-center gap-2 text-sm">
          <span className="w-20 text-zinc-500">Tone:</span>
          <span className="font-medium capitalize">{guide.toneId?.replace('_', ' ') || "—"}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="w-20 text-zinc-500">Complexity:</span>
          <span className="font-medium">{guide.complexityLevel || "—"}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 pt-4 border-t border-zinc-100 dark:border-zinc-800">
        <div className="flex gap-2 mr-auto">
          {guide.primaryColor && (
            <div 
              className="w-6 h-6 rounded-full border border-zinc-200 dark:border-zinc-700" 
              style={{ backgroundColor: guide.primaryColor }}
            />
          )}
          {guide.secondaryColor && (
            <div 
              className="w-6 h-6 rounded-full border border-zinc-200 dark:border-zinc-700" 
              style={{ backgroundColor: guide.secondaryColor }}
            />
          )}
        </div>
        
        <Link
          href={`/style-guide/${guide.id}`}
          className="text-sm font-medium text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 flex items-center gap-1"
        >
          Edit Guide <Edit2 className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}



