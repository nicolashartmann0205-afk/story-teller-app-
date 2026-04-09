import type { Metadata } from "next";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { siteMetadata } from "@/lib/db/schema";
import { buildPageMetadata } from "./site-metadata";

type MetadataFallback = {
  title: string;
  description: string;
  canonicalPath: string;
};

function normalizeCanonical(input: string): string {
  const value = input.trim();
  if (!value) return "/";
  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }
  return value.startsWith("/") ? value : `/${value}`;
}

export async function buildDynamicPageMetadata(
  pageKey: string,
  fallback: MetadataFallback
): Promise<Metadata> {
  try {
    const [row] = await db
      .select({
        title: siteMetadata.title,
        description: siteMetadata.description,
        canonicalUrl: siteMetadata.canonicalUrl,
      })
      .from(siteMetadata)
      .where(eq(siteMetadata.pageKey, pageKey))
      .limit(1);

    if (!row) {
      return buildPageMetadata(fallback);
    }

    return buildPageMetadata({
      title: row.title?.trim() || fallback.title,
      description: row.description?.trim() || fallback.description,
      canonicalPath: normalizeCanonical(row.canonicalUrl || fallback.canonicalPath),
    });
  } catch {
    // Fail open to static fallback until DB/table is fully provisioned.
    return buildPageMetadata(fallback);
  }
}
