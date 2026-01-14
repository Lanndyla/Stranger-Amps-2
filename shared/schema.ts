import { sql } from "drizzle-orm";
import { pgTable, text, varchar, real, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Amp Settings Schema
export const ampSettingsSchema = z.object({
  // Input Section
  inputLevel: z.number().min(0).max(10).default(5),
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
  
  // Thall Features
  thicken: z.number().min(0).max(10).default(0),
  thickenEnabled: z.boolean().default(false),
  chugEnhance: z.number().min(0).max(10).default(0),
  chugEnabled: z.boolean().default(false),
  lofi: z.boolean().default(false),
  cleanse: z.boolean().default(false),
  
  // Pitch Section
  pitchShift: z.number().min(-12).max(12).default(0),
  pitchEnabled: z.boolean().default(false),
  
  // Output Section
  masterVolume: z.number().min(0).max(10).default(5),
  outputLevel: z.number().min(0).max(10).default(5),
  
  // Reverb Section
  reverbType: z.enum(['hall', 'room', 'plate', 'spring', 'ambient', 'shimmer']).default('room'),
  reverbMix: z.number().min(0).max(10).default(2),
  reverbDecay: z.number().min(0).max(10).default(5),
  reverbEnabled: z.boolean().default(false),
  
  // IR Section
  irIndex: z.number().min(0).default(0),
  irBypass: z.boolean().default(false),
  
  // Routing
  routingMode: z.enum(['direct', 'fxloop', 'live']).default('direct'),
  
  // AI Enhancement
  aiEnhance: z.boolean().default(false),
  aiTuning: z.enum(['dropA', 'dropB', 'dropC', 'dropD', 'dropE']).default('dropA'),
  
  // Delay Pedal
  delayEnabled: z.boolean().default(false),
  delayTime: z.number().min(50).max(2000).default(400),
  delayFeedback: z.number().min(0).max(10).default(4),
  delayMix: z.number().min(0).max(10).default(3),
  delaySync: z.boolean().default(false),
  
  // Parametric EQ (4 bands)
  peqEnabled: z.boolean().default(false),
  peqBand1Freq: z.number().min(20).max(20000).default(100),
  peqBand1Gain: z.number().min(-12).max(12).default(0),
  peqBand1Q: z.number().min(0.1).max(10).default(1),
  peqBand2Freq: z.number().min(20).max(20000).default(500),
  peqBand2Gain: z.number().min(-12).max(12).default(0),
  peqBand2Q: z.number().min(0.1).max(10).default(1),
  peqBand3Freq: z.number().min(20).max(20000).default(2000),
  peqBand3Gain: z.number().min(-12).max(12).default(0),
  peqBand3Q: z.number().min(0.1).max(10).default(1),
  peqBand4Freq: z.number().min(20).max(20000).default(8000),
  peqBand4Gain: z.number().min(-12).max(12).default(0),
  peqBand4Q: z.number().min(0.1).max(10).default(1),
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
  inputLevel: 5,
  inputGain: 5,
  bass: 6,
  mid: 4,
  treble: 6,
  presence: 5,
  drive: 7,
  punish: false,
  plus10db: false,
  plusLow: false,
  thicken: 0,
  thickenEnabled: false,
  chugEnhance: 0,
  chugEnabled: false,
  lofi: false,
  cleanse: false,
  pitchShift: 0,
  pitchEnabled: false,
  masterVolume: 5,
  outputLevel: 5,
  reverbType: 'room',
  reverbMix: 2,
  reverbDecay: 5,
  reverbEnabled: false,
  irIndex: 0,
  irBypass: false,
  routingMode: 'direct',
  aiEnhance: false,
  aiTuning: 'dropA',
  delayEnabled: false,
  delayTime: 400,
  delayFeedback: 4,
  delayMix: 3,
  delaySync: false,
  peqEnabled: false,
  peqBand1Freq: 100,
  peqBand1Gain: 0,
  peqBand1Q: 1,
  peqBand2Freq: 500,
  peqBand2Gain: 0,
  peqBand2Q: 1,
  peqBand3Freq: 2000,
  peqBand3Gain: 0,
  peqBand3Q: 1,
  peqBand4Freq: 8000,
  peqBand4Gain: 0,
  peqBand4Q: 1,
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
