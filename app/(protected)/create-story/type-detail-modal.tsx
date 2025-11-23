import { StoryType } from "@/lib/data/storyTypes";

interface TypeDetailModalProps {
  type: StoryType | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (type: StoryType) => void;
}

export function TypeDetailModal({ type, isOpen, onClose, onConfirm }: TypeDetailModalProps) {
  if (!isOpen || !type) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-zinc-400 hover:text-black dark:hover:text-white"
        >
          ✕
        </button>

        <div className="p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-black dark:text-white mb-2">
              {type.name}
            </h2>
            <p className="text-lg text-zinc-600 dark:text-zinc-400">
              {type.description}
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 mb-8">
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider mb-2">
                  Details
                </h4>
                <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                  <li>⏱️ Length: {type.typicalLength}</li>
                  <li>📈 Difficulty: {type.difficulty}</li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider mb-2">
                  Best For
                </h4>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  {type.bestFor}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider mb-2">
                  Key Elements
                </h4>
                <ul className="text-sm text-zinc-600 dark:text-zinc-400 list-disc pl-4 space-y-1">
                  {type.keyElements.map((el) => (
                    <li key={el}>{el}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="mb-8 p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
            <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider mb-3">
              Real-world Examples
            </h4>
            <ul className="space-y-2">
              {type.examples.map((ex) => (
                <li key={ex} className="flex items-center text-sm text-zinc-600 dark:text-zinc-400">
                  <span className="mr-2">💡</span> {ex}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex gap-4 pt-6 border-t border-zinc-200 dark:border-zinc-800">
            <button
              onClick={() => onConfirm(type)}
              className="flex-1 rounded-lg bg-black dark:bg-zinc-50 px-6 py-3 text-sm font-medium text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
            >
              Select This Type
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

