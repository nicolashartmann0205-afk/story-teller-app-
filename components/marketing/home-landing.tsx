import Link from "next/link";

const faqItems: { question: string; answer: string }[] = [
  {
    question: "Is Story Teller good for beginners?",
    answer:
      "Yes. This storytelling app guides you from idea to draft with structure, scenes, and review tools—whether you are new or experienced. Many writers want a dedicated tell your story app with guardrails, not a blank page.",
  },
  {
    question: "How is this different from a generic notes app?",
    answer:
      "It is built for narrative planning: story maps, structure beats, and scene workflows—not just blank pages.",
  },
  {
    question: "Can I export my work?",
    answer:
      "Yes. The storytelling app includes review and export flows so you can share or publish your finished story.",
  },
  {
    question: "Does the app work on mobile browsers?",
    answer:
      "You can use Story Teller in modern mobile browsers; a desktop browser is best for long writing sessions.",
  },
];

function faqJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export function HomeLanding() {
  const jsonLd = faqJsonLd();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <article className="space-y-14 text-zinc-800 dark:text-zinc-200">
          <header className="space-y-4 text-center sm:text-left">
            <h1 className="text-3xl font-semibold tracking-tight text-black dark:text-zinc-50 sm:text-4xl">
              Story Teller — the tell your story app for structure, scenes, and finishing
            </h1>
            <p className="text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
              Plan, draft, and refine in one storytelling app. If you want a tell your story app that respects plot, pacing, and voice—not just a blank document—you are in the right place.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
              <Link
                href="/auth/sign-up"
                className="inline-flex h-12 items-center justify-center rounded-full bg-black px-6 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-black dark:hover:bg-zinc-200"
              >
                Sign up free
              </Link>
              <Link
                href="/auth/sign-in"
                className="inline-flex h-12 items-center justify-center rounded-full border border-zinc-300 px-6 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-50 dark:hover:bg-zinc-900"
              >
                Sign in
              </Link>
              <Link
                href="/blogs"
                className="inline-flex h-12 items-center justify-center rounded-full border border-transparent px-4 text-sm font-semibold text-zinc-800 underline decoration-zinc-400 underline-offset-4 transition-colors hover:text-zinc-950 hover:decoration-zinc-700 dark:text-zinc-200 dark:decoration-zinc-500 dark:hover:text-white dark:hover:decoration-zinc-300 sm:px-6"
              >
                Read the guides
              </Link>
            </div>
          </header>

          <section id="what-you-get" aria-labelledby="what-you-get-heading" className="space-y-4">
            <h2 id="what-you-get-heading" className="text-2xl font-semibold text-black dark:text-zinc-50">
              What Story Teller helps you do
            </h2>
            <p className="leading-relaxed text-zinc-600 dark:text-zinc-400">
              Turn scattered ideas into a clear narrative system. Story Teller is built for writers who need more than
              a blank document and random notes. You can map your plot, define your world, and manage scenes in one
              place, so the story keeps moving even when your energy is low. Instead of juggling five different tools,
              you keep structure, context, and draft progress connected.
            </p>
            <p className="leading-relaxed text-zinc-600 dark:text-zinc-400">
              Whether you write short fiction, novels, or episodic content, the workflow helps you make clear choices
              at each stage. You can move from concept to scenes without losing your main arc, then review your draft
              with better visibility into pacing, tension, and continuity.
            </p>
          </section>

          <section id="how-it-works" aria-labelledby="how-heading" className="space-y-6">
            <h2 id="how-heading" className="text-2xl font-semibold text-black dark:text-zinc-50">
              How it works
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
                  1. Shape your story
                </h3>
                <p className="mt-2 leading-relaxed text-zinc-600 dark:text-zinc-400">
                  Start with hooks, character goals, and a structure path that fits your project. Story Teller helps
                  you choose direction early so you do not drift into disconnected chapters later.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
                  2. Build scenes with intent
                </h3>
                <p className="mt-2 leading-relaxed text-zinc-600 dark:text-zinc-400">
                  Build scene by scene with clear intent. Each scene gets a purpose, emotional weight, and relationship
                  to the broader arc, making revision easier and first drafts less chaotic.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
                  3. Review, refine, and export
                </h3>
                <p className="mt-2 leading-relaxed text-zinc-600 dark:text-zinc-400">
                  Review for continuity and completeness, then export when your draft is ready. You can ship work
                  faster because planning and writing stay aligned from start to finish.
                </p>
              </div>
            </div>
            <div
              className="flex flex-wrap items-center gap-2 rounded-2xl border border-zinc-200 bg-zinc-50/90 px-4 py-3 text-base text-zinc-800 shadow-sm dark:border-zinc-700 dark:bg-zinc-900/60 dark:text-zinc-200"
              role="navigation"
              aria-label="Jump ahead on this page"
            >
              <span className="font-medium text-zinc-600 dark:text-zinc-400">Jump ahead:</span>
              <Link
                href="#faq"
                className="inline-flex items-center rounded-full bg-white px-3 py-1 text-sm font-semibold text-zinc-900 shadow-sm ring-1 ring-zinc-200 transition hover:bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-50 dark:ring-zinc-600 dark:hover:bg-zinc-700"
              >
                FAQ
              </Link>
              <Link
                href="/blogs"
                className="inline-flex items-center rounded-full bg-white px-3 py-1 text-sm font-semibold text-zinc-900 shadow-sm ring-1 ring-zinc-200 transition hover:bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-50 dark:ring-zinc-600 dark:hover:bg-zinc-700"
              >
                Guides on the blog
              </Link>
            </div>
          </section>

          <section id="writer-block" aria-labelledby="writer-block-heading" className="space-y-4">
            <h2 id="writer-block-heading" className="text-2xl font-semibold text-black dark:text-zinc-50">
              Beat writer&apos;s block with a visual workflow
            </h2>
            <p className="leading-relaxed text-zinc-600 dark:text-zinc-400">
              Writer&apos;s block often comes from uncertainty, not lack of talent. When you cannot see what happens next,
              drafting stalls. Story Teller reduces that friction with visual story mapping and scene-level guidance.
              You can quickly inspect where tension drops, where character motivation is unclear, or where transitions
              feel weak. That visibility turns vague frustration into concrete edits.
            </p>
            <p className="leading-relaxed text-zinc-600 dark:text-zinc-400">
              World-building also becomes practical, not overwhelming. Keep your setting details, tone decisions, and
              story logic near the draft so you do not lose consistency. As your project grows, scene management keeps
              momentum: reorder scenes, clarify outcomes, and maintain arc coherence without rewriting everything from
              scratch. The goal is simple: fewer stalled sessions, more finished pages.
            </p>
          </section>

          <section id="why-choose" aria-labelledby="why-heading" className="space-y-4">
            <h2 id="why-heading" className="text-2xl font-semibold text-black dark:text-zinc-50">
              Why writers choose this tell your story app
            </h2>
            <p className="leading-relaxed text-zinc-600 dark:text-zinc-400">
              Story Teller is built for narrative work: structure overlays, scene cards, map-based planning, and
              review checks. If you have used plain docs and lost the thread, this tell your story app gives you
              guidance without killing creativity.
            </p>
            <p className="leading-relaxed text-zinc-600 dark:text-zinc-400">
              You still own every word. The software simply helps you see the shape of the story while you write it,
              so decisions happen faster and your draft quality stays consistent.
            </p>
          </section>

          <section id="related-guides" aria-labelledby="guides-heading" className="space-y-4">
            <h2 id="guides-heading" className="text-2xl font-semibold text-black dark:text-zinc-50">
              Related guides
            </h2>
            <p className="leading-relaxed text-zinc-600 dark:text-zinc-400">
              Deep dives live on the blog—start with structure, scenes, or a pre-export review pass.
            </p>
            <ul className="list-inside list-disc space-y-2 text-zinc-700 dark:text-zinc-300">
              <li>
                <Link href="/blogs" className="underline underline-offset-2 hover:text-zinc-900 dark:hover:text-zinc-100">
                  Story blog — outlines and updates
                </Link>
              </li>
              <li>
                <Link
                  href="/blog/story-structure"
                  className="underline underline-offset-2 hover:text-zinc-900 dark:hover:text-zinc-100"
                >
                  Story structure (first post)
                </Link>
              </li>
              <li>
                <Link href="#how-it-works" className="underline underline-offset-2 hover:text-zinc-900 dark:hover:text-zinc-100">
                  Back to how it works
                </Link>
              </li>
            </ul>
          </section>

          <section id="faq" aria-labelledby="faq-heading" className="space-y-6 border-t border-zinc-200 pt-12 dark:border-zinc-800">
            <h2 id="faq-heading" className="text-2xl font-semibold text-black dark:text-zinc-50">
              FAQ
            </h2>
            <div className="space-y-8">
              {faqItems.map((item) => (
                <div key={item.question}>
                  <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">{item.question}</h3>
                  <p className="mt-2 leading-relaxed text-zinc-600 dark:text-zinc-400">{item.answer}</p>
                </div>
              ))}
            </div>
          </section>
          <footer className="space-y-3 border-t border-zinc-200 pt-10 dark:border-zinc-800" aria-label="Company and legal links">
            <h2 className="text-sm font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-500">
              Company
            </h2>
            <nav className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
              <Link href="/about" className="underline underline-offset-2 hover:text-zinc-900 dark:hover:text-zinc-100">
                About
              </Link>
              <Link href="/team" className="underline underline-offset-2 hover:text-zinc-900 dark:hover:text-zinc-100">
                Team
              </Link>
              <Link href="/contact" className="underline underline-offset-2 hover:text-zinc-900 dark:hover:text-zinc-100">
                Contact
              </Link>
              <Link href="/support" className="underline underline-offset-2 hover:text-zinc-900 dark:hover:text-zinc-100">
                Feedback & support
              </Link>
              <Link href="/privacy" className="underline underline-offset-2 hover:text-zinc-900 dark:hover:text-zinc-100">
                Privacy
              </Link>
              <Link href="/terms" className="underline underline-offset-2 hover:text-zinc-900 dark:hover:text-zinc-100">
                Terms
              </Link>
            </nav>
          </footer>
        </article>
      </div>
    </>
  );
}
