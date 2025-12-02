import { StoryCategory, storyCategories } from "@/lib/data/storyTypes";

interface CategorySelectionProps {
  onSelect: (category: StoryCategory) => void;
}

export function CategorySelection({ onSelect }: CategorySelectionProps) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Object.values(storyCategories).map((category) => (
        <button
          key={category.id}
          onClick={() => onSelect(category.id)}
          className={`
            group relative flex flex-col items-start p-8 rounded-2xl border-2 
            transition-all duration-200 text-left hover:shadow-lg hover:scale-[1.02]
            focus:outline-none focus:ring-4 
            ${
              category.color === "blue"
                ? "border-blue-100 bg-blue-50/30 hover:border-blue-300 focus:ring-blue-100 dark:border-blue-900/30 dark:bg-blue-900/10 dark:hover:border-blue-800"
                : category.color === "orange"
                ? "border-orange-100 bg-orange-50/30 hover:border-orange-300 focus:ring-orange-100 dark:border-orange-900/30 dark:bg-orange-900/10 dark:hover:border-orange-800"
                : category.color === "purple"
                ? "border-purple-100 bg-purple-50/30 hover:border-purple-300 focus:ring-purple-100 dark:border-purple-900/30 dark:bg-purple-900/10 dark:hover:border-purple-800"
                : category.color === "green"
                ? "border-green-100 bg-green-50/30 hover:border-green-300 focus:ring-green-100 dark:border-green-900/30 dark:bg-green-900/10 dark:hover:border-green-800"
                : category.color === "yellow"
                ? "border-yellow-100 bg-yellow-50/30 hover:border-yellow-300 focus:ring-yellow-100 dark:border-yellow-900/30 dark:bg-yellow-900/10 dark:hover:border-yellow-800"
                : "border-zinc-100 bg-zinc-50/30 hover:border-zinc-300 focus:ring-zinc-100 dark:border-zinc-800 dark:bg-zinc-900/30 dark:hover:border-zinc-700"
            }
          `}
        >
          <div className="text-4xl mb-4">{category.icon}</div>
          <h3 className="text-xl font-bold text-black dark:text-zinc-50 mb-2">
            {category.name}
          </h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
            {category.description}
          </p>
          {category.types.length > 0 && (
            <div className="mt-auto flex items-center text-xs font-medium text-zinc-500 dark:text-zinc-500">
              <span>{category.types.length} story types</span>
            </div>
          )}
        </button>
      ))}
    </div>
  );
}



