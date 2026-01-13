import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertPresetSchema, ampSettingsSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.get("/api/presets", async (req, res) => {
    try {
      const presets = await storage.getPresets();
      res.json(presets);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch presets" });
    }
  });

  app.get("/api/presets/:id", async (req, res) => {
    try {
      const preset = await storage.getPreset(req.params.id);
      if (!preset) {
        return res.status(404).json({ error: "Preset not found" });
      }
      res.json(preset);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch preset" });
    }
  });

  app.post("/api/presets", async (req, res) => {
    try {
      const bodySchema = z.object({
        name: z.string().min(1).max(50),
        settings: ampSettingsSchema,
        isFactory: z.boolean().optional().default(false),
      });

      const validated = bodySchema.parse(req.body);
      
      const preset = await storage.createPreset({
        name: validated.name,
        settings: validated.settings,
        isFactory: validated.isFactory,
      });
      
      res.status(201).json(preset);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid preset data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create preset" });
    }
  });

  app.delete("/api/presets/:id", async (req, res) => {
    try {
      const deleted = await storage.deletePreset(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Preset not found or cannot be deleted" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete preset" });
    }
  });

  return httpServer;
}
