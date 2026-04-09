# Add Scene After First Scene Completion

## Feature Name
Add Scene After First Scene Completion

## Goal
Enable a clear, guided workflow where users can continue story building by adding the next scene after finishing their first scene, reducing confusion about how to proceed.

## User Story
As a story creator, I want an obvious way to add the next scene after I complete scene one so that I can continue writing without leaving the current flow.

## Functional Requirements
1. The scene editor must expose an "Add scene" action once the first scene is considered finished.
2. "Finished" must be determined by existing scene completion indicators (for example, drafted/completed status and/or non-empty draft content) and reuse current scene state where possible.
3. Triggering "Add scene" must create a new scene with the next order number for the same story.
4. After creation, the user must be navigated directly to the new scene editor.
5. The feature must prevent duplicate scene creation from rapid repeated clicks (disabled/loading state).
6. The new scene must initialize with existing default empty framework fields.
7. Scene navigation (dropdown/list) must include the newly created scene immediately after creation.
8. If creation fails, the user must see a clear error message and remain on the current scene.

## Data Requirements
- Reuse existing `scenes` table fields (`storyId`, `title`, `order`, `movieTimeAction`, `movieTimeEmotion`, `movieTimeMeaning`, `completenessStatus`).
- Reuse existing `createScene(storyId)` server action for insertion logic.
- Ensure order generation remains monotonic and stable when scenes are added over time.

## User Flow
1. User opens scene 1 and fills framework fields and/or generates a draft.
2. User reaches a finished state for scene 1.
3. UI reveals or enables the "Add scene" action.
4. User clicks "Add scene".
5. App creates scene 2 and redirects user to scene 2 editor.
6. User continues writing with the same workflow.

## Acceptance Criteria
- When scene 1 is finished, user can add a new scene from the editor.
- New scene is created with correct order and default values.
- User is routed directly to the new scene after creation.
- Multiple rapid clicks do not create duplicate scenes.
- Creation failures show a clear error and do not lose current scene progress.
- No lint/type errors are introduced in touched files.

## Edge Cases
- Scene is partially filled but not finished.
- Scene has generated draft but framework fields are sparse.
- User clicks add while save/generate is still in progress.
- Network/database error during scene creation.
- Story already has many scenes; order integrity must remain correct.

## Non-Functional Requirements
- Scene creation should feel immediate (target: responsive action with visible loading state).
- UI behavior must remain consistent across desktop and mobile layouts.
- Existing autosave behavior must not regress.
