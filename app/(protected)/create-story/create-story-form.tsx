"use client";

import { useActionState } from "react";
import Link from "next/link";
import { StoryCategory, StoryType } from "@/lib/data/storyTypes";

type CreateStoryAction = (
  previousState: { error?: string } | null,
  formData: FormData
) => Promise<{ error?: string } | void>;

interface CreateStoryFormProps {
  createStoryAction: CreateStoryAction;
  selectedCategory: StoryCategory;
  selectedType: StoryType;
  onBack: () => void;
}

export default function CreateStoryForm({ 
  createStoryAction, 
  selectedCategory, 
  selectedType,
  onBack 
}: CreateStoryFormProps) {
  const [state, formAction, isPending] = useActionState(createStoryAction, null);

  return (
    <form action={formAction} className="space-y-6">
      {state?.error && (
        <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4">
          <p className="text-sm text-red-800 dark:text-red-200">{state.error}</p>
        </div>
      )}

      <div className="mb-6 p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-100 dark:border-zinc-800">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-xs text-zinc-500 uppercase tracking-wider font-medium">Selected Type</p>
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{selectedType.name}</p>
          </div>
          <button 
            type="button" 
            onClick={onBack}
            className="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300 underline"
          >
            Change
          </button>
        </div>
      </div>

      <input type="hidden" name="category" value={selectedCategory} />
      <input type="hidden" name="typeId" value={selectedType.id} />

      <div>
        <label
          htmlFor="title"
          className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2"
        >
          Title <span className="text-red-500">*</span>
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          className="block w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-black dark:text-zinc-50 placeholder-zinc-400 dark:placeholder-zinc-500 focus:border-zinc-500 dark:focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:focus:ring-zinc-500"
          placeholder="Enter story title"
        />
      </div>

      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2"
        >
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={6}
          className="block w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-black dark:text-zinc-50 placeholder-zinc-400 dark:placeholder-zinc-500 focus:border-zinc-500 dark:focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:focus:ring-zinc-500"
          placeholder="Enter story description (optional)"
        />
      </div>

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-black dark:bg-zinc-50 px-4 py-2 text-sm font-medium text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? "Creating..." : "Create Story"}
        </button>
        <Link
          href="/"
          className="rounded-md border border-zinc-300 dark:border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}

