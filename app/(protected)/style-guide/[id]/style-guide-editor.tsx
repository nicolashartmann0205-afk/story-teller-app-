"use client";

import { useState, useTransition, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, Save, Plus, Trash2, Upload, Link as LinkIcon, FileText, Sparkles, Loader2, CheckCircle, XCircle } from "lucide-react";
import { updateStyleGuide, addDictionaryEntry, deleteDictionaryEntry } from "../actions";
import { analyzeDocumentAction, analyzeUrlAction, analyzeTextAction } from "../ai-actions";
import { tones, writingStyles, perspectives } from "@/lib/data/styleOptions";
import { InferSelectModel } from "drizzle-orm";
import { styleGuides, dictionaryEntries } from "@/lib/db/schema";
import { StyleAnalysisResult } from "@/lib/ai/style-analyzer";

type StyleGuide = InferSelectModel<typeof styleGuides>;
type DictionaryEntry = InferSelectModel<typeof dictionaryEntries>;

interface StyleGuideEditorProps {
  guide: StyleGuide;
  initialDictionary: DictionaryEntry[];
}

const COMPLEXITY_LEVELS = [
  "Elementary (6th Grade)",
  "Middle School (9th Grade)",
  "High School",
  "Undergraduate",
  "PhD / Technical",
];

