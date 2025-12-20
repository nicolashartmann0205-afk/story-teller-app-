"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { createStyleGuide } from "./actions";

export function CreateGuideButton() {
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    setIsCreating(true);
    const formData = new FormData();
    formData.append("name", "New Style Guide");
    
    try {
      await createStyleGuide(formData);
    } catch (error) {
      console.error("Failed to create guide", error);
      alert("Failed to create style guide");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <button
      onClick={handleCreate}
      disabled={isCreating}
      className="flex items-center gap-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
    >
      <Plus className="w-4 h-4" />
      {isCreating ? "Creating..." : "New Style Guide"}
    </button>
  );
}



