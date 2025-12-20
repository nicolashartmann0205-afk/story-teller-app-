"use client";

import { MoralComplexity } from "@/lib/data/moralConflicts";
import { useState } from "react";

interface PositionDefinitionProps {
  complexity: MoralComplexity;
  conflictName: string;
  onComplete: (data: any) => void;
  onBack: () => void;
}

export function PositionDefinition({
  complexity,
  conflictName,
  onComplete,
  onBack,
}: PositionDefinitionProps) {
  const [formData, setFormData] = useState<Record<string, string>>({});

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete(formData);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
          Define Moral Positions
        </h2>
        <p className="text-zinc-600 dark:text-zinc-400">
          Exploring: <span className="font-semibold text-purple-600 dark:text-purple-400">{conflictName}</span>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {complexity === "simple" && (
          <>
            <div className="p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span className="text-green-500">●</span> The Good Side
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    How does your hero embody this value?
                  </label>
                  <textarea
                    required
                    rows={3}
                    className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="e.g., Sarah risks her career to ensure patients get treatment..."
                    value={formData.heroPosition || ""}
                    onChange={(e) => handleChange("heroPosition", e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span className="text-red-500">●</span> The Bad Side
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    How does the villain oppose this value?
                  </label>
                  <textarea
                    required
                    rows={3}
                    className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="e.g., The administrator cuts funding to boost bonus metrics..."
                    value={formData.villainPosition || ""}
                    onChange={(e) => handleChange("villainPosition", e.target.value)}
                  />
                </div>
              </div>
            </div>
          </>
        )}

        {complexity === "two_rights" && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-xl border border-blue-200 dark:border-blue-900/30 bg-blue-50/30 dark:bg-blue-900/10">
                <h3 className="text-lg font-semibold mb-4 text-blue-700 dark:text-blue-300">Right #1</h3>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  What moral good does this represent?
                </label>
                <textarea
                  required
                  rows={3}
                  className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Value A..."
                  value={formData.rightOne || ""}
                  onChange={(e) => handleChange("rightOne", e.target.value)}
                />
              </div>
              <div className="p-6 rounded-xl border border-purple-200 dark:border-purple-900/30 bg-purple-50/30 dark:bg-purple-900/10">
                <h3 className="text-lg font-semibold mb-4 text-purple-700 dark:text-purple-300">Right #2</h3>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  What conflicting moral good opposes it?
                </label>
                <textarea
                  required
                  rows={3}
                  className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Value B..."
                  value={formData.rightTwo || ""}
                  onChange={(e) => handleChange("rightTwo", e.target.value)}
                />
              </div>
            </div>
            
            <div className="p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
              <h3 className="text-lg font-semibold mb-4">The Tragic Choice</h3>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Why can't both be honored fully? What makes this difficult?
              </label>
              <textarea
                required
                rows={3}
                className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500"
                placeholder="The hero must choose between loyalty to their family and justice for the victim..."
                value={formData.tragicChoice || ""}
                onChange={(e) => handleChange("tragicChoice", e.target.value)}
              />
            </div>
          </>
        )}

        {complexity === "lesser_evil" && (
          <>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-xl border border-red-200 dark:border-red-900/30 bg-red-50/30 dark:bg-red-900/10">
                <h3 className="text-lg font-semibold mb-4 text-red-700 dark:text-red-300">Greater Evil</h3>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  What terrible outcome must be avoided?
                </label>
                <textarea
                  required
                  rows={3}
                  className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Total destruction..."
                  value={formData.greaterEvil || ""}
                  onChange={(e) => handleChange("greaterEvil", e.target.value)}
                />
              </div>
              <div className="p-6 rounded-xl border border-orange-200 dark:border-orange-900/30 bg-orange-50/30 dark:bg-orange-900/10">
                <h3 className="text-lg font-semibold mb-4 text-orange-700 dark:text-orange-300">Lesser Evil</h3>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  What harm must be caused to prevent the greater evil?
                </label>
                <textarea
                  required
                  rows={3}
                  className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Sacrificing the few..."
                  value={formData.lesserEvil || ""}
                  onChange={(e) => handleChange("lesserEvil", e.target.value)}
                />
              </div>
            </div>

            <div className="p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
              <h3 className="text-lg font-semibold mb-4">The Painful Reality</h3>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                What cost does this choice exact? Who suffers?
              </label>
              <textarea
                required
                rows={3}
                className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500"
                placeholder="Innocents will be lost, and the hero will carry the guilt forever..."
                value={formData.painfulReality || ""}
                onChange={(e) => handleChange("painfulReality", e.target.value)}
              />
            </div>
          </>
        )}

        <div className="flex justify-between pt-4 border-t border-zinc-200 dark:border-zinc-800">
          <button
            type="button"
            onClick={onBack}
            className="px-4 py-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 font-medium"
          >
            Back
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-black dark:bg-zinc-50 text-white dark:text-black rounded-md font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
          >
            Finish Framework
          </button>
        </div>
      </form>
    </div>
  );
}












