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
          className="text-sm text-brand-ink/85 dark:text-brand-seafoam hover:text-brand-teal dark:hover:text-brand-yellow underline"
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
          ? "border-brand-seafoam/40 hover:border-brand-teal bg-brand-cream/70 dark:bg-brand-seafoam/10 dark:border-brand-seafoam/30 dark:hover:border-brand-yellow"
          : "border-brand-yellow/30 hover:border-brand-orange bg-brand-yellow/10 dark:bg-brand-orange/10 dark:border-brand-orange/30 dark:hover:border-brand-yellow"
      }`}
    >
      <div className="mb-6">
        {badge && (
          <div className="absolute top-4 right-4 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-brand-teal/20 text-brand-teal dark:bg-brand-yellow/20 dark:text-brand-yellow border border-brand-seafoam/40">
            {badge}
          </div>
        )}
        <div className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 ${
          isBlue 
            ? "bg-brand-seafoam/30 text-brand-teal dark:bg-brand-seafoam/20 dark:text-brand-seafoam" 
            : "bg-brand-yellow/30 text-brand-orange dark:bg-brand-orange/20 dark:text-brand-yellow"
        }`}>
          {timeEstimate}
        </div>
        <h3 className="text-2xl font-bold text-brand-ink dark:text-brand-yellow mb-2">
          {title}
        </h3>
        <p className="text-brand-ink/85 dark:text-brand-seafoam leading-relaxed">
          {description}
        </p>
      </div>

      <div className="mt-auto space-y-3">
        <p className="font-semibold text-sm text-brand-ink dark:text-brand-seafoam">Includes:</p>
        <ul className="space-y-2">
          {features.map((feature, idx) => (
            <li key={idx} className="flex items-start gap-2 text-sm text-brand-ink/85 dark:text-brand-seafoam">
              <svg
                className={`w-5 h-5 shrink-0 ${isBlue ? "text-brand-teal" : "text-brand-orange"}`}
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
          ? "bg-brand-ink text-white hover:bg-brand-teal dark:bg-brand-seafoam dark:text-brand-ink dark:hover:bg-brand-yellow"
          : "bg-brand-orange text-white hover:bg-brand-ink dark:bg-brand-yellow dark:text-brand-ink dark:hover:bg-brand-seafoam"
      }`}>
        Select {title}
      </div>
    </motion.div>
  );
}




