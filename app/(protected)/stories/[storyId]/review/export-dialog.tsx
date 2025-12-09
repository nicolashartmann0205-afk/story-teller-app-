"use client";
import { useState } from 'react';
import { useReview } from './review-context';

export function ExportDialog({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
    const { exportStory } = useReview();
    const [format, setFormat] = useState<"pdf" | "docx" | "md" | "txt">("pdf");
    const [isExporting, setIsExporting] = useState(false);

    if (!open) return null;

    const handleExport = async () => {
        setIsExporting(true);
        try {
            await exportStory(format);
            onOpenChange(false);
        } catch (e) {
            console.error(e);
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg w-full max-w-md shadow-xl border border-zinc-200 dark:border-zinc-800">
                <h3 className="text-xl font-bold mb-4 text-zinc-900 dark:text-zinc-100">Export Story</h3>
                <div className="space-y-4 mb-6">
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">Select a format to export your story draft.</p>
                    <div className="grid grid-cols-2 gap-4">
                        {(["pdf", "docx", "md", "txt"] as const).map(f => (
                            <button
                                key={f}
                                onClick={() => setFormat(f)}
                                className={`p-4 rounded border transition-colors ${format === f ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300' : 'border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300'}`}
                            >
                                <span className="uppercase font-bold">{f}</span>
                            </button>
                        ))}
                    </div>
                </div>
                <div className="flex justify-end gap-2">
                    <button onClick={() => onOpenChange(false)} className="px-4 py-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200">Cancel</button>
                    <button 
                        onClick={handleExport}
                        disabled={isExporting}
                        className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
                    >
                        {isExporting ? "Exporting..." : "Export"}
                    </button>
                </div>
            </div>
        </div>
    );
}


