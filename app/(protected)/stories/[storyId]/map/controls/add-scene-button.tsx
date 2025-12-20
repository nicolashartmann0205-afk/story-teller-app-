"use client";

import { useMap } from "../map-context";
import { useState } from "react";

export function AddSceneButton() {
  const { addScene, isLoading } = useMap();
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      addScene(title.trim());
      setTitle("");
      setIsAdding(false);
    }
  };

  if (isAdding) {
    return (
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Scene Title"
          className="px-3 py-1.5 text-sm border border-zinc-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500"
          autoFocus
        />
        <button
          type="submit"
          disabled={isLoading || !title.trim()}
          className="px-3 py-1.5 text-sm font-medium text-white bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 rounded-md hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-50"
        >
          Add
        </button>
        <button
          type="button"
          onClick={() => setIsAdding(false)}
          className="px-3 py-1.5 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
        >
          Cancel
        </button>
      </form>
    );
  }

  return (
    <button
      onClick={() => setIsAdding(true)}
      className="flex items-center gap-2 px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-md text-sm font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors shadow-sm"
    >
      <span>+</span> Add Scene
    </button>
  );
}









