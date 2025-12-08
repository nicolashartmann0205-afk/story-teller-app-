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
      <div className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 max-h-[90vh] overflow-y-auto flex flex-col">
        
        {/* Header - Fixed */}
        <div className="sticky top-0 bg-white dark:bg-zinc-900 z-10 p-6 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-black dark:text-white mb-1">
              {type.name}
            </h2>
            <div className="flex gap-2 mt-2">
              <span className="text-xs px-2 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 uppercase tracking-wider font-medium">
                {type.difficulty}
              </span>
              <span className="text-xs px-2 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-medium">
                {type.typicalLength}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-black dark:hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="p-8 overflow-y-auto">
          <p className="text-lg text-zinc-600 dark:text-zinc-300 mb-8 leading-relaxed">
            {type.description}
          </p>

          <div className="grid gap-8 sm:grid-cols-2 mb-8">
            {/* Left Column */}
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <span>🎯</span> Best For
                </h4>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {type.bestFor}
                </p>
              </div>
              
              <div>
                <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <span>🔑</span> Key Elements
                </h4>
                <ul className="space-y-2">
                  {type.keyElements.map((el) => (
                    <li key={el} className="flex items-start gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                      <span className="text-green-500 mt-0.5">✓</span>
                      {el}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <span>🏗️</span> Recommended Structures
                </h4>
                <ul className="space-y-2">
                  {type.recommendedStructures.map((struct) => (
                    <li key={struct} className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800/50 px-3 py-2 rounded-lg border border-zinc-100 dark:border-zinc-800">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                      <span className="capitalize">{struct.replace(/([A-Z])/g, ' $1').trim()}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <span>🎭</span> Typical Archetypes
                </h4>
                <div className="flex flex-wrap gap-2">
                  {type.recommendedArchetypes.map((arch) => (
                    <span key={arch} className="text-xs px-2 py-1 rounded-md bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-800 capitalize">
                      {arch}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="p-5 bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-amber-100 dark:border-amber-800/30">
            <h4 className="text-sm font-semibold text-amber-900 dark:text-amber-100 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span>💡</span> Real-world Examples
            </h4>
            <ul className="grid sm:grid-cols-2 gap-2">
              {type.examples.map((ex) => (
                <li key={ex} className="flex items-center gap-2 text-sm text-amber-800 dark:text-amber-200/80">
                  <span className="w-1 h-1 rounded-full bg-amber-400"></span>
                  {ex}
                </li>
              ))}
            </ul>
          </div>
          </div>

        {/* Footer - Fixed */}
        <div className="sticky bottom-0 bg-white dark:bg-zinc-900 p-6 border-t border-zinc-100 dark:border-zinc-800 flex gap-4">
            <button
              onClick={() => onConfirm(type)}
            className="flex-1 rounded-lg bg-black dark:bg-zinc-50 px-6 py-3 text-sm font-bold text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Select This Type
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors"
            >
            Keep Browsing
            </button>
        </div>
      </div>
    </div>
  );
}
