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
    const [generationError, setGenerationError] = useState<string | null>(null);
    const [selectedLanguage, setSelectedLanguage] = useState(story.language || "en");

    const handleGenerate = async () => {
        if (draftContent && !confirm("This will overwrite your existing draft. Are you sure?")) {
            return;
        }
        
        setGenerationError(null);
        try {
            await generateDraft({ tone: "Engaging", language: selectedLanguage });
        } catch (error) {
            console.error("Draft generation failed:", error);
            setGenerationError("Failed to generate draft. Please try again.");
        }
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
                        
                        {generationError && (
                            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-md border border-red-100 dark:border-red-800">
                                {generationError}
                            </div>
                        )}

                        <div className="mb-4">
                            <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1 uppercase tracking-wider">
                                Story Language
                            </label>
                            <select
                                value={selectedLanguage}
                                onChange={(e) => setSelectedLanguage(e.target.value)}
                                disabled={isGenerating}
                                className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                            >
                                <option value="en">English</option>
                                <option value="de">German (Deutsch)</option>
                                <option value="th">Thai (ไทย)</option>
                            </select>
                        </div>

                        <button
                            onClick={handleGenerate}
                            disabled={isGenerating}
                            className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isGenerating ? (
                                <>
                                    <span className="animate-spin">⏳</span> 
                                    <span>Generating... (this may take a minute)</span>
                                </>
                            ) : (
                                draftContent && draftContent.length > 50 ? "Regenerate Draft" : "Generate Draft"
                            )}
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


