"use client";

import { useState } from "react";
import { generateIllustrationAction, deleteIllustrationAction } from "../actions";
import { Loader2, Image as ImageIcon, Download, Sparkles, Trash2 } from "lucide-react";
import Image from "next/image";
import { QuotaTracker, incrementQuotaUsage } from "./quota-tracker";

interface IllustrationPanelProps {
  storyId: string;
  initialIllustrations: any[];
  storyTitle: string;
  storyDescription: string;
  scenes: any[];
  draftContent?: string;
}

// Helper function to format error messages
function formatErrorMessage(error: unknown): { message: string; type: 'network' | 'auth' | 'quota' | 'invalid' | 'unknown' } {
  const errorString = error instanceof Error ? error.message : String(error);
  
  // Network errors
  if (errorString.includes('fetch failed') || errorString.includes('ENOTFOUND') || errorString.includes('network')) {
    return {
      type: 'network',
      message: 'Connection issue detected. Please check your internet connection and try again.'
    };
  }
  
  // Auth errors
  if (errorString.includes('Unauthorized') || errorString.includes('API key') || errorString.includes('authentication')) {
    return {
      type: 'auth',
      message: 'API authentication failed. Please check your API key configuration in settings.'
    };
  }
  
  // Quota errors (already handled elsewhere, but keeping for completeness)
  if (errorString.includes('429') || errorString.includes('quota') || errorString.includes('Too Many Requests')) {
    return {
      type: 'quota',
      message: 'AI usage limit reached. Placeholder mode has been enabled automatically.'
    };
  }
  
  // Invalid input
  if (errorString.includes('invalid') || errorString.includes('prompt')) {
    return {
      type: 'invalid',
      message: 'Invalid prompt provided. Please check your input and try again.'
    };
  }
  
  // Unknown error
  return {
    type: 'unknown',
    message: errorString || 'An unexpected error occurred. Please try again.'
  };
}

