"use client";

import { useState } from "react";
import { switchStoryModeAction } from "./actions";
import { motion, AnimatePresence } from "framer-motion";

interface ModeSwitchDialogProps {
  storyId: string;
  currentMode: "quick" | "comprehensive" | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ModeSwitchDialog({
  storyId,
  currentMode,
  isOpen,
  onClose,
}: ModeSwitchDialogProps) {
  const [isSwitching, setIsSwitching] = useState(false);

  if (!isOpen) return null;

  const targetMode = currentMode === "quick" ? "comprehensive" : "quick";

  const handleSwitch = async () => {
    setIsSwitching(true);
    try {
      await switchStoryModeAction(storyId, targetMode);
      onClose();
    } catch (error) {
      console.error("Failed to switch mode:", error);
      alert("Failed to switch mode. Please try again.");
    } finally {
      setIsSwitching(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden"
      >
        <div className="p-6">
          <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
            Switch to {targetMode === "quick" ? "Quick Mode" : "Comprehensive Mode"}?
          </h3>
          <p className="text-zinc-600 dark:text-zinc-400 mb-6">
            {targetMode === "quick" 
              ? "Quick Mode streamlines the tools to help you move faster. Advanced features will be hidden but your data is preserved."
              : "Comprehensive Mode unlocks all advanced tools like the Character Builder, Moral Framework, and deeper AI analysis."}
          </p>

          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800 rounded-md transition-colors"
              disabled={isSwitching}
            >
              Cancel
            </button>
            <button
              onClick={handleSwitch}
              disabled={isSwitching}
              className={`px-4 py-2 text-sm font-medium text-white rounded-md shadow-sm transition-colors flex items-center gap-2 ${
                targetMode === "quick" 
                  ? "bg-blue-600 hover:bg-blue-700" 
                  : "bg-purple-600 hover:bg-purple-700"
              }`}
            >
              {isSwitching ? "Switching..." : "Confirm Switch"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}






