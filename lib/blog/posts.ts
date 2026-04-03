export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  /** Markdown body — use ## / ### only; page template renders the post title as H1. */
  content: string;
};

const posts: BlogPost[] = [
  {
    slug: "story-structure",
    title: "Story structure without the overwhelm",
    description:
      "Acts, beats, and scene flow—how to keep your plot legible while you draft.",
    publishedAt: "2026-03-15",
    content: `## Why structure matters

A strong spine keeps readers oriented. You do not need a perfect outline on day one—you need **enough** structure that each scene knows its job.

## Three layers that work together

### Premise and promise

State what the story is about and what tension will pay off. That promise guides which scenes belong.

### Beats, not bureaucracy

List a handful of turning points: inciting incident, midpoint shift, crisis, resolution. If a scene does not push one of these, question whether it earns its place.

### Scene cards

One card per scene: goal, obstacle, outcome. When cards connect, your storytelling app workflow stays aligned with the whole arc.

## Tie it to your draft

Revisit structure when something feels slow or muddled. Adjust beats first, then scenes—never the other way around.`,
  },
  {
    slug: "from-idea-to-scenes",
    title: "From a loose idea to a scene list",
    description:
      "Turn a premise into actionable scenes you can write in order.",
    publishedAt: "2026-03-22",
    content: `## Start messy, end organized

Capture the idea in a paragraph. Then ask: **who wants what, and what stops them?** That conflict becomes your engine.

## Build outward

### Characters in motion

Give each major character a want and a fear. Scenes emerge when wants collide.

### Sequence, not perfection

Order scenes for cause and effect. You can rename or merge later; first get a chain of events that feels inevitable.

### Use your tell your story app tools

When your app supports maps and structure views, sync the scene list there so nothing lives only in your head.

## Next step

Draft the first scene that *changes* something. Momentum beats polish in early passes.`,
  },
  {
    slug: "review-before-export",
    title: "A quick review pass before you export",
    description:
      "Checklist for continuity, voice, and completeness when you share a draft.",
    publishedAt: "2026-03-28",
    content: `## Before you hit export

Readers forgive rough prose faster than broken logic. Run a lightweight pass focused on clarity and payoff.

## What to scan for

### Continuity

Names, timelines, and props should match across scenes. Note anything that contradicts an earlier beat.

### Voice

Read dialogue aloud. Does each character sound distinct, or could lines be swapped without notice?

### Completeness

Does the ending answer the questions the opening raised? If your storytelling app has review tools, use them for gaps and orphaned setups.

## Ship it

Export when the story is *clear*, not when it is perfect. You can always revise after feedback.`,
  },
];

export function getAllPosts(): BlogPost[] {
  return [...posts].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  return posts.find((p) => p.slug === slug);
}

export function getAllSlugs(): string[] {
  return posts.map((p) => p.slug);
}
