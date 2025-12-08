import { pgTable, uuid, text, timestamp, pgSchema, jsonb, integer, numeric, boolean } from "drizzle-orm/pg-core";

// Define the auth schema to reference auth.users
const authSchema = pgSchema("auth");

// Define authUsers table reference for auth.users
export const authUsers = authSchema.table("users", {
  id: uuid("id").primaryKey(),
});

// Public users table for profile data
export const users = pgTable("users", {
  id: uuid("id")
    .primaryKey()
    .references(() => authUsers.id, { onDelete: "cascade" }),
  email: text("email").notNull(),
  displayName: text("display_name"),
  avatarUrl: text("avatar_url"),
  bio: text("bio"),
  preferences: jsonb("preferences").default({}),
  analytics: jsonb("analytics").default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const stories = pgTable("stories", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => authUsers.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  storyType: jsonb("story_type"),
  hooks: jsonb("hooks"), // Stores the complete hook object (generated options, selection, etc.)
  mode: text("mode").$type<"quick" | "comprehensive">(), // "quick" | "comprehensive"
  modeSwitchHistory: jsonb("mode_switch_history"),
  moralConflictPrimary: text("moral_conflict_primary"),
  moralConflictSecondary: text("moral_conflict_secondary"),
  moralComplexity: text("moral_complexity").$type<"simple" | "two_rights" | "lesser_evil">(),
  moralData: jsonb("moral_data").default({}),
  character: jsonb("character"), // Stores full archetype data: primary, secondary, journey, etc.
  structure: jsonb("structure"), // Stores guidance level, selected structure, beats, etc.
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const scenes = pgTable("scenes", {
  id: uuid("id").defaultRandom().primaryKey(),
  storyId: uuid("story_id")
    .notNull()
    .references(() => stories.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  order: integer("order").notNull(),
  duration: numeric("duration"), // Estimated minutes or percentage
  tension: integer("tension"), // 1-10
  emotion: text("emotion"),
  mapPositionX: numeric("map_position_x"),
  mapPositionY: numeric("map_position_y"),
  cardWidthPercent: numeric("card_width_percent").default("10.0"),
  visualStyle: jsonb("visual_style").default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const storyMaps = pgTable("story_maps", {
  id: uuid("id").defaultRandom().primaryKey(),
  storyId: uuid("story_id")
    .notNull()
    .unique()
    .references(() => stories.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => authUsers.id, { onDelete: "cascade" }),
  
  // View Settings
  currentView: text("current_view").default("timeline"), // 'timeline', 'arc', 'characters'
  zoomLevel: numeric("zoom_level").default("1.0"),
  panPosition: jsonb("pan_position").default({ x: 0, y: 0 }),
  
  // Structure Overlay Settings
  structureOverlayVisible: boolean("structure_overlay_visible").default(true),
  structureViewType: text("structure_view_type"),
  overlayOpacity: numeric("overlay_opacity").default("0.7"),
  
  // Scene Layout (for custom positioning)
  scenePositions: jsonb("scene_positions").default({}),
  
  // Filter State
  activeFilters: jsonb("active_filters").default([]),
  
  // Character Track Settings
  visibleCharacters: jsonb("visible_characters").default([]),
  characterTrackOrder: jsonb("character_track_order").default([]),
  
  // Emotional Arc Settings
  arcSmoothing: boolean("arc_smoothing").default(true),
  showAverageLine: boolean("show_average_line").default(true),
  arcColorScheme: text("arc_color_scheme").default("gradient"),
  
  // AI Analysis
  lastAnalysis: jsonb("last_analysis"),
  analysisVersion: integer("analysis_version").default(1),
  analysisTimestamp: timestamp("analysis_timestamp", { withTimezone: true }),
  
  // Export Settings
  lastExportSettings: jsonb("last_export_settings"),
  
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// Archetype Analytics Tracking
export const archetypeAnalytics = pgTable("archetype_analytics", {
  id: uuid("id").defaultRandom().primaryKey(),
  storyId: uuid("story_id").references(() => stories.id, { onDelete: "cascade" }),
  userId: uuid("user_id").references(() => authUsers.id),
  primaryArchetype: text("primary_archetype").notNull(),
  secondaryArchetype: text("secondary_archetype"),
  storyType: text("story_type"),
  selectionMethod: text("selection_method"), // 'grid' | 'ai-suggested' | 'deep-builder'
  hasJourney: boolean("has_journey").default(false),
  hasDarkSides: boolean("has_dark_sides").default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const structureAnalytics = pgTable("structure_analytics", {
  id: uuid("id").defaultRandom().primaryKey(),
  storyId: uuid("story_id").references(() => stories.id, { onDelete: "cascade" }),
  userId: uuid("user_id").references(() => authUsers.id),
  structureId: text("structure_id").notNull(),
  guidanceLevel: text("guidance_level").$type<"deep" | "light">(),
  storyType: text("story_type"),
  selectionMethod: text("selection_method").$type<"manual" | "ai-recommended">(),
  beatsCompleted: integer("beats_completed").default(0),
  totalBeats: integer("total_beats"),
  timeSpentSeconds: integer("time_spent_seconds"),
  completed: boolean("completed").default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});
