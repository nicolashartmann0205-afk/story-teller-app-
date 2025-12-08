import { pgTable, uuid, text, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { stories, users } from "./schema";

export const structureAnalytics = pgTable("structure_analytics", {
  id: uuid("id").defaultRandom().primaryKey(),
  storyId: uuid("story_id")
    .references(() => stories.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .references(() => users.id),
  structureId: text("structure_id").notNull(),
  guidanceLevel: text("guidance_level"), // 'deep', 'light', null
  storyType: text("story_type"),
  selectionMethod: text("selection_method"), // 'manual', 'ai-recommended'
  beatsCompleted: integer("beats_completed").default(0),
  totalBeats: integer("total_beats"),
  timeSpentSeconds: integer("time_spent_seconds"),
  completed: boolean("completed").default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

