# SEO Admin Page And Site Metadata Table

## Feature Name
SEO Admin Page And Site Metadata Table

## Goal
Provide an admin-only interface at `/seo-admin` to manage SEO fields (title, meta description, canonical URL) per page, backed by Supabase/DB persistence.

## User Story
As an SEO admin, I want to select a page and edit its title, meta description, and canonical URL in one place so I can control search snippets and canonical signals without code edits.

## Functional Requirements
1. Add a new route `/seo-admin` accessible only to authorized admin users.
2. Create a persisted table (e.g., `site_metadata`) with one record per page key/slug.
3. SEO Admin UI must include:
   - Page selector (Home, Stories, About, and other configured pages),
   - Title Tag input,
   - Meta Description textarea,
   - Canonical URL input.
4. Selecting a page must load existing stored values into the form.
5. Submitting the form must upsert the selected page record.
6. Form must validate:
   - non-empty title,
   - description length guidance (target ~150–160),
   - canonical URL format (absolute URL or normalized path based on system choice).
7. Save action must show success/error feedback.
8. Changes must be reflected by metadata generation logic at runtime for supported pages.
9. Non-admin users must be redirected/blocked from `/seo-admin`.

## Data Requirements
- New `site_metadata` table:
  - `id` (pk)
  - `page_key` (unique, e.g. `home`, `stories`, `about`)
  - `title`
  - `description`
  - `canonical_url` (or canonical path if preferred)
  - `updated_at`
  - optional `updated_by`
- Add upsert/read query helpers for this table.

## User Flow
1. Admin opens `/seo-admin`.
2. Admin picks a target page in selector.
3. Existing SEO values load into form fields.
4. Admin edits title/description/canonical.
5. Admin clicks save.
6. System validates and persists.
7. Admin sees success state and can switch to another page.

## Acceptance Criteria
- `/seo-admin` route exists and is admin-protected.
- Metadata values can be created and updated per selected page.
- Page selector + 3 fields render and persist correctly.
- Invalid canonical URL is rejected with clear error.
- Updated values are used by page metadata output for integrated routes.
- Lint/type checks pass.

## Edge Cases
- No row exists yet for selected page (form initializes empty/default).
- Duplicate `page_key` attempts are handled by unique + upsert.
- Admin submits while another save is in progress.
- Stored canonical conflicts with global canonical origin policy.
- Unauthorized direct access attempt.

## Non-Functional Requirements
- Save and load interactions should feel immediate.
- Inputs and labels should match existing app design tokens.
- Server-side authorization checks must gate all write operations.
