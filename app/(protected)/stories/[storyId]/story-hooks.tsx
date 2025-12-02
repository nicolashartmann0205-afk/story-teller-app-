"use client";

import { useState } from "react";
import { hookTypes, HookTypeID } from "@/lib/data/hookTypes";
import { generateHooksAction, saveSelectedHookAction } from "./actions";
import { useRouter } from "next/navigation";

interface GeneratedHook {
  text: string;
  whyItWorks: string;
  tone: string;
}

interface StoryHooksProps {
  storyId: string;
  existingHooks: any;
}

export default function StoryHooks({ storyId, existingHooks }: StoryHooksProps) {
  const router = useRouter();
  const [selectedTypes, setSelectedTypes] = useState<HookTypeID[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedHooks, setGeneratedHooks] = useState<Record<string, GeneratedHook[]>>(
    existingHooks?.generated || {}
  );
  const [chosenHook, setChosenHook] = useState<any>(existingHooks?.chosen || null);

  const toggleType = (id: HookTypeID) => {
    if (selectedTypes.includes(id)) {
      setSelectedTypes(selectedTypes.filter((t) => t !== id));
    } else {
      setSelectedTypes([...selectedTypes, id]);
    }
  };

  const handleGenerate = async () => {
    if (selectedTypes.length === 0) return;

    setIsGenerating(true);
    try {
      await generateHooksAction(storyId, selectedTypes);
      router.refresh(); // Refresh to get new data from server
    } catch (error) {
      console.error("Failed to generate hooks", error);
      alert("Failed to generate hooks. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectHook = async (type: string, hook: GeneratedHook, index: number) => {
    const hookId = `${type}_${index}`;
    try {
      await saveSelectedHookAction(storyId, hookId, type, hook.text);
      setChosenHook({
        id: hookId,
        type,
        text: hook.text,
        selectedAt: new Date().toISOString(),
      });
      router.refresh();
    } catch (error) {
      console.error("Failed to select hook", error);
    }
  };

  const hasResults = Object.keys(generatedHooks || {}).length > 0;

  // Helper to check if we are in "initial state" (no generation yet)
  // But if we have existingHooks.generated, we show results.
  // If we re-generate, we might append or replace.
  // For simplicity, let's just show selection if no results, or results if results exist.
  // But user might want to generate MORE types.
  // Let's show selection at top, results below.

  return (
    <div className="mt-12 border-t border-zinc-200 dark:border-zinc-800 pt-8">
      <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-6">
        Hook Generator
      </h2>

      {/* Selection Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {hookTypes.map((type) => {
          const isSelected = selectedTypes.includes(type.id);
          const hasGeneratedForThis = generatedHooks[type.id]?.length > 0;

          return (
            <div
              key={type.id}
              onClick={() => toggleType(type.id)}
              className={`cursor-pointer rounded-xl border-2 p-4 transition-all ${
                isSelected
                  ? "border-black dark:border-white bg-zinc-50 dark:bg-zinc-900"
                  : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-3xl">{type.icon}</span>
                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                    isSelected
                      ? "bg-black dark:bg-white border-black dark:border-white"
                      : "border-zinc-300 dark:border-zinc-600"
                  }`}
                >
                  {isSelected && (
                    <svg
                      className="w-3 h-3 text-white dark:text-black"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </div>
              </div>
              <h3 className="font-bold text-zinc-900 dark:text-zinc-100">
                {type.name}
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
                {type.tagline}
              </p>
              <p className="text-sm text-zinc-600 dark:text-zinc-300 mb-4">
                {type.description}
              </p>
              {hasGeneratedForThis && (
                <span className="inline-block px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs rounded-full">
                  Generated
                </span>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex justify-end mb-12">
        <button
          onClick={handleGenerate}
          disabled={selectedTypes.length === 0 || isGenerating}
          className="bg-black dark:bg-white text-white dark:text-black px-6 py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isGenerating ? (
            <>
              <svg
                className="animate-spin h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Generating...
            </>
          ) : (
            "Generate Hooks"
          )}
        </button>
      </div>

      {/* Results Display */}
      {hasResults && (
        <div className="space-y-12">
          {Object.entries(generatedHooks).map(([typeId, hooks]) => {
            const typeInfo = hookTypes.find((t) => t.id === typeId);
            if (!typeInfo || !hooks) return null;

            return (
              <div key={typeId} className="space-y-4">
                <div className="flex items-center gap-3 border-b border-zinc-200 dark:border-zinc-800 pb-2">
                  <span className="text-2xl">{typeInfo.icon}</span>
                  <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                    {typeInfo.name} Hooks
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {hooks.map((hook, idx) => {
                    const isChosen =
                      chosenHook?.id === `${typeId}_${idx}` &&
                      chosenHook?.text === hook.text;

                    return (
                      <div
                        key={idx}
                        className={`rounded-lg border p-6 flex flex-col relative ${
                          isChosen
                            ? "border-purple-500 bg-purple-50 dark:bg-purple-900/10 ring-2 ring-purple-500 ring-offset-2 dark:ring-offset-black"
                            : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"
                        }`}
                      >
                        {isChosen && (
                          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-purple-500 text-white text-xs px-3 py-1 rounded-full font-bold">
                            SELECTED
                          </div>
                        )}
                        <div className="mb-4 flex-grow">
                          <p className="text-lg font-medium text-zinc-900 dark:text-zinc-100 italic">
                            "{hook.text}"
                          </p>
                        </div>
                        <div className="mb-6 text-sm">
                          <span className="font-bold text-zinc-500 dark:text-zinc-400 block mb-1">
                            Why this works:
                          </span>
                          <p className="text-zinc-600 dark:text-zinc-300">
                            {hook.whyItWorks}
                          </p>
                        </div>
                        <div className="mt-auto pt-4 border-t border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
                          <span className="text-xs uppercase tracking-wider font-bold text-zinc-400">
                            {hook.tone}
                          </span>
                          <button
                            onClick={() => handleSelectHook(typeId, hook, idx)}
                            className={`text-sm font-medium px-4 py-2 rounded-md transition-colors ${
                              isChosen
                                ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                                : "bg-black dark:bg-white text-white dark:text-black hover:opacity-90"
                            }`}
                          >
                            {isChosen ? "Selected" : "Use This"}
                          </button>
                        </div>
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
  );
}


