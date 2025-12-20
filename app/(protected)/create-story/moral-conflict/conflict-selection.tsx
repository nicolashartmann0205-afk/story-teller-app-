"use client";

import { MoralConflict, MoralConflictID, moralConflicts } from "@/lib/data/moralConflicts";
import { motion } from "framer-motion";
import { useState } from "react";

interface MoralConflictSelectionProps {
  selectedId: MoralConflictID | null;
  onSelect: (id: MoralConflictID) => void;
  onNext: () => void;
  onBack: () => void;
}

export function MoralConflictSelection({
  selectedId,
  onSelect,
  onNext,
  onBack,
}: MoralConflictSelectionProps) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
          Choose a Moral Conflict Framework
        </h2>
        <p className="text-zinc-600 dark:text-zinc-400">
          Add depth to your story by exploring the ethical tensions at its core. Select one primary conflict.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {moralConflicts.map((conflict) => (
          <ConflictCard
            key={conflict.id}
            conflict={conflict}
            isSelected={selectedId === conflict.id}
            onSelect={() => onSelect(conflict.id)}
          />
        ))}
      </div>

      <div className="flex justify-between pt-4 border-t border-zinc-200 dark:border-zinc-800">
        <button
          onClick={onBack}
          className="px-4 py-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 font-medium"
        >
          Back
        </button>
        <div className="flex gap-2">
          <button
             onClick={onNext} // Allow skipping if needed, or validate
             className={`px-6 py-2 rounded-md font-medium transition-all ${
                selectedId 
                  ? "bg-black dark:bg-zinc-50 text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200"
                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
             }`}
          >
            {selectedId ? "Continue" : "Skip this step"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ConflictCard({
  conflict,
  isSelected,
  onSelect,
}: {
  conflict: MoralConflict;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Map color names to Tailwind classes
  const colorClasses = {
    pink: "bg-pink-50 dark:bg-pink-900/20 border-pink-200 dark:border-pink-800 text-pink-700 dark:text-pink-300",
    blue: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300",
    green: "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300",
    purple: "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300",
    teal: "bg-teal-50 dark:bg-teal-900/20 border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300",
    amber: "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300",
  };

  const baseColor = colorClasses[conflict.color as keyof typeof colorClasses] || colorClasses.blue;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`relative rounded-xl border-2 transition-all cursor-pointer overflow-hidden ${
        isSelected
          ? "border-black dark:border-white ring-2 ring-black/5 dark:ring-white/10 shadow-lg"
          : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
      } bg-white dark:bg-zinc-900`}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest("button")) return;
        onSelect();
      }}
    >
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <span className="text-3xl">{conflict.icon}</span>
          {isSelected && (
            <span className={`text-xs font-bold px-2 py-1 rounded-full ${baseColor}`}>
              SELECTED
            </span>
          )}
        </div>
        <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-1">
          {conflict.name}
        </h3>
        <p className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-3">
          {conflict.coreTension}
        </p>
        <p className="text-sm text-zinc-600 dark:text-zinc-300 mb-4 line-clamp-2">
          {conflict.description}
        </p>
        
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300 underline"
        >
          {isExpanded ? "Show Less" : "Learn More"}
        </button>
      </div>

      {isExpanded && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="px-5 pb-5 border-t border-zinc-100 dark:border-zinc-800 pt-4 bg-zinc-50/50 dark:bg-zinc-900/50"
        >
           <div className="space-y-4 text-sm">
             <div>
               <span className="font-semibold text-green-600 dark:text-green-400">Good Side:</span> {conflict.goodSide}
             </div>
             <div>
               <span className="font-semibold text-red-600 dark:text-red-400">Bad Side:</span> {conflict.badSide}
             </div>
             <div>
               <h4 className="font-semibold mb-1 text-zinc-900 dark:text-zinc-100">Examples:</h4>
               <ul className="list-disc list-inside text-zinc-600 dark:text-zinc-400 space-y-1">
                 {conflict.examples.slice(0, 3).map((ex, i) => (
                   <li key={i}>{ex}</li>
                 ))}
               </ul>
             </div>
           </div>
        </motion.div>
      )}
    </motion.div>
  );
}











