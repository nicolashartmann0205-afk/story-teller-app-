import { StoryCategory, storyCategories, StoryType } from "@/lib/data/storyTypes";
import { useState } from "react";

interface TypeSelectionProps {
  category: StoryCategory;
  onSelect: (type: StoryType) => void;
  onBack: () => void;
}

export function TypeSelection({ category, onSelect, onBack }: TypeSelectionProps) {
  const categoryData = storyCategories[category];
  const [searchQuery, setSearchQuery] = useState("");

  // Flatten types if we were doing global search, but here we are scoped to category
  // unless we want to allow searching all types from within a category view?
  // For now, let's stick to filtering the current category's types.
  const filteredTypes = categoryData.types.filter((type) =>
    type.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={onBack}
          className="text-sm text-zinc-500 hover:text-black dark:hover:text-white transition-colors"
        >
          ← Back to Categories
        </button>
        <h2 className="text-xl font-semibold text-black dark:text-zinc-50 flex items-center gap-2">
          <span className="text-2xl">{categoryData.icon}</span>
          {categoryData.name}
        </h2>
      </div>

      <div className="relative">
        <input
          type="text"
          placeholder={`Search ${categoryData.name.toLowerCase()}...`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-2 pl-10 text-sm text-black dark:text-white placeholder-zinc-400 focus:border-black dark:focus:border-white focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
        />
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">
          🔍
        </span>
      </div>

      {filteredTypes.length === 0 ? (
        <div className="text-center py-12 text-zinc-500">
          No story types found matching "{searchQuery}"
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filteredTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => onSelect(type)}
              className="group text-left p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-black dark:hover:border-white hover:shadow-md transition-all duration-200"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-lg text-black dark:text-white">
                  {type.name}
                </h3>
                <span className="text-xs px-2 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 uppercase tracking-wider font-medium text-[10px]">
                  {type.difficulty}
                </span>
              </div>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4 line-clamp-2">
                {type.description}
              </p>
              <div className="space-y-1 text-xs text-zinc-500 dark:text-zinc-500">
                <p>⏱️ {type.typicalLength}</p>
                <p>🎯 Best for: {type.bestFor}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

