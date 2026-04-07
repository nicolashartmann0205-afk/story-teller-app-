/** Keeps blog HTML read-only in the DOM and signals writing extensions not to treat the page as an editor. */
const blogReadOnlyRootProps = {
  contentEditable: false as const,
  spellCheck: false as const,
  "data-gramm": "false",
  "data-gramm_editor": "false",
} as const;

export default function BlogsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen font-sans">
      <main>
        <div {...blogReadOnlyRootProps}>{children}</div>
      </main>
    </div>
  );
}
