# Blog Navigation And Migration

## Feature Name
Blog Navigation And Migration

## Goal
Expose blogging as a first-class section in Story in the Making by adding dedicated navigation entries, making published posts visible via the main app navigation, and ensuring local blog content can be migrated to production safely and repeatably.

## User Story
As a signed-in writer/admin, I want direct access to blog reading and blog management from the primary app navigation so that I can publish and maintain public articles without leaving the core storytelling workspace.

## Functional Requirements
1. The protected app navigation must include three tabs: `Settings`, `Blogs`, and `Blog Admin`.
2. Navigation links must appear alongside existing core links (`Dashboard`, `Stories`, and sign-out/logout action) and reuse current typography, spacing, and color tokens.
3. The `Blogs` tab must route to a page that lists all published blog posts, sorted newest-first.
4. The blog feed must include at minimum title, short description/excerpt, published date, and link to the post detail page.
5. The `Blog Admin` tab must route to the admin interface for creating, editing, and deleting posts.
6. Blog admin routes must enforce existing authentication/authorization policy (same guard pattern used by protected app sections and blog-admin allowlist).
7. The app must support migration/sync of blog posts from local development data to the production database via script-based workflow.
8. Migration scripts must be safe to run multiple times (idempotent upsert behavior by stable key such as slug).
9. Migration workflow must support a source environment (local) and destination environment (production target) configured through environment variables.

## Data Requirements
- Reuse existing `blog_posts` table/schema used by the blog feed and admin pages.
- Required persisted fields: `slug`, `title`, `description`, `content`, `published_at`, and timestamps/ids already defined in schema.
- Migration scripts must preserve `published_at` ordering and avoid duplicate rows by slug.

## User Flow
1. User signs in and lands in protected app shell.
2. User sees `Settings`, `Blogs`, and `Blog Admin` in primary navigation near `Dashboard` and `Stories`.
3. User clicks `Blogs` and sees the list of published articles.
4. User opens a post from the feed to read public content.
5. Authorized admin clicks `Blog Admin` to manage posts.
6. Admin creates/edits/deletes posts, then verifies updates on the `Blogs` feed.
7. Developer/operator runs migration script(s) to copy local blog posts to production.
8. Production `Blogs` feed reflects migrated published content.

## Acceptance Criteria
- Navigation renders `Settings`, `Blogs`, and `Blog Admin` with consistent app-shell styling.
- `Blogs` route is reachable from navigation and displays published posts from production DB.
- `Blog Admin` route is reachable from navigation and denies access for unauthorized users.
- Admin can create, edit, and delete posts from the blog admin area.
- Running migration sync from local to production imports existing local posts.
- Re-running migration does not create duplicate blog posts.
- Public blog feed shows migrated posts after sync completes.

## Edge Cases
- Unauthenticated user attempts to access blog admin routes.
- Authenticated but non-admin user accesses blog admin route.
- Duplicate slugs in source data.
- Source has zero posts.
- Destination has partially overlapping posts (some existing, some new).
- Invalid or missing DB connection environment variables.
- Network/database interruption during sync.

## Non-Functional Requirements
- Navigation updates should not regress responsiveness for mobile/tablet header layouts.
- Migration scripts should provide clear CLI output for success/failure counts.
- Blog feed loading should remain performant for moderate post counts (target sub-second server query for typical dataset).
- Authorization checks must occur server-side for admin routes.
