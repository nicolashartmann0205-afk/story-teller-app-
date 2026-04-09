# SEO Admin Navigation Link

## Feature Name
SEO Admin Navigation Link

## Goal
Expose a dedicated `SEO Admin` entry in the main navigation for a single authorized admin account, without showing it to other users.

## User Story
As the site admin (`nicolas@hartmanns.net`), I want to see an `SEO Admin` link in the header near `Blog Admin` so that I can quickly access SEO controls.

## Functional Requirements
1. The navigation bar must include a new link labeled `SEO Admin`.
2. The link must route to `/seo-admin`.
3. The link must render only when the signed-in user email equals `nicolas@hartmanns.net`.
4. Non-admin users must not see the link in the navigation UI.
5. Existing navigation order and styling must remain consistent with current header/nav patterns.
6. The new link should appear alongside existing links (`Blogs`, `Blog Admin`) and before logout/action controls where applicable.

## Data Requirements
- Reuse existing user/auth session data already available to the navigation component.
- No database schema changes required.

## User Flow
1. Admin signs in using `nicolas@hartmanns.net`.
2. Admin opens any page with the shared header/navigation.
3. Admin sees `SEO Admin` in nav next to `Blog Admin`.
4. Admin clicks `SEO Admin` and is routed to `/seo-admin`.
5. Non-admin users repeat step 2 and do not see the `SEO Admin` link.

## Acceptance Criteria
- `SEO Admin` link is visible for `nicolas@hartmanns.net` and hidden for all other users.
- Link destination is exactly `/seo-admin`.
- No regressions to existing nav links or layout.
- Lint/type checks pass for touched files.

## Edge Cases
- User session is null/undefined: `SEO Admin` must not render.
- Email casing differences: comparison behavior must be explicit (recommended case-insensitive).
- User email unavailable temporarily during auth hydration: no flicker into unauthorized visibility.

## Non-Functional Requirements
- Conditional rendering should be simple and performant.
- Styling should match existing navigation tokens/components.
