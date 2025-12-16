import { StoryCategory, storyCategories, StoryType } from "@/lib/data/storyTypes";
import { useState } from "react";

interface TypeSelectionProps {
  category: StoryCategory;
  onSelect: (type: StoryType) => void;
  onBack: () => void;
}

type DifficultyFilter = "all" | "beginner" | "intermediate" | "advanced";
type LengthFilter = "all" | "short" | "medium" | "long";

export function TypeSelection({ category, onSelect, onBack }: TypeSelectionProps) {
  const categoryData = storyCategories[category];
  const [searchQuery, setSearchQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyFilter>("all");
  // Length filter logic is a bit complex as strings vary, let's keep it simple for v1 or match keywords
  
  const filteredTypes = categoryData.types.filter((type) => {
    const matchesSearch = type.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          type.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDifficulty = difficultyFilter === "all" || type.difficulty === difficultyFilter;
    
    return matchesSearch && matchesDifficulty;
  });

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

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-grow">
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
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-zinc-500 whitespace-nowrap">Difficulty:</span>
          <select
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value as DifficultyFilter)}
            className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-black dark:text-white focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
          >
            <option value="all">All Levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
      </div>

      {filteredTypes.length === 0 ? (
        <div className="text-center py-12 text-zinc-500">
          No story types found matching your filters.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => onSelect(type)}
              className={`
                group text-left p-6 rounded-xl border border-b border-x border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 
                border-t-4 hover:shadow-md transition-all duration-200 flex flex-col h-full
                ${
                  categoryData.color === "blue" 
                    ? "border-t-blue-500 hover:border-blue-400" 
                    : categoryData.color === "orange"
                    ? "border-t-orange-500 hover:border-orange-400"
                    : categoryData.color === "purple"
                    ? "border-t-purple-500 hover:border-purple-400"
                    : categoryData.color === "green"
                    ? "border-t-green-500 hover:border-green-400"
                    : categoryData.color === "yellow"
                    ? "border-t-yellow-500 hover:border-yellow-400"
                    : "border-t-zinc-500 hover:border-zinc-400"
                }
              `}
            >
              <div className="flex justify-between items-start mb-2 w-full">
                <h3 className="font-bold text-lg text-black dark:text-white line-clamp-1 pr-2">
                  {type.name}
                </h3>
                <span className={`text-[10px] px-2 py-1 rounded-full uppercase tracking-wider font-medium whitespace-nowrap ${
                  type.difficulty === 'beginner' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                  type.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                  'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                }`}>
                  {type.difficulty}
                </span>
              </div>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4 line-clamp-3 flex-grow">
                {type.description}
              </p>
              <div className="space-y-2 text-xs text-zinc-500 dark:text-zinc-500 mt-auto pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <span>⏱️</span>
                  <span>{type.typicalLength}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="mt-0.5">🎯</span>
                  <span className="line-clamp-1">{type.bestFor}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
