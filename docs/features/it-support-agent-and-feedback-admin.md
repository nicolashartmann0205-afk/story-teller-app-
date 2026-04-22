# IT Support Agent and Feedback Admin

## Feature Name
IT Support Agent and Feedback Admin

## Goal
Provide a dedicated signed-in IT support assistant that helps users troubleshoot issues in-app, and a separate feedback submission workflow where feedback is stored in the database and only visible to authorized admins.

## User Story
As a signed-in Story Teller user, I want an AI support agent page to help me diagnose account and technical issues quickly.  
As a user or visitor, I want to submit product feedback in-app.  
As the owner/admin, I want to review and manage submitted feedback privately.

## Functional Requirements
1. Add a signed-in route at `/support-agent` with a chat-style UI for IT troubleshooting.
2. Support agent must save conversation sessions/messages in the database.
3. Support agent replies are generated server-side via Gemini and include practical troubleshooting steps.
4. Add a separate route at `/feedback` with a submission form (category, subject, message, optional email).
5. Feedback submissions are persisted in a new `feedback_submissions` table.
6. Add admin-only page at `/admin/feedback` to list feedback and update status.
7. Admin permissions for feedback management reuse `isBlogAdminUser()` plus owner email behavior.
8. Signed-in nav “Support” should point to `/support-agent`; signed-out nav keeps `/support`.
9. `/feedback` remains publicly reachable; `/support-agent` and `/admin/feedback` require authentication.

## Data Requirements
- New `feedback_submissions` table:
  - `id`, `created_at`, `updated_at`, `submitted_by`, `email`, `category`, `subject`, `message`, `status`, `metadata`
- New `support_sessions` table:
  - `id`, `user_id`, `title`, `status`, `created_at`, `updated_at`
- New `support_messages` table:
  - `id`, `session_id`, `role`, `content`, `metadata`, `created_at`
- Reuse existing `auth.users` reference and existing admin helper from `lib/blog/admin.ts`.

## User Flow
1. Signed-in user clicks Support in app nav and lands on `/support-agent`.
2. User sends a troubleshooting message.
3. System stores user message, generates AI reply, stores assistant message, and updates UI.
4. User (or signed-out visitor) opens `/feedback`, submits form, and sees success message.
5. Admin opens `/admin/feedback`, reviews submissions, updates status, and tracks follow-up.

## Acceptance Criteria
- `/support-agent` is accessible to signed-in users and unavailable to signed-out users.
- Support messages persist across refresh for the latest session.
- `/feedback` successfully stores submissions.
- `/admin/feedback` is visible only to owner/blog admins and blocks others server-side.
- Public `/support` page continues to work and links users to new flows.

## Edge Cases
- Gemini unavailable or API error: support chat returns graceful error without losing user message history.
- Empty or oversized support/feedback messages are rejected with user-friendly validation errors.
- Signed-out access to `/support-agent` or `/admin/feedback` redirects to sign-in.
- Missing optional email on feedback should not block submission.

## Non-Functional Requirements
- Keep UI simple and fast; avoid long blocking operations in the browser.
- Persist minimal metadata only; avoid storing secrets in feedback/support payloads.
- Maintain current design language and dark/light mode styles.
