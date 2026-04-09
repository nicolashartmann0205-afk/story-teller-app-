import type { Metadata } from "next";

/** Brand name in `<title>` after the pipe (Primary - Secondary | Brand). */
export const SITE_NAME = "Story Teller App";

/** Suffix appended by `metadata.title.template`: ` | Story Teller App` */
export const TITLE_BRAND_SUFFIX = ` | ${SITE_NAME}`;

/**
 * Child routes pass `title` as the "Primary Keyword - Secondary Keyword" segment only.
 * Root layout applies this template so the final tag is: `%s | Story Teller App`.
 */
export const TITLE_TEMPLATE = `%s${TITLE_BRAND_SUFFIX}`;

/**
 * Fallback when a route does not set `metadata.title` (standalone string; template does not apply to `default`).
 * Target ~50–60 characters total for SERP display.
 */
export const DEFAULT_PAGE_TITLE = `Write stories - scenes & maps | ${SITE_NAME}`;

/** Default `meta name="description"` from root layout. */
export const DEFAULT_DESCRIPTION =
  "Plan structure, scenes, maps, and revisions in one writing app built for momentum. Start free, shape your draft faster, and finish with confidence. Learn more.";

export type BuildPageMetadataInput = {
  title: string;
  description: string;
  /** Path only (e.g. `/blogs`). Resolved against `metadataBase` in root layout. */
  canonicalPath?: string;
  /** Open Graph object type, defaults to `website`. */
  openGraphType?: "website" | "article";
  /** Optional OG images (absolute URLs preferred). */
  openGraphImages?: string[];
  /** Merged after default Open Graph title/description/url. */
  openGraph?: Metadata["openGraph"];
  /** e.g. `{ index: false }` for auth or private URLs. */
  robots?: Metadata["robots"];
  /** If false, description is left as-is (e.g. blog posts). Default true clamps to ~160 chars. */
  clampDescription?: boolean;
  /**
   * If true (default), clamps the title segment so the full document title stays within `maxTitleLength`
   * (segment + ` | ${SITE_NAME}`). Set false only for rare absolute titles.
   */
  clampTitle?: boolean;
  /** Max length for the full `<title>` text (segment + brand suffix). Default 60. */
  maxTitleLength?: number;
};

/** Clamp meta description for SERP display (~160 characters, word-aware). */
export function clampMetaDescription(text: string, max = 160): string {
  const t = text.trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(" ");
  const base =
    lastSpace > 50 ? cut.slice(0, lastSpace).trimEnd() : cut.trimEnd();
  return `${base}…`;
}

/**
 * Clamps the "Primary - Secondary" segment so `segment + " | Story Teller App"` fits SERP limits (~50–60 chars total).
 */
export function clampTitleSegmentForBrand(
  primarySecondarySegment: string,
  maxTotalLength = 60
): string {
  const suffix = TITLE_BRAND_SUFFIX;
  const maxSegment = Math.max(12, maxTotalLength - suffix.length);
  const s = primarySecondarySegment.trim().replace(/\s+/g, " ");
  if (s.length <= maxSegment) return s;
  const cut = s.slice(0, maxSegment);
  const lastSpace = cut.lastIndexOf(" ");
  return (lastSpace > 12 ? cut.slice(0, lastSpace) : cut).trimEnd();
}

/**
 * Full document title for OG/Twitter when using the segment + brand pattern.
 */
export function formatDocumentTitle(segment: string): string {
  return `${clampTitleSegmentForBrand(segment)}${TITLE_BRAND_SUFFIX}`;
}

/**
 * Self-referencing canonical for a route path (resolved to an absolute URL via root `metadataBase`).
 * Use on pages that don’t call `buildPageMetadata` so every URL still emits `<link rel="canonical">`.
 * Host/http/www normalization for visitors is handled separately (`lib/canonical-redirects.ts` + deployment).
 */
export function selfReferencingCanonical(path: string): Metadata {
  const pathname = path.startsWith("/") ? path : `/${path}`;
  return {
    alternates: { canonical: pathname },
    openGraph: { url: pathname },
  };
}

/**
 * Build Next.js `Metadata` with optional `alternates.canonical` and Open Graph fields.
 * Edit global defaults in this file; use this helper on pages for per-route SEO.
 */
export function buildPageMetadata(input: BuildPageMetadataInput): Metadata {
  const {
    title,
    description,
    canonicalPath,
    openGraphType = "website",
    openGraphImages,
    openGraph,
    robots,
    clampDescription = true,
    clampTitle = true,
    maxTitleLength = 60,
  } = input;

  const resolvedDescription =
    clampDescription ? clampMetaDescription(description) : description.trim();

  const resolvedTitle = clampTitle
    ? clampTitleSegmentForBrand(title, maxTitleLength)
    : title.trim();

  const fullTitleForSocial = clampTitle
    ? formatDocumentTitle(resolvedTitle)
    : `${resolvedTitle}${TITLE_BRAND_SUFFIX}`;

  const result: Metadata = {
    title: resolvedTitle,
    description: resolvedDescription,
    openGraph: {
      type: openGraphType,
      siteName: SITE_NAME,
      title: fullTitleForSocial,
      description: resolvedDescription,
      ...(canonicalPath ? { url: canonicalPath } : {}),
      ...(openGraphImages?.length ? { images: openGraphImages } : {}),
      ...openGraph,
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitleForSocial,
      description: resolvedDescription,
      ...(openGraphImages?.length ? { images: openGraphImages } : {}),
    },
  };

  if (canonicalPath) {
    result.alternates = { canonical: canonicalPath };
  }

  if (robots) {
    result.robots = robots;
  }

  return result;
}
