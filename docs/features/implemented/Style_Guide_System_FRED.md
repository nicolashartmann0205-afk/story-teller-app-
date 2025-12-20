# Feature Request Document (FRED)
## Style Guide System for Storyteller Tactics Interactive App

**Version:** 1.1
**Date:** December 20, 2024
**Feature Owner:** Nicolas
**Status:** Planning (Enhancement of existing primitives)

---

## 1. Feature Overview

### 1.1 Purpose
The Style Guide System enables users to create, manage, and apply customizable style guides that ensure consistency across all stories created within the Storyteller Tactics app. This feature elevates the current per-story style configuration (Tone, Writing Style, Perspective) into reusable, robust assets.

### 1.2 Problem Statement
Currently, users can select `Tone`, `Writing Style`, and `Perspective` for individual stories via dropdowns in the creation wizard. However, they must manually re-select these for every new story to ensure consistency.
This leads to:
- Inconsistent brand voice across different stories if settings are mismatched.
- Time-consuming manual configuration for power users.
- Lack of granular control (e.g., specific vocabulary, color palettes for exports).
- No way to persist a "brand identity" across a series of stories.

### 1.3 Solution Summary
A comprehensive Style Guide System that allows users to:
- **Reuse**: Save current style configurations as reusable "Style Guides".
- **Define**: Go beyond simple dropdowns to include Dictionary, Color Palette, and Typography.
- **Generate**: AI-assisted creation from uploaded documents (PDF/DOCX) or URLs.
- **Manage**: Version control and export/import capabilities.

### 1.4 Success Criteria
- Users can save a story's style settings as a new Style Guide.
- AI-generated style guides from documents achieve 80%+ accuracy.
- "Style Guide" selector replaces individual dropdowns in the story creation flow (with option to customize).
- Export functionality applies Style Guide formatting (fonts/colors).

---

## 2. User Stories

### 2.1 Core User Stories

**As a marketing professional**, I want to save my "Corporate" tone and "Concise" style as a reusable guide, so I don't have to re-configure it for every campaign.

**As a business consultant**, I want to upload a client's brand PDF, so the system automatically extracts their colors and voice for my stories.

**As a content creator**, I want to define a custom dictionary (e.g., "Use 'Client' not 'Customer'"), so that AI generation respects my terminology rules.

**As a storyteller**, I want to apply a visual style (colors/fonts) to the Story Map and Exports, so my deliverables look professional and branded.

---

## 3. Functional Requirements

### 3.1 Style Guide Creation & Management

#### 3.1.1 Manual Creation
- **FR-001**: Create new style guide from scratch.
- **FR-002**: Save current story settings as a new Style Guide (from `CreateStoryForm`).
- **FR-003**: Edit, Delete, Clone, and Set Default style guides.

#### 3.1.2 AI-Assisted Creation
- **FR-008**: Upload documents (PDF, DOCX) or provide URLs.
- **FR-013**: AI extracts Tone, Terminology, Complexity, Colors, and Fonts.
- **FR-014**: Review interface to approve/modify AI-extracted attributes.

### 3.2 Style Guide Components

#### 3.2.1 Tone & Voice (Enhanced)
*Current Implementation: `neutral`, `humorous`, `dark`, `uplifting`, `suspenseful`, `romantic`, `formal`.*
- **FR-019**: Select Tone from existing `lib/data/styleOptions.ts` list.
- **FR-020**: Custom Tone description field (AI instructions).
- **FR-021**: Detailed sliders: Formality (1-5), Emotion (1-5).
- **FR-022**: Perspective Selection (First, Second, Third) - *Already implemented in `styleOptions.ts`*.

#### 3.2.2 Writing Style & Complexity
*Current Implementation: `standard`, `descriptive`, `concise`, `poetic`, `cinematic`, `experimental`.*
- **FR-023**: Select Writing Style from existing list.
- **FR-024**: **Complexity Level** (New):
  - Elementary (6th Grade)
  - Middle School (9th Grade)
  - High School
  - Undergraduate
  - PhD / Technical
- **Conflict Note**: Distinguish between "Writing Style" (artistic approach) and "Complexity" (reading level). Both should be configurable.

#### 3.2.3 Typography & Visuals
- **FR-027**: Font selection (Google Fonts).
- **FR-032**: Color Palette (Primary, Secondary, Accent, Background, Text).
- **FR-040**: Visual Art Style (for image generation) - *Align with `scenes.visualStyle`*.

#### 3.2.4 Custom Dictionary
- **FR-044**: List of terms with definitions and usage rules.
- **FR-046**: Categories (Product, Person, Jargon).
- **FR-050**: AI prompt injection to enforce terminology.

### 3.3 Style Guide Application

#### 3.3.1 Integration with Story Creation
- **FR-055**: Replace the current "Style & Context" section in `CreateStoryForm` with a **Style Guide Selector**.
- **FR-056**: Selector options:
  - "None (Custom)" - Show current individual dropdowns.
  - "[Style Guide Name]" - Hide dropdowns or pre-fill them, show "Active Style Guide" badge.
