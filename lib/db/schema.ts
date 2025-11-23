import { pgTable, uuid, text, timestamp, pgSchema } from "drizzle-orm/pg-core";

// Define the auth schema to reference auth.users
const authSchema = pgSchema("auth");

// Define authUsers table reference for auth.users
export const authUsers = authSchema.table("users", {
  id: uuid("id").primaryKey(),
});

// Stories table linked to authUsers
export const stories = pgTable("stories", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => authUsers.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

