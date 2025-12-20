"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ArrowLeft, Save, Plus, Trash2 } from "lucide-react";
import { updateStyleGuide, addDictionaryEntry, deleteDictionaryEntry } from "../actions";
import { tones, writingStyles, perspectives } from "@/lib/data/styleOptions";
import { InferSelectModel } from "drizzle-orm";
import { styleGuides, dictionaryEntries } from "@/lib/db/schema";

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
  const [activeTab, setActiveTab] = useState<"overview" | "visuals" | "dictionary">("overview");
  const [isSaving, startTransition] = useTransition();
  const [formData, setFormData] = useState(guide);

  // Dictionary State
  const [dictionary, setDictionary] = useState(initialDictionary);
  const [newTerm, setNewTerm] = useState("");
  const [newDefinition, setNewDefinition] = useState("");
  const [newUsage, setNewUsage] = useState("");

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
        </div>
      </div>
    </div>
  );
}


