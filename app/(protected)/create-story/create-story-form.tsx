"use client";

import { useState, useTransition } from "react";
import { useActionState } from "react";
import Link from "next/link";
import { StoryCategory, StoryType } from "@/lib/data/storyTypes";
import { hookTypes, HookTypeID } from "@/lib/data/hookTypes";
import { tones, writingStyles, perspectives } from "@/lib/data/styleOptions";
import { generatePreviewHooksAction } from "./actions";
import { StoryMode } from "./mode-selection";

type CreateStoryAction = (
  previousState: { error?: string } | null,
  formData: FormData
) => Promise<{ error?: string } | null>;

interface CreateStoryFormProps {
  createStoryAction: CreateStoryAction;
  selectedCategory: StoryCategory;
  selectedType: StoryType;
  selectedMode: StoryMode;
  moralData?: any; // Added to support moral framework data
  archetypeData?: any; // Added to support archetype data
  onBack: () => void;
}

export default function CreateStoryForm({
  createStoryAction,
  selectedCategory,
  selectedType,
  selectedMode,
  moralData,
  archetypeData,
  onBack,
}: CreateStoryFormProps) {
  const [state, formAction, isPending] = useActionState(createStoryAction, { error: undefined });
  
  // Hook Generation State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [language, setLanguage] = useState("en");
  const [showHookGenerator, setShowHookGenerator] = useState(true);
  const [selectedHookTypes, setSelectedHookTypes] = useState<HookTypeID[]>([]);
  const [generatedHooks, setGeneratedHooks] = useState<Record<string, any[]>>({});
  const [selectedHook, setSelectedHook] = useState<any>(null);
  const [isGeneratingHooks, startHookGeneration] = useTransition();

  const toggleHookType = (id: HookTypeID) => {
    if (selectedHookTypes.includes(id)) {
      setSelectedHookTypes(selectedHookTypes.filter((t) => t !== id));
    } else {
      setSelectedHookTypes([...selectedHookTypes, id]);
    }
  };

  const handleGenerateHooks = async () => {
    if (!title) {
      alert("Please enter a title first.");
      return;
    }
    if (selectedHookTypes.length === 0) {
      alert("Please select at least one hook type.");
      return;
    }

    startHookGeneration(async () => {
      const result = await generatePreviewHooksAction(title, description, selectedHookTypes, language);
      if (result.hooks) {
        setGeneratedHooks(result.hooks);
      } else if (result.error) {
        alert(result.error);
      }
    });
  };

  const handleSelectHook = (type: string, hook: any, index: number) => {
    const hookId = `${type}_${index}`;
    setSelectedHook({
      id: hookId,
      type,
      text: hook.text,
      whyItWorks: hook.whyItWorks,
      tone: hook.tone,
      selectedAt: new Date().toISOString(),
      isEdited: false
    });
  };

  return (
    <form action={formAction} className="space-y-8">
      {state?.error && (
        <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4">
          <p className="text-sm text-red-800 dark:text-red-200">{state.error}</p>
        </div>
      )}

      <div className="mb-6 p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-100 dark:border-zinc-800">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-xs text-zinc-500 uppercase tracking-wider font-medium">Selected Type</p>
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{selectedType.name}</p>
          </div>
          <button
            type="button"
            onClick={onBack}
            className="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300 underline"
          >
            Change
          </button>
        </div>
        {moralData && moralData.primary && (
          <div className="mt-3 pt-3 border-t border-zinc-200 dark:border-zinc-700">
             <p className="text-xs text-zinc-500 uppercase tracking-wider font-medium">Moral Conflict</p>
             <div className="flex items-center gap-2 mt-1">
               <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 capitalize">
                 {moralData.primary.replace('_', ' vs ')}
               </span>
               {moralData.complexity && (
                 <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 capitalize">
                   {moralData.complexity.replace('_', ' ')}
                 </span>
               )}
             </div>
          </div>
        )}
        {archetypeData && archetypeData.primary && (
          <div className="mt-3 pt-3 border-t border-zinc-200 dark:border-zinc-700">
             <p className="text-xs text-zinc-500 uppercase tracking-wider font-medium">Character Archetype</p>
             <div className="flex items-center gap-2 mt-1">
               <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 capitalize">
                 {archetypeData.primary}
               </span>
               {archetypeData.secondary && (
                 <span className="text-xs text-zinc-500">
                   + {archetypeData.secondary}
                 </span>
               )}
             </div>
          </div>
        )}
      </div>

      <input type="hidden" name="category" value={selectedCategory} />
      <input type="hidden" name="typeId" value={selectedType.id} />
      <input type="hidden" name="mode" value={selectedMode} />
      <input type="hidden" name="language" value={language} />
      {moralData && <input type="hidden" name="moralData" value={JSON.stringify(moralData)} />}
      {archetypeData && <input type="hidden" name="archetypeData" value={JSON.stringify(archetypeData)} />}
      {selectedHook && <input type="hidden" name="selectedHook" value={JSON.stringify(selectedHook)} />}

      <div className="space-y-6">
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2"
          >
            Title <span className="text-red-500">*</span>
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="block w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-black dark:text-zinc-50 placeholder-zinc-400 dark:placeholder-zinc-500 focus:border-zinc-500 dark:focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:focus:ring-zinc-500"
            placeholder="Enter story title"
          />
        </div>

        <div>
           <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
             Language
           </label>
           <select
             value={language}
             onChange={(e) => setLanguage(e.target.value)}
             className="block w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-black dark:text-zinc-50 focus:border-zinc-500 dark:focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:focus:ring-zinc-500"
           >
             <option value="en">English</option>
             <option value="de">German (Deutsch)</option>
             <option value="th">Thai (ไทย)</option>
           </select>
        </div>

        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2"
          >
            Description / Context
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="block w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-black dark:text-zinc-50 placeholder-zinc-400 dark:placeholder-zinc-500 focus:border-zinc-500 dark:focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:focus:ring-zinc-500"
            placeholder="What is your story about?"
          />
        </div>

        {/* Style & Context Section */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Style & Context (Optional)</h3>
          </div>
          <div className="p-4 space-y-4">
            <div>
              <label htmlFor="backgroundInfo" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Background Info / World Building
              </label>
              <textarea
                id="backgroundInfo"
                name="backgroundInfo"
                rows={3}
                className="block w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-black dark:text-zinc-50 placeholder-zinc-400 dark:placeholder-zinc-500 focus:border-zinc-500 dark:focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:focus:ring-zinc-500 text-sm"
                placeholder="Details about the setting, time period, or important backstory..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="tone" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Tone
                </label>
                <select
                  id="tone"
                  name="tone"
                  className="block w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-black dark:text-zinc-50 focus:border-zinc-500 dark:focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:focus:ring-zinc-500 text-sm"
                >
                  <option value="">Select a tone...</option>
                  {tones.map((t) => (
                    <option key={t.id} value={t.id}>{t.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="style" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Writing Style
                </label>
                <select
                  id="style"
                  name="style"
                  className="block w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-black dark:text-zinc-50 focus:border-zinc-500 dark:focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:focus:ring-zinc-500 text-sm"
                >
                  <option value="">Select a style...</option>
                  {writingStyles.map((s) => (
                    <option key={s.id} value={s.id}>{s.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="perspective" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Perspective
                </label>
                <select
                  id="perspective"
                  name="perspective"
                  className="block w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-black dark:text-zinc-50 focus:border-zinc-500 dark:focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:focus:ring-zinc-500 text-sm"
                >
                  <option value="">Select perspective...</option>
                  {perspectives.map((p) => (
                    <option key={p.id} value={p.id}>{p.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="customInstructions" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Custom AI Instructions
              </label>
              <textarea
                id="customInstructions"
                name="customInstructions"
                rows={2}
                className="block w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-black dark:text-zinc-50 placeholder-zinc-400 dark:placeholder-zinc-500 focus:border-zinc-500 dark:focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:focus:ring-zinc-500 text-sm"
                placeholder="Any specific rules for the AI? (e.g., 'Avoid flowery language', 'Focus on dialogue')"
              />
            </div>
          </div>
        </div>

        {/* Hook Generator Toggle */}
        <div className="border-t border-zinc-200 dark:border-zinc-800 pt-6">
          <button
            type="button"
            onClick={() => setShowHookGenerator(!showHookGenerator)}
            className="flex items-center gap-2 text-sm font-medium text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300"
          >
            {showHookGenerator ? "Hide Hook Generator" : "✨ Need a catchy opening hook?"}
          </button>

          {showHookGenerator && (
            <div className="mt-6 p-6 bg-zinc-50 dark:bg-zinc-900/30 rounded-xl border border-zinc-200 dark:border-zinc-800">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
                Generate a Great Hook
              </h3>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                {hookTypes.map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => toggleHookType(type.id)}
                    className={`p-3 rounded-lg border text-left text-sm transition-all ${
                      selectedHookTypes.includes(type.id)
                        ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20 ring-1 ring-purple-500"
                        : "border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600"
                    }`}
                  >
                    <span className="mr-2">{type.icon}</span>
                    <span className="font-medium">{type.name}</span>
                  </button>
                ))}
              </div>

              <div className="flex justify-end mb-6">
                <button
                  type="button"
                  onClick={handleGenerateHooks}
                  disabled={isGeneratingHooks || selectedHookTypes.length === 0}
                  className="px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black rounded-md text-sm font-medium disabled:opacity-50"
                >
                  {isGeneratingHooks ? "Generating..." : "Generate Options"}
                </button>
              </div>

              {/* Generated Results */}
              {Object.keys(generatedHooks).length > 0 && (
                <div className="space-y-6">
                  {Object.entries(generatedHooks).map(([typeId, hooks]) => {
                    const typeInfo = hookTypes.find(t => t.id === typeId);
                    return (
                      <div key={typeId}>
                        <h4 className="text-sm font-medium text-zinc-500 uppercase tracking-wider mb-3">
                          {typeInfo?.name} Hooks
                        </h4>
                        <div className="space-y-3">
                          {hooks.map((hook: any, idx: number) => {
                            const isSelected = selectedHook?.text === hook.text;
                            return (
                              <div 
                                key={idx}
                                onClick={() => handleSelectHook(typeId, hook, idx)}
                                className={`p-4 rounded-lg border cursor-pointer transition-all ${
                                  isSelected
                                    ? "border-purple-500 bg-white dark:bg-zinc-800 shadow-md ring-1 ring-purple-500"
                                    : "border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:border-purple-300"
                                }`}
                              >
                                <p className="text-zinc-900 dark:text-zinc-100 mb-2">"{hook.text}"</p>
                                <p className="text-xs text-zinc-500 italic">Why: {hook.whyItWorks}</p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-4 pt-4">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-black dark:bg-zinc-50 px-6 py-2.5 text-sm font-medium text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
        >
          {isPending ? "Creating Story..." : "Create Story"}
        </button>
        <Link
          href="/"
          className="rounded-md border border-zinc-300 dark:border-zinc-700 px-6 py-2.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
