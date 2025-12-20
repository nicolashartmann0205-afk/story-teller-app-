import React from 'react';
import { StoryStructure } from '@/lib/data/structures';

interface StructureDetailModalProps {
  structure: StoryStructure | null;
  isOpen: boolean;
  onClose: () => void;
  onSelect: (structure: StoryStructure) => void;
}

export default function StructureDetailModal({ structure, isOpen, onClose, onSelect }: StructureDetailModalProps) {
  if (!isOpen || !structure) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto flex flex-col">
        <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-start sticky top-0 bg-white dark:bg-zinc-900 z-10">
          <div className="flex items-center gap-3">
             <span className="text-3xl">{structure.icon}</span>
             <div>
               <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{structure.name}</h2>
               <p className="text-sm text-zinc-500">{structure.tagline}</p>
             </div>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300">
            ✕
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Overview */}
          <section>
            <h3 className="text-lg font-semibold mb-2">Overview</h3>
            <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
              {structure.fullDescription || structure.description}
            </p>
          </section>

          {/* Visual Arc (Placeholder) */}
          <section className="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-lg">
             <h3 className="text-sm font-semibold mb-2 uppercase tracking-wide text-zinc-500">Emotional Arc</h3>
             <div className="h-32 flex items-end gap-1">
               {structure.visualArc?.map((val, i) => (
                 <div key={i} className="flex-1 bg-indigo-500/20 rounded-t" style={{ height: `${val}%` }}>
                    <div className="bg-indigo-500 h-1 w-full rounded-t opacity-50"></div>
                 </div>
               ))}
             </div>
          </section>

          {/* Beats */}
          <section>
            <h3 className="text-lg font-semibold mb-4">Structure Beats ({structure.beats.length})</h3>
            <div className="space-y-4">
              {structure.beats.map((beat, index) => (
                <div key={beat.id} className="flex gap-4 p-3 rounded border border-zinc-100 dark:border-zinc-800">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-700 dark:text-indigo-400 font-bold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="font-medium text-zinc-900 dark:text-zinc-100">{beat.name}</h4>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">{beat.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Best For */}
          <section>
             <h3 className="text-sm font-semibold mb-2 uppercase tracking-wide text-zinc-500">Best For</h3>
             <div className="flex flex-wrap gap-2">
               {structure.bestFor?.map((item, i) => (
                 <span key={i} className="px-2 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-sm rounded">
                   {item}
                 </span>
               ))}
             </div>
          </section>
        </div>

        <div className="p-6 border-t border-zinc-200 dark:border-zinc-800 flex justify-end gap-3 sticky bottom-0 bg-white dark:bg-zinc-900 z-10">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded"
          >
            Cancel
          </button>
          <button 
            onClick={() => onSelect(structure)}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded shadow-lg shadow-indigo-500/20"
          >
            Select This Structure
          </button>
        </div>
      </div>
    </div>
  );
}







