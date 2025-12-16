"use client";

import { useState } from "react";
import { generateIllustrationAction } from "../actions";
import { Loader2, Image as ImageIcon, Download, Sparkles } from "lucide-react";
import Image from "next/image";

interface IllustrationPanelProps {
  storyId: string;
  initialIllustrations: any[];
  storyTitle: string;
  storyDescription: string;
}

export function IllustrationPanel({ 
  storyId, 
  initialIllustrations = [], 
  storyTitle,
  storyDescription 
}: IllustrationPanelProps) {
  const [illustrations, setIllustrations] = useState<any[]>(initialIllustrations || []);
  const [isGenerating, setIsGenerating] = useState(false);
  const [customPrompt, setCustomPrompt] = useState("");
  const [style, setStyle] = useState("cinematic");
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (useFallback: boolean = false) => {
    setIsGenerating(true);
    setError(null);
    try {
      const promptToUse = customPrompt || `A cover illustration for a story titled "${storyTitle}". Context: ${storyDescription}`;
      const newIllustration = await generateIllustrationAction(storyId, promptToUse, style, useFallback);
      setIllustrations([newIllustration, ...illustrations]);
      setCustomPrompt(""); // Clear prompt on success
    } catch (err) {
      console.error(err);
      let errorMessage = "Failed to generate illustration. Please try again.";
      const errorString = err instanceof Error ? err.message : String(err);
      
      if (errorString.includes("429") || errorString.includes("quota") || errorString.includes("Too Many Requests")) {
        errorMessage = "AI usage limit reached. Please wait a moment and try again.";
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = (dataUrl: string, index: number) => {
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `story-illustration-${index + 1}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg border border-zinc-200 dark:border-zinc-800 space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-500" />
          Story Illustrations
        </h3>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Generate AI illustrations for your story cover or scenes using Gemini.
        </p>
      </div>

      <div className="space-y-4">
        <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Visual Style
            </label>
            <select 
                value={style} 
                onChange={(e) => setStyle(e.target.value)}
                className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
                <option value="cinematic">Cinematic</option>
                <option value="watercolor">Watercolor</option>
                <option value="cyberpunk">Cyberpunk</option>
                <option value="minimalist">Minimalist Vector</option>
                <option value="sketch">Pencil Sketch</option>
                <option value="fantasy">Fantasy Art</option>
            </select>
        </div>

        <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Custom Prompt (Optional)
            </label>
            <textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder={`e.g. A dramatic scene showing ${storyTitle}...`}
                className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm h-20 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
        </div>

        {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-md">
                {error}
                {(error.includes("limit") || error.includes("quota") || error.includes("busy")) && (
                    <button
                        onClick={() => handleGenerate(true)}
                        className="mt-2 text-xs font-semibold underline hover:no-underline block"
                    >
                        Use Placeholder Image
                    </button>
                )}
            </div>
        )}

        <button
            onClick={() => handleGenerate(false)}
            disabled={isGenerating}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-md hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 transition-all font-medium"
        >
            {isGenerating ? (
                <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating Illustration...
                </>
            ) : (
                <>
                    <ImageIcon className="h-4 w-4" />
                    Generate Illustration
                </>
            )}
        </button>
      </div>

      {/* Gallery */}
      {illustrations.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <h4 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Gallery ({illustrations.length})</h4>
            <div className="grid grid-cols-2 gap-4">
                {illustrations.map((img, idx) => (
                    <div key={img.id || idx} className="group relative aspect-square bg-zinc-100 dark:bg-zinc-800 rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-700">
                        {/* We use standard img tag for base64 data to ensure compatibility with SVG data URIs */}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                            src={img.url} 
                            alt={img.prompt || "Generated illustration"} 
                            className="w-full h-full object-contain p-2"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                             <button 
                                onClick={() => handleDownload(img.url, idx)}
                                className="p-2 bg-white text-zinc-900 rounded-full hover:bg-zinc-200"
                                title="Download"
                             >
                                <Download className="h-4 w-4" />
                             </button>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-2 text-[10px] text-white truncate px-2">
                            {img.style}
                        </div>
                    </div>
                ))}
            </div>
        </div>
      )}
    </div>
  );
}


