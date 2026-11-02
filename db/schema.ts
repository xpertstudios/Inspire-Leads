import { integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const profiles = sqliteTable("profiles", {
  id: text("id").primaryKey(), email: text("email").notNull(), name: text("name").notNull(),
  role: text("role", { enum: ["admin", "member"] }).notNull().default("member"), createdAt: text("created_at").notNull(),
});
export const leads = sqliteTable("leads", {
  id: text("id").primaryKey(), ownerId: text("owner_id").notNull().references(() => profiles.id), name: text("name").notNull(),
  phone: text("phone").notNull(), normalizedPhone: text("normalized_phone").notNull(), area: text("area").notNull(), source: text("source").notNull(),
  consentConfirmed: integer("consent_confirmed", { mode: "boolean" }).notNull(), officeDate: text("office_date").notNull(), createdAt: text("created_at").notNull(),
}, (table) => [uniqueIndex("leads_phone_unique").on(table.normalizedPhone)]);
export const outreachEvents = sqliteTable("outreach_events", {
  id: text("id").primaryKey(), leadId: text("lead_id").notNull().references(() => leads.id), actorId: text("actor_id").notNull().references(() => profiles.id),
  channel: text("channel").notNull().default("whatsapp"), createdAt: text("created_at").notNull(),
});
