# SEO Admin Blog Posts Editor

## Feature Name
SEO Admin Blog Posts Editor

## Goal
Provide a dedicated `/seo-admin` interface where the owner can review and update SEO metadata for all blog posts in one place without editing full post content.

## User Story
As the site owner (`nicolas@hartmanns.net`), I want a centralized SEO editor for blog posts so that I can quickly update canonical URLs, meta descriptions, and SEO titles for search optimization.

## Functional Requirements
1. The `/seo-admin` page must be accessible only to signed-in users whose email is exactly `nicolas@hartmanns.net`.
2. Unauthorized users must be redirected away (for example to `/dashboard`) and must not see SEO editing controls.
3. The page must fetch blog posts from the `blog_posts` table (not `stories`).
4. The page must list each post with identifying context (at minimum title and slug) plus editable SEO fields:
   - `canonical_url`
   - `meta_description`
   - `seo_title`
5. Each post row/card must include a Save action that updates only SEO fields for that specific post.
6. Save actions must perform server-side authorization checks before writing.
7. Save success and failure states must be shown inline per post.
8. The page should preserve existing `/seo-admin` route and navigation link behavior (no new route path).

## Data Requirements
- Reuse existing `blog_posts` columns:
  - `canonical_url`
  - `meta_description`
  - `seo_title`
- No new table required.
- Reuse existing auth user from Supabase session for access checks.

## User Flow
1. Owner signs in and opens `/seo-admin`.
2. System checks email and allows access only for `nicolas@hartmanns.net`.
3. Page displays a list of blog posts and current SEO values.
4. Owner edits one post's SEO fields.
5. Owner clicks Save for that post.
6. System validates, writes to DB, and shows success message.
7. Owner repeats for other posts as needed.

## Acceptance Criteria
- `/seo-admin` no longer 404s and renders an SEO post editor for the owner.
- Non-owner users cannot access editor controls.
- Editing and saving `canonical_url`, `meta_description`, and `seo_title` updates the corresponding `blog_posts` row.
- Existing blog admin/editor functionality remains unaffected.
- Lint checks pass for touched files.

## Edge Cases
- No blog posts exist: show empty state without errors.
- One post save fails while others remain editable.
- Existing SEO fields are null: inputs render safely with empty defaults.
- Canonical URL is blank: allow null/empty persistence according to existing DB rules.
- Stale page state after save: UI should still reflect successful update outcome clearly.

## Non-Functional Requirements
- Keep UI consistent with existing app design tokens/styles.
- Keep per-row save interactions responsive and isolated.
- Authorization must be enforced server-side even if UI is manipulated client-side.
