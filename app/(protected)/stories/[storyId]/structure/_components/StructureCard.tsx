import React from 'react';
import { StoryStructure } from '@/lib/data/structures';

interface StructureCardProps {
  structure: StoryStructure;
  onSelect: (structure: StoryStructure) => void;
  onLearnMore: (structure: StoryStructure) => void;
  isRecommended?: boolean;
}

export default function StructureCard({ structure, onSelect, onLearnMore, isRecommended }: StructureCardProps) {
  return (
    <div className="flex flex-col p-6 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:shadow-lg transition-all relative">
      {isRecommended && (
        <div className="absolute top-4 right-4 bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-medium">
          ⭐ Recommended
        </div>
      )}
      <div className="flex items-center gap-3 mb-3">
        <span className="text-2xl">{structure.icon || '📝'}</span>
        <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{structure.name}</h3>
      </div>
      <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4 line-clamp-2 min-h-[2.5rem]">
        {structure.description}
      </p>
      
      <div className="flex gap-2 mb-4 text-xs text-zinc-500">
        <span className="px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded">{structure.difficulty || 'Moderate'}</span>
        <span className="px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded">{structure.timeToDevelop || 'Medium'}</span>
      </div>

      <div className="mt-auto flex gap-2">
        <button 
          onClick={(e) => { e.stopPropagation(); onLearnMore(structure); }}
          className="flex-1 px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
        >
          Learn More
        </button>
        <button 
          onClick={() => onSelect(structure)}
          className="flex-1 px-3 py-2 text-sm text-white bg-indigo-600 rounded hover:bg-indigo-700 transition-colors"
        >
          Select
        </button>
      </div>
    </div>
  );
}





