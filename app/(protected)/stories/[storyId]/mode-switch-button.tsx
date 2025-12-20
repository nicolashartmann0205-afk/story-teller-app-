"use client";

import { useState } from "react";
import { ModeSwitchDialog } from "./mode-switch-dialog";

interface ModeSwitchButtonProps {
  storyId: string;
  currentMode: "quick" | "comprehensive" | null;
}

export function ModeSwitchButton({ storyId, currentMode }: ModeSwitchButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="rounded-md border border-zinc-300 dark:border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800"
      >
        Switch Mode
      </button>
      <ModeSwitchDialog
        storyId={storyId}
        currentMode={currentMode}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
}









