"use client";

import { useId, useState } from "react";

export type SeoReferenceTabsProps = {
  siteName: string;
  titleTemplate: string;
  defaultPageTitle: string;
  defaultDescription: string;
  metadataBaseUrl: string;
  exampleCanonicalPaths: readonly { path: string; label: string }[];
};

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-500">{label}</p>
      <p className="rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100">
        {value}
      </p>
    </div>
  );
}

export function SeoReferenceTabs({
  siteName,
  titleTemplate,
  defaultPageTitle,
  defaultDescription,
  metadataBaseUrl,
  exampleCanonicalPaths,
}: SeoReferenceTabsProps) {
  const baseId = useId();
  const [tab, setTab] = useState<"title" | "description" | "canonical">("title");

  const tabs = [
    { id: "title" as const, label: "Title" },
    { id: "description" as const, label: "Meta description" },
    { id: "canonical" as const, label: "Canonical" },
  ];

  const resolvedExamples = exampleCanonicalPaths.map(({ path, label }) => {
    try {
      const url = new URL(path, `${metadataBaseUrl.replace(/\/$/, "")}/`);
      return { path, label, absolute: url.href };
    } catch {
      return { path, label, absolute: `${metadataBaseUrl}${path}` };
    }
  });

  return (
    <div>
      <div
        role="tablist"
        aria-label="SEO reference sections"
        className="flex flex-wrap gap-1 border-b border-zinc-200 pb-2 dark:border-zinc-800"
      >
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            id={`${baseId}-tab-${t.id}`}
            aria-selected={tab === t.id}
            aria-controls={`${baseId}-panel-${t.id}`}
            onClick={() => setTab(t.id)}
            className={
              tab === t.id
                ? "rounded-md bg-zinc-200 px-3 py-1.5 text-sm font-medium text-zinc-900 dark:bg-zinc-700 dark:text-zinc-50"
                : "rounded-md px-3 py-1.5 text-sm font-medium text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
            }
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-4 text-sm text-zinc-700 dark:text-zinc-300">
        {tab === "title" && (
          <div
            role="tabpanel"
            id={`${baseId}-panel-title`}
            aria-labelledby={`${baseId}-tab-title`}
            className="space-y-4"
          >
            <Field label="Site / brand name" value={siteName} />
            <Field label="Default document title (fallback)" value={defaultPageTitle} />
            <Field label="Title template (child pages)" value={titleTemplate} />
            <p className="text-xs text-zinc-500 dark:text-zinc-500">
              Routes pass a “Primary Keyword - Secondary Keyword” segment; the template appends the brand after a pipe.
              Edit defaults in{" "}
              <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">lib/seo/site-metadata.ts</code>.
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-500">
              Best practice is one H1 per page. Multiple H1s can dilute keyword focus and confuse search engines
              about the page&apos;s primary topic.
            </p>
          </div>
        )}

        {tab === "description" && (
          <div
            role="tabpanel"
            id={`${baseId}-panel-description`}
            aria-labelledby={`${baseId}-tab-description`}
            className="space-y-4"
          >
            <Field label="Default meta description (root layout)" value={defaultDescription} />
            <p className="text-xs text-zinc-500 dark:text-zinc-500">
              Per-page descriptions are set in each route’s metadata or{" "}
              <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">buildPageMetadata</code>.
            </p>
          </div>
        )}

        {tab === "canonical" && (
          <div
            role="tabpanel"
            id={`${baseId}-panel-canonical`}
            aria-labelledby={`${baseId}-tab-canonical`}
            className="space-y-4"
          >
            <Field label="metadataBase (from app URL)" value={metadataBaseUrl.replace(/\/$/, "")} />
            <p className="text-xs text-zinc-500 dark:text-zinc-500">
              Each indexable URL should have a self-referencing canonical (this app sets one per route via{" "}
              <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">buildPageMetadata</code> or{" "}
              <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">selfReferencingCanonical</code>). Next.js
              resolves paths against this base. Visitor host/http/www normalization uses{" "}
              <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">CANONICAL_ORIGIN</code> in{" "}
              <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">lib/canonical-redirects.ts</code>.
            </p>
            <div className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-500">
                Example canonical URLs
              </p>
              <ul className="space-y-2">
                {resolvedExamples.map((row) => (
                  <li
                    key={row.path}
                    className="rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
                  >
                    <p className="text-xs text-zinc-500 dark:text-zinc-500">{row.label}</p>
                    <p className="mt-1 break-all font-mono text-xs text-zinc-800 dark:text-zinc-200">{row.absolute}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
