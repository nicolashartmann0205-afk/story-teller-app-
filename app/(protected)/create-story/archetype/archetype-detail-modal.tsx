"use client";

import { Archetype } from "@/lib/data/archetypes";
import { useEffect } from "react";
import { createPortal } from "react-dom";

interface ArchetypeDetailModalProps {
  archetype: Archetype | null;
  isOpen: boolean;
  onClose: () => void;
  onSelect: (archetypeId: string) => void;
}

export function ArchetypeDetailModal({
  archetype,
  isOpen,
  onClose,
  onSelect,
}: ArchetypeDetailModalProps) {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Close on escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  if (!isOpen || !archetype) return null;

  // Render to body (portal) if possible, otherwise inline (for now inline is safer in Next.js app router if not set up for portals easily, but let's try portal if document exists)
  // Actually, avoiding portal complexity for now to ensure it works in the sandbox environment without extra setup.
  // I'll use a fixed overlay.

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="p-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row gap-6 items-start mb-8">
            <div className="flex-shrink-0 w-24 h-24 rounded-2xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-6xl border-2 border-purple-200 dark:border-purple-800">
              {archetype.icon}
            </div>
            <div>
              <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
                {archetype.name}
              </h2>
              <p className="text-xl text-purple-600 dark:text-purple-400 font-medium mb-4">
                {archetype.tagline}
              </p>
              <p className="text-lg text-zinc-700 dark:text-zinc-300 leading-relaxed">
                {archetype.fullDescription}
              </p>
            </div>
          </div>

          {/* Key Characteristics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="space-y-4">
              <div className="bg-zinc-50 dark:bg-zinc-800/50 p-5 rounded-xl border border-zinc-100 dark:border-zinc-700">
                <h3 className="font-bold text-zinc-900 dark:text-zinc-100 mb-3 flex items-center gap-2">
                  <span>✨</span> The Gift
                </h3>
                <p className="text-zinc-600 dark:text-zinc-400">{archetype.gift}</p>
              </div>
              
              <div>
                <h3 className="font-bold text-zinc-900 dark:text-zinc-100 mb-3">Core Values</h3>
                <div className="flex flex-wrap gap-2">
                  {archetype.values.map((value) => (
                    <span
                      key={value}
                      className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium"
                    >
                      {value}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-red-50 dark:bg-red-900/10 p-5 rounded-xl border border-red-100 dark:border-red-900/30">
                <h3 className="font-bold text-red-800 dark:text-red-300 mb-3 flex items-center gap-2">
                  <span>⚠️</span> The Shadow Side
                </h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-xs font-bold uppercase text-red-600 dark:text-red-400">Too Much:</span>
                    <span className="ml-2 text-zinc-700 dark:text-zinc-300 font-medium">{archetype.darkSides.tooMuch.name}</span>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">{archetype.darkSides.tooMuch.description}</p>
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase text-blue-600 dark:text-blue-400">Too Little:</span>
                    <span className="ml-2 text-zinc-700 dark:text-zinc-300 font-medium">{archetype.darkSides.tooLittle.name}</span>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">{archetype.darkSides.tooLittle.description}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* You Say / Examples */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
             <div>
                <h3 className="font-bold text-zinc-900 dark:text-zinc-100 mb-3">You Might Say...</h3>
                <ul className="space-y-2">
                  {archetype.youSay.map((phrase, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-zinc-600 dark:text-zinc-400 italic">
                      <span className="text-purple-400 select-none">"</span>
                      {phrase}
                      <span className="text-purple-400 select-none">"</span>
                    </li>
                  ))}
                </ul>
             </div>

             <div>
                <h3 className="font-bold text-zinc-900 dark:text-zinc-100 mb-3">Famous Examples</h3>
                <div className="space-y-4">
                  <div>
                    <span className="text-xs font-bold uppercase text-zinc-500 dark:text-zinc-500 mb-1 block">Characters</span>
                    <div className="flex flex-wrap gap-2">
                      {archetype.examples.characters.map((char) => (
                        <span key={char} className="text-sm text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded">
                          {char}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase text-zinc-500 dark:text-zinc-500 mb-1 block">Brands</span>
                    <div className="flex flex-wrap gap-2">
                      {archetype.examples.brands.map((brand) => (
                        <span key={brand} className="text-sm text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded">
                          {brand}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
             </div>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-4 pt-6 border-t border-zinc-100 dark:border-zinc-800">
            <button
              onClick={onClose}
              className="px-6 py-2 text-zinc-600 dark:text-zinc-400 font-medium hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => {
                onSelect(archetype.id);
                onClose();
              }}
              className="px-8 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-lg shadow-purple-500/20 transition-transform active:scale-95"
            >
              Select {archetype.name}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
