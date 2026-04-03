import ReactMarkdown from "react-markdown";

type PostBodyProps = {
  content: string;
};

export function PostBody({ content }: PostBodyProps) {
  return (
    <div className="blog-md space-y-4 text-zinc-700 dark:text-zinc-300">
      <ReactMarkdown
        components={{
          h2: ({ children }) => (
            <h2 className="mt-10 scroll-mt-24 text-xl font-semibold text-black first:mt-0 dark:text-zinc-50">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="mt-6 text-lg font-medium text-zinc-900 dark:text-zinc-100">{children}</h3>
          ),
          p: ({ children }) => <p className="leading-relaxed">{children}</p>,
          ul: ({ children }) => <ul className="list-disc space-y-2 pl-5">{children}</ul>,
          li: ({ children }) => <li className="leading-relaxed">{children}</li>,
          strong: ({ children }) => <strong className="font-semibold text-zinc-900 dark:text-zinc-100">{children}</strong>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
