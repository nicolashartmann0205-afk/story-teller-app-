"use client";

import { MoralComplexity } from "@/lib/data/moralConflicts";
import { useState } from "react";

interface ComplexitySelectionProps {
  selectedComplexity: MoralComplexity | null;
  onSelect: (complexity: MoralComplexity) => void;
  onNext: () => void;
  onBack: () => void;
}

export function ComplexitySelection({
  selectedComplexity,
  onSelect,
  onNext,
  onBack,
}: ComplexitySelectionProps) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
          How complex is your moral story?
        </h2>
        <p className="text-zinc-600 dark:text-zinc-400">
          Choose the level of moral ambiguity you want to explore.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ComplexityCard
          id="simple"
          title="Simple Conflict"
          subtitle="Clear Good vs. Evil"
          icon="⭐"
          description="One side is clearly right, the other is clearly wrong. Your hero fights for the good side against a villain."
          bestFor={["Inspirational stories", "Children's narratives", "Clear cause advocacy"]}
          isSelected={selectedComplexity === "simple"}
          onSelect={() => onSelect("simple")}
        />
        <ComplexityCard
          id="two_rights"
          title="Two Rights"
          subtitle="Tragic Choice"
          icon="⚡"
          description="Both sides have moral justification. There is no perfect answer, and honoring one value means sacrificing another."
          bestFor={["Sophisticated dramas", "Ethical dilemmas", "Character-driven stories"]}
          isSelected={selectedComplexity === "two_rights"}
          onSelect={() => onSelect("two_rights")}
        />
        <ComplexityCard
          id="lesser_evil"
          title="Lesser Evil"
          subtitle="No Good Options"
          icon="🌪️"
          description="Both options cause harm. The protagonist must choose the path that causes the least damage."
          bestFor={["War stories", "Crisis scenarios", "Survival narratives"]}
          isSelected={selectedComplexity === "lesser_evil"}
          onSelect={() => onSelect("lesser_evil")}
        />
      </div>

      <div className="flex justify-between pt-4 border-t border-zinc-200 dark:border-zinc-800">
        <button
          onClick={onBack}
          className="px-4 py-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 font-medium"
        >
          Back
        </button>
        <button
          onClick={onNext}
          disabled={!selectedComplexity}
          className="px-6 py-2 bg-black dark:bg-zinc-50 text-white dark:text-black rounded-md font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Continue
        </button>
      </div>
    </div>
  );
}

function ComplexityCard({
  id,
  title,
  subtitle,
  icon,
  description,
  bestFor,
  isSelected,
  onSelect,
}: {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  description: string;
  bestFor: string[];
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <div
      onClick={onSelect}
      className={`cursor-pointer rounded-xl border-2 p-6 transition-all h-full flex flex-col ${
        isSelected
          ? "border-black dark:border-white bg-zinc-50 dark:bg-zinc-900 ring-1 ring-black dark:ring-white"
          : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 bg-white dark:bg-zinc-900"
      }`}
    >
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-1">
        {title}
      </h3>
      <p className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 mb-4">
        {subtitle}
      </p>
      <p className="text-sm text-zinc-600 dark:text-zinc-300 mb-6 flex-grow leading-relaxed">
        {description}
      </p>
      
      <div className="mt-auto pt-4 border-t border-zinc-100 dark:border-zinc-800">
        <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-500 mb-2">Best for:</p>
        <ul className="space-y-1">
          {bestFor.map((item, idx) => (
            <li key={idx} className="text-xs text-zinc-600 dark:text-zinc-400 flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-zinc-400"></span>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}




