"use client";

import { useState } from "react";
import { motion } from "framer-motion";

export type StoryMode = "quick" | "comprehensive";

interface ModeSelectionProps {
  onSelect: (mode: StoryMode) => void;
  onHelp: () => void;
}

export function ModeSelection({ onSelect, onHelp }: ModeSelectionProps) {
  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Quick Mode Card */}
        <ModeCard
          mode="quick"
          title="Quick Mode"
          timeEstimate="15-20 min"
          description="A streamlined, fast-paced workflow to get your story idea down quickly."
          features={[
            "6-step streamlined process",
            "Core story elements only",
            "Perfect for drafts & outlines",
            "AI-assisted brainstorming"
          ]}
          badge="75% completion rate"
          color="blue"
          onClick={() => onSelect("quick")}
        />

        {/* Comprehensive Mode Card */}
        <ModeCard
          mode="comprehensive"
          title="Comprehensive Mode"
          timeEstimate="45-60 min"
          description="A deep dive into every aspect of your story, from character arcs to thematic depth."
          features={[
            "15-step full tactical framework",
            "Detailed character builder",
            "Scene-by-scene breakdown",
            "Advanced AI analysis"
          ]}
          badge="Best for depth"
          color="purple"
          onClick={() => onSelect("comprehensive")}
        />
      </div>

      <div className="mt-12 text-center">
        <button
          onClick={onHelp}
          className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 underline"
        >
          Not sure which mode to choose? Help me decide.
        </button>
      </div>
    </div>
  );
}

interface ModeCardProps {
  mode: StoryMode;
  title: string;
  timeEstimate: string;
  description: string;
  features: string[];
  badge?: string;
  color: "blue" | "purple";
  onClick: () => void;
}

function ModeCard({
  mode,
  title,
  timeEstimate,
  description,
  features,
  badge,
  color,
  onClick,
}: ModeCardProps) {
  const isBlue = color === "blue";
  
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      onClick={onClick}
      className={`relative cursor-pointer rounded-2xl border-2 p-8 transition-all h-full flex flex-col ${
        isBlue
          ? "border-blue-100 hover:border-blue-500 bg-blue-50/30 dark:bg-blue-900/10 dark:border-blue-900 dark:hover:border-blue-400"
          : "border-purple-100 hover:border-purple-500 bg-purple-50/30 dark:bg-purple-900/10 dark:border-purple-900 dark:hover:border-purple-400"
      }`}
    >
      <div className="mb-6">
        {badge && (
          <div className="absolute top-4 right-4 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300 border border-green-200 dark:border-green-800">
            {badge}
          </div>
        )}
        <div className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 ${
          isBlue 
            ? "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300" 
            : "bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300"
        }`}>
          {timeEstimate}
        </div>
        <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
          {title}
        </h3>
        <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
          {description}
        </p>
      </div>

      <div className="mt-auto space-y-3">
        <p className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">Includes:</p>
        <ul className="space-y-2">
          {features.map((feature, idx) => (
            <li key={idx} className="flex items-start gap-2 text-sm text-zinc-600 dark:text-zinc-400">
              <svg
                className={`w-5 h-5 shrink-0 ${isBlue ? "text-blue-500" : "text-purple-500"}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {feature}
            </li>
          ))}
        </ul>
      </div>
      
      <div className={`mt-8 w-full py-3 rounded-lg text-center font-semibold transition-colors ${
        isBlue
          ? "bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-400"
          : "bg-purple-600 text-white hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-400"
      }`}>
        Select {title}
      </div>
    </motion.div>
  );
}




