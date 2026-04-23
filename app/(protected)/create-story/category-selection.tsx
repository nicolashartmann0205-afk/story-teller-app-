import { StoryCategory, storyCategories } from "@/lib/data/storyTypes";
import { useState } from "react";

interface CategorySelectionProps {
  onSelect: (category: StoryCategory) => void;
}

export function CategorySelection({ onSelect }: CategorySelectionProps) {
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customDescription, setCustomDescription] = useState("");
  const [customGoal, setCustomGoal] = useState("");

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Ideally here we would use AI to suggest a type or save this custom data
    // For now, we just proceed as a 'custom' selection
    onSelect("custom");
  };

  return (
    <>
      {!showCustomForm ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Object.values(storyCategories).map((category) => (
            <button
              key={category.id}
              onClick={() => {
                if (category.id === "custom") {
                  setShowCustomForm(true);
                } else {
                  onSelect(category.id);
                }
              }}
              className={`
                group relative flex flex-col items-start p-8 rounded-2xl border-2 
                transition-all duration-200 text-left hover:shadow-lg hover:scale-[1.02]
                focus:outline-none focus:ring-4 
                ${
                  category.color === "blue"
                    ? "border-brand-seafoam/40 bg-brand-cream hover:border-brand-teal focus:ring-brand-seafoam/40 dark:border-brand-seafoam/30 dark:bg-brand-seafoam/10 dark:hover:border-brand-yellow"
                    : category.color === "orange"
                    ? "border-brand-orange/40 bg-brand-yellow/10 hover:border-brand-orange focus:ring-brand-yellow/40 dark:border-brand-orange/30 dark:bg-brand-orange/10 dark:hover:border-brand-yellow"
                    : category.color === "purple"
                    ? "border-brand-teal/40 bg-brand-seafoam/15 hover:border-brand-teal focus:ring-brand-seafoam/40 dark:border-brand-seafoam/30 dark:bg-brand-teal/10 dark:hover:border-brand-yellow"
                    : category.color === "green"
                    ? "border-brand-seafoam/50 bg-brand-seafoam/20 hover:border-brand-teal focus:ring-brand-seafoam/40 dark:border-brand-seafoam/30 dark:bg-brand-seafoam/10 dark:hover:border-brand-yellow"
                    : category.color === "yellow"
                    ? "border-brand-yellow/50 bg-brand-yellow/20 hover:border-brand-orange focus:ring-brand-yellow/50 dark:border-brand-yellow/30 dark:bg-brand-yellow/10 dark:hover:border-brand-seafoam"
                    : "border-brand-seafoam/30 bg-brand-cream hover:border-brand-teal focus:ring-brand-seafoam/40 dark:border-brand-seafoam/30 dark:bg-brand-ink/40 dark:hover:border-brand-yellow"
                }
              `}
            >
              <div className="text-4xl mb-4">{category.icon}</div>
              <h3 className="text-xl font-bold text-brand-ink dark:text-brand-yellow mb-2">
                {category.name}
              </h3>
              <p className="text-sm text-brand-ink/85 dark:text-brand-seafoam mb-4">
                {category.description}
              </p>
              {category.types.length > 0 && (
                <div className="mt-auto flex items-center text-xs font-medium text-brand-ink/80 dark:text-brand-seafoam">
                  <span>{category.types.length} story types</span>
                </div>
              )}
            </button>
          ))}
        </div>
      ) : (
        <div className="max-w-2xl mx-auto bg-white dark:bg-brand-ink/80 rounded-2xl border border-brand-seafoam/30 p-8">
          <div className="flex items-center gap-4 mb-6">
            <button 
              onClick={() => setShowCustomForm(false)}
              className="text-sm text-brand-ink/80 dark:text-brand-seafoam hover:text-brand-teal dark:hover:text-brand-yellow"
            >
              ← Back
            </button>
            <h2 className="text-2xl font-bold text-brand-ink dark:text-brand-yellow">Define Custom Story</h2>
          </div>
          
          <form onSubmit={handleCustomSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-brand-ink dark:text-brand-seafoam mb-2">
                Describe your story type in a few words
              </label>
              <input
                type="text"
                required
                className="w-full rounded-lg border border-brand-seafoam/60 dark:border-brand-seafoam/40 bg-transparent px-4 py-2 text-brand-ink dark:text-brand-seafoam focus:outline-none focus:ring-2 focus:ring-brand-teal dark:focus:ring-brand-yellow"
                placeholder="e.g., Interactive mystery game script"
                value={customDescription}
                onChange={(e) => setCustomDescription(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-brand-ink dark:text-brand-seafoam mb-2">
                What's the main goal of this story?
              </label>
              <textarea
                required
                rows={3}
                className="w-full rounded-lg border border-brand-seafoam/60 dark:border-brand-seafoam/40 bg-transparent px-4 py-2 text-brand-ink dark:text-brand-seafoam focus:outline-none focus:ring-2 focus:ring-brand-teal dark:focus:ring-brand-yellow"
                placeholder="e.g., To engage players in solving a crime..."
                value={customGoal}
                onChange={(e) => setCustomGoal(e.target.value)}
              />
            </div>

            <div className="pt-4">
              <button
                type="submit"
                className="w-full rounded-lg bg-brand-ink dark:bg-brand-yellow px-6 py-3 text-sm font-bold text-white dark:text-brand-ink hover:bg-brand-teal dark:hover:bg-brand-seafoam transition-all"
              >
                Create Custom Story
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
