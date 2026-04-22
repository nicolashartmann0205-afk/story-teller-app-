# Feedback & Support Page

## Feature Name
Feedback & Support Page

## Goal
Give users a single place to send product feedback, request help with bugs or account issues, and discover self-service content—without requiring a backend form pipeline. Align with existing contact patterns (email mailto links).

## User Story
As a Story Teller user or visitor, I want a dedicated Feedback & support page so that I know how to get help, submit feedback, and find guides without hunting through the app.

## Functional Requirements
1. A route at `/support` renders a marketing-style page with title **Feedback & support** (or equivalent H1).
2. The page includes: short intro; product feedback via `mailto:` to `hello@storyinthemaking.com` with a sensible default subject; support/bugs guidance (including account email reminder); **IT support** section with `mailto:` and distinct default subject for sign-in, browser, and connectivity issues; link to `/blogs` for guides; link to `/contact` for partnerships/general contact; `← Back to home` link.
3. Page metadata uses `buildDynamicPageMetadata` with page key `support`, canonical `/support`, and fallback title/description.
4. Unauthenticated users can open `/support` (middleware public route). Other marketing URLs remain unchanged.
5. Signed-in and signed-out global headers include a **Support** link with correct active state on `/support`.
6. Home landing footer includes a link to `/support` for discoverability.
7. SEO Admin page list includes `/support` so admins can override metadata via existing `siteMetadata` workflow.

## Data Requirements
- Reuse `siteMetadata` / `buildDynamicPageMetadata` (optional DB row keyed `support`).
- No new tables or API routes.

## User Flow
1. User opens `/support` (from nav, footer, or direct URL) while signed in or out.
2. User reads sections and uses mailto links or follows links to blogs/contact/home.

## Acceptance Criteria
- `/support` loads without redirect to sign-in when signed out.
- Nav highlights Support when pathname is `/support`.
- Metadata includes canonical `/support` and sensible fallbacks.
- Styling matches other static marketing pages (`contact`, `about`).
- SEO admin lists `/support` among preview paths.
- The IT support section is visible with its own mailto subject line (distinct from product feedback and help/bugs).

## Edge Cases
- DB unavailable or missing `support` row: metadata falls back via `buildDynamicPageMetadata`.
- Nested paths under `/support/`: middleware treats prefix consistently if added later.

## Non-Functional Requirements
- No new email-sending infrastructure; mailto-only.
- Minimal scope: do not change public access for `/contact`, `/about`, etc.
