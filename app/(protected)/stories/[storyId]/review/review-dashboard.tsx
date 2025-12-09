"use client";
import { useState } from "react";
import { useReview } from "./review-context";
import { CompletenessChecker } from "./completeness-checker";
import { DraftEditor } from "./draft-editor";
import { ExportDialog } from "./export-dialog";
import Link from "next/link";

export function ReviewDashboard() {
    const { story, generateDraft, isGenerating, draftContent } = useReview();
    const [showExport, setShowExport] = useState(false);

    const handleGenerate = async () => {
        if (draftContent && !confirm("This will overwrite your existing draft. Are you sure?")) {
            return;
        }
        await generateDraft({ tone: "Engaging" });
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">Review & Export</h1>
                    <p className="text-zinc-600 dark:text-zinc-400">Validate your story, generate a draft, and export.</p>
                </div>
                 <div className="flex gap-2">
                    <Link
                        href={`/stories/${story.id}`}
                        className="px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                    >
                        Back to Dashboard
                    </Link>
                    <button
                        onClick={() => setShowExport(true)}
                        className="px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-md hover:opacity-90 font-medium"
                    >
                        Export Story
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-6">
                    <CompletenessChecker />
                    
                    <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg border border-zinc-200 dark:border-zinc-800">
                        <h3 className="font-semibold mb-4 text-zinc-900 dark:text-zinc-100">AI Draft Generation</h3>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                            Turn your outline, characters, and scenes into a full prose draft.
                        </p>
                        <button
                            onClick={handleGenerate}
                            disabled={isGenerating}
                            className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isGenerating ? "Generating..." : (draftContent && draftContent.length > 50 ? "Regenerate Draft" : "Generate Draft")}
                        </button>
                    </div>
                </div>

                <div className="lg:col-span-2">
                    <DraftEditor />
                </div>
            </div>
            
            <ExportDialog open={showExport} onOpenChange={setShowExport} />
        </div>
    );
}