export function StyleGuideEditor({ guide, initialDictionary }: StyleGuideEditorProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "visuals" | "dictionary" | "ai-import">("overview");
  const [isSaving, startTransition] = useTransition();
  const [formData, setFormData] = useState(guide);

  // Dictionary State
  const [dictionary, setDictionary] = useState(initialDictionary);
  const [newTerm, setNewTerm] = useState("");
  const [newDefinition, setNewDefinition] = useState("");
  const [newUsage, setNewUsage] = useState("");

  // AI Import State
  const [aiAnalysisMethod, setAiAnalysisMethod] = useState<"upload" | "url" | "text">("upload");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState<string>("");
  const [analysisResult, setAnalysisResult] = useState<StyleAnalysisResult | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState("");
  const [textInput, setTextInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    startTransition(async () => {
      await updateStyleGuide(guide.id, formData);
    });
  };

  const handleAddTerm = async () => {
    if (!newTerm) return;
    startTransition(async () => {
        await addDictionaryEntry(guide.id, {
            term: newTerm,
            definition: newDefinition,
            usageGuidelines: newUsage,
            category: "General",
        } as any);
        // Optimistic update or wait for revalidate? 
        // We'll rely on revalidate for now, but strictly we should probably fetch or optimistically update.
        // Since we are inside a client component that received initialDictionary, we can't easily refetch without router refresh.
        // Actually, the server action revalidates the page, so useRouter().refresh() or just waiting might work if this was a server component wrapper.
        // But let's just do a simple optimistic update for UX.
        setDictionary([...dictionary, {
            id: crypto.randomUUID(),
            styleGuideId: guide.id,
            term: newTerm,
            definition: newDefinition,
            usageGuidelines: newUsage,
            category: "General",
            createdAt: new Date(),
            updatedAt: new Date()
        } as DictionaryEntry]); // Temporary ID
        setNewTerm("");
        setNewDefinition("");
        setNewUsage("");
    });
  };

  const handleDeleteTerm = async (id: string) => {
      setDictionary(dictionary.filter(d => d.id !== id));
      startTransition(async () => {
          await deleteDictionaryEntry(id, guide.id);
      });
  };

  const handleChange = (field: keyof StyleGuide, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  // AI Import Handlers
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsAnalyzing(true);
    setAnalysisError(null);
    setAnalysisResult(null);
    setAnalysisProgress("Uploading and parsing document...");

    try {
      const formData = new FormData();
      formData.append("file", file);

      setAnalysisProgress("Extracting text content...");
      const result = await analyzeDocumentAction(formData);
      
      setIsAnalyzing(false);
      setAnalysisProgress("");

      if (result.success && result.data) {
        setAnalysisResult(result.data);
      } else {
        setAnalysisError(result.error || "Failed to analyze document");
      }
    } catch (error) {
      setIsAnalyzing(false);
      setAnalysisProgress("");
      setAnalysisError(error instanceof Error ? error.message : "An unexpected error occurred");
      console.error("File upload error:", error);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUrlAnalyze = async () => {
    if (!urlInput.trim()) {
      setAnalysisError("Please enter a URL");
      return;
    }

    setIsAnalyzing(true);
    setAnalysisError(null);
    setAnalysisResult(null);
    setAnalysisProgress("Fetching content from URL...");

    try {
      const result = await analyzeUrlAction(urlInput.trim());
      
      setIsAnalyzing(false);
      setAnalysisProgress("");

      if (result.success && result.data) {
        setAnalysisResult(result.data);
      } else {
        setAnalysisError(result.error || "Failed to analyze URL");
      }
    } catch (error) {
      setIsAnalyzing(false);
      setAnalysisProgress("");
      setAnalysisError(error instanceof Error ? error.message : "An unexpected error occurred");
      console.error("URL analysis error:", error);
    }
  };

  const handleTextAnalyze = async () => {
    if (!textInput.trim()) {
      setAnalysisError("Please enter some text to analyze");
      return;
    }

    setIsAnalyzing(true);
    setAnalysisError(null);
    setAnalysisResult(null);
    setAnalysisProgress("Analyzing writing style...");

    try {
      const result = await analyzeTextAction(textInput.trim());
      
      setIsAnalyzing(false);
      setAnalysisProgress("");

      if (result.success && result.data) {
        setAnalysisResult(result.data);
      } else {
        setAnalysisError(result.error || "Failed to analyze text");
      }
    } catch (error) {
      setIsAnalyzing(false);
      setAnalysisProgress("");
      setAnalysisError(error instanceof Error ? error.message : "An unexpected error occurred");
      console.error("Text analysis error:", error);
    }
  };

  const applyAnalysisResults = (partial: boolean = false) => {
    if (!analysisResult) return;

    const updates: Partial<StyleGuide> = {
      toneId: analysisResult.toneId,
      writingStyleId: analysisResult.writingStyleId,
      perspectiveId: analysisResult.perspectiveId,
      complexityLevel: analysisResult.complexityLevel,
      toneDescription: analysisResult.toneDescription,
    };

    setFormData({ ...formData, ...updates });

    // Add suggested terms to dictionary
    if (!partial && analysisResult.suggestedTerms.length > 0) {
      analysisResult.suggestedTerms.forEach(async (term) => {
        startTransition(async () => {
          await addDictionaryEntry(guide.id, {
            term: term.term,
            definition: term.definition || "",
            usageGuidelines: term.usageGuidelines || "",
            category: "General",
          } as any);
        });
        
        setDictionary([...dictionary, {
          id: crypto.randomUUID(),
          styleGuideId: guide.id,
          term: term.term,
          definition: term.definition || null,
          usageGuidelines: term.usageGuidelines || null,
          category: "General",
          createdAt: new Date(),
          updatedAt: new Date()
        } as DictionaryEntry]);
      });
    }

    // Clear analysis result
    setAnalysisResult(null);
    setAnalysisError(null);
    setUrlInput("");
    setTextInput("");
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link
            href="/style-guide"
            className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{formData.name}</h1>
            <p className="text-zinc-500 text-sm">Edit Style Guide</p>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Sidebar Tabs */}
        <div className="col-span-12 md:col-span-3 space-y-2">
          <button
            onClick={() => setActiveTab("overview")}
            className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
              activeTab === "overview"
                ? "bg-zinc-100 dark:bg-zinc-800 font-medium"
                : "hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-500"
            }`}
          >
            Overview & Tone
          </button>
          <button
            onClick={() => setActiveTab("visuals")}
            className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
              activeTab === "visuals"
                ? "bg-zinc-100 dark:bg-zinc-800 font-medium"
                : "hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-500"
            }`}
          >
            Visual Identity
          </button>
          <button
            onClick={() => setActiveTab("dictionary")}
            className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
              activeTab === "dictionary"
                ? "bg-zinc-100 dark:bg-zinc-800 font-medium"
                : "hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-500"
            }`}
          >
            Dictionary
          </button>
          <button
            onClick={() => setActiveTab("ai-import")}
            className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
              activeTab === "ai-import"
                ? "bg-zinc-100 dark:bg-zinc-800 font-medium"
                : "hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-500"
            }`}
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              AI Import
            </div>
          </button>
        </div>

        {/* Content Area */}
        <div className="col-span-12 md:col-span-9 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6">
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Guide Name</label>
                <input
                  type="text"
                  value={formData.name || ""}
                  onChange={(e) => handleChange("name", e.target.value)}
                  className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-2"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Tone</label>
                  <select
                    value={formData.toneId || ""}
                    onChange={(e) => handleChange("toneId", e.target.value)}
                    className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-2"
                  >
                    <option value="">Select Tone...</option>
                    {tones.map((t) => (
                      <option key={t.id} value={t.id}>{t.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Writing Style</label>
                  <select
                    value={formData.writingStyleId || ""}
                    onChange={(e) => handleChange("writingStyleId", e.target.value)}
                    className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-2"
                  >
                     <option value="">Select Style...</option>
                    {writingStyles.map((s) => (
                      <option key={s.id} value={s.id}>{s.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Perspective</label>
                  <select
                    value={formData.perspectiveId || ""}
                    onChange={(e) => handleChange("perspectiveId", e.target.value)}
                    className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-2"
                  >
                     <option value="">Select Perspective...</option>
                    {perspectives.map((p) => (
                      <option key={p.id} value={p.id}>{p.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Complexity Level</label>
                  <select
                    value={formData.complexityLevel || ""}
                    onChange={(e) => handleChange("complexityLevel", e.target.value)}
                    className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-2"
                  >
                     <option value="">Select Level...</option>
                    {COMPLEXITY_LEVELS.map((level) => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Tone Description / AI Instructions</label>
                <textarea
                  value={formData.toneDescription || ""}
                  onChange={(e) => handleChange("toneDescription", e.target.value)}
                  rows={4}
                  className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-2"
                  placeholder="Describe the voice and tone in detail (e.g., 'Friendly but professional, avoiding jargon...')"
                />
              </div>
            </div>
          )}

          {activeTab === "visuals" && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Color Palette</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Primary Color</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={formData.primaryColor || "#000000"}
                      onChange={(e) => handleChange("primaryColor", e.target.value)}
                      className="h-10 w-10 rounded cursor-pointer border-none p-0"
                    />
                    <input
                      type="text"
                      value={formData.primaryColor || ""}
                      onChange={(e) => handleChange("primaryColor", e.target.value)}
                      className="flex-1 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-2 uppercase"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Secondary Color</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={formData.secondaryColor || "#ffffff"}
                      onChange={(e) => handleChange("secondaryColor", e.target.value)}
                      className="h-10 w-10 rounded cursor-pointer border-none p-0"
                    />
                    <input
                      type="text"
                      value={formData.secondaryColor || ""}
                      onChange={(e) => handleChange("secondaryColor", e.target.value)}
                      className="flex-1 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-2 uppercase"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800">
                <h3 className="text-lg font-semibold mb-4">Typography</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Heading Font</label>
                    <input
                      type="text"
                      value={formData.fontHeading || ""}
                      onChange={(e) => handleChange("fontHeading", e.target.value)}
                      placeholder="e.g., Inter, Roboto Slab"
                      className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-2"
                    />
                    <p className="text-xs text-zinc-500 mt-1">Google Fonts supported in exports</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Body Font</label>
                    <input
                      type="text"
                      value={formData.fontBody || ""}
                      onChange={(e) => handleChange("fontBody", e.target.value)}
                      placeholder="e.g., Open Sans, Lato"
                      className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-2"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "dictionary" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Custom Dictionary</h3>
              </div>

              <div className="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-lg border border-zinc-200 dark:border-zinc-700">
                <h4 className="text-sm font-medium mb-3">Add New Term</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                  <input
                    type="text"
                    value={newTerm}
                    onChange={(e) => setNewTerm(e.target.value)}
                    placeholder="Term (e.g., 'App')"
                    className="rounded-md border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm"
                  />
                   <input
                    type="text"
                    value={newDefinition}
                    onChange={(e) => setNewDefinition(e.target.value)}
                    placeholder="Definition (Optional)"
                    className="rounded-md border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm"
                  />
                   <input
                    type="text"
                    value={newUsage}
                    onChange={(e) => setNewUsage(e.target.value)}
                    placeholder="Usage Rule (e.g., 'Capitalize')"
                    className="rounded-md border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm"
                  />
                </div>
                <button
                  onClick={handleAddTerm}
                  disabled={!newTerm || isSaving}
                  className="text-sm bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black px-3 py-1.5 rounded-md font-medium disabled:opacity-50"
                >
                  Add Term
                </button>
              </div>

              <div className="space-y-2">
                {dictionary.map((entry) => (
                  <div key={entry.id} className="flex items-start justify-between p-3 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900">
                    <div>
                      <p className="font-semibold text-sm">{entry.term}</p>
                      {entry.definition && <p className="text-xs text-zinc-500">{entry.definition}</p>}
                      {entry.usageGuidelines && <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">Rule: {entry.usageGuidelines}</p>}
                    </div>
                    <button
                      onClick={() => handleDeleteTerm(entry.id)}
                      className="text-zinc-400 hover:text-red-500 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {dictionary.length === 0 && (
                  <p className="text-center text-zinc-500 text-sm py-4">No dictionary entries yet.</p>
                )}
              </div>
            </div>
          )}

          {activeTab === "ai-import" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">AI-Powered Style Import</h3>
                <p className="text-sm text-zinc-500">
                  Analyze documents, URLs, or text samples to automatically extract style characteristics.
                </p>
              </div>

              {/* Method Selector */}
              <div className="flex gap-2 border-b border-zinc-200 dark:border-zinc-700">
                <button
                  onClick={() => setAiAnalysisMethod("upload")}
                  className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
                    aiAnalysisMethod === "upload"
                      ? "border-purple-600 text-purple-600 font-medium"
                      : "border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300"
                  }`}
                >
                  <Upload className="w-4 h-4" />
                  Upload Document
                </button>
                <button
                  onClick={() => setAiAnalysisMethod("url")}
                  className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
                    aiAnalysisMethod === "url"
                      ? "border-purple-600 text-purple-600 font-medium"
                      : "border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300"
                  }`}
                >
                  <LinkIcon className="w-4 h-4" />
                  From URL
                </button>
                <button
                  onClick={() => setAiAnalysisMethod("text")}
                  className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
                    aiAnalysisMethod === "text"
                      ? "border-purple-600 text-purple-600 font-medium"
                      : "border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300"
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  Paste Text
                </button>
              </div>

              {/* Upload Method */}
              {aiAnalysisMethod === "upload" && (
                <div>
                  <label className="block">
                    <div className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-lg p-8 text-center hover:border-purple-600 transition-colors cursor-pointer">
                      <Upload className="w-12 h-12 mx-auto mb-4 text-zinc-400" />
                      <p className="text-sm font-medium mb-1">Click to upload or drag and drop</p>
                      <p className="text-xs text-zinc-500">PDF, DOCX, or TXT (max 10MB)</p>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.docx,.txt"
                        onChange={handleFileUpload}
                        className="hidden"
                        disabled={isAnalyzing}
                      />
                    </div>
                  </label>
                </div>
              )}

              {/* URL Method */}
              {aiAnalysisMethod === "url" && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-2">Website URL</label>
                    <input
                      type="url"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      placeholder="https://example.com/article"
                      className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-2"
                      disabled={isAnalyzing}
                    />
                  </div>
                  <button
                    onClick={handleUrlAnalyze}
                    disabled={isAnalyzing || !urlInput.trim()}
                    className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Analyze URL
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Text Method */}
              {aiAnalysisMethod === "text" && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-2">Text Sample</label>
                    <textarea
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      placeholder="Paste a writing sample here (minimum 100 characters)..."
                      rows={8}
                      className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-2 font-mono text-sm"
                      disabled={isAnalyzing}
                    />
                    <p className="text-xs text-zinc-500 mt-1">
                      {textInput.length} characters
                    </p>
                  </div>
                  <button
                    onClick={handleTextAnalyze}
                    disabled={isAnalyzing || textInput.trim().length < 100}
                    className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Analyze Text
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Progress Display */}
              {isAnalyzing && analysisProgress && (
                <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <Loader2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5 animate-spin" />
                  <div>
                    <p className="font-medium text-blue-900 dark:text-blue-200">Analyzing Content</p>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">{analysisProgress}</p>
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">This may take 10-30 seconds depending on content size...</p>
                  </div>
                </div>
              )}

              {/* Error Display */}
              {analysisError && (
                <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-red-900 dark:text-red-200">Analysis Failed</p>
                    <p className="text-sm text-red-700 dark:text-red-300 mt-1">{analysisError}</p>
                  </div>
                </div>
              )}

              {/* Results Review Panel */}
              {analysisResult && (
                <div className="border border-purple-200 dark:border-purple-800 rounded-lg overflow-hidden">
                  <div className="bg-purple-50 dark:bg-purple-900/20 px-4 py-3 border-b border-purple-200 dark:border-purple-800">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-purple-600" />
                      <h4 className="font-semibold text-purple-900 dark:text-purple-100">
                        Analysis Complete
                      </h4>
                    </div>
                  </div>
                  
                  <div className="p-4 space-y-4">
                    {/* Style Settings */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-zinc-500 mb-1">Tone</label>
                        <p className="text-sm font-medium">
                          {tones.find(t => t.id === analysisResult.toneId)?.label || analysisResult.toneId}
                        </p>
                        <div className="mt-1 h-1 bg-zinc-200 dark:bg-zinc-700 rounded">
                          <div 
                            className="h-full bg-purple-600 rounded" 
                            style={{ width: `${analysisResult.confidence.tone * 100}%` }}
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-zinc-500 mb-1">Writing Style</label>
                        <p className="text-sm font-medium">
                          {writingStyles.find(s => s.id === analysisResult.writingStyleId)?.label || analysisResult.writingStyleId}
                        </p>
                        <div className="mt-1 h-1 bg-zinc-200 dark:bg-zinc-700 rounded">
                          <div 
                            className="h-full bg-purple-600 rounded" 
                            style={{ width: `${analysisResult.confidence.style * 100}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-zinc-500 mb-1">Perspective</label>
                        <p className="text-sm font-medium">
                          {perspectives.find(p => p.id === analysisResult.perspectiveId)?.label || analysisResult.perspectiveId}
                        </p>
                        <div className="mt-1 h-1 bg-zinc-200 dark:bg-zinc-700 rounded">
                          <div 
                            className="h-full bg-purple-600 rounded" 
                            style={{ width: `${analysisResult.confidence.perspective * 100}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-zinc-500 mb-1">Complexity Level</label>
                        <p className="text-sm font-medium">{analysisResult.complexityLevel}</p>
                      </div>
                    </div>

                    {/* Tone Description */}
                    <div>
                      <label className="block text-xs font-medium text-zinc-500 mb-1">AI Description</label>
                      <p className="text-sm text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded">
                        {analysisResult.toneDescription}
                      </p>
                    </div>

                    {/* Suggested Terms */}
                    {analysisResult.suggestedTerms.length > 0 && (
                      <div>
                        <label className="block text-xs font-medium text-zinc-500 mb-2">
                          Suggested Dictionary Terms ({analysisResult.suggestedTerms.length})
                        </label>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {analysisResult.suggestedTerms.map((term, idx) => (
                            <div key={idx} className="text-sm bg-zinc-50 dark:bg-zinc-800/50 p-2 rounded">
                              <p className="font-medium">{term.term}</p>
                              {term.definition && (
                                <p className="text-xs text-zinc-500 mt-0.5">{term.definition}</p>
                              )}
                              {term.usageGuidelines && (
                                <p className="text-xs text-purple-600 dark:text-purple-400 mt-0.5">
                                  {term.usageGuidelines}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => applyAnalysisResults(false)}
                        className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors"
                      >
                        Apply All
                      </button>
                      <button
                        onClick={() => applyAnalysisResults(true)}
                        className="flex-1 bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 px-4 py-2 rounded-lg font-medium hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors"
                      >
                        Apply Settings Only
                      </button>
                      <button
                        onClick={() => {
                          setAnalysisResult(null);
                          setAnalysisError(null);
                        }}
                        className="px-4 py-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