export function IllustrationPanel({ 
  storyId, 
  initialIllustrations = [], 
  storyTitle,
  storyDescription,
  scenes = [],
  draftContent = ""
}: IllustrationPanelProps) {
  const [illustrations, setIllustrations] = useState<any[]>(initialIllustrations || []);
  const [isGenerating, setIsGenerating] = useState(false);
  const [customPrompt, setCustomPrompt] = useState("");
  const [style, setStyle] = useState("cinematic");
  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<'network' | 'auth' | 'quota' | 'invalid' | 'unknown' | null>(null);
  const [usePlaceholder, setUsePlaceholder] = useState(false);
  const [preferredProvider, setPreferredProvider] = useState<string>("auto");

  // Debug logging
  console.log('[IllustrationPanel] Scenes count:', scenes.length);
  console.log('[IllustrationPanel] Draft content length:', draftContent?.length || 0);

  // Extract chapter titles and content from draft HTML/text
  const extractChaptersFromDraft = (draftContent: string) => {
    const chapters: Array<{ title: string; content: string }> = [];
    
    // Split by chapter headings
    const chapterRegex = /(Chapter \d+:[^\n]+)/gi;
    const parts = draftContent.split(chapterRegex);
    
    for (let i = 1; i < parts.length; i += 2) {
      const title = parts[i].trim();
      const content = parts[i + 1] ? parts[i + 1].trim() : "";
      
      // Get first 150 words of chapter content (remove HTML tags first)
      const cleanContent = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
      const words = cleanContent.split(/\s+/);
      const excerpt = words.slice(0, 150).join(' ');
      
      chapters.push({ title, content: excerpt });
    }
    
    console.log('[IllustrationPanel] Extracted chapters:', chapters.map(ch => ch.title));
    return chapters;
  };

  // Generate smart prompt suggestions from scenes
  const generatePromptSuggestions = () => {
    const suggestions: Array<{ label: string; prompt: string }> = [];
    
    // Always add cover art option
    suggestions.push({
      label: "📖 Cover Art",
      prompt: `A book cover illustration for "${storyTitle}". ${storyDescription}`
    });
    
    // Try to use scenes first
    if (scenes && scenes.length > 0) {
      // Add scene-based prompts (limit to first 5 scenes for UI space)
      scenes.slice(0, 5).forEach((scene, index) => {
        const sceneNumber = index + 1;
        const sceneTitle = scene.title || `Scene ${sceneNumber}`;
        const sceneDesc = scene.description || "";
        
        // Get first 100 chars of scene content if available
        let contentSnippet = "";
        if (scene.sceneContent && typeof scene.sceneContent === 'string') {
          contentSnippet = scene.sceneContent.substring(0, 100).trim();
        }
        
        const promptText = contentSnippet || sceneDesc || sceneTitle;
        
        suggestions.push({
          label: sceneTitle.length > 20 ? sceneTitle.substring(0, 17) + "..." : sceneTitle,
          prompt: `Illustration for: ${sceneTitle}. ${promptText}`
        });
      });
    } else if (draftContent && draftContent.length > 0) {
      // Fallback: Extract chapters from draft content
      const chapters = extractChaptersFromDraft(draftContent);
      
      // Add chapter-based prompts (limit to first 5 chapters)
      chapters.slice(0, 5).forEach((chapter) => {
        const shortLabel = chapter.title.length > 20 ? chapter.title.substring(0, 17) + "..." : chapter.title;
        
        suggestions.push({
          label: shortLabel,
          prompt: `Illustration for ${chapter.title} from "${storyTitle}". Scene: ${chapter.content}`
        });
      });
    }
    
    return suggestions;
  };

  const promptSuggestions = generatePromptSuggestions();

  const handleGenerate = async (useFallback: boolean = false) => {
    setIsGenerating(true);
    setError(null);
    setErrorType(null);
    
    // Increment quota tracker if not using fallback
    if (!useFallback) {
      incrementQuotaUsage();
    }
    
    try {
      const promptToUse = customPrompt || `A cover illustration for a story titled "${storyTitle}". Context: ${storyDescription}`;
      const provider = preferredProvider === "auto" ? undefined : preferredProvider;
      const newIllustration = await generateIllustrationAction(storyId, promptToUse, style, useFallback, provider);
      
      // Check if server auto-switched to fallback due to quota
      if (newIllustration.wasAutoFallback) {
          setUsePlaceholder(true);
          setErrorType('quota');
          setError("✅ Switched to Placeholder Mode - AI quota reached. Future generations will use placeholders automatically.");
      }
      
      setIllustrations([newIllustration, ...illustrations]);
      setCustomPrompt(""); // Clear prompt on success
    } catch (err) {
      // Use enhanced error formatting
      console.error(err);
      const formattedError = formatErrorMessage(err);
      setErrorType(formattedError.type);
      setError(formattedError.message);
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

  const handleDelete = async (illustrationId: string) => {
    if (!confirm("Are you sure you want to delete this illustration?")) return;
    
    try {
        await deleteIllustrationAction(storyId, illustrationId);
        setIllustrations(illustrations.filter((img) => img.id !== illustrationId));
    } catch (err) {
        console.error("Failed to delete illustration:", err);
        setError("Failed to delete illustration. Please try again.");
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg border border-zinc-200 dark:border-zinc-800 space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-500" />
          Story Illustrations
        </h3>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Generate AI illustrations for your story cover or scenes using multiple providers.
        </p>
      </div>

      {/* Quota Tracker */}
      <QuotaTracker onQuotaWarning={() => {
        setUsePlaceholder(true);
        setError("⚠️ Approaching API quota limit. Consider using placeholder mode.");
      }} />

      <div className="space-y-4">
        {/* Provider Selection */}
        <div>
          <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            AI Provider
          </label>
          <select 
            value={preferredProvider} 
            onChange={(e) => setPreferredProvider(e.target.value)}
            className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="auto">🤖 Auto (Best Available)</option>
            <option value="gemini">🌟 Google Gemini (Free Tier)</option>
            <option value="openai">🎨 OpenAI DALL-E 3 ($0.04/image)</option>
            <option value="stability">🎭 Stability AI ($0.01/image)</option>
            <option value="fallback">📄 Placeholder (Free)</option>
          </select>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Auto mode tries providers in order until one succeeds
          </p>
        </div>
        <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Visual Style
            </label>
            <select 
                value={style} 
                onChange={(e) => setStyle(e.target.value)}
                className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
                <option value="cinematic">🎬 Cinematic</option>
                <option value="watercolor">🎨 Watercolor</option>
                <option value="oil-painting">🖼️ Oil Painting</option>
                <option value="digital-art">💻 Digital Art</option>
                <option value="anime">🎭 Anime/Manga</option>
                <option value="realistic">📷 Realistic</option>
                <option value="storybook">📚 Storybook</option>
                <option value="comic-book">💥 Comic Book</option>
                <option value="impressionist">🌅 Impressionist</option>
                <option value="gothic">🦇 Gothic</option>
                <option value="cyberpunk">🌃 Cyberpunk</option>
                <option value="minimalist">⚪ Minimalist</option>
                <option value="sketch">✏️ Pencil Sketch</option>
                <option value="fantasy">🐉 Fantasy Art</option>
                <option value="nano-banana">🍌 Nano Banana</option>
            </select>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Each style includes optimized quality enhancements
            </p>
        </div>

        {promptSuggestions.length > 0 && (
          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              💡 Suggested Prompts
            </label>
            <div className="flex flex-wrap gap-2">
              {promptSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => setCustomPrompt(suggestion.prompt)}
                  className="px-3 py-1.5 text-xs font-medium bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 rounded-full hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors"
                  type="button"
                >
                  {suggestion.label}
                </button>
              ))}
            </div>
          </div>
        )}

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

        <div className={`p-3 rounded-md border transition-colors ${
          usePlaceholder 
            ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800" 
            : "bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700"
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="usePlaceholder"
                checked={usePlaceholder}
                onChange={(e) => setUsePlaceholder(e.target.checked)}
                className="w-4 h-4 text-purple-600 border-zinc-300 rounded focus:ring-purple-500"
              />
              <label htmlFor="usePlaceholder" className="text-sm font-medium text-zinc-700 dark:text-zinc-300 cursor-pointer">
                {usePlaceholder ? "🎨 Placeholder Mode" : "⚡ AI Generation Mode"}
              </label>
            </div>
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
              usePlaceholder 
                ? "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300" 
                : "bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300"
            }`}>
              {usePlaceholder ? "Free" : "Uses Credits"}
            </span>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 ml-6">
            {usePlaceholder 
              ? "Generates styled placeholder graphics without using AI credits" 
              : "Creates high-quality AI illustrations (requires API credits)"}
          </p>
        </div>

        {error && (
            <div className={`p-3 text-sm rounded-md ${
              error.includes("✅") || error.includes("Switched") 
                ? "bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-800" 
                : error.includes("Note:") 
                ? "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 border border-yellow-200 dark:border-yellow-800" 
                : "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800"
            }`}>
                <div className="font-semibold mb-1">
                  {error.includes("✅") || error.includes("Switched") 
                    ? "🎨 Placeholder Mode Activated" 
                    : (error.includes("limit") || error.includes("quota") || error.includes("429")) 
                    ? "⚠️ AI Credits Exhausted" 
                    : "❌ Generation Failed"}
                </div>
                <div className="text-xs mb-2">{error}</div>
                {error.includes("✅") && (
                    <div className="space-y-2 mt-3 pt-2 border-t border-blue-200 dark:border-blue-700">
                        <p className="text-xs font-medium">What are placeholders?</p>
                        <p className="text-xs opacity-80">Placeholder images are simple, styled graphics that don't use AI credits. They're perfect for previewing layouts and can be replaced later when your quota resets.</p>
                        <p className="text-xs mt-2">
                          <a
                            href="https://ai.google.dev/gemini-api/docs/rate-limits"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline hover:no-underline"
                          >
                            Learn about API quotas →
                          </a>
                        </p>
                    </div>
                )}
                {!error.includes("✅") && !error.includes("Note:") && (error.includes("limit") || error.includes("quota") || error.includes("429") || error.includes("busy")) && (
                    <div className="space-y-2 mt-3 pt-2 border-t border-red-200 dark:border-red-700">
                        <p className="text-xs">Your Google Gemini API quota has been reached. The app has automatically switched to placeholder mode.</p>
                        <p className="text-xs opacity-80">You can continue generating placeholder images, or wait for your quota to reset (typically 24 hours).</p>
                        <a
                            href="https://ai.google.dev/gemini-api/docs/rate-limits"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs inline-block mt-2 underline hover:no-underline"
                        >
                            Learn about API quotas & limits →
                        </a>
                    </div>
                )}
            </div>
        )}

        <button
            onClick={() => handleGenerate(usePlaceholder)}
            disabled={isGenerating}
            className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-md disabled:opacity-50 transition-all font-medium ${
              usePlaceholder 
                ? "bg-zinc-700 dark:bg-zinc-600 text-white hover:bg-zinc-800 dark:hover:bg-zinc-700"
                : "bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700"
            }`}
        >
            {isGenerating ? (
                <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {usePlaceholder ? "Generating Placeholder..." : "Generating Illustration..."}
                </>
            ) : (
                <>
                    <ImageIcon className="h-4 w-4" />
                    {usePlaceholder ? "Generate Placeholder Illustration" : "Generate AI Illustration"}
                </>
            )}
        </button>
      </div>

      {/* Gallery */}
      {illustrations.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <h4 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Gallery ({illustrations.length})</h4>
            <div className="grid grid-cols-2 gap-4 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                {illustrations.map((img, idx) => (
                    <div key={img.id || idx} className="group relative aspect-square bg-zinc-100 dark:bg-zinc-800 rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-700 shrink-0">
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
                                className="p-2 bg-white text-zinc-900 rounded-full hover:bg-zinc-200 transition-colors"
                                title="Download"
                             >
                                <Download className="h-4 w-4" />
                             </button>
                             <button 
                                onClick={() => handleDelete(img.id)}
                                className="p-2 bg-white text-red-600 rounded-full hover:bg-red-50 transition-colors"
                                title="Delete"
                             >
                                <Trash2 className="h-4 w-4" />
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


