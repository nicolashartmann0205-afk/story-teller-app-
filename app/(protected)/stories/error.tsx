"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[STORIES_SEGMENT][CLIENT_ERROR_BOUNDARY]", {
      message: error.message,
      digest: error.digest ?? null,
      stack: error.stack ?? null,
      pathname: typeof window !== "undefined" ? window.location.pathname : null,
      href: typeof window !== "undefined" ? window.location.href : null,
    });
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-black p-4">
      <div className="text-center space-y-4">
        <h2 className="text-xl font-bold text-red-600 dark:text-red-400">
          Something went wrong!
        </h2>
        <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-md max-w-lg mx-auto overflow-auto">
          <p className="text-sm font-mono text-red-800 dark:text-red-200">
            {error.message || "Unknown error occurred"}
          </p>
          {error.stack && (
             <pre className="mt-2 text-xs text-left whitespace-pre-wrap opacity-50">
               {error.stack}
             </pre>
          )}
        </div>
        <button
          onClick={() => reset()}
          className="px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black rounded-md hover:opacity-90 transition-opacity"
        >
          Try again
        </button>
        {error.digest ? (
          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">
            Ref: {error.digest}
          </p>
        ) : null}
      </div>
    </div>
  );
}










