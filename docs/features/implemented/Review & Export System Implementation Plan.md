# Review & Export System Implementation Plan

We will implement the Review & Export System to allow users to validate their story, generate a full draft using AI, and export it in various formats.

## 1. Dependencies & Setup
- Install required packages:
  - `jspdf`: For PDF generation.
  - `docx`: For Word document generation.
  - `file-saver`: For client-side file saving.
  - `html2canvas`: For capturing visual elements (story map).
  - `react-markdown`: For rendering the draft preview.
  - `@types/file-saver`: TypeScript types.

## 2. Database Schema Updates
- Update `lib/db/schema.ts`:
  - Add columns to `stories` table:
    - `export_count` (integer, default 0)
    - `last_export_date` (timestamp)
    - `last_export_format` (text)
    - `export_history` (jsonb, default '[]')
  - Add columns to `users` table (optional for v1, skip for now to keep it simple or add if needed).

## 3. AI Integration
- Update `lib/ai/story-generator.ts`:
  - Implement `generateFullStoryDraft(storyData, options)`:
    - Prompt engineering to combine Hook, Character, Structure, Scenes, and Moral Conflict.
    - Use `gemini-2.0-flash` model.
  - Implement `improveText(text, type)`: For "Improve Selected Text" feature.
  - Implement `regenerateSection(text, context)`: For "Regenerate Section" feature.

## 4. UI Components
- **Location**: `app/(protected)/stories/[storyId]/review/`
- **Page**: `page.tsx` (Main entry point).
- **Components**:
  - `review-dashboard.tsx`: Displays completeness and summary.
  - `completeness-checker.tsx`: Visual progress bar and checklist.
  - `draft-editor.tsx`: Rich text editor (using TipTap or simple textarea enhanced) for the AI draft.
  - `export-dialog.tsx`: Modal for selecting format and content options.
  - `preview-modal.tsx`: Preview of the export.
  - `review-context.tsx`: React Context to manage review state.

## 5. Server Actions
- Create `app/(protected)/stories/[storyId]/review/actions.ts`:
  - `saveStoryDraft(storyId, content)`: Save the generated/edited draft.
  - `recordExport(storyId, format)`: Update export stats in DB.
  - `getReviewData(storyId)`: Fetch all data needed for the review dashboard (aggregating from stories, scenes, etc.).

## 6. Export Utilities
- Create `lib/export/`:
  - `index.ts`: Main export handler.
  - `generate-pdf.ts`: PDF generation logic using `jspdf`.
  - `generate-docx.ts`: Word generation logic using `docx`.
  - `generate-markdown.ts`: Markdown string generation.
  - `generate-txt.ts`: Plain text generation.

## 7. Integration
- Add "Review & Export" button to `app/(protected)/stories/[storyId]/page.tsx` (Story Dashboard).
- Ensure the "Visual Story Map" can be captured (if feasible) or just linked.

## 8. Polish
- Add success celebration (confetti).
- Loading states for draft generation.

