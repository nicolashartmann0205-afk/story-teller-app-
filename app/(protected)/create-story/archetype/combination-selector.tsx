"use client";

import { Archetype, archetypesLibrary } from "@/lib/data/archetypes";

interface CombinationSelectorProps {
  primaryArchetypeId: string;
  selectedSecondaryId?: string | null;
  onSelect: (secondaryId: string | null) => void;
}

export function CombinationSelector({
  primaryArchetypeId,
  selectedSecondaryId,
  onSelect,
}: CombinationSelectorProps) {
  const primaryArchetype = archetypesLibrary[primaryArchetypeId];

  if (!primaryArchetype) return null;

  const combinations = primaryArchetype.combinations || {};
  const combinationKeys = Object.keys(combinations);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="text-center max-w-2xl mx-auto">
        <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
          Add Depth with a Secondary Archetype
        </h3>
        <p className="text-zinc-600 dark:text-zinc-400">
          Combine <strong>{primaryArchetype.name}</strong> with another archetype to create a more complex, nuanced character.
        </p>
      </div>

      {combinationKeys.length === 0 ? (
        <div className="text-center text-zinc-500 italic p-8 border border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl">
          No specific combinations defined for this archetype yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Option to keep single archetype */}
          <div
            onClick={() => onSelect(null)}
            className={`
              cursor-pointer p-6 rounded-xl border-2 transition-all
              ${
                selectedSecondaryId === null
                  ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                  : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-600 bg-white dark:bg-zinc-900"
              }
            `}
          >
            <div className="flex items-center gap-4">
              <div className="text-4xl">{primaryArchetype.icon}</div>
              <div>
                <h4 className="font-bold text-lg text-zinc-900 dark:text-zinc-100">
                  Pure {primaryArchetype.name}
                </h4>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Focus on the core strengths and weaknesses of a single archetype.
                </p>
              </div>
            </div>
          </div>

          {/* Combinations */}
          {combinationKeys.map((secondaryId) => {
            const secondary = archetypesLibrary[secondaryId];
            const combo = combinations[secondaryId];
            const isSelected = selectedSecondaryId === secondaryId;

            if (!secondary || !combo) return null;

            return (
              <div
                key={secondaryId}
                onClick={() => onSelect(secondaryId)}
                className={`
                  cursor-pointer p-6 rounded-xl border-2 transition-all relative overflow-hidden
                  ${
                    isSelected
                      ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20 ring-1 ring-purple-500"
                      : "border-zinc-200 dark:border-zinc-800 hover:border-purple-300 dark:hover:border-purple-700 bg-white dark:bg-zinc-900"
                  }
                `}
              >
                <div className="flex items-start gap-4">
                  <div className="flex flex-col items-center gap-1 min-w-[3rem]">
                    <div className="text-2xl opacity-50">{primaryArchetype.icon}</div>
                    <div className="text-xs text-zinc-400 font-bold">+</div>
                    <div className="text-3xl">{secondary.icon}</div>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-lg text-zinc-900 dark:text-zinc-100 mb-1">
                        {combo.name}
                      </h4>
                      {isSelected && (
                        <span className="bg-purple-500 text-white text-xs px-2 py-0.5 rounded-full">
                          Selected
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-medium text-purple-600 dark:text-purple-400 mb-2 uppercase tracking-wide">
                      {primaryArchetype.name} + {secondary.name}
                    </p>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      {combo.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
