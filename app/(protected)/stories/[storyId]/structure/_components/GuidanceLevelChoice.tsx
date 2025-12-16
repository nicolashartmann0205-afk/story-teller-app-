import React from 'react';

interface GuidanceLevelChoiceProps {
  onSelect: (level: 'deep' | 'light') => void;
}

export default function GuidanceLevelChoice({ onSelect }: GuidanceLevelChoiceProps) {
  return (
    <div className="flex flex-col md:flex-row gap-6 max-w-4xl mx-auto mt-8">
      {/* Deep Guidance Card */}
      <div 
        className="flex-1 p-8 rounded-xl border-2 border-zinc-200 dark:border-zinc-800 hover:border-purple-500 dark:hover:border-purple-500 cursor-pointer transition-all bg-white dark:bg-zinc-900 shadow-sm hover:shadow-md group"
        onClick={() => onSelect('deep')}
      >
        <div className="flex items-center gap-3 mb-4">
          <span className="text-3xl">📚</span>
          <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-purple-600 dark:group-hover:text-purple-400">Deep Guidance</h3>
        </div>
        <p className="text-zinc-600 dark:text-zinc-400 mb-6 min-h-[3rem]">
          Choose from proven structures with detailed step-by-step guidance.
        </p>
        <ul className="space-y-3 mb-8 text-sm text-zinc-600 dark:text-zinc-400">
          <li className="flex gap-2"><span>✅</span> Step-by-step beat breakdowns</li>
          <li className="flex gap-2"><span>✅</span> Guided questions for each beat</li>
          <li className="flex gap-2"><span>✅</span> Examples from successful stories</li>
          <li className="flex gap-2"><span>✅</span> Pacing recommendations</li>
        </ul>
        <div className="mt-auto">
          <div className="text-xs font-medium text-zinc-500 mb-2 uppercase tracking-wide">Best For</div>
          <div className="text-sm text-zinc-800 dark:text-zinc-200">First-time storytellers, important stories</div>
        </div>
      </div>

      {/* Light Guidance Card */}
      <div 
        className="flex-1 p-8 rounded-xl border-2 border-zinc-200 dark:border-zinc-800 hover:border-blue-500 dark:hover:border-blue-500 cursor-pointer transition-all bg-white dark:bg-zinc-900 shadow-sm hover:shadow-md group"
        onClick={() => onSelect('light')}
      >
        <div className="flex items-center gap-3 mb-4">
          <span className="text-3xl">✨</span>
          <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400">Light Guidance</h3>
        </div>
        <p className="text-zinc-600 dark:text-zinc-400 mb-6 min-h-[3rem]">
          Choose from 15+ structures with AI-generated outlines.
        </p>
        <ul className="space-y-3 mb-8 text-sm text-zinc-600 dark:text-zinc-400">
          <li className="flex gap-2"><span>✅</span> Brief structure overview</li>
          <li className="flex gap-2"><span>✅</span> 3-5 key beats/touchpoints</li>
          <li className="flex gap-2"><span>✅</span> AI generates custom outline</li>
          <li className="flex gap-2"><span>✅</span> Quick implementation</li>
        </ul>
        <div className="mt-auto">
          <div className="text-xs font-medium text-zinc-500 mb-2 uppercase tracking-wide">Best For</div>
          <div className="text-sm text-zinc-800 dark:text-zinc-200">Experienced storytellers, exploring options</div>
        </div>
      </div>
    </div>
  );
}


