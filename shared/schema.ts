import { sql } from "drizzle-orm";
import { pgTable, text, varchar, real, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Amp Settings Schema
export const ampSettingsSchema = z.object({
  // Input Section
  inputGain: z.number().min(0).max(10).default(5),
  
  // EQ Section
  bass: z.number().min(0).max(10).default(5),
  mid: z.number().min(0).max(10).default(5),
  treble: z.number().min(0).max(10).default(5),
  presence: z.number().min(0).max(10).default(5),
  
  // Overdrive Section
  drive: z.number().min(0).max(10).default(5),
  punish: z.boolean().default(false),
  plus10db: z.boolean().default(false),
  plusLow: z.boolean().default(false),
  
  // Output Section
  masterVolume: z.number().min(0).max(10).default(5),
  
  // IR Section
  irIndex: z.number().min(0).default(0),
  irBypass: z.boolean().default(false),
  
  // Routing
  routingMode: z.enum(['direct', 'fxloop', 'live']).default('direct'),
});

export type AmpSettings = z.infer<typeof ampSettingsSchema>;

// Preset Schema
export const presets = pgTable("presets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  settings: jsonb("settings").notNull().$type<AmpSettings>(),
  isFactory: boolean("is_factory").default(false),
});

export const insertPresetSchema = createInsertSchema(presets).omit({
  id: true,
});

export type InsertPreset = z.infer<typeof insertPresetSchema>;
export type Preset = typeof presets.$inferSelect;

// IR (Impulse Response) list - Built-in cabinet IRs
export const builtInIRs = [
  { id: 0, name: "DJENT CRUSH 4x12", description: "Tight, aggressive modern metal" },
  { id: 1, name: "MESA OVERSIZED", description: "Classic djent cabinet" },
  { id: 2, name: "EVH 5150 III", description: "Punchy high-gain response" },
  { id: 3, name: "ORANGE PPC412", description: "British crunch with depth" },
  { id: 4, name: "FRAMUS DRAGON", description: "Extended range optimized" },
  { id: 5, name: "DIEZEL FRONTLOAD", description: "Modern precision" },
  { id: 6, name: "ENGL PRO 4x12", description: "Tight and focused" },
  { id: 7, name: "PEAVEY 5150", description: "Legendary metal tone" },
  { id: 8, name: "BOGNER UBERCAB", description: "Rich harmonics" },
  { id: 9, name: "SOLDANO 4x12", description: "Smooth high-gain" },
] as const;

// Default amp settings
export const defaultAmpSettings: AmpSettings = {
  inputGain: 5,
  bass: 6,
  mid: 4,
  treble: 6,
  presence: 5,
  drive: 7,
  punish: false,
  plus10db: false,
  plusLow: false,
  masterVolume: 5,
  irIndex: 0,
  irBypass: false,
  routingMode: 'direct',
};

// Users table (keep existing)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
