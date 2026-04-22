"use client";

import { useActionState, useRef } from "react";
import { sendSupportMessageAction, type SupportAgentState } from "./actions";

export function SupportAgentClient({
  initialState,
}: {
  initialState: SupportAgentState;
}) {
  const [state, formAction, isPending] = useActionState(sendSupportMessageAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Ask about sign-in loops, browser compatibility, extension conflicts, cookie issues, or connectivity.
        </p>
      </div>

      <div className="space-y-3 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        {state.messages.length === 0 ? (
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Start by describing the issue and what you already tried.
          </p>
        ) : null}

        {state.messages.map((message) => (
          <div
            key={message.id}
            className={`rounded-lg px-3 py-2 text-sm ${
              message.role === "user"
                ? "ml-auto max-w-[90%] bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
                : "mr-auto max-w-[90%] bg-blue-50 text-zinc-900 dark:bg-blue-950/40 dark:text-zinc-100"
            }`}
          >
            <p className="whitespace-pre-wrap">{message.content}</p>
          </div>
        ))}
      </div>

      {state.error ? (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-300">
          {state.error}
        </div>
      ) : null}

      <form
        ref={formRef}
        action={async (formData) => {
          await formAction(formData);
          formRef.current?.reset();
        }}
        className="space-y-3 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
      >
        <input type="hidden" name="sessionId" value={state.sessionId || ""} />
        <label className="block text-sm">
          <span className="mb-1 block text-zinc-700 dark:text-zinc-300">Message</span>
          <textarea
            name="message"
            rows={4}
            required
            maxLength={4000}
            placeholder="Example: I click sign in, then I get redirected back with error_code=exchange_failed."
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          />
        </label>
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center rounded-full bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60 dark:bg-zinc-100 dark:text-black dark:hover:bg-zinc-200"
        >
          {isPending ? "Sending..." : "Send to IT support agent"}
        </button>
      </form>
    </div>
  );
}
