import Link from "next/link";
import { notFound } from "next/navigation";
import { PostBody } from "@/components/blog/post-body";
import { getPostBySlugFromDb } from "@/lib/blog/queries";
import { buildPageMetadata, SITE_NAME } from "@/lib/seo/site-metadata";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
};

const DIGITAL_STORY_GUIDE_SLUG = "digital-storytelling-guide";

const DIGITAL_STORY_GUIDE_FALLBACK = {
  title: "How to Start Digital Storytelling: Turn Memories into Legacies",
  description:
    "Discover how storytelling apps bridge the gap between traditional writing and digital legacy. Follow our 5-step guide to preserve family history and beat writer's block.",
  canonicalPath: "/digital-storytelling-guide",
};

function faqJsonLdForSlug(slug: string) {
  if (slug !== DIGITAL_STORY_GUIDE_SLUG) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What is digital storytelling?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Digital storytelling is the practice of using computer-based tools to tell stories, often combining text, images, video, and audio to create an immersive experience.",
        },
      },
      {
        "@type": "Question",
        name: "How do storytelling apps help beginners?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "They provide structured workflows, templates, and creative prompts that lower the barrier to entry for non-writers, making the process collaborative rather than solitary.",
        },
      },
      {
        "@type": "Question",
        name: "Why is authenticity important in stories?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Authentic stories build trust and emotional resonance, which are essential for audience engagement in a crowded digital landscape where static data is often ignored.",
        },
      },
    ],
  };
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const post = await getPostBySlugFromDb(slug);
  if (!post) {
    return {
      title: { absolute: `Blog post not found | ${SITE_NAME}` },
      robots: { index: false, follow: false },
    };
  }
  const fallback =
    slug === DIGITAL_STORY_GUIDE_SLUG
      ? DIGITAL_STORY_GUIDE_FALLBACK
      : null;
  return buildPageMetadata({
    title: post.seoTitle?.trim() || fallback?.title || post.title,
    description:
      post.metaDescription?.trim() ||
      fallback?.description ||
      post.description?.trim() ||
      `Read "${post.title}" on Story Teller for practical structure, scenes, and drafting insights. Open the full article and learn more.`,
    canonicalPath: post.canonicalUrl?.trim() || fallback?.canonicalPath || `/blog/${slug}`,
    openGraphType: "article",
  });
}

function formatDate(iso: string) {
  return new Date(iso + "T12:00:00").toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPostBySlugFromDb(slug);
  if (!post) notFound();
  const faqJsonLd = faqJsonLdForSlug(slug);

  return (
    <article
      className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8"
      contentEditable={false}
      spellCheck={false}
      data-gramm="false"
      data-gramm_editor="false"
    >
      {faqJsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      ) : null}
      <header className="space-y-4 border-b border-zinc-200 pb-10 dark:border-zinc-800">
        <p className="text-sm text-zinc-500 dark:text-zinc-500">{formatDate(post.publishedAt)}</p>
        <h1 className="text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">{post.title}</h1>
        <p className="text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">{post.description}</p>
      </header>
      <div className="pt-10">
        <PostBody content={post.content} />
      </div>
      <footer className="mt-16 border-t border-zinc-200 pt-10 dark:border-zinc-800">
        <p className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
          <Link
            href="/blogs"
            className="font-medium text-zinc-700 underline underline-offset-2 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100"
          >
            ← All posts
          </Link>
          <Link
            href="/"
            className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            Home
          </Link>
          <Link
            href={`/auth/sign-in?redirectedFrom=${encodeURIComponent(`/blog/${slug}`)}`}
            className="text-zinc-600 underline underline-offset-2 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            Sign in
          </Link>
          <Link
            href={`/auth/sign-up?redirectedFrom=${encodeURIComponent(`/blog/${slug}`)}`}
            className="text-zinc-600 underline underline-offset-2 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            Sign up
          </Link>
        </p>
      </footer>
    </article>
  );
}
