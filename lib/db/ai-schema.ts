import { pgTable, uuid, text, timestamp, jsonb, integer, decimal, date } from "drizzle-orm/pg-core";
import { users, stories } from "./schema";

export const aiGenerations = pgTable("ai_generations", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  storyId: uuid("story_id").references(() => stories.id, { onDelete: "cascade" }),
  
  // Generation Details
  generationType: text("generation_type").notNull(), // 'hook', 'scene', 'character', 'structure', 'fullDraft', 'improvement', 'coaching'
  promptHash: text("prompt_hash"),
  
  // Request
  requestParams: jsonb("request_params").notNull(),
  storyContext: jsonb("story_context"),
  
  // Response
  generatedContent: jsonb("generated_content").notNull(),
  tokensUsed: jsonb("tokens_used"), // { input: N, output: N, total: N }
  
  // Performance
  generationTimeMs: integer("generation_time_ms"),
  modelUsed: text("model_used"),
  temperature: decimal("temperature", { precision: 3, scale: 2 }),
  
  // User Interaction
  userAction: text("user_action"), // 'accepted', 'edited', 'rejected', 'regenerated'
  userEdits: jsonb("user_edits"),
  finalContent: text("final_content"),
  
  // Status
  status: text("status").default("success"), // 'success', 'error', 'cached'
  errorMessage: text("error_message"),
  
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const aiUsageCosts = pgTable("ai_usage_costs", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id),
  date: date("date").notNull(),
  
  // Token Usage
  totalTokens: integer("total_tokens").default(0),
  inputTokens: integer("input_tokens").default(0),
  outputTokens: integer("output_tokens").default(0),
  
  // Cost (in cents)
  estimatedCostCents: integer("estimated_cost_cents").default(0),
  
  // Generation Counts
  hooksGenerated: integer("hooks_generated").default(0),
  scenesGenerated: integer("scenes_generated").default(0),
  draftsGenerated: integer("drafts_generated").default(0),
  improvementsGenerated: integer("improvements_generated").default(0),
  
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});