- **FR-060**: AI generation uses Style Guide parameters (injecting into `generateStory` and `generateHooks`).

#### 3.3.2 Output Formatting
- **FR-066**: Apply fonts/colors to PDF/DOCX exports.
- **FR-069**: Apply colors to Visual Story Map nodes.

---

## 4. Data Specifications

### 4.1 Database Schema

#### 4.1.1 Style Guides Table (New)
```sql
CREATE TABLE style_guides (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  
  -- Core Attributes (matching styleOptions.ts)
  tone_id VARCHAR(50), -- references tones.id
  writing_style_id VARCHAR(50), -- references writingStyles.id
  perspective_id VARCHAR(50), -- references perspectives.id
  
  -- Enhanced Attributes
  tone_description TEXT,
  complexity_level VARCHAR(30),
  
  -- Visuals
  primary_color VARCHAR(7),
  secondary_color VARCHAR(7),
  font_heading VARCHAR(100),
  font_body VARCHAR(100),
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 4.1.2 Dictionary Entries Table (New)
```sql
CREATE TABLE dictionary_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  style_guide_id UUID NOT NULL REFERENCES style_guides(id) ON DELETE CASCADE,
  term VARCHAR(100) NOT NULL,
  definition TEXT,
  usage_guidelines TEXT,
  category VARCHAR(50)
);
```

#### 4.1.3 Updates to Stories Table
*Current: `stylePreferences` jsonb column exists.*
- **Action**: Add `style_guide_id` column.
- **Logic**: When a Style Guide is selected, copy its values into `stylePreferences` (snapshot) AND link `style_guide_id`. This allows per-story deviation without altering the master guide.

### 4.2 Integration Points

#### 4.2.1 Frontend
- **New Page**: `app/(protected)/style-guide/page.tsx` (Dashboard).
- **Update**: `app/(protected)/create-story/create-story-form.tsx` (Selector).
- **Update**: `lib/ai/story-generator.ts` (Accept dictionary/complexity params).

---

## 5. UI/UX Design

### 5.1 Style Guide Dashboard
- **Layout**: Grid of style guide cards.
- **Card**: Name, Tone preview, Color swatches.
- **Actions**: Edit, Duplicate, Delete.

### 5.2 Editor Interface
- **Tabs**: General (Tone/Style), Dictionary, Visuals (Colors/Fonts).
- **Preview**: Real-time text preview showing Tone/Complexity changes.

---

## 6. Implementation Plan

### Phase 1: Data Layer & Dashboard (Week 1)
- Create `style_guides` and `dictionary_entries` tables.
- Create `app/(protected)/style-guide` dashboard.
- Implement basic CRUD for Style Guides.

### Phase 2: Integration with Creation Flow (Week 2)
- Update `CreateStoryForm` to fetch and list Style Guides.
- Implement "Apply Style Guide" logic (pre-filling existing dropdowns).
- Ensure `stylePreferences` in `stories` table correctly snapshots the guide data.

### Phase 3: AI & Advanced Features (Week 3)
- Implement Dictionary injection into AI prompts.
- Implement "Complexity Level" logic in prompt engineering.
- Build "Generate from Document" feature (File Upload -> Analysis -> Creation).

### Phase 4: Visuals & Export (Week 4)
- Implement Color/Font selection in Style Guide Editor.
- Update Export logic (`lib/export/`) to utilize these styles.
- Update Story Map to reflect brand colors.

---

## 7. Conflicts & Resolutions

| Conflict | Resolution |
| :--- | :--- |
| **Language vs Complexity** | `stories.language` (en/de/th) already exists. Rename style guide reading level to **"Complexity"** or **"Reading Level"** to avoid ambiguity. |
| **Writing Style vs Tone** | `styleOptions.ts` separates these. Keep them separate in the Style Guide object to match existing data model. |
| **Storage Strategy** | Stories currently store styles in JSON. **Decision**: Keep JSON snapshot in `stories` table so changes to the master Guide don't break old stories, but store `style_guide_id` for reference/re-syncing. |

---

## 8. Open Questions
- **Q**: Should Dictionary terms be language-specific (e.g., only apply to English stories)? 
- **A**: For V1, assume Dictionary applies to all languages or user manages separate guides for separate languages.
- **Q**: How to handle "Custom Instructions" from the current form?
- **A**: Map this to `tone_description` or a dedicated `custom_instructions` field in the Style Guide.

---

## Appendix: Existing Primitives (`lib/data/styleOptions.ts`)
- **Tones**: Neutral, Humorous, Dark, Uplifting, Suspenseful, Romantic, Formal.
- **Styles**: Standard, Descriptive, Concise, Poetic, Cinematic, Experimental.
- **Perspectives**: Third Limited, Third Omniscient, First Person.
